import { useState } from "react";
import {
  Send, Bell, CheckCircle, Clock, XCircle, AlertCircle,
  Home, BedDouble, ChevronRight, Phone, Info, GripVertical,
  ArrowRight
} from "lucide-react";
import { depositRecords as initialRecords, DepositRecord, DepositStatus } from "../../data/saleMockData";
import { useToast } from "../../components/ToastProvider";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ";

const colConfig: Record<DepositStatus, {
  label: string; icon: React.ElementType; color: string; bg: string; border: string; headerBg: string;
}> = {
  "Pending Approval": {
    label: "Chờ Manager duyệt", icon: Clock,
    color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", headerBg: "bg-amber-500",
  },
  "Awaiting Payment": {
    label: "Chờ thanh toán", icon: AlertCircle,
    color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", headerBg: "bg-blue-500",
  },
  "Deposited": {
    label: "Đã đặt cọc", icon: CheckCircle,
    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", headerBg: "bg-emerald-500",
  },
  "Cancelled": {
    label: "Đã huỷ", icon: XCircle,
    color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", headerBg: "bg-slate-400",
  },
};

const COLUMNS: DepositStatus[] = ["Pending Approval", "Awaiting Payment", "Deposited", "Cancelled"];

function DepositCard({
  record, onSubmit, onNotify, onMove,
}: {
  record: DepositRecord;
  onSubmit: (id: string) => void;
  onNotify: (id: string) => void;
  onMove: (id: string, status: DepositStatus) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const isWhole = record.rentalMode === "Whole Room";

  return (
    <div className={`bg-white rounded-xl border-2 shadow-sm transition-all hover:shadow-md group ${colConfig[record.status].border}`}>
      {/* Deposited success banner */}
      {record.status === "Deposited" && (
        <div className="bg-emerald-600 px-4 py-2 rounded-t-xl flex items-center gap-2">
          <CheckCircle size={13} className="text-white" />
          <span className="text-white text-xs" style={{ fontWeight: 600 }}>Đặt cọc thành công!</span>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-2.5 mb-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isWhole ? "bg-violet-100" : "bg-teal-100"}`}>
            {isWhole ? <Home size={15} className="text-violet-700" /> : <BedDouble size={15} className="text-teal-700" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-slate-900 flex items-center gap-2" style={{ fontWeight: 700 }}>
              {record.clientName}
              {record.status === "Awaiting Payment" && record.approvedAt && (
                new Date().getTime() - new Date(record.approvedAt).getTime() > 24 * 60 * 60 * 1000
              ) && (
                <span className="px-2 py-0.5 rounded text-[0.65rem] bg-red-100 text-red-600 border border-red-200" style={{ fontWeight: 800 }}>
                  Quá hạn 24h
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Phone size={9} /> {record.phone}
            </div>
          </div>
          <span className="text-xs text-slate-300" style={{ fontWeight: 500 }}>{record.id}</span>
        </div>

        {/* Reserved asset – key info */}
        <div className={`rounded-xl px-3 py-2.5 mb-3 border ${isWhole ? "bg-violet-50 border-violet-100" : "bg-teal-50 border-teal-100"}`}>
          <div className={`text-xs mb-0.5 ${isWhole ? "text-violet-500" : "text-teal-500"}`} style={{ fontWeight: 600 }}>
            {isWhole ? "🏠 Toàn phòng" : "🛏 Ghép giường"}
          </div>
          <div className={`text-sm ${isWhole ? "text-violet-900" : "text-teal-900"}`} style={{ fontWeight: 600 }}>
            {record.reservedAsset}
          </div>
          {record.specificBeds && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {record.specificBeds.map(b => (
                <span key={b} className={`text-xs px-2 py-0.5 rounded-lg border ${isWhole ? "bg-violet-100 border-violet-200 text-violet-700" : "bg-teal-100 border-teal-200 text-teal-700"}`} style={{ fontWeight: 700 }}>
                  Giường {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-slate-50 rounded-lg p-2.5">
            <div className="text-xs text-slate-400">Tiền cọc</div>
            <div className="text-sm text-emerald-700 mt-0.5" style={{ fontWeight: 700 }}>{fmt(record.depositAmount)}</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2.5">
            <div className="text-xs text-slate-400">Thuê/tháng</div>
            <div className="text-sm text-slate-700 mt-0.5" style={{ fontWeight: 700 }}>{fmt(record.monthlyRent)}</div>
          </div>
        </div>

        {/* Note */}
        {record.note && (
          <div className="flex items-start gap-1.5 mb-3 px-2.5 py-2 rounded-lg bg-amber-50 border border-amber-100">
            <Info size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-amber-700">{record.note}</span>
          </div>
        )}

        {/* Mini timeline toggle */}
        <button onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 mb-2 transition" style={{ fontWeight: 500 }}>
          <ChevronRight size={12} className={`transition-transform ${showHistory ? "rotate-90" : ""}`} />
          Lịch sử xử lý
        </button>
        {showHistory && (
          <div className="space-y-1.5 mb-3 pl-2">
            {[
              { label: "Nộp hồ sơ", date: record.submittedAt, done: !!record.submittedAt },
              { label: "Manager duyệt", date: record.approvedAt, done: !!record.approvedAt },
              { label: "Thanh toán cọc", date: record.paidAt, done: !!record.paidAt },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs ${step.done ? "text-slate-600" : "text-slate-300"}`}>
                <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-emerald-100" : "bg-slate-100"}`}>
                  {step.done ? <CheckCircle size={10} className="text-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                <span style={{ fontWeight: step.done ? 500 : 400 }}>{step.label}</span>
                {step.date && <span className="ml-auto text-slate-400">{step.date}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Action button */}
        {record.status === "Pending Approval" && (
          <button onClick={() => onSubmit(record.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 text-white text-xs hover:bg-amber-600 transition"
            style={{ fontWeight: 700 }}>
            <Send size={13} /> Gửi Manager duyệt
          </button>
        )}
        {record.status === "Awaiting Payment" && (
          <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-xs hover:bg-blue-700 transition"
            style={{ fontWeight: 600 }}>
            <Clock size={13} /> Xác nhận đã nhận cọc
          </button>
        )}
        {record.status === "Deposited" && (
          <button onClick={() => onNotify(record.id)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition"
            style={{ fontWeight: 600 }}>
            <Bell size={13} /> Thông báo lịch nhận phòng
          </button>
        )}
        {record.status === "Cancelled" && (
          <div className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-100 text-slate-400 text-xs"
            style={{ fontWeight: 500 }}>
            <XCircle size={13} /> Đã huỷ hồ sơ
          </div>
        )}

        {/* Move card shortcuts */}
        <div className="mt-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          {COLUMNS.filter(c => c !== record.status).slice(0, 2).map(c => (
            <button key={c} onClick={() => onMove(record.id, c)}
              className="flex-1 text-xs py-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition truncate px-1"
              style={{ fontWeight: 500 }}>
              → {colConfig[c].label.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SaleDeposits() {
  const { addToast } = useToast();
  const [records, setRecords] = useState(initialRecords);

  const handleSubmit = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "Awaiting Payment", approvedAt: "2025-04-20" } : r));
  };
  const handleNotify = (_id: string) => {
    addToast({ message: "Đã gửi thông báo lịch nhận phòng cho khách hàng!", type: "success" });
  };
  const handleMove = (id: string, status: DepositStatus) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const totalDeposited = records.filter(r => r.status === "Deposited").reduce((s, r) => s + r.depositAmount, 0);
  const pendingCount = records.filter(r => r.status === "Pending Approval").length;

  return (
    <div className="space-y-5">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-4">
        {COLUMNS.map(status => {
          const cfg = colConfig[status];
          const Icon = cfg.icon;
          const count = records.filter(r => r.status === status).length;
          return (
            <div key={status} className={`bg-white rounded-2xl border-2 ${cfg.border} p-4 shadow-sm flex items-center gap-3`}>
              <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={cfg.color} />
              </div>
              <div>
                <div className="text-2xl text-slate-900" style={{ fontWeight: 700 }}>{count}</div>
                <div className={`text-xs ${cfg.color}`} style={{ fontWeight: 500 }}>{cfg.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-4 gap-4 items-start">
        {COLUMNS.map(status => {
          const cfg = colConfig[status];
          const Icon = cfg.icon;
          const colCards = records.filter(r => r.status === status);
          return (
            <div key={status} className="bg-slate-100/60 rounded-2xl border border-slate-200 overflow-hidden">
              {/* Column header */}
              <div className={`px-4 py-3 flex items-center justify-between`} style={{ background: `linear-gradient(to right, ${status === "Pending Approval" ? "#f59e0b,#f97316" : status === "Awaiting Payment" ? "#3b82f6,#6366f1" : status === "Deposited" ? "#10b981,#059669" : "#94a3b8,#64748b"})` }}>
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-white" />
                  <span className="text-white text-xs" style={{ fontWeight: 700 }}>{cfg.label}</span>
                </div>
                <span className="w-6 h-6 rounded-full bg-white/20 text-white text-xs flex items-center justify-center" style={{ fontWeight: 700 }}>
                  {colCards.length}
                </span>
              </div>

              {/* Cards */}
              <div className="p-3 space-y-3 min-h-[200px]">
                {colCards.map(record => (
                  <DepositCard
                    key={record.id}
                    record={record}
                    onSubmit={handleSubmit}
                    onNotify={handleNotify}
                    onMove={handleMove}
                  />
                ))}
                {colCards.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-slate-300">
                    <GripVertical size={24} className="mb-1" />
                    <p className="text-xs">Không có hồ sơ</p>
                  </div>
                )}
              </div>

              {/* Column footer – total if Deposited */}
              {status === "Deposited" && colCards.length > 0 && (
                <div className="px-4 py-3 border-t border-emerald-200 bg-emerald-50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-emerald-600" style={{ fontWeight: 500 }}>Tổng cọc đã thu</span>
                    <span className="text-sm text-emerald-700" style={{ fontWeight: 700 }}>
                      {colCards.reduce((s, r) => s + r.depositAmount, 0).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
