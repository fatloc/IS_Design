import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, CircleDollarSign, Calculator, CheckCircle2, CreditCard, RefreshCcw, Search, ShieldCheck,
  TriangleAlert, Wallet
} from "lucide-react";
import { getAccountingWorkflows, money, type AccountingWorkflows } from "../../services/accounting";
import {
  updateRequest,
  createTransaction,
  updateTransaction,
  createDeposit,
} from "../../services/api";
import { useToast } from "../../components/ToastProvider";

type WorkflowMode = "deposit" | "movein" | "reconciliation";

type Props = {
  mode: WorkflowMode;
};

const MODE_META: Record<WorkflowMode, { title: string; subtitle: string; accent: string; icon: React.ElementType }> = {
  deposit: {
    title: "Thanh toán tiền cọc",
    subtitle: "Lấy yêu cầu thuê từ sale và sinh yêu cầu thu cọc theo dữ liệu DB.",
    accent: "from-amber-50 to-orange-50",
    icon: Wallet,
  },
  movein: {
    title: "Thanh toán đầu kỳ",
    subtitle: "Hệ thống lấy hợp đồng đã ký và tính số tiền cần thu khi vào ở.",
    accent: "from-sky-50 to-blue-50",
    icon: CreditCard,
  },
  reconciliation: {
    title: "Đối soát chi phí & trả phòng",
    subtitle: "Kế toán xác nhận khấu trừ, hoàn cọc hoặc thu bù trước khi trả phòng.",
    accent: "from-emerald-50 to-teal-50",
    icon: RefreshCcw,
  },
};

function SectionCard({ title, value, helper, icon: Icon, tone }: { title: string; value: string; helper: string; icon: React.ElementType; tone: string; }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-gradient-to-br ${tone} p-4 shadow-sm`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{title}</div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{helper}</div>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-white/80 flex items-center justify-center text-slate-700">
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

export default function AccountingWorkflowPage({ mode }: Props) {
  const meta = MODE_META[mode];
  const [data, setData] = useState<AccountingWorkflows | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [scenario, setScenario] = useState<"all" | string>("all");
  const [openDeposit, setOpenDeposit] = useState<null | AccountingWorkflows["depositQueue"][number]>(null);
  const [openMoveIn, setOpenMoveIn] = useState<null | AccountingWorkflows["moveInPayments"][number]>(null);
  const [openReconciliation, setOpenReconciliation] = useState<null | AccountingWorkflows["reconciliationQueue"][number]>(null);
  const [finalAmount, setFinalAmount] = useState<number | string>(0);
  const [reconRate, setReconRate] = useState<number>(80);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const workflows = await getAccountingWorkflows();
        if (active) {
          setData(workflows);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!data) {
      return [];
    }

    const search = query.trim().toLowerCase();

    if (mode === "deposit") {
      return data.depositQueue.filter((item) => {
        const haystack = [item.customerName, item.customerId, item.requestId, item.area, item.requestStatus].filter(Boolean).join(" ").toLowerCase();
        return !search || haystack.includes(search);
      });
    }

    if (mode === "movein") {
      return data.moveInPayments.filter((item) => {
        const haystack = [item.customerName, item.customerId, item.contractId, item.rentType, item.paymentCycle].filter(Boolean).join(" ").toLowerCase();
        return !search || haystack.includes(search);
      });
    }

    return data.reconciliationQueue.filter((item) => {
      const haystack = [item.customerName, item.customerId, item.contractId, item.roomRef, item.scenario].filter(Boolean).join(" ").toLowerCase();
      const matchesScenario = scenario === "all" || item.scenario === scenario;
      return (!search || haystack.includes(search)) && matchesScenario;
    });
  }, [data, mode, query, scenario]);

  const summary = data?.summary;

  async function refresh() {
    try {
      setLoading(true);
      const workflows = await getAccountingWorkflows();
      setData(workflows);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDeposit() {
    if (!openDeposit) return;
    try {
      setLoading(true);
      // create deposit record (mucTienCoc expected as string/decimal)
      await createDeposit({ mucTienCoc: String(finalAmount) as any });
      // update request status to awaiting payment
      await updateRequest(openDeposit.requestId, { trangThaiYeuCau: "Chờ thanh toán" });
      const { addToast } = useToast();
      addToast({ message: "Yêu cầu thu đã được tạo (mock). Dữ liệu đã cập nhật từ DB.", type: "success" });
      setOpenDeposit(null);
      await refresh();
    } catch (err) {
      console.error(err);
      const { addToast } = useToast();
      addToast({ message: "Không thể tạo yêu cầu thu: lỗi", type: "error" });
    }
  }

  async function handleConfirmMoveIn() {
    if (!openMoveIn) return;
    try {
      setLoading(true);
      // create a transaction record (basic)
      await createTransaction({ loaiGiaoDich: "Thu đầu kỳ", ghiChu: `Thu đầu kỳ hợp đồng ${openMoveIn.contractId}`, ngayGiaoDich: new Date().toISOString().split("T")[0] } as any);
      const { addToast } = useToast();
      addToast({ message: "Ghi nhận thu đầu kỳ (mock). Vui lòng kiểm tra giao dịch.", type: "success" });
      setOpenMoveIn(null);
      await refresh();
    } catch (err) {
      console.error(err);
      const { addToast } = useToast();
      addToast({ message: "Không thể ghi nhận thu: lỗi", type: "error" });
    }
  }

  async function handleConfirmReconciliation(ratePercent: number, deductions: number) {
    if (!openReconciliation) return;
    try {
      setLoading(true);
      const base = Number(openReconciliation.depositAmount ?? 0) * (ratePercent / 100);
      const net = base - deductions;
      const type = net < 0 ? "Collection" : "Refund";
      await createTransaction({ loaiGiaoDich: type, ghiChu: `Đối soát ${openReconciliation.contractId} net=${net}`, ngayGiaoDich: new Date().toISOString().split("T")[0] } as any);
      const { addToast } = useToast();
      addToast({ message: `Đối soát hoàn tất (mock). Net: ${money(net)}`, type: "success" });
      setOpenReconciliation(null);
      await refresh();
    } catch (err) {
      console.error(err);
      const { addToast } = useToast();
      addToast({ message: "Không thể hoàn tất đối soát: lỗi", type: "error" });
    }
  }

  const topBoxes = mode === "deposit"
    ? [
        { title: "Yêu cầu chờ thu", value: String(summary?.pendingDepositRequests ?? 0), helper: `Tổng dự kiến ${money(summary?.expectedDepositAmount)}`, icon: CircleDollarSign, tone: "from-amber-50 to-orange-50" },
        { title: "Cọc trung bình", value: money(rows.length ? rows.reduce((sum, item) => sum + item.depositAmount, 0) / rows.length : 0), helper: "Theo dữ liệu yêu cầu thuê", icon: Wallet, tone: "from-sky-50 to-blue-50" },
      ]
    : mode === "movein"
      ? [
          { title: "Hợp đồng chờ thu", value: String(summary?.pendingMoveInPayments ?? 0), helper: `Tổng dự kiến ${money(summary?.expectedMoveInAmount)}`, icon: CreditCard, tone: "from-sky-50 to-blue-50" },
          { title: "Khoản thu TB", value: money(rows.length ? rows.reduce((sum, item) => sum + item.moveInAmount, 0) / rows.length : 0), helper: "Tính từ hợp đồng đã ký", icon: CircleDollarSign, tone: "from-amber-50 to-orange-50" },
        ]
      : [
          { title: "Hồ sơ đối soát", value: String(summary?.pendingReconciliations ?? 0), helper: `Hoàn dự kiến ${money(summary?.expectedRefundAmount)}`, icon: RefreshCcw, tone: "from-emerald-50 to-teal-50" },
          { title: "Bù thu dự kiến", value: money(summary?.expectedCollectionAmount), helper: "Khách còn nợ sau đối soát", icon: ShieldCheck, tone: "from-violet-50 to-fuchsia-50" },
        ];

  if (loading && !data) {
    return <div className="py-16 text-center text-sm text-slate-400">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-5">
      <div className={`rounded-3xl border border-slate-200 bg-gradient-to-br ${meta.accent} p-6 shadow-sm`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-xs font-semibold text-slate-700">
              <meta.icon size={12} /> Kế toán
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">{meta.title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{meta.subtitle}</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 rounded-full px-3 py-2">
            <CheckCircle2 size={12} /> Dữ liệu DB thật
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topBoxes.map((box) => (
          <SectionCard key={box.title} title={box.title} value={box.value} helper={box.helper} icon={box.icon} tone={box.tone} />
        ))}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between px-5 py-4 border-b border-slate-100">
          <div className="relative w-full lg:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo khách hàng, phòng, hợp đồng..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          {mode === "reconciliation" && (
            <div className="flex flex-wrap gap-2">
              {(["all", "Cancelled", "Short Stay", "Long Stay", "Expired"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setScenario(item)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${scenario === item ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                >
                  {item === "all" ? "Tất cả" : item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                {mode === "deposit" && ["Mã yêu cầu", "Khách hàng", "Khu vực", "Mức cọc", "Trạng thái", "Thao tác"].map((heading) => <th key={heading} className="px-5 py-3.5">{heading}</th>)}
                {mode === "movein" && ["Mã HĐ", "Khách hàng", "Hình thức", "Tiền đầu kỳ", "Kỳ thanh toán", "Thao tác"].map((heading) => <th key={heading} className="px-5 py-3.5">{heading}</th>)}
                {mode === "reconciliation" && ["Mã HĐ", "Khách hàng", "Kịch bản", "Cọc gốc", "Kết quả", "Thao tác"].map((heading) => <th key={heading} className="px-5 py-3.5">{heading}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mode === "deposit" && rows.map((item) => (
                <tr key={item.requestId} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{item.requestId}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-slate-900">{item.customerName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.requestedStartDate ?? "Chưa có ngày"}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.area ?? "-"}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{money(item.depositAmount)}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{item.requestStatus ?? "Chờ xử lý"}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => { setOpenDeposit(item); setFinalAmount(item.depositAmount ?? 0); }} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                      Gửi yêu cầu <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}

              {mode === "movein" && rows.map((item) => (
                <tr key={item.contractId} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{item.contractId}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-slate-900">{item.customerName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.contractDate ?? "Chưa có ngày"}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.rentType ?? "-"}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{money(item.moveInAmount)}</td>
                  <td className="px-5 py-4 text-sm text-slate-500">{item.paymentCycle ?? "-"}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => { setOpenMoveIn(item); setFinalAmount(item.moveInAmount ?? 0); }} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-100 px-3 py-1.5 text-xs font-semibold text-sky-700">
                      Xác nhận đã thu <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}

              {mode === "reconciliation" && rows.map((item) => (
                <tr key={item.contractId} className="hover:bg-slate-50/60 transition">
                  <td className="px-5 py-4 text-sm font-semibold text-slate-700">{item.contractId}</td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-slate-900">{item.customerName}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{item.roomRef ?? "-"}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600">{item.scenario}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-900">{money(item.depositAmount)}</td>
                  <td className="px-5 py-4 text-sm font-semibold text-emerald-700">{money(item.finalBalance)}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => { setOpenReconciliation(item); setFinalAmount(item.finalBalance ?? 0); }} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                      Mở biên bản <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-slate-400">Không có dữ liệu phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {mode === "reconciliation" && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Calculator size={15} className="text-emerald-600" /> Ghi chú nghiệp vụ
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm text-slate-600">
            <div className="rounded-2xl bg-slate-50 p-4">Hoàn cọc cơ bản được tính từ tỷ lệ 50% / 70% / 100% tùy thời gian lưu trú.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Các khoản khấu trừ như nợ phòng, điện nước, bồi thường có thể nhập ở màn biên bản chi tiết.</div>
            <div className="rounded-2xl bg-slate-50 p-4">Kết quả cuối cùng quyết định hoặc thu thêm tiền hoặc lập phiếu chi hoàn cọc.</div>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {openDeposit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Review yêu cầu: {openDeposit.requestId}</h3>
                <div className="text-sm text-slate-500">Khách: {openDeposit.customerName} — Phòng: {openDeposit.area}</div>
              </div>
              <button onClick={() => setOpenDeposit(null)} className="text-sm text-slate-400">Đóng</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="text-sm font-semibold">Thông tin khách & yêu cầu</div>
                <div className="mt-2 text-sm text-slate-700">Tên: {openDeposit.customerName}</div>
                <div className="text-sm text-slate-500">Ngày dự kiến: {openDeposit.requestedStartDate ?? '-'}</div>
              </div>

              <div className="p-4 rounded-lg bg-slate-50">
                <div className="text-sm font-semibold">Tổng hệ thống</div>
                <div className="mt-2 text-lg font-bold text-slate-900">{money(openDeposit.depositAmount)}</div>
                <div className="mt-2 text-sm">Chỉnh sửa tổng cuối (VND)</div>
                <input value={finalAmount} onChange={(e) => setFinalAmount(Number(e.target.value) || 0)} className="mt-2 w-full rounded-md border px-3 py-2" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpenDeposit(null)} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={handleConfirmDeposit} className="px-4 py-2 rounded-lg bg-amber-600 text-white">Confirm & Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* Move-in Modal */}
      {openMoveIn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl bg-white rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Xác nhận thu đầu kỳ: {openMoveIn.contractId}</h3>
                <div className="text-sm text-slate-500">Khách: {openMoveIn.customerName}</div>
              </div>
              <button onClick={() => setOpenMoveIn(null)} className="text-sm text-slate-400">Đóng</button>
            </div>

            <div className="mt-4">
              <div className="text-sm">Số tiền cần thu</div>
              <div className="mt-2 text-2xl font-bold">{money(openMoveIn.moveInAmount)}</div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpenMoveIn(null)} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={handleConfirmMoveIn} className="px-4 py-2 rounded-lg bg-sky-600 text-white">Xác nhận đã thu</button>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Modal */}
      {openReconciliation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Đối soát: {openReconciliation.contractId}</h3>
                <div className="text-sm text-slate-500">Cọc gốc: {money(openReconciliation.depositAmount)}</div>
              </div>
              <button onClick={() => setOpenReconciliation(null)} className="text-sm text-slate-400">Đóng</button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4">
              <div className="flex gap-3 items-center">
                <label className="text-sm font-semibold">Tỷ lệ hoàn</label>
                <select defaultValue="80" onChange={(e) => {
                  const rate = Number(e.target.value);
                  setReconRate(rate);
                  setFinalAmount(Number(openReconciliation.depositAmount ?? 0) * (rate / 100));
                }} className="ml-2 rounded-md border px-3 py-2">
                  <option value={80}>Hoàn 80% (Chưa ký HĐ)</option>
                  <option value={50}>Hoàn 50% (Lưu trú &lt; 6 tháng)</option>
                  <option value={70}>Hoàn 70% (Lưu trú &gt; 6 tháng)</option>
                  <option value={100}>Hoàn 100% (Hết hạn HĐ)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <div className="text-xs text-slate-500">Nợ tiền phòng</div>
                  <input type="number" defaultValue={0} id="ded1" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Phí DV cuối kỳ</div>
                  <input type="number" defaultValue={0} id="ded2" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Bồi thường hư hỏng</div>
                  <input type="number" defaultValue={0} id="ded3" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
              </div>

              <div className="mt-2 text-sm">Kết quả tạm tính: <span className="font-semibold">{money(Number(finalAmount) || 0)}</span></div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setOpenReconciliation(null)} className="px-4 py-2 rounded-lg border">Hủy</button>
              <button onClick={() => {
                const d1 = Number((document.getElementById('ded1') as HTMLInputElement)?.value || 0);
                const d2 = Number((document.getElementById('ded2') as HTMLInputElement)?.value || 0);
                const d3 = Number((document.getElementById('ded3') as HTMLInputElement)?.value || 0);
                // finalAmount currently holds the computed refund base; use reconRate
                handleConfirmReconciliation(reconRate, d1 + d2 + d3);
              }} className="px-4 py-2 rounded-lg bg-emerald-600 text-white">Confirm Reconciliation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}