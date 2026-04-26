import { useState, useRef } from "react";
import { Search, X, Upload, Phone, Mail, CreditCard, MapPin, Calendar, MessageSquare, Home, DollarSign, Clock, Users, ChevronRight } from "lucide-react";
import { customers as initialCustomers, Customer, Interaction } from "../../data/saleMockData";

const statusColors: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700", Scheduled: "bg-blue-100 text-blue-700",
  Shown: "bg-purple-100 text-purple-700", Deposited: "bg-emerald-100 text-emerald-700", Cancelled: "bg-slate-100 text-slate-500",
};
const statusLabels: Record<string, string> = {
  Pending: "Chờ xử lý", Scheduled: "Đã hẹn", Shown: "Đã xem", Deposited: "Đã cọc", Cancelled: "Huỷ",
};

const interactionIcons: Record<Interaction["type"], React.ReactNode> = {
  Call: <Phone size={12} className="text-blue-500" />,
  Email: <Mail size={12} className="text-purple-500" />,
  Showing: <Home size={12} className="text-emerald-500" />,
  Note: <MessageSquare size={12} className="text-amber-500" />,
  Deposit: <DollarSign size={12} className="text-emerald-600" />,
};
const interactionBg: Record<Interaction["type"], string> = {
  Call: "bg-blue-50 border-blue-100",
  Email: "bg-purple-50 border-purple-100",
  Showing: "bg-emerald-50 border-emerald-100",
  Note: "bg-amber-50 border-amber-100",
  Deposit: "bg-emerald-100 border-emerald-200",
};

function CustomerPanel({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [docs, setDocs] = useState(customer.documents);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    setDocs(prev => [...prev, ...files.map(f => f.name)]);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocs(prev => [...prev, ...files.map(f => f.name)]);
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[480px] bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between bg-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm" style={{ fontWeight: 700 }}>
              {customer.avatar}
            </div>
            <div>
              <h2 className="text-slate-900" style={{ fontWeight: 700 }}>{customer.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[customer.status]}`} style={{ fontWeight: 500 }}>
                  {statusLabels[customer.status]}
                </span>
                <span className="text-xs text-slate-400">{customer.source}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center mt-1">
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Personal Info */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4" style={{ fontWeight: 600 }}>Thông tin cá nhân</h3>
            <div className="space-y-3">
              {[
                { icon: Phone, label: "Điện thoại", value: customer.phone, color: "text-blue-500" },
                { icon: Mail, label: "Email", value: customer.email, color: "text-purple-500" },
                { icon: CreditCard, label: "CMND/CCCD", value: customer.idNumber, color: "text-amber-500" },
                { icon: Calendar, label: "Ngày sinh", value: customer.dob, color: "text-emerald-500" },
                { icon: MapPin, label: "Địa chỉ", value: customer.address, color: "text-rose-500" },
              ].map(item => (
                <div key={item.label} className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0`}>
                    <item.icon size={13} className={item.color} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className="text-sm text-slate-700 mt-0.5" style={{ fontWeight: 500 }}>{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents Upload */}
          <div className="px-6 py-5 border-b border-slate-100">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4" style={{ fontWeight: 600 }}>Giấy tờ tùy thân</h3>
            <div
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                isDragging ? "border-emerald-400 bg-emerald-50" : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50"
              }`}
            >
              <Upload size={20} className={`mx-auto mb-2 ${isDragging ? "text-emerald-500" : "text-slate-300"}`} />
              <div className="text-sm text-slate-500" style={{ fontWeight: 500 }}>Kéo thả hoặc nhấn để tải lên</div>
              <div className="text-xs text-slate-400 mt-1">CMND, CCCD, Hộ khẩu, Passport</div>
              <input ref={fileRef} type="file" multiple className="hidden" onChange={handleFile} />
            </div>
            {docs.length > 0 && (
              <div className="mt-3 space-y-2">
                {docs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200">
                    <CreditCard size={13} className="text-slate-400" />
                    <span className="text-xs text-slate-600 flex-1 truncate">{doc}</span>
                    <button onClick={() => setDocs(d => d.filter((_, j) => j !== i))} className="text-slate-300 hover:text-red-400 transition">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Interaction Timeline */}
          <div className="px-6 py-5">
            <h3 className="text-xs text-slate-500 uppercase tracking-wider mb-4" style={{ fontWeight: 600 }}>Lịch sử tương tác</h3>
            <div className="relative">
              <div className="absolute left-[13px] top-2 bottom-2 w-px bg-slate-100" />
              <div className="space-y-4">
                {customer.interactions.map((interaction, i) => (
                  <div key={interaction.id} className="flex gap-3 items-start">
                    <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border ${interactionBg[interaction.type]}`}>
                      {interactionIcons[interaction.type]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${interactionBg[interaction.type]}`} style={{ fontWeight: 500 }}>
                          {interaction.type}
                        </span>
                        <span className="text-xs text-slate-400">{interaction.date}</span>
                      </div>
                      <div className={`rounded-xl p-3 border text-xs text-slate-600 leading-relaxed ${interactionBg[interaction.type]}`}>
                        {interaction.content}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock size={10} /> {interaction.staff}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-sm hover:bg-slate-200 transition" style={{ fontWeight: 500 }}>
            Thêm tương tác
          </button>
          <button className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition" style={{ fontWeight: 500 }}>
            Đặt lịch xem phòng
          </button>
        </div>
      </div>
    </>
  );
}

export default function SaleCustomers() {
  const [customers] = useState(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tên, SĐT, email..."
            className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 w-72" />
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-white border border-slate-200 rounded-xl px-3 py-2">
          <Users size={13} className="text-emerald-500" />
          <span style={{ fontWeight: 500 }}>{customers.length} khách hàng</span>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-5 gap-3">
        {(["Pending","Scheduled","Shown","Deposited","Cancelled"] as const).map(s => {
          const count = customers.filter(c => c.status === s).length;
          return (
            <div key={s} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center shadow-sm">
              <div className="text-xl text-slate-900 mb-1" style={{ fontWeight: 700 }}>{count}</div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[s]}`} style={{ fontWeight: 500 }}>{statusLabels[s]}</span>
            </div>
          );
        })}
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Khách hàng</th>
              <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Liên hệ</th>
              <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Nguồn</th>
              <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Tương tác</th>
              <th className="text-left px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}>Trạng thái</th>
              <th className="text-right px-5 py-3.5 text-xs text-slate-500 uppercase tracking-wider" style={{ fontWeight: 600 }}></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(c => (
              <tr key={c.id} onClick={() => setSelectedCustomer(c)}
                className="hover:bg-emerald-50/30 transition cursor-pointer group">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm flex-shrink-0" style={{ fontWeight: 600 }}>
                      {c.avatar}
                    </div>
                    <div>
                      <div className="text-sm text-slate-800" style={{ fontWeight: 600 }}>{c.name}</div>
                      <div className="text-xs text-slate-400">{c.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <div className="text-sm text-slate-600">{c.phone}</div>
                  <div className="text-xs text-slate-400">{c.email}</div>
                </td>
                <td className="px-5 py-4">
                  <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg" style={{ fontWeight: 500 }}>{c.source}</span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-1">
                    {c.interactions.slice(0, 3).map(i => (
                      <div key={i.id} className={`w-6 h-6 rounded-lg flex items-center justify-center border ${interactionBg[i.type]}`}>
                        {interactionIcons[i.type]}
                      </div>
                    ))}
                    {c.interactions.length > 3 && (
                      <span className="text-xs text-slate-400 ml-1">+{c.interactions.length - 3}</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${statusColors[c.status]}`} style={{ fontWeight: 500 }}>
                    {statusLabels[c.status]}
                  </span>
                </td>
                <td className="px-5 py-4 text-right">
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition ml-auto" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">Không tìm thấy khách hàng</div>
        )}
      </div>

      {selectedCustomer && (
        <CustomerPanel customer={selectedCustomer} onClose={() => setSelectedCustomer(null)} />
      )}
    </div>
  );
}
