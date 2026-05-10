import { type ElementType, useEffect, useState } from "react";
import {
  ClipboardList, ArrowLeftRight, Home, Calendar, Check, X,
  CheckCircle, Send, FileSignature, Sparkles, BedDouble, Lock,
  BadgeCheck, Building2, SlidersHorizontal, Droplets, Wrench,
  AlertTriangle,
} from "lucide-react";
import { getOperations, type OperationAsset, type OperationCheckinItem, type OperationCheckoutItem } from "../services/api";
import { formatVNDInput } from "../utils/format";

const A = "#4F46E5";
const PAGE_SIZE_OPTIONS = [10, 20, 30] as const;

type CheckinStatus = "Chờ bàn giao" | "Đã bàn giao";
type CheckoutStatus = "Chờ thanh lý" | "Chờ đối soát" | "Đã trả phòng";
type ItemCondition = OperationAsset["condition"];
type ChecklistItem = OperationAsset;

const ASSET_ICONS: Record<string, ElementType> = {
  "Giường": BedDouble,
  "Nệm": Sparkles,
  "Tủ đầu giường": Building2,
  "Chìa khóa/Thẻ từ": Lock,
};

const CHECKIN_STATUS_COLORS: Record<CheckinStatus, { bg: string; dot: string; color: string }> = {
  "Chờ bàn giao": { bg: "#FFF7ED", dot: "#F97316", color: "#C2410C" },
  "Đã bàn giao": { bg: "#F0FDF4", dot: "#22C55E", color: "#15803D" },
};

const CHECKOUT_STATUS_COLORS: Record<CheckoutStatus, { bg: string; dot: string; color: string }> = {
  "Chờ thanh lý": { bg: "#FFF7ED", dot: "#F97316", color: "#C2410C" },
  "Chờ đối soát": { bg: "#EEF2FF", dot: "#6366F1", color: "#4338CA" },
  "Đã trả phòng": { bg: "#F0FDF4", dot: "#22C55E", color: "#15803D" },
};

function Avatar({ initials, gradient, size = 9 }: { initials: string; gradient: string; size?: number }) {
  const s = `${size / 4}rem`;
  return (
    <div
      className="flex-shrink-0 rounded-full flex items-center justify-center text-white"
      style={{ width: s, height: s, background: gradient, fontWeight: 800, fontSize: "0.72rem" }}
    >
      {initials}
    </div>
  );
}

function ConditionPill({ value, active, onClick }: { value: ItemCondition; active: boolean; onClick: () => void }) {
  const COLORS: Record<ItemCondition, { bg: string; active: string; text: string }> = {
    "Tốt": { bg: "#F0FDF4", active: "#059669", text: "#166534" },
    "Bình thường": { bg: "#FFFBEB", active: "#D97706", text: "#92400E" },
    "Cần sửa chữa": { bg: "#FFF1F2", active: "#DC2626", text: "#991B1B" },
  };
  const color = COLORS[value];

  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-lg transition-all"
      style={{
        background: active ? color.active : "#F1F5F9",
        color: active ? "white" : "#94A3B8",
        fontSize: "0.72rem",
        fontWeight: active ? 800 : 500,
        border: `1.5px solid ${active ? color.active : "#E2E8F0"}`,
      }}
    >
      {value}
    </button>
  );
}

function initialsOf(text: string) {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  const first = parts[0] ?? "K";
  const last = parts[parts.length - 1] ?? "H";
  return `${first[0] ?? "K"}${last[0] ?? "H"}`.toUpperCase();
}

function cloneChecklist(assets: ChecklistItem[]) {
  return assets.map((item) => ({ ...item }));
}

function fallbackChecklist(): ChecklistItem[] {
  return [
    { asset: "Giường", present: true, condition: "Tốt", notes: "" },
    { asset: "Nệm", present: true, condition: "Tốt", notes: "" },
    { asset: "Tủ đầu giường", present: true, condition: "Tốt", notes: "" },
    { asset: "Chìa khóa/Thẻ từ", present: true, condition: "Tốt", notes: "" },
  ];
}

function mapAssets(assets: OperationAsset[] | undefined | null) {
  if (!assets || assets.length === 0) {
    return fallbackChecklist();
  }

  return cloneChecklist(assets);
}

function formatCurrency(value: number) {
  return `₫${value.toLocaleString("vi-VN")}`;
}

function PaginationControls({
  totalItems,
  currentPage,
  pageSize,
  pageInput,
  onPageInputChange,
  onPageSizeChange,
  onPageChange,
}: {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  pageInput: string;
  onPageInputChange: (value: string) => void;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const goToTypedPage = () => {
    const parsed = Number.parseInt(pageInput.trim(), 10);
    if (Number.isNaN(parsed)) {
      onPageInputChange(String(currentPage));
      return;
    }
    const nextPage = Math.min(totalPages, Math.max(1, parsed));
    onPageChange(nextPage);
  };

  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/70">
      <div className="flex items-center gap-2 text-xs text-slate-600">
        <span>Hiển thị</span>
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-700"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <span>/ trang · Tổng {totalItems}</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
          style={{
            borderColor: currentPage <= 1 ? "#E2E8F0" : "#CBD5E1",
            color: currentPage <= 1 ? "#94A3B8" : "#334155",
            background: "white",
            cursor: currentPage <= 1 ? "not-allowed" : "pointer",
          }}
        >
          Trước
        </button>

        <span className="text-xs text-slate-600">Trang {currentPage}/{totalPages}</span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded-lg border text-xs font-semibold"
          style={{
            borderColor: currentPage >= totalPages ? "#E2E8F0" : "#CBD5E1",
            color: currentPage >= totalPages ? "#94A3B8" : "#334155",
            background: "white",
            cursor: currentPage >= totalPages ? "not-allowed" : "pointer",
          }}
        >
          Sau
        </button>

        <input
          value={pageInput}
          onChange={(event) => onPageInputChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              goToTypedPage();
            }
          }}
          className="w-14 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700"
          placeholder="Trang"
        />
        <button
          onClick={goToTypedPage}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer hover:opacity-90 transition"
          style={{ background: `linear-gradient(135deg,${A},#7C3AED)` }}
        >
          Đi
        </button>
      </div>
    </div>
  );
}

function CheckInTab({
  rooms,
  onRoomsChange,
}: {
  rooms: OperationCheckinItem[];
  onRoomsChange: (rooms: OperationCheckinItem[]) => void;
}) {
  const [selectedRoom, setSelectedRoom] = useState<OperationCheckinItem | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(fallbackChecklist());
  const [handoverNote, setHandoverNote] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");

  const totalPages = Math.max(1, Math.ceil(rooms.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pagedRooms = rooms.slice(pageStart, pageStart + pageSize);

  const handlePageChange = (nextPage: number) => {
    const bounded = Math.min(totalPages, Math.max(1, nextPage));
    setCurrentPage(bounded);
    setPageInput(String(bounded));
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setCurrentPage(1);
    setPageInput("1");
  };

  const openModal = (room: OperationCheckinItem) => {
    setSelectedRoom(room);
    setModalId(room.id);
    setChecklist(mapAssets(room.assets));
    setHandoverNote("");
    setConfirmed(false);
  };

  const closeModal = () => {
    setModalId(null);
    setSelectedRoom(null);
  };

  const updateItem = (idx: number, field: keyof ChecklistItem, val: unknown) => {
    setChecklist((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onRoomsChange(rooms.filter((room) => room.id !== modalId));
      closeModal();
    }, 400);
  };

  const activeRoom = selectedRoom;
  const allPresent = checklist.every((item) => item.present);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(String(totalPages));
    }
  }, [currentPage, totalPages]);

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Chờ bàn giao", value: rooms.length, color: A, bg: "#EEF2FF" },
          { label: "Tổng cọc chờ", value: `₫${(rooms.reduce((sum, room) => sum + room.deposit, 0) / 1e6).toFixed(1)}M`, color: "#059669", bg: "#ECFDF5" },
          { label: "Vào sớm nhất", value: rooms[0]?.moveIn ?? "—", color: "#D97706", bg: "#FFFBEB" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "white", border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
              <ClipboardList size={15} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1E293B", lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {rooms.length > 0 && (
          <PaginationControls
            totalItems={rooms.length}
            currentPage={currentPage}
            pageSize={pageSize}
            pageInput={pageInput}
            onPageInputChange={setPageInput}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
          />
        )}
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E8EEF4" }}>
              {["Phòng", "Khách thuê", "Loại phòng", "Ngày dọn vào", "Tiền cọc", "Trạng thái", "Hành động"].map((heading) => (
                <th
                  key={heading}
                  className="text-left px-4 py-3"
                  style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRooms.map((room, index) => (
              <tr
                key={room.id}
                style={{ background: index % 2 === 0 ? "white" : "#FAFBFD", borderBottom: "1px solid #F1F5F9" }}
                className="hover:bg-indigo-50/20 transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#EEF2FF" }}>
                      <Home size={13} style={{ color: A }} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>{room.room}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar initials={room.avatar} gradient={`linear-gradient(135deg,${A},#7C3AED)`} size={8} />
                    <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>{room.tenant}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="px-2 py-0.5 rounded-md"
                    style={{ background: room.roomType === "Toàn phòng" ? "#EEF2FF" : "#FFF7ED", color: room.roomType === "Toàn phòng" ? A : "#EA580C", fontSize: "0.72rem", fontWeight: 700 }}
                  >
                    {room.roomType}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={12} style={{ color: "#94A3B8" }} />
                    <span style={{ fontSize: "0.82rem", color: "#374151" }}>{room.moveIn}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1E293B" }}>{formatCurrency(room.deposit)}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                    style={{ background: CHECKIN_STATUS_COLORS[room.status].bg, color: CHECKIN_STATUS_COLORS[room.status].color, border: `1px solid ${CHECKIN_STATUS_COLORS[room.status].dot}30`, fontSize: "0.72rem", fontWeight: 700 }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: CHECKIN_STATUS_COLORS[room.status].dot }} />
                    {room.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => openModal(room)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white cursor-pointer hover:opacity-90 transition"
                    style={{ background: `linear-gradient(135deg,${A},#7C3AED)`, fontSize: "0.78rem", fontWeight: 700, boxShadow: `0 2px 8px ${A}35` }}
                  >
                    <ClipboardList size={13} /> Lập biên bản
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {rooms.length === 0 && (
          <div className="flex flex-col items-center py-14">
            <CheckCircle size={32} style={{ color: "#86EFAC" }} className="mb-2" />
            <div style={{ fontWeight: 700, color: "#374151" }}>Tất cả phòng đã được bàn giao</div>
          </div>
        )}
      </div>

      {modalId && activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: `linear-gradient(135deg,${A},#7C3AED)` }}>
              <div>
                <div className="text-white flex items-center gap-2" style={{ fontWeight: 900, fontSize: "1.05rem" }}>
                  <ClipboardList size={16} /> Biên bản Bàn giao Phòng
                </div>
                <div className="text-indigo-200 mt-0.5" style={{ fontSize: "0.78rem" }}>
                  Phòng <strong>{activeRoom.room}</strong> · {activeRoom.tenant} · Vào ngày {activeRoom.moveIn}
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-200 hover:text-white hover:bg-white/10 transition">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Loại phòng", value: activeRoom.roomType },
                  { label: "Ngày dọn vào", value: activeRoom.moveIn },
                  { label: "Tiền cọc", value: formatCurrency(activeRoom.deposit) },
                ].map((info) => (
                  <div key={info.label} className="px-3 py-2.5 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontSize: "0.68rem", color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{info.label}</div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 800, color: "#1E293B", marginTop: 2 }}>{info.value}</div>
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: `${A}15` }}>
                    <CheckCircle size={11} style={{ color: A }} />
                  </div>
                  <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>Kiểm kê tài sản bàn giao</span>
                </div>
                <div className="space-y-2">
                  {checklist.map((item, index) => {
                    const Icon = ASSET_ICONS[item.asset] || BedDouble;
                    return (
                      <div
                        key={item.asset}
                        className="rounded-xl overflow-hidden"
                        style={{ border: `1.5px solid ${item.present ? "#E2E8F0" : "#FECACA"}`, background: item.present ? "white" : "#FFF5F5" }}
                      >
                        <div className="flex items-center gap-3 px-4 py-3">
                          <button
                            onClick={() => updateItem(index, "present", !item.present)}
                            className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition"
                            style={{ background: item.present ? A : "#F1F5F9", border: `2px solid ${item.present ? A : "#CBD5E1"}` }}
                          >
                            {item.present && <Check size={11} className="text-white" />}
                          </button>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${A}12` }}>
                            <Icon size={13} style={{ color: A }} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1E293B", flex: 1 }}>{item.asset}</span>
                          {item.present && (
                            <div className="flex items-center gap-1.5">
                              {(["Tốt", "Bình thường", "Cần sửa chữa"] as ItemCondition[]).map((condition) => (
                                <ConditionPill key={condition} value={condition} active={item.condition === condition} onClick={() => updateItem(index, "condition", condition)} />
                              ))}
                            </div>
                          )}
                          {!item.present && (
                            <span className="px-2 py-0.5 rounded-md" style={{ background: "#FEE2E2", color: "#DC2626", fontSize: "0.7rem", fontWeight: 700 }}>
                              Thiếu / Không có
                            </span>
                          )}
                        </div>
                        {item.present && (
                          <div className="px-4 pb-3">
                            <input
                              value={item.notes}
                              onChange={(event) => updateItem(index, "notes", event.target.value)}
                              placeholder="Ghi chú tình trạng (tùy chọn)..."
                              className="w-full px-3 rounded-lg outline-none"
                              style={{ paddingTop: "0.45rem", paddingBottom: "0.45rem", background: "#F8FAFC", border: "1px solid #E2E8F0", fontSize: "0.78rem", color: "#64748B" }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="mb-1.5" style={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151" }}>Ghi chú bổ sung</div>
                <textarea
                  value={handoverNote}
                  onChange={(event) => setHandoverNote(event.target.value)}
                  placeholder="Ghi nhận thêm về tình trạng phòng, yêu cầu đặc biệt..."
                  rows={2}
                  className="w-full rounded-xl resize-none outline-none"
                  style={{ padding: "0.65rem 0.85rem", background: "#F8FAFC", border: "1.5px solid #E2E8F0", fontSize: "0.82rem", color: "#374151" }}
                />
              </div>

              {!allPresent && (
                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "#FFF7ED", border: "1px solid #FDE68A" }}>
                  <AlertTriangle size={13} style={{ color: "#D97706", flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: "0.78rem", color: "#92400E" }}>Một hoặc nhiều tài sản bị ghi nhận là thiếu. Cần xử lý trước khi hoàn tất bàn giao.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
              <button onClick={closeModal} className="px-4 py-2.5 rounded-xl cursor-pointer hover:bg-slate-50 transition" style={{ border: "1.5px solid #E2E8F0", fontSize: "0.82rem", fontWeight: 600, color: "#64748B" }}>
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={!allPresent || confirmed}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white cursor-pointer hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: confirmed ? "#059669" : !allPresent ? "#CBD5E1" : `linear-gradient(135deg,${A},#7C3AED)`,
                  fontSize: "0.85rem",
                  fontWeight: 800,
                  boxShadow: !allPresent || confirmed ? "none" : `0 3px 12px ${A}40`,
                }}
              >
                {confirmed ? <><CheckCircle size={14} /> Đã xác nhận!</> : <><FileSignature size={14} /> Xác nhận Biên bản Bàn giao</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CheckOutTab({
  rooms,
  onRoomsChange,
}: {
  rooms: OperationCheckoutItem[];
  onRoomsChange: (rooms: OperationCheckoutItem[]) => void;
}) {
  const [selectedRoom, setSelectedRoom] = useState<OperationCheckoutItem | null>(null);
  const [modalId, setModalId] = useState<string | null>(null);
  const [assetList, setAssetList] = useState<ChecklistItem[]>(fallbackChecklist());
  const [cleanState, setCleanState] = useState<"Tốt" | "Trung bình" | "Kém">("Tốt");
  const [damages, setDamages] = useState("");
  const [penalty, setPenalty] = useState("0");
  const [sentToAcct, setSentToAcct] = useState(false);
  const [released, setReleased] = useState(false);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>("1");

  const totalPages = Math.max(1, Math.ceil(rooms.length / pageSize));
  const pageStart = (currentPage - 1) * pageSize;
  const pagedRooms = rooms.slice(pageStart, pageStart + pageSize);

  const handlePageChange = (nextPage: number) => {
    const bounded = Math.min(totalPages, Math.max(1, nextPage));
    setCurrentPage(bounded);
    setPageInput(String(bounded));
  };

  const handlePageSizeChange = (nextSize: number) => {
    setPageSize(nextSize);
    setCurrentPage(1);
    setPageInput("1");
  };

  const openModal = (room: OperationCheckoutItem) => {
    setSelectedRoom(room);
    setModalId(room.id);
    setAssetList(mapAssets(room.assets));
    setCleanState("Tốt");
    setDamages("");
    setPenalty("0");
    setSentToAcct(false);
    setReleased(false);
  };

  const closeModal = () => {
    setModalId(null);
    setSelectedRoom(null);
  };

  const updateAsset = (idx: number, field: keyof ChecklistItem, val: unknown) => {
    setAssetList((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  };

  const handleSendToAccountant = () => {
    setSentToAcct(true);
    onRoomsChange(rooms.map((room) => (room.id === modalId ? { ...room, status: "Chờ đối soát" } : room)));
  };

  const handleRelease = () => {
    setReleased(true);
    setTimeout(() => {
      onRoomsChange(rooms.filter((room) => room.id !== modalId));
      closeModal();
    }, 400);
  };

  const activeRoom = selectedRoom;
  const depositAmt = activeRoom?.deposit ?? 0;
  const penaltyAmt = Number((penalty || "0").replace(/\D/g, "")) || 0;
  const refundAmt = Math.max(0, depositAmt - penaltyAmt);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
      setPageInput(String(totalPages));
    }
  }, [currentPage, totalPages]);

  const CLEAN_COLORS: Record<"Tốt" | "Trung bình" | "Kém", { active: string }> = {
    "Tốt": { active: "#059669" },
    "Trung bình": { active: "#D97706" },
    "Kém": { active: "#DC2626" },
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "Chờ thanh lý", value: rooms.filter((room) => room.status === "Chờ thanh lý").length, color: "#EA580C", bg: "#FFF7ED" },
          { label: "Chờ kế toán", value: rooms.filter((room) => room.status === "Chờ đối soát").length, color: A, bg: "#EEF2FF" },
          { label: "Tổng cọc chờ", value: `₫${(rooms.reduce((sum, room) => sum + room.deposit, 0) / 1e6).toFixed(1)}M`, color: "#059669", bg: "#ECFDF5" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{ background: "white", border: "1px solid #F1F5F9", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: stat.bg }}>
              <ArrowLeftRight size={15} style={{ color: stat.color }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.1rem", color: "#1E293B", lineHeight: 1.1 }}>{stat.value}</div>
              <div style={{ fontSize: "0.7rem", color: "#94A3B8", marginTop: 2 }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        {rooms.length > 0 && (
          <PaginationControls
            totalItems={rooms.length}
            currentPage={currentPage}
            pageSize={pageSize}
            pageInput={pageInput}
            onPageInputChange={setPageInput}
            onPageSizeChange={handlePageSizeChange}
            onPageChange={handlePageChange}
          />
        )}
        <table className="w-full">
          <thead>
            <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #E8EEF4" }}>
              {["Phòng", "Khách thuê", "Loại phòng", "Ngày trả phòng", "Còn", "Tiền cọc", "Trạng thái", "Hành động"].map((heading) => (
                <th
                  key={heading}
                  className="text-left px-4 py-3"
                  style={{ fontSize: "0.7rem", fontWeight: 800, color: "#94A3B8", letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pagedRooms.map((room, index) => {
              const status = CHECKOUT_STATUS_COLORS[room.status];
              return (
                <tr
                  key={room.id}
                  style={{ background: index % 2 === 0 ? "white" : "#FAFBFD", borderBottom: "1px solid #F1F5F9" }}
                  className="hover:bg-red-50/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "#FFF7ED" }}>
                        <Home size={13} style={{ color: "#EA580C" }} />
                      </div>
                      <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>{room.room}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={room.avatar} gradient="linear-gradient(135deg,#EA580C,#DC2626)" size={8} />
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#374151" }}>{room.tenant}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md" style={{ background: "#F8FAFC", color: "#64748B", fontSize: "0.72rem", fontWeight: 700, border: "1px solid #E2E8F0" }}>
                      {room.roomType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} style={{ color: "#94A3B8" }} />
                      <span style={{ fontSize: "0.82rem", color: "#374151" }}>{room.moveOut}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: room.daysLeft === 0 ? "#FEE2E2" : room.daysLeft <= 2 ? "#FEF3C7" : "#F0FDF4", color: room.daysLeft === 0 ? "#DC2626" : room.daysLeft <= 2 ? "#D97706" : "#059669", fontSize: "0.72rem", fontWeight: 800 }}>
                      {room.daysLeft === 0 ? "Hôm nay" : `${room.daysLeft}d`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1E293B" }}>{formatCurrency(room.deposit)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                      style={{ background: status.bg, color: status.color, border: `1px solid ${status.dot}30`, fontSize: "0.72rem", fontWeight: 700 }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.dot }} />
                      {room.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openModal(room)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer hover:opacity-80 transition"
                      style={{ background: "#FFF7ED", border: "1.5px solid #FDE68A", color: "#C2410C", fontSize: "0.78rem", fontWeight: 700 }}
                    >
                      <SlidersHorizontal size={13} /> Thanh lý
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {rooms.length === 0 && (
          <div className="flex flex-col items-center py-14">
            <CheckCircle size={32} style={{ color: "#86EFAC" }} className="mb-2" />
            <div style={{ fontWeight: 700, color: "#374151" }}>Không có phòng nào chờ thanh lý</div>
          </div>
        )}
      </div>

      {modalId && activeRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(6px)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ background: "linear-gradient(135deg,#EA580C,#DC2626)" }}>
              <div>
                <div className="text-white flex items-center gap-2" style={{ fontWeight: 900, fontSize: "1.05rem" }}>
                  <ArrowLeftRight size={16} /> Biên bản Thanh lý & Trả phòng
                </div>
                <div className="text-orange-200 mt-0.5" style={{ fontSize: "0.78rem" }}>
                  Phòng <strong>{activeRoom.room}</strong> · {activeRoom.tenant} · Trả ngày {activeRoom.moveOut}
                </div>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-200 hover:text-white hover:bg-white/10 transition">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle size={14} style={{ color: "#EA580C" }} />
                  <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>Tình trạng tài sản khi trả phòng</span>
                </div>
                <div className="space-y-2">
                  {assetList.map((item, index) => {
                    const Icon = ASSET_ICONS[item.asset] || BedDouble;
                    return (
                      <div key={item.asset} className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "#FFF7ED" }}>
                          <Icon size={13} style={{ color: "#EA580C" }} />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#374151", flex: 1 }}>{item.asset}</span>
                        <div className="flex items-center gap-1.5">
                          {(["Tốt", "Bình thường", "Cần sửa chữa"] as ItemCondition[]).map((condition) => (
                            <ConditionPill key={condition} value={condition} active={item.condition === condition} onClick={() => updateAsset(index, "condition", condition)} />
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Droplets size={14} style={{ color: "#0891B2" }} />
                  <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>Vệ sinh phòng</span>
                </div>
                <div className="flex items-center gap-2">
                  {(["Tốt", "Trung bình", "Kém"] as const).map((condition) => {
                    const isActive = cleanState === condition;
                    return (
                      <button
                        key={condition}
                        onClick={() => setCleanState(condition)}
                        className="flex-1 py-2.5 rounded-xl transition"
                        style={{
                          background: isActive ? CLEAN_COLORS[condition].active : "#F8FAFC",
                          color: isActive ? "white" : "#64748B",
                          border: `1.5px solid ${isActive ? CLEAN_COLORS[condition].active : "#E2E8F0"}`,
                          fontSize: "0.82rem",
                          fontWeight: isActive ? 800 : 500,
                        }}
                      >
                        {condition === "Tốt" ? "✓ Tốt" : condition === "Trung bình" ? "~ Trung bình" : "✗ Kém"}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Wrench size={14} style={{ color: "#DC2626" }} />
                  <span style={{ fontWeight: 800, fontSize: "0.9rem", color: "#1E293B" }}>Hư hỏng / Mất mát</span>
                </div>
                <textarea
                  value={damages}
                  onChange={(event) => setDamages(event.target.value)}
                  placeholder="Mô tả chi tiết hư hỏng, đồ thiếu... VD: Gương bị nứt, chìa khóa thiếu 1 cái..."
                  rows={3}
                  className="w-full rounded-xl resize-none outline-none"
                  style={{ padding: "0.65rem 0.85rem", background: "#F8FAFC", border: "1.5px solid #E2E8F0", fontSize: "0.82rem", color: "#374151" }}
                />
                <div className="flex-1">
                  <div style={{ fontSize: "0.72rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 3 }}>Tiền phạt khấu trừ (VNĐ)</div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">₫</span>
                    <input
                      value={penalty}
                      onChange={(event) => setPenalty(formatVNDInput(event.target.value))}
                      className="w-full pl-7 pr-3 py-2.5 rounded-xl outline-none"
                      style={{ border: "1.5px solid #EA580C30", background: "#FFF7ED", fontSize: "1rem", fontWeight: 800, color: "#C2410C" }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E8EEF4" }}>
                <div className="px-4 py-3" style={{ background: "#F8FAFC", borderBottom: "1px solid #E8EEF4" }}>
                  <span style={{ fontWeight: 800, fontSize: "0.88rem", color: "#1E293B" }}>Tổng kết tài chính</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Tiền cọc gốc", value: formatCurrency(depositAmt), color: "#374151" },
                    { label: "Khấu trừ hư hỏng", value: `− ${formatCurrency(penaltyAmt)}`, color: "#DC2626" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                      <span style={{ fontSize: "0.82rem", color: "#64748B" }}>{row.label}</span>
                      <span style={{ fontSize: "0.88rem", fontWeight: 700, color: row.color }}>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-4 py-3" style={{ background: "#F0FDF4" }}>
                    <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#1E293B" }}>Hoàn lại khách</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 900, color: "#059669" }}>{formatCurrency(refundAmt)}</span>
                  </div>
                </div>
              </div>

              {sentToAcct && !released && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl" style={{ background: "#EEF2FF", border: "1px solid #C7D2FE" }}>
                  <BadgeCheck size={14} style={{ color: A }} />
                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: A }}>Đã chuyển kế toán xử lý. Đang chờ đối soát số liệu...</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0" style={{ borderTop: "1px solid #F1F5F9", background: "#FAFBFD" }}>
              <button onClick={closeModal} className="px-4 py-2.5 rounded-xl transition" style={{ border: "1.5px solid #E2E8F0", fontSize: "0.82rem", fontWeight: 600, color: "#64748B" }}>
                Đóng
              </button>
              <div className="flex-1" />
              <button
                onClick={handleSendToAccountant}
                disabled={sentToAcct}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition"
                style={{
                  background: sentToAcct ? "#D1FAE5" : "linear-gradient(135deg,#EA580C,#DC2626)",
                  color: sentToAcct ? "#059669" : "white",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  boxShadow: sentToAcct ? "none" : "0 2px 10px rgba(234,88,12,0.35)",
                  cursor: sentToAcct ? "default" : "pointer",
                }}
              >
                {sentToAcct ? <><BadgeCheck size={13} /> Đã chuyển kế toán</> : <><Send size={13} /> Chuyển Kế toán đối soát</>}
              </button>
              <button
                onClick={handleRelease}
                disabled={!sentToAcct || released}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white transition"
                style={{
                  background: !sentToAcct ? "#CBD5E1" : released ? "#059669" : "linear-gradient(135deg,#059669,#0891B2)",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  cursor: !sentToAcct ? "not-allowed" : "pointer",
                  boxShadow: sentToAcct && !released ? "0 2px 10px rgba(5,150,105,0.35)" : "none",
                }}
              >
                {released ? <><CheckCircle size={13} /> Đã trả phòng!</> : <><FileSignature size={13} /> Ký biên bản & Trả phòng</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type OTab = "checkin" | "checkout";

export default function Operations() {
  const [tab, setTab] = useState<OTab>("checkin");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkins, setCheckins] = useState<OperationCheckinItem[]>([]);
  const [checkouts, setCheckouts] = useState<OperationCheckoutItem[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await getOperations();
        if (!active) {
          return;
        }
        setCheckins(data.checkins ?? []);
        setCheckouts(data.checkouts ?? []);
      } catch (loadError) {
        if (!active) {
          return;
        }
        setError(loadError instanceof Error ? loadError.message : "Không tải được dữ liệu bàn giao & thanh lý");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: "#FFF7ED" }}>
          <ArrowLeftRight size={14} style={{ color: "#EA580C" }} />
        </div>
        <h2 className="text-slate-900" style={{ fontWeight: 900, fontSize: "1.35rem", letterSpacing: "-0.02em" }}>
          Bàn giao & Thanh lý
        </h2>
      </div>
      <p className="mb-6" style={{ fontSize: "0.85rem", color: "#64748B", paddingLeft: "2.25rem" }}>
        Quản lý check-in (lập biên bản bàn giao) và check-out (thanh lý & hoàn cọc)
      </p>

      <div className="flex items-center gap-1 mb-6 p-1 rounded-2xl" style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", display: "inline-flex" }}>
        {[
          { id: "checkin" as const, label: "Bàn giao (Check-in)", icon: ClipboardList, color: A, count: checkins.length },
          { id: "checkout" as const, label: "Thanh lý (Check-out)", icon: ArrowLeftRight, color: "#EA580C", count: checkouts.length },
        ].map((item) => {
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all"
              style={{
                fontSize: "0.82rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? item.color : "#64748B",
                background: isActive ? "white" : "transparent",
                boxShadow: isActive ? "0 1px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)" : "none",
              }}
            >
              <item.icon size={14} />
              {item.label}
              <span className="px-1.5 py-0.5 rounded-full text-white" style={{ background: isActive ? item.color : "#CBD5E1", fontSize: "0.65rem", fontWeight: 800 }}>
                {item.count}
              </span>
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-8 text-sm text-slate-500">
          Đang tải dữ liệu bàn giao & thanh lý từ database...
        </div>
      )}

      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {tab === "checkin" && <CheckInTab rooms={checkins} onRoomsChange={setCheckins} />}
          {tab === "checkout" && <CheckOutTab rooms={checkouts} onRoomsChange={setCheckouts} />}
        </>
      )}
    </div>
  );
}