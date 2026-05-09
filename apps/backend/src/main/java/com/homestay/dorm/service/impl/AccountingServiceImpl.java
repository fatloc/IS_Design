package com.homestay.dorm.service.impl;

import com.homestay.dorm.dto.response.AccountingWorkflowsResponse;
import com.homestay.dorm.dto.response.OperationsResponse;
import com.homestay.dorm.entity.HoSoDatCoc;
import com.homestay.dorm.entity.HopDongThue;
import com.homestay.dorm.entity.KhachHang;
import com.homestay.dorm.entity.YeuCauDangKy;
import com.homestay.dorm.repository.HoSoDatCocRepository;
import com.homestay.dorm.repository.HopDongThueRepository;
import com.homestay.dorm.repository.KhachHangRepository;
import com.homestay.dorm.repository.YeuCauDangKyRepository;
import com.homestay.dorm.service.AccountingService;
import com.homestay.dorm.service.OperationsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountingServiceImpl implements AccountingService {

    private static final BigDecimal TWO = BigDecimal.valueOf(2);
    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final YeuCauDangKyRepository requestRepository;
    private final HopDongThueRepository contractRepository;
    private final HoSoDatCocRepository depositRepository;
    private final KhachHangRepository customerRepository;
    private final OperationsService operationsService;

    @Override
    public AccountingWorkflowsResponse getWorkflows() {
        List<YeuCauDangKy> requests = requestRepository.findAll();
        List<HopDongThue> contracts = contractRepository.findAll();
        List<HoSoDatCoc> deposits = depositRepository.findAll();
        OperationsResponse operations = operationsService.getOperations();

        Map<String, String> customerNames = loadCustomerNames();
        Map<String, YeuCauDangKy> latestRequestByCustomer = latestRequestByCustomer(requests);
        Map<String, HoSoDatCoc> latestDepositByCustomer = latestDepositByCustomer(deposits);

        List<AccountingWorkflowsResponse.DepositQueueItem> depositQueue = requests.stream()
                .filter(this::isDepositRequestPending)
                .sorted(Comparator.comparing(YeuCauDangKy::getThoiGianBatDauThueDuKien, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(request -> buildDepositQueueItem(request, customerNames))
                .toList();

        List<AccountingWorkflowsResponse.MoveInPaymentItem> moveInPayments = contracts.stream()
                .sorted(Comparator.comparing(HopDongThue::getNgayLap, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(contract -> buildMoveInPaymentItem(contract, latestRequestByCustomer, customerNames))
                .toList();

        List<AccountingWorkflowsResponse.ReconciliationItem> reconciliationQueue = contracts.stream()
                .sorted(Comparator.comparing(HopDongThue::getNgayLap, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(contract -> buildReconciliationItem(contract, latestDepositByCustomer, customerNames))
                .toList();

        List<AccountingWorkflowsResponse.CheckoutItem> checkoutQueue = operations.getCheckouts().stream()
                .map(checkout -> AccountingWorkflowsResponse.CheckoutItem.builder()
                        .checkoutId(checkout.getId())
                        .customerId(checkout.getTenant())
                        .customerName(checkout.getTenant())
                        .roomRef(checkout.getRoom())
                .depositAmount(defaultMoney(checkout.getDeposit()))
                .finalBalance(defaultMoney(checkout.getDeposit()))
                        .status(checkout.getStatus())
                        .moveOutDate(checkout.getMoveOut())
                        .note("Dữ liệu bàn giao lấy từ nghiệp vụ vận hành")
                        .build())
                .toList();

        BigDecimal expectedDepositAmount = depositQueue.stream()
                .map(AccountingWorkflowsResponse.DepositQueueItem::getDepositAmount)
            .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expectedMoveInAmount = moveInPayments.stream()
                .map(AccountingWorkflowsResponse.MoveInPaymentItem::getMoveInAmount)
            .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expectedRefundAmount = reconciliationQueue.stream()
                .map(AccountingWorkflowsResponse.ReconciliationItem::getFinalBalance)
            .filter(Objects::nonNull)
                .filter(amount -> amount.signum() > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expectedCollectionAmount = reconciliationQueue.stream()
                .map(AccountingWorkflowsResponse.ReconciliationItem::getFinalBalance)
            .filter(Objects::nonNull)
                .filter(amount -> amount.signum() < 0)
                .map(BigDecimal::abs)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AccountingWorkflowsResponse.builder()
                .summary(AccountingWorkflowsResponse.Summary.builder()
                        .pendingDepositRequests(depositQueue.size())
                        .pendingMoveInPayments(moveInPayments.size())
                        .pendingReconciliations(reconciliationQueue.size())
                        .pendingCheckoutSettlements(checkoutQueue.size())
                        .expectedDepositAmount(expectedDepositAmount)
                        .expectedMoveInAmount(expectedMoveInAmount)
                        .expectedRefundAmount(expectedRefundAmount)
                        .expectedCollectionAmount(expectedCollectionAmount)
                        .build())
                .depositQueue(depositQueue)
                .moveInPayments(moveInPayments)
                .reconciliationQueue(reconciliationQueue)
                .checkoutQueue(checkoutQueue)
                .build();
    }

    private boolean isDepositRequestPending(YeuCauDangKy request) {
        if (request.getTrangThaiYeuCau() == null) {
            return true;
        }

        String status = request.getTrangThaiYeuCau().toLowerCase();
        return status.contains("yêu cầu mới") || status.contains("yeu cau moi") || status.contains("chờ phê duyệt") || status.contains("cho phe duyet");
    }

    private AccountingWorkflowsResponse.DepositQueueItem buildDepositQueueItem(
            YeuCauDangKy request,
            Map<String, String> customerNames
    ) {
        BigDecimal monthlyRent = defaultMoney(request.getMucGiaMongMuon());
        Integer bedCount = Optional.ofNullable(request.getSoLuongNguoi()).orElse(1);
        BigDecimal depositAmount = monthlyRent.multiply(TWO).multiply(BigDecimal.valueOf(bedCount.longValue()));

        return AccountingWorkflowsResponse.DepositQueueItem.builder()
                .requestId(request.getMaYeuCau())
                .customerId(request.getKhachHangYeuCau())
                .customerName(resolveCustomerName(request.getKhachHangYeuCau(), customerNames))
                .staffId(request.getNhanVienPhuTrach())
                .area(request.getKhuVuc())
                .requestStatus(request.getTrangThaiYeuCau())
                .bedCount(bedCount)
                .monthlyRent(monthlyRent)
                .depositAmount(depositAmount)
                .requestedStartDate(request.getThoiGianBatDauThueDuKien() == null ? null : request.getThoiGianBatDauThueDuKien().toString())
                .note("Tính theo công thức 2 tháng x số giường x tiền thuê giường")
                .build();
    }

    private AccountingWorkflowsResponse.MoveInPaymentItem buildMoveInPaymentItem(
            HopDongThue contract,
            Map<String, YeuCauDangKy> latestRequestByCustomer,
            Map<String, String> customerNames
    ) {
        YeuCauDangKy request = latestRequestByCustomer.get(contract.getKhachHangSoHuu());
        BigDecimal monthlyRent = request == null ? BigDecimal.ZERO : defaultMoney(request.getMucGiaMongMuon());
        int memberCount = Optional.ofNullable(contract.getSoLuongThanhVien()).orElse(1);
        BigDecimal moveInAmount = monthlyRent.multiply(TWO).multiply(BigDecimal.valueOf(memberCount));

        return AccountingWorkflowsResponse.MoveInPaymentItem.builder()
                .contractId(contract.getMaVanBan())
                .customerId(contract.getKhachHangSoHuu())
                .customerName(resolveCustomerName(contract.getKhachHangSoHuu(), customerNames))
                .rentType(contract.getHinhThucThue())
                .memberCount(memberCount)
                .monthlyRent(monthlyRent)
                .moveInAmount(moveInAmount)
                .contractDate(contract.getNgayLap() == null ? null : contract.getNgayLap().toString())
                .paymentCycle(contract.getKyThanhToan())
                .note(request == null ? "Chưa tìm được yêu cầu gốc, dùng mức thuê mặc định 0" : "Tính từ hợp đồng đã ký và mức thuê trong yêu cầu")
                .build();
    }

    private AccountingWorkflowsResponse.ReconciliationItem buildReconciliationItem(
            HopDongThue contract,
            Map<String, HoSoDatCoc> latestDepositByCustomer,
            Map<String, String> customerNames
    ) {
        HoSoDatCoc deposit = latestDepositByCustomer.get(contract.getKhachHangSoHuu());
        BigDecimal depositAmount = deposit == null ? BigDecimal.ZERO : defaultMoney(deposit.getMucTienCoc());
        String scenario = determineScenario(contract);
        BigDecimal refundRate = BigDecimal.valueOf(refundRatePercent(scenario));
        BigDecimal refundableAmount = depositAmount.multiply(refundRate).divide(ONE_HUNDRED, 0, RoundingMode.HALF_UP);
        BigDecimal totalDeduction = BigDecimal.ZERO;
        BigDecimal finalBalance = refundableAmount.subtract(totalDeduction);

        return AccountingWorkflowsResponse.ReconciliationItem.builder()
                .contractId(contract.getMaVanBan())
                .customerId(contract.getKhachHangSoHuu())
                .customerName(resolveCustomerName(contract.getKhachHangSoHuu(), customerNames))
                .roomRef(contract.getHinhThucThue())
                .depositAmount(depositAmount)
                .refundRate(refundRate)
                .refundableAmount(refundableAmount)
                .totalDeduction(totalDeduction)
                .finalBalance(finalBalance)
                .scenario(scenario)
                .note("Người dùng có thể nhập thêm khấu trừ tại frontend")
                .build();
    }

    private String determineScenario(HopDongThue contract) {
        if (contract.getNgayLap() == null) {
            return "Expired";
        }

        long months = ChronoUnit.MONTHS.between(contract.getNgayLap(), LocalDate.now());
        if (months < 6) {
            return "Short Stay";
        }
        if (months >= 12) {
            return "Expired";
        }
        return "Long Stay";
    }

    private int refundRatePercent(String scenario) {
        return switch (scenario) {
            case "Cancelled" -> 80;
            case "Short Stay" -> 50;
            case "Long Stay" -> 70;
            case "Expired" -> 100;
            default -> 70;
        };
    }

    private Map<String, String> loadCustomerNames() {
        return customerRepository.findAll().stream()
                .collect(Collectors.toMap(KhachHang::getMaKhachHang, customer -> Optional.ofNullable(customer.getHoTen()).orElse(customer.getMaKhachHang()), (left, right) -> left, HashMap::new));
    }

    private Map<String, YeuCauDangKy> latestRequestByCustomer(List<YeuCauDangKy> requests) {
        return requests.stream()
                .filter(request -> request.getKhachHangYeuCau() != null && !request.getKhachHangYeuCau().isBlank())
                .collect(Collectors.toMap(
                        YeuCauDangKy::getKhachHangYeuCau,
                        request -> request,
                        this::pickNewestRequest,
                        HashMap::new
                ));
    }

    private YeuCauDangKy pickNewestRequest(YeuCauDangKy left, YeuCauDangKy right) {
        LocalDate leftDate = left.getThoiGianBatDauThueDuKien();
        LocalDate rightDate = right.getThoiGianBatDauThueDuKien();
        if (leftDate == null) {
            return right;
        }
        if (rightDate == null) {
            return left;
        }
        return rightDate.isAfter(leftDate) ? right : left;
    }

    private Map<String, HoSoDatCoc> latestDepositByCustomer(List<HoSoDatCoc> deposits) {
        return deposits.stream()
                .filter(deposit -> deposit.getKhachHangSoHuu() != null && !deposit.getKhachHangSoHuu().isBlank())
                .collect(Collectors.toMap(
                        HoSoDatCoc::getKhachHangSoHuu,
                        deposit -> deposit,
                        this::pickNewestDeposit,
                        HashMap::new
                ));
    }

    private HoSoDatCoc pickNewestDeposit(HoSoDatCoc left, HoSoDatCoc right) {
        LocalDate leftDate = left.getNgayLap();
        LocalDate rightDate = right.getNgayLap();
        if (leftDate == null) {
            return right;
        }
        if (rightDate == null) {
            return left;
        }
        return rightDate.isAfter(leftDate) ? right : left;
    }

    private BigDecimal defaultMoney(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount.setScale(0, RoundingMode.HALF_UP);
    }

    private String resolveCustomerName(String customerId, Map<String, String> customerNames) {
        if (customerId == null || customerId.isBlank()) {
            return "Không rõ khách hàng";
        }
        return customerNames.getOrDefault(customerId, customerId);
    }
}