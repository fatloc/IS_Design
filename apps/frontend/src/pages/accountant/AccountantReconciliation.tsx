import { useState } from "react";
import {
  Search, ChevronDown, FileDown, CheckCircle, AlertTriangle,
  ArrowRight, Minus, Calculator, Info, DollarSign, Home,
  Calendar, User, Scale
} from "lucide-react";
import {
  reconciliationResidents, ReconciliationResident,
  refundScaleMap, RefundScenario
} from "../../data/accountantMockData";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ";
const fmtAbs = (n: number) => Math.abs(n).toLocaleString("vi-VN") + " đ";

const scenarioLabels: Record<RefundScenario, string> = {
  Cancelled:    "Huỷ / Chưa ký HĐ",
  "Short Stay": "Đã ký & ở < 6 tháng",
  "Long Stay":  "Đã ký & ở ≥ 6 tháng",
  Expired:      "Hết hạn HĐ (đúng kỳ)",
};

function monthsBetween(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  return (e.getFullYear() - s.getFullYear()) * 12 + e.getMonth() - s.getMonth();
}

function DeductionRow({ label, amount, color = "text-red-600", sublabel }: { label: string; amount: number; color?: string; sublabel?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-2">
        <Minus size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
        <div>
          <span className="text-sm text-slate-700">{label}</span>
          {sublabel && <div className="text-xs text-slate-400 mt-0.5">{sublabel}</div>}
        </div>
      </div>
      <span className={`text-sm ${color}`} style={{ fontWeight: 600 }}>
        {amount > 0 ? `–${fmtAbs(amount)}` : <span className="text-slate-300">—</span>}
      </span>
    </div>
  );
}

function RefundScaleCard({ current, scenario, onSelect }: {
  current: RefundScenario;
  scenario: RefundScenario;
  onSelect: (s: RefundScenario) => void;
}) {
  const cfg = refundScaleMap[scenario];
  const isActive = current === scenario;
  return (
    <button onClick={() => onSelect(scenario)}
      className={`rounded-xl border-2 p-3.5 text-left transition-all w-full ${
        isActive
          ? "border-violet-500 bg-violet-50 shadow-sm"
          : "border-slate-200 bg-white hover:border-violet-300"
      }`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-600" style={{ fontWeight: 500 }}>{cfg.label}</span>
        <span className={`text-lg ${cfg.color}`} style={{ fontWeight: 800 }}>{cfg.pct}%</span>
      </div>
      <div className="text-xs text-slate-400">{cfg.description}</div>
      {isActive && (
        <div className="mt-2 flex items-center gap-1 text-xs text-violet-700" style={{ fontWeight: 600 }}>
          <CheckCircle size={11} /> Đang áp dụng
        </div>
      )}
    </button>
  );
}

export default function AccountantReconciliation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState<ReconciliationResident | null>(null);
  const [overrideScenario, setOverrideScenario] = useState<RefundScenario | null>(null);
  const [exported, setExported] = useState(false);

  const filteredResidents = reconciliationResidents.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.roomId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (r: ReconciliationResident) => {
    setSelected(r);
    setSearchQuery(r.name);
    setShowDropdown(false);
    setOverrideScenario(null);
    setExported(false);
  };

  const activeScenario = overrideScenario ?? selected?.scenario ?? null;
  const scalePct = activeScenario ? refundScaleMap[activeScenario].pct : 0;

  // Calculations
  const deposit = selected?.depositAmount ?? 0;
  const unpaidRent = selected?.unpaidRent ?? 0;
  const electricity = selected?.electricity ?? 0;
  const water = selected?.water ?? 0;
  const damage = selected?.damageFee ?? 0;
  const fine = selected?.violationFine ?? 0;
  const totalDeductions = unpaidRent + electricity + water + damage + fine;
  const afterDeductions = deposit - totalDeductions;
  const refundableBase = Math.max(afterDeductions, 0);
  const refundAmount = Math.round(refundableBase * scalePct / 100);
  const finalResult = refundAmount - Math.max(-afterDeductions, 0);
  const isRefund = finalResult >= 0;

  const months = selected ? monthsBetween(selected.contractStart, selected.contractEnd) : 0;

  const handleExport = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Refund scale banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={16} className="text-violet-600" />
          <h2 className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Bảng tỷ lệ hoàn cọc theo thời gian ở</h2>
          <div className="ml-auto flex items-center gap-1 text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
            <Info size={11} /> Nhấn để chọn kịch bản
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(["Cancelled","Short Stay","Long Stay","Expired"] as RefundScenario[]).map(s => (
            <RefundScaleCard key={s} current={activeScenario ?? "Expired"} scenario={s} onSelect={setOverrideScenario} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Left: Search + Resident Info */}
        <div className="col-span-2 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h2 className="text-sm text-slate-900 mb-3" style={{ fontWeight: 600 }}>Tìm cư dân / phòng trả</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Tên hoặc mã phòng..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300"
              />
              {showDropdown && filteredResidents.length > 0 && (
                <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-white border border-slate-200 rounded-xl shadow-xl py-1 max-h-48 overflow-y-auto">
                  {filteredResidents.map(r => (
                    <button key={r.id} onClick={() => handleSelect(r)}
                      className="w-full text-left px-4 py-3 hover:bg-violet-50 transition">
                      <div className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{r.name}</div>
                      <div className="text-xs text-slate-400">Phòng {r.roomId} · {r.contractStart} → {r.contractEnd}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-3 text-xs text-slate-400">
              {reconciliationResidents.length} cư dân đang chờ đối soát
            </div>
          </div>

          {/* Resident card */}
          {selected && (
            <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-5 space-y-3">
              <h3 className="text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Thông tin cư dân</h3>
              {[
                { icon: User, label: "Tên cư dân", value: selected.name },
                { icon: Home, label: "Phòng", value: selected.roomId },
                { icon: Calendar, label: "Ngày ở", value: `${selected.contractStart} → ${selected.contractEnd}` },
                { icon: Calculator, label: "Thời gian ở", value: `${months} tháng` },
                { icon: DollarSign, label: "Tiền cọc gốc", value: fmt(selected.depositAmount) },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <item.icon size={13} className="text-violet-500" />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.label}</span>
                    <span className="text-xs text-slate-700" style={{ fontWeight: 500 }}>{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Calculation */}
        <div className="col-span-3 space-y-4">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 h-full flex flex-col items-center justify-center py-20 text-center">
              <Scale size={40} className="text-slate-200 mb-3" />
              <p className="text-sm text-slate-400" style={{ fontWeight: 500 }}>Chọn cư dân để bắt đầu đối soát</p>
              <p className="text-xs text-slate-300 mt-1">Tìm kiếm theo tên hoặc mã phòng ở bên trái</p>
            </div>
          ) : (
            <>
              {/* Breakdown */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
                  <Calculator size={15} className="text-violet-500" />
                  <h2 className="text-sm text-slate-900" style={{ fontWeight: 600 }}>Bảng tính đối soát</h2>
                </div>
                <div className="p-5">
                  {/* Base deposit */}
                  <div className="flex items-center justify-between py-3 border-b border-slate-200 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                        <DollarSign size={12} className="text-emerald-600" />
                      </div>
                      <span className="text-sm text-slate-700" style={{ fontWeight: 600 }}>Tiền cọc ban đầu</span>
                    </div>
                    <span className="text-sm text-emerald-700" style={{ fontWeight: 700 }}>{fmt(deposit)}</span>
                  </div>

                  {/* Deductions */}
                  <div className="mb-2">
                    <div className="text-xs text-slate-400 mb-2 px-0.5" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Các khoản khấu trừ
                    </div>
                    <DeductionRow label="Tiền thuê còn thiếu" amount={unpaidRent} sublabel={unpaidRent === 0 ? "Không có" : undefined} color={unpaidRent > 0 ? "text-red-600" : "text-slate-300"} />
                    <DeductionRow label="Tiền điện tháng cuối" amount={electricity} sublabel={electricity > 0 ? "Theo chỉ số công tơ" : "Không có"} color={electricity > 0 ? "text-red-600" : "text-slate-300"} />
                    <DeductionRow label="Tiền nước tháng cuối" amount={water} sublabel={water > 0 ? "Theo chỉ số đồng hồ" : "Không có"} color={water > 0 ? "text-red-600" : "text-slate-300"} />
                    <DeductionRow label="Phí hư hỏng tài sản" amount={damage} sublabel={damage > 0 ? "Theo biên bản bàn giao" : "Không có"} color={damage > 0 ? "text-red-600" : "text-slate-300"} />
                    <DeductionRow label="Phạt vi phạm nội quy" amount={fine} sublabel={fine > 0 ? "Theo quyết định xử lý" : "Không có"} color={fine > 0 ? "text-red-600" : "text-slate-300"} />
                  </div>

                  {/* After deductions subtotal */}
                  <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                    <span className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Còn lại sau khấu trừ</span>
                    <span className={`text-sm ${afterDeductions >= 0 ? "text-slate-800" : "text-red-600"}`} style={{ fontWeight: 700 }}>
                      {fmt(afterDeductions)}
                    </span>
                  </div>

                  {/* Scale application */}
                  <div className={`rounded-xl border p-3.5 mb-4 ${
                    refundScaleMap[activeScenario!].pct === 100 ? "bg-emerald-50 border-emerald-200" :
                    refundScaleMap[activeScenario!].pct >= 70 ? "bg-blue-50 border-blue-200" :
                    refundScaleMap[activeScenario!].pct >= 50 ? "bg-amber-50 border-amber-200" :
                    "bg-red-50 border-red-200"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-500" style={{ fontWeight: 500 }}>Kịch bản hoàn cọc</div>
                        <div className="text-sm text-slate-800 mt-0.5" style={{ fontWeight: 600 }}>
                          {scenarioLabels[activeScenario!]}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl ${refundScaleMap[activeScenario!].color}`} style={{ fontWeight: 800 }}>
                          {scalePct}%
                        </div>
                        <div className="text-xs text-slate-400">tỷ lệ hoàn</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span>{fmt(refundableBase)} × {scalePct}%</span>
                      <ArrowRight size={12} />
                      <span style={{ fontWeight: 600 }}>{fmt(refundAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Final result */}
              <div className={`rounded-2xl border-2 p-5 shadow-sm ${isRefund ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs mb-1" style={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: isRefund ? "#059669" : "#dc2626" }}>
                      {isRefund ? "Hoàn trả cho khách hàng" : "Thu thêm từ khách hàng"}
                    </div>
                    <div className={`text-3xl ${isRefund ? "text-emerald-700" : "text-red-700"}`} style={{ fontWeight: 800 }}>
                      {isRefund ? "" : "+"}{fmt(Math.abs(finalResult))}
                    </div>
                    <div className="text-xs mt-1" style={{ color: isRefund ? "#6ee7b7" : "#fca5a5", fontWeight: 500 }}>
                      {isRefund
                        ? `Hoàn ${scalePct}% cọc sau khi trừ chi phí`
                        : "Khách cần bù thêm phần còn thiếu"}
                    </div>
                  </div>
                  {isRefund
                    ? <CheckCircle size={40} className="text-emerald-400 opacity-60" />
                    : <AlertTriangle size={40} className="text-red-400 opacity-60" />}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleExport}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition shadow-sm ${
                    exported
                      ? "bg-emerald-600 text-white"
                      : "bg-violet-600 text-white hover:bg-violet-700"
                  }`}
                  style={{ fontWeight: 600 }}>
                  {exported
                    ? <><CheckCircle size={16} /> Đã xuất PDF!</>
                    : <><FileDown size={16} /> Xuất PDF Đối soát</>}
                </button>
                <button className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50 transition" style={{ fontWeight: 500 }}>
                  Lưu nháp
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
