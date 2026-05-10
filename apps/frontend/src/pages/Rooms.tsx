import { useEffect, useMemo, useState } from "react";
import { Building2, Filter, Layers3, Search, SlidersHorizontal, Users, UserCheck, UserPlus } from "lucide-react";
import { Pagination } from "../components/Pagination";
import { usePagedList } from "../hooks/usePagedList";
import { getRooms, getRoomAvailability, type RoomAvailability } from "../services/api";
import type { Room } from "../types";

const STATUS_OPTIONS = [
  { value: "All", label: "Tất cả" },
  { value: "Trong", label: "Trống", color: "#059669", bg: "#ECFDF5" },
  { value: "Da dat", label: "Đã đặt", color: "#D97706", bg: "#FFFBEB" },
  { value: "Dang thue", label: "Đang thuê", color: "#2563EB", bg: "#EFF6FF" },
  { value: "Bao tri", label: "Bảo trì", color: "#64748B", bg: "#F8FAFC" },
] as const;

const BRANCH_OPTIONS = ["All", "0001", "0002", "0003", "0004", "0005"] as const;

function formatMoney(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const numeric = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  if (Number.isNaN(numeric)) return String(value);
  return numeric.toLocaleString("vi-VN") + " đ";
}

function statusStyle(status: string | null | undefined) {
  const normalized = (status ?? "").toLowerCase();
  if (normalized.includes("trong")) return { label: "Trống", bg: "#ECFDF5", color: "#059669" };
  if (normalized.includes("da dat")) return { label: "Đã đặt", bg: "#FFFBEB", color: "#D97706" };
  if (normalized.includes("dang thue")) return { label: "Đang thuê", bg: "#EFF6FF", color: "#2563EB" };
  if (normalized.includes("bao tri")) return { label: "Bảo trì", bg: "#F8FAFC", color: "#64748B" };
  return { label: status ?? "Không rõ", bg: "#F1F5F9", color: "#334155" };
}

export default function Rooms() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_OPTIONS)[number]["value"]>("All");
  const [branchFilter, setBranchFilter] = useState<(typeof BRANCH_OPTIONS)[number]>("All");
  const [searchText, setSearchText] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [availability, setAvailability] = useState<Map<string, RoomAvailability>>(new Map());

  const apiParams = useMemo(() => {
    const query: Record<string, unknown> = {};
    if (statusFilter !== "All") {
      query.search = statusFilter;
    }
    return query;
  }, [statusFilter]);

  const { items, page, size, totalElements, totalPages, loading, error, setPage, setSize, reload } = usePagedList<Room>(
    getRooms,
    12,
    apiParams
  );

  // Load room availability (slot data)
  useEffect(() => {
    getRoomAvailability()
      .then(data => {
        const map = new Map<string, RoomAvailability>();
        data.forEach(r => map.set(r.maPhong.trim(), r));
        setAvailability(map);
      })
      .catch(() => { /* silently fail, rooms still show without slot info */ });
  }, [items]); // reload when items change

  useEffect(() => {
    setPage(0);
    setSelectedRoom(null);
  }, [statusFilter, branchFilter, setPage]);

  const visibleRooms = items.filter((room) => {
    const matchBranch = branchFilter === "All" || String(room.chiNhanh ?? "") === branchFilter;
    const matchSearch = !searchText.trim() || String(room.maPhong ?? "").toLowerCase().includes(searchText.trim().toLowerCase());
    return matchBranch && matchSearch;
  });

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((room) => {
      const normalized = (room.trangThai ?? "").toLowerCase();
      const key = normalized.includes("trong")
        ? "Trong"
        : normalized.includes("da dat")
          ? "Da dat"
          : normalized.includes("dang thue")
            ? "Dang thue"
            : normalized.includes("bao tri")
              ? "Bao tri"
              : room.trangThai ?? "Khac";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return counts;
  }, [items]);

  useEffect(() => {
    if (!selectedRoom && visibleRooms.length > 0) {
      setSelectedRoom(visibleRooms[0]);
    }
    if (selectedRoom && !visibleRooms.find((room) => room.maPhong === selectedRoom.maPhong)) {
      setSelectedRoom(visibleRooms[0] ?? null);
    }
  }, [visibleRooms, selectedRoom]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {STATUS_OPTIONS.filter((option) => option.value !== "All").map((option) => {
          const count = statusCounts.get(option.value) ?? 0;
          return (
            <button
              key={option.value}
              onClick={() => setStatusFilter(statusFilter === option.value ? "All" : option.value)}
              className="rounded-2xl border p-4 text-left bg-white shadow-sm transition hover:-translate-y-0.5"
              style={{ borderColor: statusFilter === option.value ? option.color ?? "#E2E8F0" : "#E2E8F0" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-slate-400">{option.label}</div>
                  <div className="mt-2 text-2xl text-slate-900" style={{ fontWeight: 800 }}>{count}</div>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: option.bg }}>
                  <Layers3 size={18} style={{ color: option.color }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[260px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm theo mã phòng..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 bg-slate-50">
              <Filter size={14} className="text-slate-400" />
              Trạng thái
            </div>
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setStatusFilter(option.value)}
                className="px-3 py-2.5 rounded-xl text-sm transition border"
                style={{
                  background: statusFilter === option.value ? (option.bg ?? "#EEF2FF") : "#fff",
                  color: statusFilter === option.value ? (option.color ?? "#4F46E5") : "#64748B",
                  borderColor: statusFilter === option.value ? (option.color ?? "#CBD5E1") : "#E2E8F0",
                  fontWeight: statusFilter === option.value ? 700 : 500,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 bg-slate-50">
              <Building2 size={14} className="text-slate-400" />
              Chi nhánh
            </div>
            {BRANCH_OPTIONS.map((branch) => (
              <button
                key={branch}
                onClick={() => setBranchFilter(branch)}
                className="px-3 py-2.5 rounded-xl text-sm transition border"
                style={{
                  background: branchFilter === branch ? "#EEF2FF" : "#fff",
                  color: branchFilter === branch ? "#4F46E5" : "#64748B",
                  borderColor: branchFilter === branch ? "#C7D2FE" : "#E2E8F0",
                  fontWeight: branchFilter === branch ? 700 : 500,
                }}
              >
                {branch === "All" ? "Tất cả" : branch}
              </button>
            ))}
          </div>

          <div className="ml-auto text-xs text-slate-500 flex items-center gap-2">
            <SlidersHorizontal size={14} />
            {loading ? "Đang tải dữ liệu..." : `${totalElements} phòng`}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Không tải được dữ liệu phòng. Hãy kiểm tra backend đang chạy ở cổng 3000.
            <button onClick={reload} className="ml-3 font-semibold underline underline-offset-2">
              Tải lại
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Mã phòng</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Sức chứa</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Công suất hiện tại</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Giá thuê</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs uppercase tracking-wider text-slate-500">Chi nhánh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {!loading && visibleRooms.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-sm text-slate-400">
                    Không có phòng phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              )}

              {visibleRooms.map((room) => {
                const state = statusStyle(room.trangThai);
                const isSelected = selectedRoom?.maPhong === room.maPhong;
                return (
                  <tr
                    key={room.maPhong}
                    onClick={() => setSelectedRoom(room)}
                    className={`cursor-pointer transition ${isSelected ? "bg-indigo-50/70" : "hover:bg-slate-50"}`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center" style={{ fontWeight: 800 }}>
                          {room.maPhong}
                        </div>
                        <div>
                          <div className="text-sm text-slate-900" style={{ fontWeight: 700 }}>{room.maPhong}</div>
                          <div className="text-xs text-slate-400">Phòng ký túc xá</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{room.sucChuaToiDa ?? "—"} người</td>
                    <td className="px-4 py-4">
                      {(() => {
                        const avail = availability.get(room.maPhong.trim());
                        if (!avail) return <span className="text-sm text-slate-400">—</span>;
                        const pct = avail.sucChuaToiDa > 0 ? Math.round((avail.soNguoiHienTai / avail.sucChuaToiDa) * 100) : 0;
                        const barColor = pct >= 100 ? "#EF4444" : pct >= 75 ? "#F59E0B" : "#22C55E";
                        return (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: barColor }} />
                            </div>
                            <span className="text-xs text-slate-600" style={{ fontWeight: 700 }}>
                              {avail.soNguoiHienTai}/{avail.sucChuaToiDa}
                            </span>
                            <span className="text-[10px] rounded-full px-1.5 py-0.5" style={{
                              background: avail.slotsTrong > 0 ? "#ECFDF5" : "#FEF2F2",
                              color: avail.slotsTrong > 0 ? "#059669" : "#DC2626",
                              fontWeight: 700
                            }}>
                              {avail.slotsTrong > 0 ? `${avail.slotsTrong} trống` : "Đầy"}
                            </span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{formatMoney(room.giaThuePhong)}</td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs" style={{ background: state.bg, color: state.color, fontWeight: 700 }}>
                        {state.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-slate-700">{room.chiNhanh ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          pageSize={size}
          onPageChange={setPage}
          onPageSizeChange={setSize}
        />
      </div>

      <div className="grid grid-cols-[1.6fr_1fr] gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-indigo-500" />
            <div>
              <div className="text-sm text-slate-900" style={{ fontWeight: 700 }}>Danh sách đang xem</div>
              <div className="text-xs text-slate-400">Trang {page + 1} / {totalPages || 1} · hiển thị {visibleRooms.length} phòng</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {visibleRooms.map((room) => {
              const state = statusStyle(room.trangThai);
              return (
                <button
                  key={room.maPhong}
                  onClick={() => setSelectedRoom(room)}
                  className="rounded-2xl border p-4 text-left transition hover:-translate-y-0.5"
                  style={{ borderColor: selectedRoom?.maPhong === room.maPhong ? "#C7D2FE" : "#E2E8F0", background: selectedRoom?.maPhong === room.maPhong ? "#EEF2FF" : "#FFFFFF" }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-slate-900" style={{ fontWeight: 800 }}>{room.maPhong}</div>
                    <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ background: state.bg, color: state.color, fontWeight: 700 }}>
                      {state.label}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-slate-600">
                    {(() => {
                      const avail = availability.get(room.maPhong.trim());
                      if (avail) {
                        return (
                          <>
                            <div className="flex items-center gap-1.5">
                              <Users size={12} className="text-slate-400" />
                              <span>{avail.soNguoiHienTai}/{avail.sucChuaToiDa}</span>
                              <span className="text-[10px] rounded-full px-1.5 py-0.5 ml-1" style={{
                                background: avail.slotsTrong > 0 ? "#ECFDF5" : "#FEF2F2",
                                color: avail.slotsTrong > 0 ? "#059669" : "#DC2626",
                                fontWeight: 700
                              }}>
                                {avail.slotsTrong > 0 ? `${avail.slotsTrong} slot trống` : "Đầy"}
                              </span>
                            </div>
                            <div>Giá: {formatMoney(room.giaThuePhong)}</div>
                            <div>Chi nhánh: {room.chiNhanh ?? "—"}</div>
                          </>
                        );
                      }
                      return (
                        <>
                          <div>Sức chứa: {room.sucChuaToiDa ?? "—"}</div>
                          <div>Giá: {formatMoney(room.giaThuePhong)}</div>
                          <div>Chi nhánh: {room.chiNhanh ?? "—"}</div>
                        </>
                      );
                    })()}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="text-sm text-slate-900 mb-4" style={{ fontWeight: 800 }}>Chi tiết phòng</div>
          {selectedRoom ? (
            <div className="space-y-4">
              <div className="rounded-2xl p-4" style={{ background: "linear-gradient(135deg,#EEF2FF,#F8FAFC)", border: "1px solid #E0E7FF" }}>
                <div className="text-xs uppercase tracking-widest text-indigo-500">Phòng</div>
                <div className="mt-1 text-2xl text-slate-900" style={{ fontWeight: 900 }}>{selectedRoom.maPhong}</div>
                <div className="mt-2 text-sm text-slate-600">{selectedRoom.chiNhanh ?? "—"}</div>
              </div>

              {(() => {
                const avail = availability.get(selectedRoom.maPhong.trim());
                const capacity = avail?.sucChuaToiDa ?? selectedRoom.sucChuaToiDa ?? 0;
                const current = avail?.soNguoiHienTai ?? 0;
                const slotsLeft = avail?.slotsTrong ?? capacity;
                const pct = capacity > 0 ? Math.round((current / capacity) * 100) : 0;
                const barColor = pct >= 100 ? "#EF4444" : pct >= 75 ? "#F59E0B" : pct >= 50 ? "#3B82F6" : "#22C55E";
                return (
                  <>
                    {/* Occupancy Progress */}
                    <div className="rounded-xl border border-slate-100 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users size={13} /> Công suất phòng
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          background: slotsLeft > 0 ? "#ECFDF5" : "#FEF2F2",
                          color: slotsLeft > 0 ? "#059669" : "#DC2626",
                          fontWeight: 800
                        }}>
                          {slotsLeft > 0 ? `Còn ${slotsLeft} chỗ` : "ĐẦY"}
                        </span>
                      </div>
                      <div className="relative h-3 rounded-full overflow-hidden" style={{ background: "#F1F5F9" }}>
                        <div className="absolute inset-y-0 left-0 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span><UserCheck size={11} className="inline mr-1" />{current} đang ở</span>
                        <span style={{ fontWeight: 700, color: "#1E293B" }}>{current} / {capacity} người</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-xs text-slate-400">Sức chứa tối đa</div>
                        <div className="mt-1 text-sm text-slate-900" style={{ fontWeight: 800 }}>{capacity} người</div>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="text-xs text-slate-400">Giá thuê</div>
                        <div className="mt-1 text-sm text-slate-900" style={{ fontWeight: 800 }}>{formatMoney(selectedRoom.giaThuePhong)}</div>
                      </div>
                    </div>

                    <div className="rounded-xl px-3 py-2.5" style={{ background: statusStyle(selectedRoom.trangThai).bg, color: statusStyle(selectedRoom.trangThai).color, fontWeight: 700 }}>
                      Trạng thái: {statusStyle(selectedRoom.trangThai).label}
                    </div>
                  </>
                );
              })()}

              <button
                onClick={reload}
                className="w-full rounded-xl py-2.5 text-sm text-white transition"
                style={{ background: "linear-gradient(135deg,#4F46E5,#7C3AED)" }}
              >
                Tải lại dữ liệu từ backend
              </button>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
              Chưa có phòng nào được chọn.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
