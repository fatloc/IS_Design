import { useState } from "react";
import { CheckCircle, Clock, AlertCircle, XCircle, Send, Bell, ChevronDown, User, Home, DollarSign, Calendar, Info } from "lucide-react";
import { depositRecords as initialRecords, DepositRecord, DepositStatus } from "../../data/saleMockData";

const statusConfig: Record<DepositStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Pending Approval": {
    label: "Chờ duyệt", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock
  },
  "Awaiting Payment": {
    label: "Chờ thanh toán", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: AlertCircle
  },
  "Deposited": {
    label: "Đã đặt cọc", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", icon: CheckCircle
  },
  "Cancelled": {
    label: "Đã huỷ", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: XCircle
  },
};

const statusOrder: DepositStatus[] = ["Pending Approval", "Awaiting Payment", "Deposited", "Cancelled"];

function fmt(n: number) {
  return n.toLocaleString("vi-VN") + " đ";
}

function DepositCard({ record, onSubmit, onNotify }: {
  record: DepositRecord;
  onSubmit: (id: string) => void;
  onNotify: (id: string) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const cfg = statusConfig[record.status];
  const Icon = cfg.icon;

  return (
    <div className={`bg-white rounded-2xl border-2 ${cfg.border} shadow-sm overflow-hidden transition-all hover:shadow-md`}>
      {/* Status banner for deposited */}
      {record.status === "Deposited" && (
        <div className="bg-emerald-600 px-5 py-2.5 flex items-center gap-2">
          <CheckCircle size={14} className="text-white" />
          <span className="text-white text-xs" style={{ fontWeight: 600 }}>Đặt cọc thành công! Sẵn sàng bàn giao.</span>
        </div>
      )}

      <div className="p-5">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={cfg.color} />
            </div>
            <div>
              <div className="text-sm text-slate-900" style={{ fontWeight: 700 }}>{record.clientName}</div>
              <div className="text-xs text-slate-400 mt-0.5">{record.id} · {record.phone}</div>
            </div>
          </div>
          <span className={`text-xs px-2.5 py-1.5 rounded-xl border ${cfg.bg} ${cfg.color} ${cfg.border}`} style={{ fontWeight: 600 }}>
            {cfg.label}
          </span>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
            <Home size={13} className="text-slate-400 mt-0.5" />
            <div>
              <div className="text-xs text-slate-400">Phòng mục tiêu</div>
              <div className="text-sm text-slate-700 mt-0.5" style={{ fontWeight: 500 }}>{record.targetRoom}</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
            <DollarSign size={13} className="text-emerald-500 mt-0.5" />
            <div>
              <div className="text-xs text-slate-400">Tiền cọc</div>
              <div className="text-sm text-emerald-700 mt-0.5" style={{ fontWeight: 600 }}>{fmt(record.depositAmount)}</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
            <Calendar size={13} className="text-blue-400 mt-0.5" />
            <div>
              <div className="text-xs text-slate-400">Giá thuê / tháng</div>
              <div className="text-sm text-slate-700 mt-0.5" style={{ fontWeight: 500 }}>{fmt(record.monthlyRent)}</div>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50">
            <Clock size={13} className="text-amber-400 mt-0.5" />
            <div>
              <div className="text-xs text-slate-400">Ngày nộp</div>
              <div className="text-sm text-slate-700 mt-0.5" style={{ fontWeight: 500 }}>{record.submittedAt || "—"}</div>
            </div>
          </div>
        </div>

        {/* Note */}
        {record.note && (
          <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100">
            <Info size={13} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-amber-700">{record.note}</span>
          </div>
        )}

        {/* Timeline */}
        <button onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 transition mb-3"
          style={{ fontWeight: 500 }}>
          <ChevronDown size={12} className={`transition-transform ${showHistory ? "rotate-180" : ""}`} />
          Lịch sử trạng thái
        </button>
        {showHistory && (
          <div className="space-y-2 mb-4">
            {[
              { date: record.submittedAt, label: "Đã nộp hồ sơ", active: !!record.submittedAt },
              { date: record.approvedAt, label: "Manager đã duyệt", active: !!record.approvedAt },
              { date: record.paidAt, label: "Đã thanh toán cọc", active: !!record.paidAt },
            ].map((step, i) => (
              <div key={i} className={`flex items-center gap-2.5 text-xs ${step.active ? "text-slate-600" : "text-slate-300"}`}>
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${step.active ? "bg-emerald-100" : "bg-slate-100"}`}>
                  {step.active ? <CheckCircle size={11} className="text-emerald-600" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />}
                </div>
                <span style={{ fontWeight: step.active ? 500 : 400 }}>{step.label}</span>
                {step.date && <span className="text-slate-400 ml-auto">{step.date}</span>}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {record.status === "Pending Approval" && (
            <button onClick={() => onSubmit(record.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition shadow-sm"
              style={{ fontWeight: 600 }}>
              <Send size={14} /> Gửi Manager duyệt
            </button>
          )}
          {record.status === "Awaiting Payment" && (
            <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
              style={{ fontWeight: 600 }}>
              <Clock size={14} /> Xác nhận đã nhận cọc
            </button>
          )}
          {record.status === "Deposited" && (
            <button onClick={() => onNotify(record.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition shadow-sm"
              style={{ fontWeight: 600 }}>
              <Bell size={14} /> Thông báo lịch nhận phòng
            </button>
          )}
          {record.status === "Cancelled" && (
            <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 text-slate-400 text-sm"
              style={{ fontWeight: 500 }}>
              <XCircle size={14} /> Hồ sơ đã huỷ
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SaleDeposits() {
  const [records, setRecords] = useState(initialRecords);
  const [activeStatus, setActiveStatus] = useState<DepositStatus | "all">("all");

  const handleSubmit = (id: string) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status: "Awaiting Payment", approvedAt: "2025-04-20" } : r));
  };

  const handleNotify = (id: string) => {
    // In real app, this would send notification
    alert("Đã gửi thông báo lịch nhận phòng cho khách hàng!");
  };

  const filtered = records.filter(r => activeStatus === "all" || r.status === activeStatus);

  const counts = statusOrder.reduce((acc, s) => {
    acc[s] = records.filter(r => r.status === s).length;
    return acc;
  }, {} as Record<DepositStatus, number>);

  return (
    <div className="space-y-5">
      {/* Pipeline header */}
      <div className="grid grid-cols-4 gap-4">
        {statusOrder.map(s => {
          const cfg = statusConfig[s];
          const Icon = cfg.icon;
          return (
            <button key={s} onClick={() => setActiveStatus(activeStatus === s ? "all" : s)}
              className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                activeStatus === s ? `${cfg.bg} ${cfg.border}` : "bg-white border-slate-200 hover:border-slate-300"
              }`}>
              <div className={`w-10 h-10 rounded-xl ${cfg.bg} border ${cfg.border} flex items-center justify-center flex-shrink-0`}>
                <Icon size={18} className={cfg.color} />
              </div>
              <div>
                <div className="text-xl text-slate-900" style={{ fontWeight: 700 }}>{counts[s]}</div>
                <div className={`text-xs ${cfg.color}`} style={{ fontWeight: 500 }}>{cfg.label}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 w-fit">
        <button onClick={() => setActiveStatus("all")}
          className={`px-3 py-1.5 rounded-lg text-xs transition ${activeStatus === "all" ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
          style={{ fontWeight: 500 }}>
          Tất cả ({records.length})
        </button>
        {statusOrder.map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${activeStatus === s ? `${statusConfig[s].bg} ${statusConfig[s].color}` : "text-slate-500 hover:bg-slate-50"}`}
            style={{ fontWeight: 500 }}>
            {statusConfig[s].label} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-2 gap-5">
        {filtered.map(record => (
          <DepositCard key={record.id} record={record} onSubmit={handleSubmit} onNotify={handleNotify} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-16 text-slate-400">
            <CheckCircle size={36} className="mx-auto mb-2 text-slate-200" />
            <p className="text-sm">Không có hồ sơ nào trong danh mục này</p>
          </div>
        )}
      </div>
    </div>
  );
}
