import { useState, useEffect } from "react";
import {
  CheckSquare, AlertTriangle, FileText, Users, Settings2,
  DoorOpen, Home, Wrench, BookMarked, Plus, Pencil, Trash2,
  Search, ChevronDown, Eye, RefreshCw, UserCheck, Lock, Zap, Droplets,
  Building2, BedDouble, ShieldCheck, Loader2
} from "lucide-react";
import {
  userAccounts, pendingAccounts
} from "../data/mockData";
import { getRooms } from "../services/api";
import type { Room as ApiRoom } from "../types";

type UIRoom = {
  id: string;
  number: string;
  floor: number;
  building: string;
  type: string;
  status: "Vacant" | "Occupied" | "Reserved" | "Maintenance";
  capacity: number;
  price: number;
};

// Helper mapper API -> UI
function mapApiToUIRoom(apiRoom: ApiRoom): UIRoom {
  const ma = apiRoom.maPhong || "";
  const b = ma.charAt(0).toUpperCase(); 
  const f = parseInt(ma.charAt(1) || "1", 10);
  
  let mappedStatus: "Vacant" | "Occupied" | "Reserved" | "Maintenance" = "Vacant";
  if (apiRoom.trangThai === "Đang thuê" || apiRoom.trangThai === "Occupied") mappedStatus = "Occupied";
  else if (apiRoom.trangThai === "Bảo trì" || apiRoom.trangThai === "Maintenance") mappedStatus = "Maintenance";
  else if (apiRoom.trangThai === "Đặt trước" || apiRoom.trangThai === "Reserved") mappedStatus = "Reserved";

  return {
    id: apiRoom.maPhong,
    number: apiRoom.maPhong,
    floor: isNaN(f) ? 1 : f,
    building: b || "A",
    type: `Phòng ${apiRoom.sucChuaToiDa || 0}`,
    status: mappedStatus,
    capacity: apiRoom.sucChuaToiDa || 0,
    price: Number(apiRoom.giaThuePhong) || 0
  };
}

const TABS = ["Dashboard Overview", "Contracts & Residencies", "Admin Settings"];

// ──────────────── Tab 1: Dashboard Overview ────────────────
function DashboardOverview({ roomsData, contractsData, isLoading }: { roomsData: UIRoom[], contractsData: UIContract[], isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-100">
        <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
        <p className="text-slate-500">Đang tải biểu đồ...</p>
      </div>
    );
  }

  const statusCounts = {
    Vacant: roomsData.filter(r => r.status === "Vacant").length,
    Occupied: roomsData.filter(r => r.status === "Occupied").length,
    Reserved: roomsData.filter(r => r.status === "Reserved").length,
    Maintenance: roomsData.filter(r => r.status === "Maintenance").length,
  };

  const expiringCount = contractsData.filter(c => c.status === "Expiring").length;
  const todayCheckIns = 3;
  const todayCheckOuts = 2;

  const statusCards = [
    { label: "Phòng trống", count: statusCounts.Vacant, color: "emerald", icon: DoorOpen, bg: "bg-emerald-50", text: "text-emerald-600", ring: "ring-emerald-200" },
    { label: "Đang thuê", count: statusCounts.Occupied, color: "blue", icon: Home, bg: "bg-blue-50", text: "text-blue-600", ring: "ring-blue-200" },
    { label: "Đã đặt trước", count: statusCounts.Reserved, color: "amber", icon: BookMarked, bg: "bg-amber-50", text: "text-amber-600", ring: "ring-amber-200" },
    { label: "Bảo trì", count: statusCounts.Maintenance, color: "red", icon: Wrench, bg: "bg-red-50", text: "text-red-600", ring: "ring-red-200" },
  ];

  const urgentTasks = [
    { label: "Check-in hôm nay", count: todayCheckIns, color: "text-blue-600", bg: "bg-blue-50", link: "/manager/workflows" },
    { label: "Check-out hôm nay", count: todayCheckOuts, color: "text-amber-600", bg: "bg-amber-50", link: "/manager/workflows" },
    { label: "Hợp đồng sắp hết hạn", count: expiringCount, color: "text-red-600", bg: "bg-red-50", link: "/manager/dashboard" },
    { label: "Phòng cần bảo trì", count: statusCounts.Maintenance, color: "text-orange-600", bg: "bg-orange-50", link: "/manager/rooms" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl p-5 border border-slate-100 ring-1 ${card.ring} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                <card.icon size={20} className={card.text} />
              </div>
              <span className={`text-3xl ${card.text}`} style={{ fontWeight: 700 }}>{card.count}</span>
            </div>
            <div className="text-sm text-slate-600" style={{ fontWeight: 500 }}>{card.label}</div>
            <div className="text-xs text-slate-400 mt-0.5">/ {roomsData.length} phòng tổng</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-800">Tỷ lệ lấp đầy phòng</h3>
          <span className="text-xs text-slate-500">{roomsData.length} phòng tổng cộng</span>
        </div>
        <div className="flex h-6 rounded-lg overflow-hidden gap-0.5 bg-slate-100">
          {roomsData.length > 0 && statusCards.map((card) => (
            <div
              key={card.label}
              className={`${card.bg} transition-all`}
              style={{ width: `${(card.count / roomsData.length) * 100}%` }}
              title={`${card.label}: ${card.count}`}
            />
          ))}
        </div>
        <div className="flex gap-4 mt-3">
          {roomsData.length > 0 && statusCards.map((card) => (
            <div key={card.label} className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${card.bg} border ${card.ring}`} />
              <span className="text-xs text-slate-500">{card.label} ({Math.round((card.count / roomsData.length) * 100)}%)</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          <h3 className="text-slate-800">Công việc khẩn cấp</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {urgentTasks.map((task) => (
            <div key={task.label} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/60 transition">
              <div className="flex items-center gap-3">
                <CheckSquare size={15} className="text-slate-300" />
                <span className="text-sm text-slate-700">{task.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`${task.bg} ${task.color} text-xs px-2.5 py-0.5 rounded-full`} style={{ fontWeight: 600 }}>
                  {task.count}
                </span>
                <a href={task.link} className="text-xs text-indigo-600 hover:underline">Xem →</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-indigo-500" />
            <h3 className="text-slate-800">Hợp đồng gần đây</h3>
          </div>
          <span className="text-xs text-slate-500">{contractsData.length} hợp đồng</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                {["Hợp đồng", "Khách thuê", "Phòng", "Kết thúc", "Trạng thái"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {contractsData.slice(0, 5).map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 text-indigo-600 text-xs">{c.id}</td>
                  <td className="px-4 py-3 text-slate-700">{c.residentName}</td>
                  <td className="px-4 py-3 text-slate-600">{c.roomId}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{c.endDate}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Active: "bg-emerald-100 text-emerald-700",
    Expiring: "bg-amber-100 text-amber-700",
    Expired: "bg-red-100 text-red-700",
    Pending: "bg-blue-100 text-blue-700",
  };
  const label: Record<string, string> = {
    Active: "Đang hiệu lực", Expiring: "Sắp hết hạn", Expired: "Đã hết hạn", Pending: "Chờ duyệt"
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full ${map[status] || "bg-slate-100 text-slate-600"}`} style={{ fontWeight: 500 }}>
      {label[status] || status}
    </span>
  );
}

// ──────────────── Tab 2: Contracts & Residencies ────────────────
import { getContracts } from "../services/api";
import type { ApiContract } from "../services/api";

type UIContract = {
  id: string;
  residentName: string;
  residentPhone: string;
  roomId: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  status: string;
};

function mapApiToUIContract(apiContract: ApiContract): UIContract {
  let mappedStatus = "Pending";
  if (apiContract.loaiVanBan?.includes("[STATUS:Active]")) mappedStatus = "Active";
  else if (apiContract.loaiVanBan?.includes("[STATUS:Expiring]")) mappedStatus = "Expiring";
  else if (apiContract.loaiVanBan?.includes("[STATUS:Expired]")) mappedStatus = "Expired";

  let price = 0;
  if (apiContract.hinhThucThue === "Phòng Đơn") price = 3500000;
  else if (apiContract.hinhThucThue === "Phòng Đôi") price = 4500000;
  else price = 2500000;

  return {
    id: apiContract.maVanBan || apiContract.maHopDongThue || "unknown",
    residentName: apiContract.khachHangSoHuu || "Khách ẩn danh",
    residentPhone: "Đang cập nhật...", // No relation
    roomId: "Chưa phân", // No relation
    startDate: apiContract.ngayLap || "2025-04-20",
    endDate: "Tính bằng Code", // Placeholder
    rentAmount: price,
    status: mappedStatus
  };
}

function ContractsTab({ contractsData, isLoading }: { contractsData: UIContract[], isLoading: boolean }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [showRenewModal, setShowRenewModal] = useState<string | null>(null);

  const filtered = contractsData.filter(c => {
    const matchSearch = c.residentName.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.roomId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            placeholder="Tìm theo tên, phòng, mã HĐ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="All">Tất cả trạng thái</option>
            <option value="Active">Đang hiệu lực</option>
            <option value="Expiring">Sắp hết hạn</option>
            <option value="Expired">Đã hết hạn</option>
            <option value="Pending">Chờ duyệt</option>
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
        <button className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition">
          <Plus size={14} /> Tạo hợp đồng
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-100">
           <Loader2 className="animate-spin text-indigo-500 mb-4" size={32} />
           <p className="text-slate-500">Đang tải biểu bảng hợp đồng...</p>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Tổng hợp đồng", v: contractsData.length, color: "text-slate-700", bg: "bg-white" },
              { label: "Đang hiệu lực", v: contractsData.filter(c => c.status === "Active").length, color: "text-emerald-600", bg: "bg-white" },
              { label: "Sắp hết hạn", v: contractsData.filter(c => c.status === "Expiring").length, color: "text-amber-600", bg: "bg-white" },
              { label: "Chờ duyệt", v: contractsData.filter(c => c.status === "Pending").length, color: "text-blue-600", bg: "bg-white" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-xl p-4 border border-slate-100 shadow-sm text-center`}>
                <div className={`text-2xl ${s.color}`} style={{ fontWeight: 700 }}>{s.v}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {["Mã HĐ", "Khách thuê", "Phòng", "Bắt đầu", "Kết thúc", "Tiền thuê", "Trạng thái", "Hành động"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3.5">
                        <span className="text-indigo-600 text-xs">{c.id}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-800" style={{ fontWeight: 500 }}>{c.residentName}</div>
                        <div className="text-xs text-slate-400">{c.residentPhone}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">{c.roomId}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{c.startDate}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-500">{c.endDate}</td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">{c.rentAmount.toLocaleString()}đ</td>
                      <td className="px-4 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          {c.status === "Pending" && (
                            <button className="px-2 py-1 bg-indigo-600 text-white rounded text-xs hover:bg-indigo-700">
                              Ký HĐ
                            </button>
                          )}
                          <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition" title="Xem khách">
                            <Users size={13} />
                          </button>
                          {c.status === "Expiring" && (
                            <button
                              onClick={() => setShowRenewModal(c.id)}
                              className="px-2 py-1 bg-amber-500 text-white rounded text-xs hover:bg-amber-600"
                            >
                              Gia hạn
                            </button>
                          )}
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="Xem">
                            <Eye size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="text-center py-10 text-slate-400">Không tìm thấy hợp đồng nào</div>
            )}
          </div>
        </>
      )}

      {/* Renew Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="mb-1">Gia hạn hợp đồng</h3>
            <p className="text-sm text-slate-500 mb-4">Mã hợp đồng: <strong>{showRenewModal}</strong></p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">Ngày kết thúc mới</label>
                <input type="date" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Giá thuê mới (đ/tháng)</label>
                <input type="number" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">Ghi chú</label>
                <textarea rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowRenewModal(null)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm hover:bg-slate-50">Hủy</button>
              <button onClick={() => setShowRenewModal(null)} className="flex-1 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Xác nhận gia hạn</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { getUsers } from "../services/api";

type UIUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  registeredAt?: string;
};

function mapApiToUIUser(apiUser: any): UIUser {
  const roleRaw = apiUser.loaiNhanVien || "Manager [STATUS:Active]";
  let status = "Active";
  let role = roleRaw;

  const statusMatch = roleRaw.match(/\[STATUS:(.+)\]/);
  if (statusMatch) {
    status = statusMatch[1];
    role = roleRaw.replace(/\[STATUS:.+\]/, "").trim();
  }

  return {
    id: apiUser.maNhanVien,
    name: apiUser.hoTen || "Nhân viên chưa tên",
    email: apiUser.email || "no-email@homestay.com",
    role: role,
    status: status,
    createdAt: "2025-01-01",
    registeredAt: "2025-04-26"
  };
}

// ──────────────── Tab 3: Admin Settings ────────────────
function AdminSettingsTab({ roomsData }: { roomsData: UIRoom[] }) {
  const [subTab, setSubTab] = useState("rooms");
  const [userList, setUserList] = useState<UIUser[]>([]);
  const [pendingList, setPendingList] = useState<UIUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getUsers()
      .then(res => {
        const mapped = (res.data || []).map(mapApiToUIUser);
        setUserList(mapped.filter(u => u.status !== "Pending"));
        setPendingList(mapped.filter(u => u.status === "Pending"));
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const subTabs = [
    { id: "rooms", label: "Phòng & Giường", icon: BedDouble },
    { id: "billing", label: "Cấu hình giá", icon: Zap },
    { id: "users", label: "Tài khoản", icon: Users },
    { id: "approve", label: "Duyệt tài khoản mới", icon: ShieldCheck },
  ];

  return (
    <div className="space-y-4">
      {/* Sub-tab bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-1 flex gap-1">
        {subTabs.map(st => (
          <button
            key={st.id}
            onClick={() => setSubTab(st.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm transition ${subTab === st.id ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            <st.icon size={15} />
            {st.label}
          </button>
        ))}
      </div>

      {/* Room Management */}
      {subTab === "rooms" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3>Quản lý Phòng & Giường</h3>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              <Plus size={13} /> Thêm phòng
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Phòng", "Tòa", "Tầng", "Loại", "Sức chứa", "Giá/tháng", "Trạng thái", ""].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {roomsData.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-indigo-600 text-xs">{r.number}</td>
                    <td className="px-4 py-3 text-slate-700">Tòa {r.building}</td>
                    <td className="px-4 py-3 text-slate-600">Tầng {r.floor}</td>
                    <td className="px-4 py-3 text-slate-600">{r.type}</td>
                    <td className="px-4 py-3 text-slate-600">{r.capacity} người</td>
                    <td className="px-4 py-3 text-slate-700">{r.price.toLocaleString()}đ</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === "Vacant" ? "bg-emerald-100 text-emerald-700" :
                        r.status === "Occupied" ? "bg-blue-100 text-blue-700" :
                        r.status === "Reserved" ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>{r.status === "Vacant" ? "Trống" : r.status === "Occupied" ? "Đang thuê"  : r.status === "Reserved" ? "Đặt trước" : "Bảo trì"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"><Pencil size={13} /></button>
                        <button className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Billing Configuration */}
      {subTab === "billing" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "Giá điện", icon: Zap, fields: [{ label: "Giá điện (đ/kWh)", value: "3,500" }, { label: "Giá điện cao điểm (đ/kWh)", value: "4,200" }], color: "amber" },
            { title: "Giá nước", icon: Droplets, fields: [{ label: "Giá nước (đ/m³)", value: "15,000" }, { label: "Giá nước vượt định mức", value: "18,000" }], color: "blue" },
            { title: "Giá thuê theo loại phòng", icon: Building2, fields: [{ label: "Phòng đơn (đ/tháng)", value: "3,500,000" }, { label: "Phòng đôi (đ/tháng)", value: "4,500,000" }, { label: "Phòng ba (đ/tháng)", value: "5,500,000" }], color: "indigo" },
            { title: "Phí dịch vụ", icon: Settings2, fields: [{ label: "Phí quản lý (đ/tháng)", value: "200,000" }, { label: "Phí vệ sinh (đ/tháng)", value: "150,000" }, { label: "Phí giữ xe (đ/tháng)", value: "100,000" }], color: "emerald" },
          ].map((section) => (
            <div key={section.title} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ backgroundColor: '#f8fafc' }}>
                  <section.icon size={16} />
                </div>
                <h3>{section.title}</h3>
              </div>
              <div className="space-y-3">
                {section.fields.map(f => (
                  <div key={f.label}>
                    <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                    <input defaultValue={f.value} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2 bg-slate-900 text-white rounded-lg text-sm hover:bg-slate-800 transition">Lưu cấu hình</button>
            </div>
          ))}
        </div>
      )}

      {/* User Accounts */}
      {subTab === "users" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3>Quản lý tài khoản</h3>
            <span className="text-xs text-slate-500">{userList.length} tài khoản</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {["Họ tên", "Email", "Vai trò", "Ngày tạo", "Trạng thái", "Hành động"].map(h => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {userList.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs" style={{ fontWeight: 600 }}>{u.name[0]}</div>
                      <span className="text-slate-800">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.role === "Sale" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">{u.createdAt}</td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${u.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                      {u.status === "Active" ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setUserList(prev => prev.map(p => p.id === u.id ? { ...p, status: p.status === "Active" ? "Locked" : "Active" } : p))}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs ${u.status === "Active" ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}
                    >
                      {u.status === "Active" ? <><Lock size={11} /> Khóa</> : <><UserCheck size={11} /> Mở khóa</>}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Accounts */}
      {subTab === "approve" && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-500" />
            <h3>Duyệt tài khoản mới</h3>
            <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{pendingList.length} chờ duyệt</span>
          </div>
          {pendingList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <ShieldCheck size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Không có tài khoản nào chờ duyệt</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {pendingList.map(p => (
                <div key={p.id} className="px-5 py-4 flex items-center justify-between hover:bg-slate-50/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm" style={{ fontWeight: 600 }}>{p.name[0]}</div>
                    <div>
                      <div className="text-slate-800 text-sm" style={{ fontWeight: 500 }}>{p.name}</div>
                      <div className="text-xs text-slate-500">{p.email} · Đăng ký: {p.registeredAt}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.role === "Sale" ? "bg-purple-100 text-purple-700" : "bg-teal-100 text-teal-700"}`}>{p.role}</span>
                    <button
                      onClick={() => setPendingList(prev => prev.filter(x => x.id !== p.id))}
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs hover:bg-emerald-700"
                    >
                      Phê duyệt
                    </button>
                    <button
                      onClick={() => setPendingList(prev => prev.filter(x => x.id !== p.id))}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs hover:bg-red-100"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────── Main Page ────────────────
export default function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [roomsData, setRoomsData] = useState<UIRoom[]>([]);
  const [contractsData, setContractsData] = useState<UIContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    
    Promise.all([
      getRooms().catch(err => { console.error(err); return { data: [] }; }),
      getContracts().catch(err => { console.error(err); return { data: [] }; })
    ]).then(([resRooms, resContracts]) => {
      setRoomsData((resRooms.data || []).map(mapApiToUIRoom));
      setContractsData((resContracts.data || []).map(mapApiToUIContract));
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  return (
    <div className="space-y-5">
      {/* Tab bar */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-1 flex gap-1">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm transition-all ${activeTab === i ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 0 && <DashboardOverview roomsData={roomsData} contractsData={contractsData} isLoading={isLoading} />}
      {activeTab === 1 && <ContractsTab contractsData={contractsData} isLoading={isLoading} />}
      {activeTab === 2 && <AdminSettingsTab roomsData={roomsData} />}
    </div>
  );
}

