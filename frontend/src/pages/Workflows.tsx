import { useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import {
  X, CheckSquare, Square, AlertCircle, Clock, User,
  CheckCircle2, AlertTriangle, Bell, Key, FileSignature
} from "lucide-react";
import { initialKanbanData, KanbanCard, KanbanColumnId } from "../data/mockData";

const COLUMNS: { id: KanbanColumnId; label: string; color: string; bg: string; border: string }[] = [
  { id: "showing",  label: "Lịch xem phòng",     color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-200" },
  { id: "deposit",  label: "Đặt cọc",             color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200" },
  { id: "lease",    label: "Hợp đồng thuê",       color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200" },
  { id: "payment",  label: "Phiếu thanh toán",    color: "text-emerald-700",bg: "bg-emerald-50", border: "border-emerald-200" },
  { id: "checkout", label: "Check-out",            color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200" },
];

const PRIORITY_CONFIG: Record<string, string> = {
  High: "bg-red-100 text-red-700",
  Medium: "bg-amber-100 text-amber-700",
  Low: "bg-slate-100 text-slate-600",
};

const ITEM_TYPE = "KANBAN_CARD";

// ── Deposit Approval Modal ──
function DepositModal({ card, onClose, onApprove }: { card: KanbanCard; onClose: () => void; onApprove: () => void }) {
  const [approved, setApproved] = useState(false);
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3>Phê duyệt đặt cọc</h3>
            <p className="text-xs text-slate-500 mt-0.5">{card.guestName} · Phòng {card.room}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="text-sm text-amber-800" style={{ fontWeight: 500 }}>Thông tin đặt cọc</div>
            <div className="mt-2 space-y-1 text-sm text-slate-600">
              <div>Khách: <strong>{card.guestName}</strong></div>
              <div>Phòng: <strong>{card.room}</strong></div>
              <div>Số tiền: <strong className="text-amber-700">{card.amount.toLocaleString()}đ</strong></div>
              <div>Ngày: <strong>{card.date}</strong></div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">Ghi chú phê duyệt</label>
            <textarea rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Nhập ghi chú..." />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="notify" className="rounded" defaultChecked />
            <label htmlFor="notify" className="text-sm text-slate-600">
              <Bell size={12} className="inline mr-1" />
              Gửi thông báo cho Kế toán
            </label>
          </div>
          {approved && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-sm">
              <CheckCircle2 size={16} />
              Đã phê duyệt! Thông báo đã gửi đến Kế toán.
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Hủy</button>
          <button
            onClick={() => { setApproved(true); setTimeout(() => { onApprove(); onClose(); }, 1200); }}
            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-sm hover:bg-emerald-700 transition"
          >
            <CheckCircle2 size={14} className="inline mr-1" /> Phê duyệt
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Check-in Modal ──
const CHECKIN_ITEMS = ["Giường ngủ", "Đệm / Gối", "Tủ quần áo", "Chìa khóa", "Điện kế", "Đồng hồ nước"];
function CheckinModal({ card, onClose }: { card: KanbanCard; onClose: () => void }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [elecVal, setElecVal] = useState("0");
  const [waterVal, setWaterVal] = useState("0");
  const [done, setDone] = useState(false);

  const toggle = (item: string) => setChecked(p => ({ ...p, [item]: !p[item] }));
  const allChecked = CHECKIN_ITEMS.every(i => checked[i]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3>Bàn giao Check-in</h3>
            <p className="text-xs text-slate-500 mt-0.5">{card.guestName} · Phòng {card.room}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <div className="text-sm text-slate-600 mb-3" style={{ fontWeight: 500 }}>Checklist bàn giao</div>
            <div className="space-y-2.5">
              {CHECKIN_ITEMS.map(item => (
                <button key={item} onClick={() => toggle(item)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 transition text-left">
                  {checked[item] ? <CheckSquare size={16} className="text-emerald-500 flex-shrink-0" /> : <Square size={16} className="text-slate-300 flex-shrink-0" />}
                  <span className={`text-sm ${checked[item] ? "text-slate-800 line-through text-slate-400" : "text-slate-700"}`}>{item}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Chỉ số điện ban đầu</label>
              <input value={elecVal} onChange={e => setElecVal(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Chỉ số nước ban đầu</label>
              <input value={waterVal} onChange={e => setWaterVal(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-500 mb-1 block">Ghi chú tình trạng phòng</label>
            <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" />
          </div>
          {done && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2 text-emerald-700 text-sm">
              <CheckCircle2 size={16} /> Check-in thành công!
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Hủy</button>
          <button
            disabled={!allChecked}
            onClick={() => { setDone(true); setTimeout(onClose, 1200); }}
            className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Xác nhận Check-in
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Check-out Modal ──
function CheckoutModal({ card, onClose }: { card: KanbanCard; onClose: () => void }) {
  const [damages, setDamages] = useState<Record<string, string>>({});
  const [keyReturned, setKeyReturned] = useState(false);
  const [signed, setSigned] = useState(false);
  const [vacant, setVacant] = useState(false);

  const checkinItems = CHECKIN_ITEMS.map(item => ({
    item, checkinState: "Tốt", damageNote: damages[item] || ""
  }));

  if (vacant) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <h3 className="text-emerald-700 mb-2">Check-out hoàn tất!</h3>
          <p className="text-sm text-slate-500 mb-6">Phòng {card.room} đã được cập nhật thành "Phòng trống"</p>
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm hover:bg-slate-800">Đóng</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3>Check-out & Thanh lý</h3>
            <p className="text-xs text-slate-500 mt-0.5">{card.guestName} · Phòng {card.room}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center"><X size={15} /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Damage checklist */}
          <div>
            <div className="text-sm text-slate-600 mb-3" style={{ fontWeight: 500 }}>Kiểm tra tài sản & hư hỏng</div>
            <div className="space-y-2">
              {checkinItems.map(({ item }) => (
                <div key={item} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200">
                  <span className="text-sm text-slate-700 w-32 flex-shrink-0">{item}</span>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Check-in: Tốt</span>
                  <input
                    placeholder="Ghi chú hư hỏng..."
                    value={damages[item] || ""}
                    onChange={e => setDamages(p => ({ ...p, [item]: e.target.value }))}
                    className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-red-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Transfer damages */}
          {Object.values(damages).some(d => d.trim()) && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-600" />
                <span className="text-sm text-amber-700" style={{ fontWeight: 500 }}>Chuyển thông tin hư hỏng đến Kế toán</span>
              </div>
              <div className="text-xs text-amber-600 space-y-1">
                {Object.entries(damages).filter(([, v]) => v.trim()).map(([k, v]) => (
                  <div key={k}>• {k}: {v}</div>
                ))}
              </div>
              <button className="mt-2 text-xs text-amber-700 underline">Gửi thông báo kế toán</button>
            </div>
          )}

          {/* Key recovery */}
          <button
            onClick={() => setKeyReturned(p => !p)}
            className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition ${keyReturned ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`}
          >
            <Key size={16} className={keyReturned ? "text-emerald-600" : "text-slate-400"} />
            <span className="text-sm text-slate-700">Đã thu hồi chìa khóa / thẻ từ</span>
            {keyReturned ? <CheckSquare size={16} className="ml-auto text-emerald-500" /> : <Square size={16} className="ml-auto text-slate-300" />}
          </button>

          {/* Sign termination */}
          <button
            disabled={!keyReturned}
            onClick={() => setSigned(true)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm transition ${
              signed ? "border-indigo-300 bg-indigo-50 text-indigo-700" : keyReturned ? "border-indigo-300 hover:bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-300 cursor-not-allowed"
            }`}
          >
            <FileSignature size={16} />
            {signed ? "✓ Đã ký biên bản thanh lý" : "Ký biên bản thanh lý"}
          </button>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm hover:bg-slate-50">Hủy</button>
          <button
            disabled={!keyReturned || !signed}
            onClick={() => setVacant(true)}
            className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Cập nhật: Phòng trống
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Draggable Card ──
function DraggableCard({
  card, columnId, onDepositApprove, onCheckin, onCheckout,
}: {
  card: KanbanCard;
  columnId: KanbanColumnId;
  onDepositApprove: (card: KanbanCard) => void;
  onCheckin: (card: KanbanCard) => void;
  onCheckout: (card: KanbanCard) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: card.id, fromColumn: columnId },
    collect: monitor => ({ isDragging: monitor.isDragging() }),
  });
  drag(ref);

  return (
    <div
      ref={ref}
      className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40 scale-95" : ""}`}
    >
      {/* Priority */}
      <div className="flex items-center justify-between mb-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[card.priority]}`} style={{ fontWeight: 500 }}>
          {card.priority === "High" ? "🔴" : card.priority === "Medium" ? "🟡" : "🟢"} {card.priority}
        </span>
        <span className="text-xs text-slate-400">{card.date}</span>
      </div>

      {/* Guest & Room */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs" style={{ fontWeight: 600 }}>
            {card.guestName[0]}
          </div>
          <span className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{card.guestName}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="bg-slate-100 px-2 py-0.5 rounded">Phòng {card.room}</span>
          <span>{card.amount.toLocaleString()}đ</span>
        </div>
      </div>

      {/* Salesperson */}
      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
        <User size={11} />
        {card.salesperson}
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5 mb-3">
        <Clock size={11} className="text-slate-300" />
        <span className="text-xs text-slate-500">{card.status}</span>
      </div>

      {/* Action Buttons */}
      {columnId === "deposit" && (
        <button
          onClick={() => onDepositApprove(card)}
          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs transition"
        >
          <AlertCircle size={12} className="inline mr-1" /> Phê duyệt đặt cọc
        </button>
      )}
      {columnId === "lease" && (
        <button
          onClick={() => onCheckin(card)}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs transition"
        >
          <CheckSquare size={12} className="inline mr-1" /> Bàn giao Check-in
        </button>
      )}
      {columnId === "checkout" && (
        <button
          onClick={() => onCheckout(card)}
          className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs transition"
        >
          <Key size={12} className="inline mr-1" /> Check-out & Thanh lý
        </button>
      )}
    </div>
  );
}

// ── Droppable Column ──
function KanbanColumn({
  col, cards, onDrop, onDepositApprove, onCheckin, onCheckout
}: {
  col: typeof COLUMNS[0];
  cards: KanbanCard[];
  onDrop: (cardId: string, fromCol: string) => void;
  onDepositApprove: (card: KanbanCard) => void;
  onCheckin: (card: KanbanCard) => void;
  onCheckout: (card: KanbanCard) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; fromColumn: string }) => {
      if (item.fromColumn !== col.id) onDrop(item.id, item.fromColumn);
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  });
  drop(ref);

  return (
    <div
      ref={ref}
      className={`flex flex-col min-w-[240px] w-60 flex-shrink-0 rounded-2xl ${col.bg} border ${col.border} transition-all ${isOver ? "ring-2 ring-indigo-400 ring-offset-1" : ""}`}
    >
      {/* Column header */}
      <div className={`px-4 py-3 border-b ${col.border} flex items-center justify-between`}>
        <span className={`text-sm ${col.color}`} style={{ fontWeight: 600 }}>{col.label}</span>
        <span className={`text-xs px-2 py-0.5 rounded-full bg-white ${col.color} border ${col.border}`} style={{ fontWeight: 600 }}>{cards.length}</span>
      </div>
      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-220px)]">
        {cards.map(card => (
          <DraggableCard
            key={card.id}
            card={card}
            columnId={col.id}
            onDepositApprove={onDepositApprove}
            onCheckin={onCheckin}
            onCheckout={onCheckout}
          />
        ))}
        {cards.length === 0 && (
          <div className="text-center py-8 text-xs text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
            Kéo thẻ vào đây
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──
export default function Workflows() {
  const [columns, setColumns] = useState(initialKanbanData);
  const [depositModal, setDepositModal] = useState<KanbanCard | null>(null);
  const [checkinModal, setCheckinModal] = useState<KanbanCard | null>(null);
  const [checkoutModal, setCheckoutModal] = useState<KanbanCard | null>(null);

  const moveCard = (cardId: string, fromCol: string) => {
    const fromColId = fromCol as KanbanColumnId;
    const colIds = COLUMNS.map(c => c.id);
    const fromIdx = colIds.indexOf(fromColId);

    setColumns(prev => {
      const card = prev[fromColId].find(c => c.id === cardId);
      if (!card) return prev;
      const toColId = colIds[fromIdx + 1] as KanbanColumnId;
      if (!toColId) return prev;
      return {
        ...prev,
        [fromColId]: prev[fromColId].filter(c => c.id !== cardId),
        [toColId]: [...prev[toColId], card],
      };
    });
  };

  const moveCardToCol = (cardId: string, fromCol: KanbanColumnId, toCol: KanbanColumnId) => {
    setColumns(prev => {
      const card = prev[fromCol].find(c => c.id === cardId);
      if (!card) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(c => c.id !== cardId),
        [toCol]: [...prev[toCol], card],
      };
    });
  };

  const totalCards = Object.values(columns).reduce((acc, col) => acc + col.length, 0);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-4">
        {/* Header stats */}
        <div className="grid grid-cols-5 gap-3">
          {COLUMNS.map(col => (
            <div key={col.id} className={`${col.bg} border ${col.border} rounded-xl p-3 text-center`}>
              <div className={`text-xl ${col.color}`} style={{ fontWeight: 700 }}>{columns[col.id].length}</div>
              <div className={`text-xs ${col.color} opacity-80`}>{col.label}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">Tổng {totalCards} công việc đang xử lý · Kéo thẻ để di chuyển giữa các cột</p>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
            + Thêm công việc
          </button>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map(col => (
            <KanbanColumn
              key={col.id}
              col={col}
              cards={columns[col.id]}
              onDrop={(cardId, fromCol) => moveCardToCol(cardId, fromCol as KanbanColumnId, col.id)}
              onDepositApprove={card => setDepositModal(card)}
              onCheckin={card => setCheckinModal(card)}
              onCheckout={card => setCheckoutModal(card)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {depositModal && (
        <DepositModal
          card={depositModal}
          onClose={() => setDepositModal(null)}
          onApprove={() => moveCard(depositModal.id, "deposit")}
        />
      )}
      {checkinModal && (
        <CheckinModal card={checkinModal} onClose={() => setCheckinModal(null)} />
      )}
      {checkoutModal && (
        <CheckoutModal card={checkoutModal} onClose={() => setCheckoutModal(null)} />
      )}
    </DndProvider>
  );
}
