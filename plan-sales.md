# Kế hoạch cải tiến UI/UX & Pagination cho Role Sale

Mục tiêu: Đề xuất hệ thống Pagination đồng bộ, bổ sung logic Sort/Filter cho Yêu cầu thuê và tối ưu lại Layout Dashboard theo đúng chuẩn Pro Max.

## User Review Required

> [!IMPORTANT]
> **1. Về trường "Ngày tạo mới":** Hiện tại bảng `YEUCAUDANGKY` trong database đang thiếu trường `NgayTao` (Ngày tạo). Tôi đề xuất bổ sung thêm cột `NgayTao` (kiểu `DATE`) vào Database và Entity `YeuCauDangKy`, hoặc chúng ta có thể tận dụng tạm trường `ThoiGianBatDauThueDuKien` để làm bộ lọc ngày tháng. Bạn muốn thêm hẳn cột `NgayTao` mới hay dùng trường có sẵn?
>
> **2. Về thiết kế Pagination:** Tôi đề xuất thiết kế thanh Pagination nằm dưới cùng của Grid, bao gồm thông tin "Đang xem trang X / Y", các nút Previous/Next mượt mà và một Dropdown để chọn số dòng hiển thị (10, 20, 50). Thiết kế sẽ bo góc, dùng màu xám nhạt và hiệu ứng hover tinh tế để không làm rối mắt Gridview chính. Bạn có đồng ý với form thiết kế này không?

## Proposed Changes

### UI/UX Pagination & Layout
1. **[NEW] `apps/frontend/src/components/Pagination.tsx`**:
   - Xây dựng component `Pagination` chuẩn dùng chung.
   - Props nhận vào: `page`, `totalPages`, `size`, `onPageChange`, `onSizeChange`.

2. **[MODIFY] Các màn hình Gridview của Sale (`SaleRequests.tsx`, `SaleAppointments.tsx`, `SaleContracts.tsx`, `SaleCustomers.tsx`, `SaleDeposits.tsx`)**:
   - Nhúng component `<Pagination />` vào dưới cùng của Table.

3. **[MODIFY] `apps/frontend/src/pages/sale/SaleDashboard.tsx`**:
   - Di chuyển khối `{/* Inventory at-a-glance */}` (bao gồm Tình trạng yêu cầu & Phân loại hình thức thuê) lên ngay dưới hàng `Stat Cards` (Lịch xem, Yêu cầu xử lý, Đặt cọc). Khối danh sách "Lịch xem chi tiết" và "Yêu cầu mới" sẽ bị đẩy xuống dưới cùng.

### Backend & API
1. **[MODIFY] `RequestController.java` & `RequestService.java`**:
   - Cập nhật thêm tham số filter `@RequestParam(required = false) String ngayTao` (hoặc month).
   - Truyền tham số `Sort.by(Sort.Direction.DESC, "maYeuCau")` (hoặc `ngayTao`) vào đối tượng `PageRequest` để trả về dữ liệu mới nhất lên đầu mặc định.

2. **[MODIFY] `YeuCauDangKyRepository.java`**:
   - Thêm query JPQL để lọc theo ngày/tháng được truyền xuống.

## Verification Plan
- Chạy thử backend và gọi thử API `/api/requests` xem dữ liệu có được sort mới nhất không.
- Giao diện Dashboard render đủ các KPI Card ở vị trí mới.
- Click chuyển trang Next/Prev trên `SaleRequests` hoạt động trơn tru.
