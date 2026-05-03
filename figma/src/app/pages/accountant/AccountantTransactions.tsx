import { useState, useRef, useEffect } from "react";
import {
  ArrowDownCircle, ArrowUpCircle, CheckCircle, Upload,
  AlertTriangle, Clock, X, Paperclip, Filter
} from "lucide-react";
import { accTransactions as initialTx, AccTransaction, TxCategory, TxStatus } from "../../data/accountantMockData";

const fmt = (n: number) => n.toLocaleString("vi-VN") + " đ";

const categoryLabel: Record<TxCategory, string> = {
  "Deposit": "Đặt cọc",
  "Monthly Rent": "Tiền thuê",
  "Move-in Fee": "Phí nhận phòng",
  "Check-out Settlement": "Thanh lý HĐ",
  "Deposit Refund": "Hoàn cọc",
};

const categoryColor: Record<TxCategory, string> = {
  "Deposit": "bg-violet-100 text-violet-700",
  "Monthly Rent": "bg-blue-100 text-blue-700",
  "Move-in Fee": "bg-teal-100 text-teal-700",
  "Check-out Settlement": "bg-amber-100 text-amber-700",
  "Deposit Refund": "bg-orange-100 text-orange-700",
};

function getHoursAgo(iso: string) {
  const created = new Date(iso).getTime();
  const now = new Date("2025-04-20T14:00:00").getTime();
  return Math.floor((now - created) / 3_600_000);
}

function OverdueTag({ hoursAgo }: { hoursAgo: number }) {
  if (hoursAgo < 24) return null;
  const days = Math.floor(hoursAgo / 24);
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200">
      <AlertTriangle size={10} className="text-red-500" />
      <span className="text-xs text-red-600" style={{ fontWeight: 600 }}>
        {days > 1 ? `Quá ${days} ngày` : "Quá 24h – Nguy cơ huỷ"}
      </span>
    </div>
  );
}

function ConfirmModal({
  tx, onClose, onConfirm,
}: {
  tx: AccTransaction;
  onClose: () => void;
  onConfirm: (id: string, file?: string) => void;
}) {
  const [file, setFile] = useState<string | undefined>(tx.receiptFile);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
            Xác nhận {tx.type === "Income" ? "đã thu" : "đã chi"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Mô tả:</span>
              <span className="text-slate-800" style={{ fontWeight: 500 }}>{tx.description}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Số tiền:</span>
              <span className={tx.type === "Income" ? "text-emerald-600" : "text-red-600"} style={{ fontWeight: 700 }}>
                {tx.type === "Income" ? "+" : "-"}{fmt(tx.amount)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Phòng:</span>
              <span className="text-slate-700">{tx.roomId}</span>
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs text-slate-500 mb-2" style={{ fontWeight: 600 }}>
              Chứng từ / Biên lai
            </label>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                dragging ? "border-violet-400 bg-violet-50" : "border-slate-200 hover:border-violet-300 hover:bg-slate-50"
              }`}
            >
              <Upload size={18} className="mx-auto mb-1.5 text-slate-300" />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <Paperclip size={12} className="text-violet-500" />
                  <span className="text-xs text-violet-700" style={{ fontWeight: 500 }}>{file}</span>
                </div>
              ) : (
                <span className="text-xs text-slate-400">Kéo thả hoặc nhấn để đính kèm chứng từ</span>
              )}
              <input ref={fileRef} type="file" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f.name); }} />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition" style={{ fontWeight: 500 }}>Huỷ</button>
          <button onClick={() => { onConfirm(tx.id, file); onClose(); }}
            className="px-4 py-2 rounded-xl text-sm text-white bg-violet-600 hover:bg-violet-700 transition flex items-center gap-2" style={{ fontWeight: 500 }}>
            <CheckCircle size={14} /> Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
}

function TxRow({ tx, onConfirm }: { tx: AccTransaction; onConfirm: (tx: AccTransaction) => void }) {
  const hours = getHoursAgo(tx.createdAt);
  const isIncome = tx.type === "Income";
  return (
    <tr className="hover:bg-slate-50/70 transition group">
      <td className="px-5 py-4">
        <div className="text-xs text-slate-400" style={{ fontWeight: 600 }}>{tx.id}</div>
        <div className="text-xs text-slate-400 mt-0.5">{tx.createdAt.split("T")[0]}</div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isIncome ? "bg-emerald-50" : "bg-orange-50"}`}>
            {isIncome
              ? <ArrowDownCircle size={16} className="text-emerald-600" />
              : <ArrowUpCircle size={16} className="text-orange-600" />}
          </div>
          <div>
            <div className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{tx.description}</div>
            <div className="text-xs text-slate-400 mt-0.5">{tx.residentName}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <span className={`text-xs px-2.5 py-1 rounded-full ${categoryColor[tx.category]}`} style={{ fontWeight: 500 }}>
          {categoryLabel[tx.category]}
        </span>
      </td>
      <td className="px-5 py-4">
        <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">{tx.roomId}</span>
      </td>
      <td className="px-5 py-4 text-right">
        <span className={`text-sm ${isIncome ? "text-emerald-600" : "text-red-600"}`} style={{ fontWeight: 700 }}>
          {isIncome ? "+" : "–"}{fmt(tx.amount)}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1">
          {tx.status === "Confirmed" && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>
              <CheckCircle size={10} /> Đã xác nhận
            </span>
          )}
          {tx.status === "Pending" && (
            <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>
              <Clock size={10} /> Chờ xác nhận
            </span>
          )}
          {tx.status === "Overdue" && (
            <span className="inline-flex items-center gap-1 text-xs text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full" style={{ fontWeight: 500 }}>
              <AlertTriangle size={10} /> Quá hạn
            </span>
          )}
          {tx.status !== "Confirmed" && <OverdueTag hoursAgo={hours} />}
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 justify-end">
          {tx.receiptFile && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Paperclip size={11} />
              <span className="max-w-[80px] truncate">{tx.receiptFile}</span>
            </div>
          )}
          {tx.status !== "Confirmed" && (
            <button onClick={() => onConfirm(tx)}
              className="px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs hover:bg-violet-700 transition opacity-0 group-hover:opacity-100"
              style={{ fontWeight: 500 }}>
              Xác nhận
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AccountantTransactions() {
  const [txList, setTxList] = useState(initialTx);
  const [tab, setTab] = useState<"Income" | "Expense">("Income");
  const [confirmTx, setConfirmTx] = useState<AccTransaction | null>(null);

  const filtered = txList.filter(t => t.type === tab);
  const totalIncome = txList.filter(t => t.type === "Income" && t.status === "Confirmed").reduce((s, t) => s + t.amount, 0);
  const totalExpense = txList.filter(t => t.type === "Expense" && t.status === "Confirmed").reduce((s, t) => s + t.amount, 0);

  const handleConfirm = (id: string, file?: string) => {
    setTxList(prev => prev.map(t => t.id === id ? { ...t, status: "Confirmed" as TxStatus, receiptFile: file || t.receiptFile } : t));
  };

  return (
    <div className="space-y-5">
      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <ArrowDownCircle size={18} className="text-emerald-600" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Tổng thu (đã xác nhận)</div>
            <div className="text-sm text-emerald-700 mt-0.5" style={{ fontWeight: 700 }}>+{fmt(totalIncome)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-red-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
            <ArrowUpCircle size={18} className="text-red-500" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Tổng chi (đã xác nhận)</div>
            <div className="text-sm text-red-600 mt-0.5" style={{ fontWeight: 700 }}>–{fmt(totalExpense)}</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-violet-100 p-4 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div>
            <div className="text-xs text-slate-400">Chờ xác nhận / Quá hạn</div>
            <div className="text-sm text-amber-700 mt-0.5" style={{ fontWeight: 700 }}>
              {txList.filter(t => t.status !== "Confirmed").length} giao dịch
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {(["Income","Expense"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex items-center gap-2 px-6 py-4 text-sm transition border-b-2 ${
                tab === t
                  ? "border-violet-600 text-violet-700 bg-violet-50/40"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`} style={{ fontWeight: tab === t ? 600 : 400 }}>
              {t === "Income"
                ? <><ArrowDownCircle size={15} className="text-emerald-500" /> Phiếu Thu ({txList.filter(x => x.type === "Income").length})</>
                : <><ArrowUpCircle size={15} className="text-red-500" /> Phiếu Chi ({txList.filter(x => x.type === "Expense").length})</>}
            </button>
          ))}
          <div className="flex-1 flex items-center justify-end px-5 gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs hover:bg-slate-200 transition" style={{ fontWeight: 500 }}>
              <Filter size={12} /> Lọc
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {["Mã / Ngày", "Mô tả", "Loại", "Phòng", "Số tiền", "Trạng thái", "Thao tác"].map(h => (
                  <th key={h} className={`text-xs text-slate-500 uppercase tracking-wider px-5 py-3.5 ${h === "Số tiền" || h === "Thao tác" ? "text-right" : "text-left"}`} style={{ fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(tx => (
                <TxRow key={tx.id} tx={tx} onConfirm={setConfirmTx} />
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">Không có giao dịch</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-400">Hiển thị {filtered.length} giao dịch</span>
        </div>
      </div>

      {confirmTx && (
        <ConfirmModal tx={confirmTx} onClose={() => setConfirmTx(null)} onConfirm={handleConfirm} />
      )}
    </div>
  );
}
