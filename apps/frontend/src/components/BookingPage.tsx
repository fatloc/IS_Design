import { useState } from "react";
import { CheckCircle, Calendar, Clock, User, ChevronRight, ChevronLeft, Scissors, Sparkles, Heart, Star } from "lucide-react";

const SERVICES = [
  { id: 1, name: "Cắt & Tạo kiểu tóc", duration: "60 phút", price: "250.000đ", icon: <Scissors size={22} />, desc: "Cắt tóc chuyên nghiệp, tạo kiểu theo yêu cầu" },
  { id: 2, name: "Chăm sóc da mặt", duration: "90 phút", price: "450.000đ", icon: <Sparkles size={22} />, desc: "Làm sạch sâu, dưỡng ẩm và phục hồi da" },
  { id: 3, name: "Massage thư giãn", duration: "60 phút", price: "350.000đ", icon: <Heart size={22} />, desc: "Massage toàn thân giúp thư giãn và phục hồi" },
  { id: 4, name: "Chăm sóc móng tay", duration: "45 phút", price: "180.000đ", icon: <Star size={22} />, desc: "Làm móng, sơn và trang trí móng tay" },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30",
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}
const MONTH_NAMES = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];
const DAY_NAMES = ["CN","T2","T3","T4","T5","T6","T7"];

const STEPS = ["Dịch vụ", "Ngày & Giờ", "Thông tin", "Xác nhận"];

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const today = new Date();
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", note: "" });
  const [submitted, setSubmitted] = useState(false);

  const service = SERVICES.find(s => s.id === selectedService);

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDayOfMonth(calYear, calMonth);

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
    else setCalMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
    else setCalMonth(m => m + 1);
  };

  const isDateDisabled = (day: number) => {
    const d = new Date(calYear, calMonth, day);
    const t = new Date(); t.setHours(0,0,0,0);
    return d < t || d.getDay() === 0; // disable past & Sunday
  };

  const handleDateClick = (day: number) => {
    if (isDateDisabled(day)) return;
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    setSelectedDate(dateStr);
    setSelectedTime(null);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}/${m}/${y}`;
  };

  const canGoNext = () => {
    if (step === 1) return selectedService !== null;
    if (step === 2) return selectedDate !== null && selectedTime !== null;
    if (step === 3) return form.name.trim() !== "" && form.phone.trim() !== "";
    return false;
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setStep(4);
  };

  const handleReset = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setForm({ name: "", phone: "", email: "", note: "" });
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-indigo-50">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 to-indigo-600 text-white">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1630595271375-5073a6c0638b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1 mb-4 text-sm">
            <Calendar size={14} /> Đặt lịch hẹn
          </div>
          <h1 className="text-white mb-2">Đặt Lịch Dịch Vụ</h1>
          <p className="text-white/80 text-sm">Chọn dịch vụ, thời gian phù hợp và hoàn tất thông tin của bạn</p>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => {
            const s = i + 1;
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all duration-300 ${done ? "bg-emerald-500 text-white" : active ? "bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow-lg" : "bg-gray-100 text-gray-400"}`}>
                    {done ? <CheckCircle size={18} /> : s}
                  </div>
                  <span className={`mt-1 text-xs whitespace-nowrap ${active ? "text-rose-600" : done ? "text-emerald-600" : "text-gray-400"}`}>{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all duration-300 ${done ? "bg-emerald-400" : "bg-gray-200"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Step 1: Service */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="mb-1">Chọn dịch vụ</h2>
              <p className="text-sm text-gray-500 mb-5">Vui lòng chọn dịch vụ bạn muốn đặt lịch</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedService === s.id ? "border-rose-500 bg-rose-50" : "border-gray-100 hover:border-rose-200 hover:bg-rose-50/30"}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${selectedService === s.id ? "bg-rose-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                      {s.icon}
                    </div>
                    <div className="font-medium text-gray-800 text-sm">{s.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 mb-2">{s.desc}</div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{s.duration}</span>
                      <span className="text-xs font-semibold text-rose-600">{s.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="mb-1">Chọn ngày & giờ</h2>
              <p className="text-sm text-gray-500 mb-5">Chủ nhật không làm việc. Vui lòng chọn ngày và khung giờ phù hợp</p>
              {/* Calendar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <button onClick={prevMonth} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"><ChevronLeft size={16} /></button>
                  <span className="text-sm font-medium">{MONTH_NAMES[calMonth]} {calYear}</span>
                  <button onClick={nextMonth} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"><ChevronRight size={16} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-1">
                  {DAY_NAMES.map(d => <div key={d} className="text-xs text-gray-400 py-1">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const disabled = isDateDisabled(day);
                    const selected = selectedDate === dateStr;
                    return (
                      <button
                        key={day}
                        disabled={disabled}
                        onClick={() => handleDateClick(day)}
                        className={`aspect-square rounded-lg text-sm transition-all duration-150 ${disabled ? "text-gray-300 cursor-not-allowed" : selected ? "bg-gradient-to-br from-rose-500 to-indigo-600 text-white shadow" : "hover:bg-rose-50 text-gray-700"}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Time slots */}
              {selectedDate && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Giờ hẹn — {formatDate(selectedDate)}</p>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map(t => (
                      <button
                        key={t}
                        onClick={() => setSelectedTime(t)}
                        className={`py-2 rounded-lg text-sm border transition-all duration-150 ${selectedTime === t ? "bg-gradient-to-br from-rose-500 to-indigo-600 text-white border-transparent shadow" : "border-gray-200 text-gray-600 hover:border-rose-300 hover:text-rose-600"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Info */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="mb-1">Thông tin của bạn</h2>
              <p className="text-sm text-gray-500 mb-5">Điền thông tin để chúng tôi có thể liên hệ xác nhận lịch hẹn</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1.5">Họ và tên <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 bg-gray-50 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Số điện thoại <span className="text-rose-500">*</span></label>
                  <input
                    type="tel"
                    placeholder="0901 234 567"
                    value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 bg-gray-50 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Email <span className="text-gray-400 text-xs">(tuỳ chọn)</span></label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 bg-gray-50 text-sm transition"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1.5">Ghi chú <span className="text-gray-400 text-xs">(tuỳ chọn)</span></label>
                  <textarea
                    placeholder="Yêu cầu đặc biệt, dị ứng da, ..."
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 bg-gray-50 text-sm transition resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && submitted && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={36} className="text-emerald-500" />
              </div>
              <h2 className="text-emerald-700 mb-2">Đặt lịch thành công!</h2>
              <p className="text-sm text-gray-500 mb-6">Chúng tôi sẽ liên hệ xác nhận lịch hẹn của bạn sớm nhất.</p>
              <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-6 max-w-sm mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-500">{service?.icon}</div>
                  <div>
                    <div className="text-xs text-gray-400">Dịch vụ</div>
                    <div className="text-sm font-medium text-gray-800">{service?.name}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-500"><Calendar size={16} /></div>
                  <div>
                    <div className="text-xs text-gray-400">Ngày & Giờ</div>
                    <div className="text-sm font-medium text-gray-800">{formatDate(selectedDate!)} — {selectedTime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-500"><User size={16} /></div>
                  <div>
                    <div className="text-xs text-gray-400">Khách hàng</div>
                    <div className="text-sm font-medium text-gray-800">{form.name} — {form.phone}</div>
                  </div>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-500 to-indigo-600 text-white rounded-lg text-sm hover:opacity-90 transition"
              >
                Đặt lịch mới
              </button>
            </div>
          )}

          {/* Review before submit (step 3 summary shown in footer) */}
          {step < 4 && (
            <div className="px-6 pb-6">
              {/* Summary bar */}
              {(selectedService || selectedDate) && (
                <div className="bg-gray-50 rounded-xl p-3 flex flex-wrap gap-3 mb-4 text-xs text-gray-600">
                  {service && <span className="flex items-center gap-1"><span className="text-rose-500">{service.icon}</span>{service.name} · {service.price}</span>}
                  {selectedDate && selectedTime && <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(selectedDate)} · {selectedTime}</span>}
                </div>
              )}
              {/* Nav Buttons */}
              <div className="flex gap-3">
                {step > 1 && (
                  <button
                    onClick={() => setStep(s => s - 1)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm hover:bg-gray-50 flex items-center justify-center gap-1 transition"
                  >
                    <ChevronLeft size={16} /> Quay lại
                  </button>
                )}
                {step < 3 && (
                  <button
                    disabled={!canGoNext()}
                    onClick={() => setStep(s => s + 1)}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-sm flex items-center justify-center gap-1 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    Tiếp theo <ChevronRight size={16} />
                  </button>
                )}
                {step === 3 && (
                  <button
                    disabled={!canGoNext()}
                    onClick={handleSubmit}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white text-sm flex items-center justify-center gap-1 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
                  >
                    <CheckCircle size={16} /> Xác nhận đặt lịch
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-5">Bằng cách đặt lịch, bạn đồng ý với điều khoản dịch vụ của chúng tôi</p>
      </div>
    </div>
  );
}
