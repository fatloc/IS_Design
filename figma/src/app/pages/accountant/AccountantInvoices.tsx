import { useState } from "react";
import {
  Plus, Send, CheckCircle, Clock, AlertTriangle, FileText,
  X, Mail, MessageSquare, Zap, Search
} from "lucide-react";
import { invoices as initialInvoices, Invoice, InvoiceStatus } from "../../data/accountantMockData";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ";

const statusCfg: Record<InvoiceStatus, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  "Not Sent": { label: "Chưa gửi",   color: "text-slate-600",   bg: "bg-slate-100",   border: "border-slate-200", icon: Clock },
  "Sent":     { label: "Đã gửi",     color: "text-blue-700",    bg: "bg-blue-50",     border: "border-blue-200",  icon: Send },
  "Paid":     { label: "Đã thanh toán", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
  "Overdue":  { label: "Quá hạn",    color: "text-red-700",     bg: "bg-red-50",      border: "border-red-200",   icon: AlertTriangle },
};

function RecordPaymentModal({
  invoice,
  onClose,
  onSave,
}: {
  invoice: Invoice;
  onClose: () => void;
  onSave: (id: string) => void;
}) {
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("Chuyển khoản");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Ghi nhận thanh toán</h2>
            <p className="text-xs text-slate-400 mt-0.5">{invoice.id} · {invoice.residentName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-violet-50 border border-violet-100 p-4 flex items-center justify-between">
            <div>
              <div className="text-xs text-violet-500" style={{ fontWeight: 500 }}>Phòng {invoice.roomId} · {invoice.period}</div>
              <div className="text-xl text-violet-900 mt-1" style={{ fontWeight: 700 }}>{fmt(invoice.amount)}</div>
            </div>
            <CheckCircle size={28} className="text-violet-300" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>Hình thức thanh toán</label>
            <div className="flex gap-2">
              {["Chuyển khoản", "Tiền mặt", "QR Pay"].map(m => (
                <button key={m} onClick={() => setMethod(m)}
                  className={`flex-1 py-2 rounded-xl text-xs transition border ${method === m ? "bg-violet-600 text-white border-violet-600" : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"}`}
                  style={{ fontWeight: 500 }}>{m}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 600 }}>Ghi chú</label>
            <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
              placeholder="Mã giao dịch, thời gian..." />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition" style={{ fontWeight: 500 }}>Huỷ</button>
          <button onClick={() => { onSave(invoice.id); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm text-white bg-violet-600 hover:bg-violet-700 transition flex items-center gap-2" style={{ fontWeight: 500 }}>
            <CheckCircle size={14} /> Xác nhận đã thu
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AccountantInvoices() {
  const [invoices, setInvoices] = useState(initialInvoices);
  const [filterStatus, setFilterStatus] = useState<InvoiceStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [payModal, setPayModal] = useState<Invoice | null>(null);
  const [generating, setGenerating] = useState(false);

  const filtered = invoices.filter(inv => {
    const matchSearch = inv.residentName.toLowerCase().includes(search.toLowerCase()) || inv.roomId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "all" || inv.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handlePaid = (id: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: "Paid", paidAt: "2025-04-20" } : i));
  };

  const handleSendReminder = (id: string) => {
    setInvoices(prev => prev.map(i => i.id === id ? { ...i, status: "Sent", sentAt: "2025-04-20" } : i));
  };

  const handleGenerateAll = () => {
    setGenerating(true);
    setTimeout(() => {
      setInvoices(prev => prev.map(i => i.status === "Not Sent" ? { ...i, status: "Sent", sentAt: "2025-04-20" } : i));
      setGenerating(false);
    }, 1200);
  };

  const counts = {
    all: invoices.length,
    "Not Sent": invoices.filter(i => i.status === "Not Sent").length,
    Sent: invoices.filter(i => i.status === "Sent").length,
    Paid: invoices.filter(i => i.status === "Paid").length,
    Overdue: invoices.filter(i => i.status === "Overdue").length,
  };

  const totalPaid = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const totalPending = invoices.filter(i => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Đã thu tháng 4</div>
            <div className="text-sm text-emerald-700" style={{ fontWeight: 700 }}>{fmt(totalPaid)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock size={18} className="text-amber-600" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Còn phải thu</div>
            <div className="text-sm text-amber-700" style={{ fontWeight: 700 }}>{fmt(totalPending)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-violet-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
            <FileText size={18} className="text-violet-600" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Tổng hoá đơn tháng 4</div>
            <div className="text-sm text-violet-700" style={{ fontWeight: 700 }}>{invoices.length} hoá đơn</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tên cư dân, phòng..."
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 w-56" />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {(["all","Not Sent","Sent","Paid","Overdue"] as const).map(s => {
              const cfg = s === "all" ? null : statusCfg[s];
              return (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition ${filterStatus === s ? (s === "all" ? "bg-slate-800 text-white" : `${cfg!.bg} ${cfg!.color}`) : "text-slate-500 hover:bg-slate-50"}`}
                  style={{ fontWeight: filterStatus === s ? 600 : 400 }}>
                  {s === "all" ? `Tất cả (${counts.all})` : `${statusCfg[s].label} (${counts[s]})`}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerateAll}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm border border-violet-200 text-violet-700 hover:bg-violet-50 transition ${generating ? "opacity-70 cursor-wait" : ""}`}
            style={{ fontWeight: 500 }} disabled={generating}>
            <Zap size={14} className={generating ? "animate-pulse" : ""} />
            {generating ? "Đang tạo..." : "Tự động gửi"}
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm hover:bg-violet-700 transition shadow-sm"
            style={{ fontWeight: 500 }}>
            <Plus size={14} /> Tạo hoá đơn
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {["Mã HD", "Cư dân", "Phòng", "Kỳ", "Số tiền", "Hạn thanh toán", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(inv => {
                const cfg = statusCfg[inv.status];
                const Icon = cfg.icon;
                const isOverdue = inv.status === "Overdue";
                return (
                  <tr key={inv.id} className={`hover:bg-slate-50/70 transition group ${isOverdue ? "bg-red-50/20" : ""}`}>
                    <td className="px-5 py-4">
                      <div className="text-xs text-slate-600" style={{ fontWeight: 600 }}>{inv.id}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 text-xs flex-shrink-0" style={{ fontWeight: 600 }}>
                          {inv.residentName.split(" ").slice(-1)[0][0]}
                        </div>
                        <span className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{inv.residentName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg" style={{ fontWeight: 500 }}>{inv.roomId}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs text-slate-500">{inv.period}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{fmt(inv.amount)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs ${isOverdue ? "text-red-600" : "text-slate-500"}`} style={{ fontWeight: isOverdue ? 600 : 400 }}>
                        {inv.dueDate}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`} style={{ fontWeight: 500 }}>
                        <Icon size={11} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        {inv.status !== "Paid" && (
                          <>
                            <button onClick={() => handleSendReminder(inv.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs transition"
                              style={{ fontWeight: 500 }}>
                              <Mail size={11} /> Nhắc
                            </button>
                            <button onClick={() => setPayModal(inv)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs transition"
                              style={{ fontWeight: 500 }}>
                              <CheckCircle size={11} /> Thu tiền
                            </button>
                          </>
                        )}
                        {inv.status === "Paid" && inv.paidAt && (
                          <span className="text-xs text-slate-400">Đã thu {inv.paidAt}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">Hiển thị {filtered.length} / {invoices.length} hoá đơn</span>
        </div>
      </div>

      {payModal && <RecordPaymentModal invoice={payModal} onClose={() => setPayModal(null)} onSave={handlePaid} />}
    </div>
  );
}
