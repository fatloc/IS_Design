import { useEffect, useState, useMemo } from "react";
import { getRentalRequests, confirmGeneratePaymentRequest, confirmCollection, money } from "../../services/accountingV2";
import { useToast } from "../../components/ToastProvider";
import { Pagination } from "../../components/Pagination";
import { ArrowRight, Search, Receipt, CheckCircle2, X, Wallet, User, Calendar, Building, Calculator, Filter, Banknote } from "lucide-react";

export default function RentalRequests() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<any | null>(null);
  const [final, setFinal] = useState<number>(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const { addToast } = useToast();

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    const data = await getRentalRequests();
    setRows(data);
    setLoading(false);
  }

  async function handleReview(item: any) {
    setOpen(item);
    setFinal(item.rent + item.deposit + item.fees);
  }

  async function handleConfirm() {
    if (!open) return;
    try {
      await confirmGeneratePaymentRequest(open.id, final);
      addToast({ message: `Đã phát phiếu! Yêu cầu ${open.id} chuyển sang Chờ phê duyệt từ Manager.`, type: "success" });
      setOpen(null);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      addToast({ message: `Lỗi khi lưu vào database: ${err.message}`, type: "error" });
    }
  }

  async function handleCollect(id: string) {
    if (!window.confirm(`Xác nhận đã thu tiền mặt/chuyển khoản cho yêu cầu ${id}?`)) return;
    try {
      await confirmCollection(id);
      addToast({ message: `Đã xác nhận thu tiền! Yêu cầu ${id} chuyển sang Đã xác nhận.`, type: "success" });
      void load();
    } catch (err: any) {
      addToast({ message: `Lỗi: ${err.message}`, type: "error" });
    }
  }

  const filteredRows = useMemo(() => {
    const q = search.toLowerCase();
    return rows.filter(r => {
      const matchSearch = (r.id || "").toString().toLowerCase().includes(q) || 
                          (r.client || "").toString().toLowerCase().includes(q) || 
                          (r.room || "").toString().toLowerCase().includes(q);
      const matchStatus = statusFilter === "Tất cả" || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [rows, search, statusFilter]);

  const totalElements = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedRows = filteredRows.slice(safePage * pageSize, (safePage + 1) * pageSize);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-xs font-semibold text-slate-700">
              <Receipt size={12} /> Rental Requests
            </div>
            <h1 className="mt-3 text-2xl font-bold text-slate-900">Yêu cầu thu cọc</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">Kiểm tra thông tin từ sale và tạo phiếu thu tiền cọc (giữ chỗ) cho khách hàng chuẩn bị thuê phòng.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 rounded-full px-3 py-2">
            <CheckCircle2 size={12} className="text-emerald-500" /> Dữ liệu đồng bộ
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between px-5 py-4 border-b border-slate-100">
          <div className="relative w-full lg:max-w-md">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder="Tìm kiếm theo mã yêu cầu, khách hàng, phòng..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                className="px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 focus:bg-white"
              >
                <option value="Tất cả">Tất cả trạng thái</option>
                <option value="Yêu cầu mới">Yêu cầu mới</option>
                <option value="Chờ phê duyệt">Chờ phê duyệt</option>
                <option value="Đã phê duyệt">Đã phê duyệt</option>
                <option value="Đã xác nhận">Đã xác nhận</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pagination bar */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
              <p className="mt-4 text-sm text-slate-500">Đang tải dữ liệu...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4">Mã YC</th>
                  <th className="px-5 py-4">Khách hàng</th>
                  <th className="px-5 py-4">Phòng</th>
                  <th className="px-5 py-4">Dự kiến thu</th>
                  <th className="px-5 py-4">Trạng thái</th>
                  <th className="px-5 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedRows.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">{r.id}</td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-slate-900">{r.client}</div>
                      <div className="text-xs text-slate-500 mt-0.5">Sale: {r.sales}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-sm font-medium text-slate-700">{r.room}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{r.date}</div>
                    </td>
                    <td className="px-5 py-4 text-sm font-bold text-slate-900">{money(r.rent + r.deposit + r.fees)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        r.status === 'Pending' ? 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20' : 
                        r.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 
                        'bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-500/20'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {(r.status === 'Pending' || r.status === 'Chờ phê duyệt') ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-600 border border-amber-200">
                          Đợi duyệt Manager
                        </span>
                      ) : r.status === 'Đã phê duyệt' ? (
                        <button
                          onClick={() => handleCollect(r.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 shadow-sm"
                        >
                          <Banknote size={14} /> Thu tiền
                        </button>
                      ) : r.status === 'Đã xác nhận' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-600 border border-emerald-200">
                          <CheckCircle2 size={14} /> Đã xác nhận
                        </span>
                      ) : (
                        <button onClick={() => handleReview(r)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 shadow-sm border border-blue-200/50">
                          Kiểm tra & Phát phiếu <ArrowRight size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-slate-500">
                      Không tìm thấy yêu cầu nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setOpen(null)} />
          <div className="relative w-full max-w-2xl transform overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Receipt size={18} className="text-blue-600" /> Tạo Phiếu Thu: {open.id}
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">Kiểm tra thông tin trước khi phát hành phiếu thu cho khách</p>
              </div>
              <button onClick={() => setOpen(null)} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                    <User size={14} /> Thông tin hồ sơ
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-slate-500">Khách hàng</div>
                      <div className="font-medium text-slate-900">{open.client}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Phòng dự kiến</div>
                      <div className="font-medium flex items-center gap-1"><Building size={12} className="text-slate-400"/> {open.room}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Người phụ trách (Sale)</div>
                      <div className="font-medium text-slate-700">{open.sales}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">Ngày yêu cầu</div>
                      <div className="font-medium flex items-center gap-1"><Calendar size={12} className="text-slate-400"/> {open.date}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 bg-blue-50/50 p-5 shadow-sm ring-1 ring-blue-900/5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-4 flex items-center gap-1.5">
                    <Calculator size={14} /> Chi tiết khoản thu
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Tiền phòng (tháng đầu):</span>
                      <span className="font-medium">{money(open.rent)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Tiền cọc:</span>
                      <span className="font-medium">{money(open.deposit)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600">Phí DV / Thu khác:</span>
                      <span className="font-medium">{money(open.fees)}</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-blue-100">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-slate-900">Tổng tạm tính:</span>
                        <span className="text-lg font-bold text-blue-700">{money(open.rent + open.deposit + open.fees)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 block">
                      Điều chỉnh số tiền thu cuối (VNĐ)
                    </label>
                    <div className="relative">
                      <Wallet size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="number" 
                        value={final} 
                        onChange={(e) => setFinal(Number(e.target.value) || 0)} 
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end gap-3">
              <button onClick={() => setOpen(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200 transition">
                Hủy bỏ
              </button>
              <button onClick={handleConfirm} className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-2">
                <CheckCircle2 size={16} /> Xác nhận & Phát hành phiếu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
