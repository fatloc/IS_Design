import { useState } from "react";
import { X, Phone, Mail, CreditCard, FileText, Calendar, MapPin, Wifi } from "lucide-react";
import { rooms, Room } from "../data/mockData";

type StatusColor = {
  bg: string; border: string; badge: string; dot: string; label: string;
};

const STATUS_CONFIG: Record<string, StatusColor> = {
  Vacant:      { bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500", label: "Trống" },
  Occupied:    { bg: "bg-blue-50",    border: "border-blue-200",    badge: "bg-blue-100 text-blue-700",       dot: "bg-blue-500",    label: "Đang thuê" },
  Reserved:    { bg: "bg-amber-50",   border: "border-amber-200",   badge: "bg-amber-100 text-amber-700",     dot: "bg-amber-500",   label: "Đặt trước" },
  Maintenance: { bg: "bg-slate-100",  border: "border-slate-300",   badge: "bg-slate-200 text-slate-600",     dot: "bg-slate-500",   label: "Bảo trì" },
};

const PAYMENT_CONFIG: Record<string, string> = {
  Paid: "bg-emerald-100 text-emerald-700",
  Unpaid: "bg-red-100 text-red-700",
  Partial: "bg-amber-100 text-amber-700",
};

function RoomDetailModal({ room, onClose }: { room: Room; onClose: () => void }) {
  const cfg = STATUS_CONFIG[room.status];
  const contractInfo = room.contractId
    ? { id: room.contractId, start: "2024-06-01", end: "2025-05-31" }
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`${cfg.bg} px-6 py-5 rounded-t-2xl border-b ${cfg.border}`}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl text-slate-900" style={{ fontWeight: 700 }}>{room.number}</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full ${cfg.badge}`} style={{ fontWeight: 600 }}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1`} />
                  {cfg.label}
                </span>
              </div>
              <div className="text-sm text-slate-600">Tòa {room.building} · Tầng {room.floor} · Phòng {room.type}</div>
            </div>
            <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/70 hover:bg-white flex items-center justify-center transition">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Room Details */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">Sức chứa</div>
              <div className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>{room.capacity} người</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">Giá thuê</div>
              <div className="text-indigo-600 text-sm" style={{ fontWeight: 600 }}>{room.price.toLocaleString()}đ</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-slate-400 text-xs mb-1">Vị trí</div>
              <div className="text-slate-800 text-sm" style={{ fontWeight: 600 }}>T{room.floor} · {room.building}</div>
            </div>
          </div>

          {/* Resident Details */}
          {room.resident ? (
            <div>
              <div className="text-sm text-slate-500 mb-3" style={{ fontWeight: 500 }}>Thông tin khách thuê</div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl" style={{ fontWeight: 700 }}>
                  {room.resident.name[0]}
                </div>
                <div>
                  <div className="text-slate-900 text-base" style={{ fontWeight: 600 }}>{room.resident.name}</div>
                  <div className="text-xs text-slate-500">CCCD: {room.resident.idNumber}</div>
                </div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400 flex-shrink-0" />
                  {room.resident.phone}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400 flex-shrink-0" />
                  {room.resident.email}
                </div>
                {room.paymentStatus && (
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <CreditCard size={14} className="text-slate-400 flex-shrink-0" />
                    Thanh toán:&nbsp;
                    <span className={`text-xs px-2 py-0.5 rounded-full ${PAYMENT_CONFIG[room.paymentStatus]}`}>
                      {room.paymentStatus === "Paid" ? "Đã thanh toán" : room.paymentStatus === "Unpaid" ? "Chưa thanh toán" : "Thanh toán một phần"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-slate-400 text-sm bg-slate-50 rounded-xl">
              {room.status === "Maintenance" ? "Phòng đang trong quá trình bảo trì" : "Phòng chưa có khách thuê"}
            </div>
          )}

          {/* Contract Details */}
          {contractInfo && (
            <div>
              <div className="text-sm text-slate-500 mb-3" style={{ fontWeight: 500 }}>Thông tin hợp đồng</div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <FileText size={14} className="text-slate-400 flex-shrink-0" />
                  Mã hợp đồng: <span className="text-indigo-600">{contractInfo.id}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={14} className="text-slate-400 flex-shrink-0" />
                  Hiệu lực: {contractInfo.start} → {contractInfo.end}
                </div>
              </div>
            </div>
          )}

          {/* Amenities */}
          <div>
            <div className="text-sm text-slate-500 mb-3" style={{ fontWeight: 500 }}>Tiện nghi</div>
            <div className="flex flex-wrap gap-2">
              {["WiFi miễn phí", "Điều hòa", "Nóng lạnh", "Tủ quần áo", "Bàn học"].map(a => (
                <span key={a} className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                  <Wifi size={10} /> {a}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl text-sm hover:bg-indigo-700 transition">
              {room.status === "Vacant" ? "Tạo hợp đồng" : "Xem hợp đồng"}
            </button>
            <button className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm hover:bg-slate-50 transition">
              Chỉnh sửa phòng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const [building, setBuilding] = useState<"All" | "A" | "B" | "C">("All");
  const [floor, setFloor] = useState<"All" | string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | string>("All");
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const buildings = ["All", "A", "B", "C"] as const;
  const floors = ["All", "1", "2", "3", "4"];

  const filtered = rooms.filter(r => {
    const matchBuilding = building === "All" || r.building === building;
    const matchFloor = floor === "All" || r.floor === parseInt(floor);
    const matchStatus = statusFilter === "All" || r.status === statusFilter;
    return matchBuilding && matchFloor && matchStatus;
  });

  const stats = {
    Vacant: rooms.filter(r => r.status === "Vacant").length,
    Occupied: rooms.filter(r => r.status === "Occupied").length,
    Reserved: rooms.filter(r => r.status === "Reserved").length,
    Maintenance: rooms.filter(r => r.status === "Maintenance").length,
  };

  return (
    <div className="space-y-5">
      {/* Legend + Stats */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex flex-wrap items-center gap-4">
        {[
          { status: "Vacant", label: "Phòng trống", count: stats.Vacant },
          { status: "Occupied", label: "Đang thuê", count: stats.Occupied },
          { status: "Reserved", label: "Đặt trước", count: stats.Reserved },
          { status: "Maintenance", label: "Bảo trì", count: stats.Maintenance },
        ].map((s) => (
          <button
            key={s.status}
            onClick={() => setStatusFilter(statusFilter === s.status ? "All" : s.status)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${statusFilter === s.status ? STATUS_CONFIG[s.status].border + " " + STATUS_CONFIG[s.status].bg : "border-slate-200 hover:border-slate-300"}`}
          >
            <span className={`w-3 h-3 rounded-full ${STATUS_CONFIG[s.status].dot}`} />
            <span className="text-sm text-slate-700">{s.label}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${STATUS_CONFIG[s.status].badge}`} style={{ fontWeight: 600 }}>{s.count}</span>
          </button>
        ))}
        <div className="ml-auto text-xs text-slate-400">{filtered.length} / {rooms.length} phòng</div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-slate-400" />
          <span className="text-sm text-slate-500">Tòa nhà:</span>
          <div className="flex gap-1">
            {buildings.map(b => (
              <button
                key={b}
                onClick={() => setBuilding(b as any)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${building === b ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {b === "All" ? "Tất cả" : `Tòa ${b}`}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Tầng:</span>
          <div className="flex gap-1">
            {floors.map(f => (
              <button
                key={f}
                onClick={() => setFloor(f)}
                className={`px-3 py-1.5 rounded-lg text-sm transition ${floor === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {f === "All" ? "Tất cả" : `T${f}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Room Grid - grouped by building */}
      {(["A", "B", "C"] as const).map(b => {
        if (building !== "All" && building !== b) return null;
        const buildingRooms = filtered.filter(r => r.building === b);
        if (buildingRooms.length === 0) return null;

        return (
          <div key={b} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-sm" style={{ fontWeight: 700 }}>
                {b}
              </div>
              <span className="text-slate-800">Tòa {b}</span>
              <span className="text-slate-400 text-xs">{buildingRooms.length} phòng</span>
            </div>
            <div className="p-4 grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
              {buildingRooms.map((room) => {
                const cfg = STATUS_CONFIG[room.status];
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoom(room)}
                    className={`${cfg.bg} ${cfg.border} border-2 rounded-xl p-2.5 text-center hover:scale-105 hover:shadow-md transition-all duration-150 group`}
                  >
                    <div className={`w-2 h-2 rounded-full ${cfg.dot} mx-auto mb-1.5`} />
                    <div className="text-xs text-slate-800 leading-tight" style={{ fontWeight: 600 }}>{room.number}</div>
                    <div className="text-xs text-slate-400 leading-tight mt-0.5">{room.type[0]}</div>
                    {room.paymentStatus === "Unpaid" && (
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 mx-auto" title="Chưa thanh toán" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-white rounded-xl border border-slate-100 shadow-sm">
          Không tìm thấy phòng nào với bộ lọc hiện tại
        </div>
      )}

      {selectedRoom && (
        <RoomDetailModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
      )}
    </div>
  );
}
