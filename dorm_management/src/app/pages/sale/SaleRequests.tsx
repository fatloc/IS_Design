import { useState } from "react";
import { Plus, Search, Edit2, Filter, X, ChevronDown, Home } from "lucide-react";
import { saleRequests as initialRequests, SaleRequest, RequestStatus, staffList } from "../../data/saleMockData";

const statusColors: Record<RequestStatus, string> = {
  Pending: "bg-amber-100 text-amber-700 border border-amber-200",
  Scheduled: "bg-blue-100 text-blue-700 border border-blue-200",
  Shown: "bg-purple-100 text-purple-700 border border-purple-200",
  Deposited: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Cancelled: "bg-slate-100 text-slate-500 border border-slate-200",
};
const statusLabels: Record<RequestStatus, string> = {
  Pending: "Chờ xử lý", Scheduled: "Đã hẹn", Shown: "Đã xem", Deposited: "Đã cọc", Cancelled: "Huỷ",
};
const roomTypeLabels: Record<string, string> = { Single: "Phòng đơn", Double: "Phòng đôi", Triple: "Phòng ba" };

function NewRequestModal({ onClose, onSave }: { onClose: () => void; onSave: (r: SaleRequest) => void }) {
  const [form, setForm] = useState({ clientName: "", phone: "", budget: "", roomType: "Single", area: "", note: "", staffName: staffList[0] });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.clientName || !form.phone) return;
    const newReq: SaleRequest = {
      id: `REQ${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      clientName: form.clientName, phone: form.phone, budget: form.budget,
      roomType: form.roomType as any, area: form.area, note: form.note,
      staffName: form.staffName, status: "Pending",
    };
    onSave(newReq);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-slate-900" style={{ fontWeight: 700 }}>Yêu cầu thuê mới</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Tên khách hàng *</label>
              <input value={form.clientName} onChange={e => set("clientName", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="Họ và tên" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Số điện thoại *</label>
              <input value={form.phone} onChange={e => set("phone", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="09xxxxxxxx" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Ngân sách</label>
              <input value={form.budget} onChange={e => set("budget", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="VD: 3-5 triệu" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Loại phòng</label>
              <select value={form.roomType} onChange={e => set("roomType", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
                <option value="Single">Phòng đơn</option>
                <option value="Double">Phòng đôi</option>
                <option value="Triple">Phòng ba</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Khu vực mong muốn</label>
              <input value={form.area} onChange={e => set("area", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" placeholder="VD: Quận 1" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Nhân viên phụ trách</label>
              <select value={form.staffName} onChange={e => set("staffName", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 bg-white">
                {staffList.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1.5" style={{ fontWeight: 500 }}>Ghi chú</label>
            <textarea value={form.note} onChange={e => set("note", e.target.value)} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none" placeholder="Yêu cầu đặc biệt..." />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition" style={{ fontWeight: 500 }}>Huỷ</button>
          <button onClick={handleSubmit} className="px-4 py-2 rounded-xl text-sm text-white bg-emerald-600 hover:bg-emerald-700 transition" style={{ fontWeight: 500 }}>Tạo yêu cầu</button>
        </div>
      </div>
    </div>
  );
}

export default function SaleRequests() {
  const [requests, setRequests] = useState(initialRequests);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [editId, setEditId] = useState<string | null>(null);

  const filtered = requests.filter(r => {
    const matchSearch = r.clientName.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search);
    const matchStatus = filterStatus === "all" || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSave = (req: SaleRequest) => {
    setRequests(prev => [req, ...prev]);
    setShowModal(false);
  };

  const handleStatusChange = (id: string, status: RequestStatus) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setEditId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tên hoặc số điện thoại..."
              className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 w-64" />
          </div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            {["all", "Pending", "Scheduled", "Shown", "Deposited", "Cancelled"].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs transition ${filterStatus === s ? "bg-emerald-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                style={{ fontWeight: 500 }}>
                {s === "all" ? "Tất cả" : statusLabels[s as RequestStatus]}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition shadow-sm"
          style={{ fontWeight: 500 }}>
          <Plus size={15} /> Yêu cầu mới
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Mã / Ngày</th>
                <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Khách hàng</th>
                <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Tiêu chí phòng</th>
                <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>NV phụ trách</th>
                <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Trạng thái</th>
                <th className="text-right px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(req => (
                <tr key={req.id} className="hover:bg-slate-50/70 transition group">
                  <td className="px-5 py-4">
                    <div className="text-xs text-slate-400" style={{ fontWeight: 600 }}>{req.id}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{req.date}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-700 flex-shrink-0" style={{ fontWeight: 600 }}>
                        {req.clientName.split(" ").slice(-1)[0][0]}
                      </div>
                      <div>
                        <div className="text-sm text-slate-800" style={{ fontWeight: 500 }}>{req.clientName}</div>
                        <div className="text-xs text-slate-400">{req.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm text-slate-700" style={{ fontWeight: 500 }}>{roomTypeLabels[req.roomType]}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{req.budget} · {req.area}</div>
                    {req.note && <div className="text-xs text-slate-400 mt-0.5 italic truncate max-w-[180px]">{req.note}</div>}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-slate-600">{req.staffName}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setEditId(editId === req.id ? null : req.id)}
                        className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${statusColors[req.status]}`}
                        style={{ fontWeight: 500 }}
                      >
                        {statusLabels[req.status]}
                        <ChevronDown size={10} />
                      </button>
                      {editId === req.id && (
                        <div className="absolute top-full mt-1 left-0 z-20 bg-white border border-slate-200 rounded-xl shadow-xl py-1 w-36">
                          {(["Pending","Scheduled","Shown","Deposited","Cancelled"] as RequestStatus[]).map(s => (
                            <button key={s} onClick={() => handleStatusChange(req.id, s)}
                              className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 transition ${req.status === s ? "opacity-50 cursor-default" : ""}`}
                              style={{ fontWeight: 500 }}>
                              {statusLabels[s]}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end opacity-0 group-hover:opacity-100 transition">
                      <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs transition"
                        style={{ fontWeight: 500 }}>
                        <Home size={12} /> Tìm phòng
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition">
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 text-sm">Không tìm thấy yêu cầu phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Hiển thị {filtered.length} / {requests.length} yêu cầu</span>
        </div>
      </div>

      {showModal && <NewRequestModal onClose={() => setShowModal(false)} onSave={handleSave} />}
    </div>
  );
}
