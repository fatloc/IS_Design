// ─── Types ──────────────────────────────────────────────────────────────────

export type RequestStatus = "Pending" | "Scheduled" | "Shown" | "Deposited" | "Cancelled";
export type AppointmentStatus = "Pending" | "Shown" | "Cancelled";
export type DepositStatus = "Pending Approval" | "Awaiting Payment" | "Deposited" | "Cancelled";

export interface SaleRequest {
  id: string;
  date: string;
  clientName: string;
  phone: string;
  budget: string;
  roomType: "Single" | "Double" | "Triple";
  area: string;
  status: RequestStatus;
  note?: string;
  staffName: string;
}

export interface ShowingAppointment {
  id: string;
  clientName: string;
  phone: string;
  staffName: string;
  roomId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  status: AppointmentStatus;
  notes?: string;
  requestId: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  idNumber: string;
  dob: string;
  address: string;
  source: string;
  status: RequestStatus;
  avatar: string;
  interactions: Interaction[];
  documents: string[];
}

export interface Interaction {
  id: string;
  type: "Call" | "Email" | "Showing" | "Note" | "Deposit";
  date: string;
  content: string;
  staff: string;
}

export interface DepositRecord {
  id: string;
  clientName: string;
  phone: string;
  targetRoom: string;
  depositAmount: number;
  monthlyRent: number;
  status: DepositStatus;
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  requestId: string;
  note?: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

export const saleRequests: SaleRequest[] = [
  { id: "REQ001", date: "2025-04-20", clientName: "Trần Minh Tuấn", phone: "0912345678", budget: "3-4 triệu", roomType: "Single", area: "Quận 1", status: "Pending", staffName: "Lan Anh", note: "Ưu tiên tầng cao, có ban công" },
  { id: "REQ002", date: "2025-04-19", clientName: "Nguyễn Thị Hoa", phone: "0987654321", budget: "5-6 triệu", roomType: "Double", area: "Quận 3", status: "Scheduled", staffName: "Minh Khoa", note: "Cần gần trường ĐH Kinh tế" },
  { id: "REQ003", date: "2025-04-18", clientName: "Lê Văn Đức", phone: "0901122334", budget: "4-5 triệu", roomType: "Single", area: "Quận 7", status: "Shown", staffName: "Lan Anh" },
  { id: "REQ004", date: "2025-04-17", clientName: "Phạm Thu Hương", phone: "0934455667", budget: "7-8 triệu", roomType: "Triple", area: "Quận 2", status: "Deposited", staffName: "Bảo Ngọc" },
  { id: "REQ005", date: "2025-04-16", clientName: "Hoàng Anh Khoa", phone: "0956677889", budget: "3-4 triệu", roomType: "Single", area: "Bình Thạnh", status: "Cancelled", staffName: "Minh Khoa", note: "Khách đã tìm được chỗ khác" },
  { id: "REQ006", date: "2025-04-15", clientName: "Vũ Thanh Mai", phone: "0978899001", budget: "5-7 triệu", roomType: "Double", area: "Quận 1", status: "Pending", staffName: "Lan Anh" },
  { id: "REQ007", date: "2025-04-14", clientName: "Đinh Quốc Hùng", phone: "0923344556", budget: "4-5 triệu", roomType: "Single", area: "Quận 10", status: "Scheduled", staffName: "Bảo Ngọc" },
  { id: "REQ008", date: "2025-04-13", clientName: "Bùi Lan Chi", phone: "0945566778", budget: "6-8 triệu", roomType: "Double", area: "Quận 5", status: "Shown", staffName: "Minh Khoa" },
];

export const showingAppointments: ShowingAppointment[] = [
  { id: "APT001", clientName: "Trần Minh Tuấn", phone: "0912345678", staffName: "Lan Anh", roomId: "A101", date: "2025-04-20", time: "09:00", status: "Pending", requestId: "REQ001" },
  { id: "APT002", clientName: "Nguyễn Thị Hoa", phone: "0987654321", staffName: "Minh Khoa", roomId: "B205", date: "2025-04-20", time: "10:30", status: "Pending", requestId: "REQ002" },
  { id: "APT003", clientName: "Vũ Thanh Mai", phone: "0978899001", staffName: "Lan Anh", roomId: "A302", date: "2025-04-20", time: "14:00", status: "Pending", requestId: "REQ006" },
  { id: "APT004", clientName: "Đinh Quốc Hùng", phone: "0923344556", staffName: "Bảo Ngọc", roomId: "C104", date: "2025-04-20", time: "16:00", status: "Shown", notes: "Khách thích phòng, đang cân nhắc", requestId: "REQ007" },
  { id: "APT005", clientName: "Lê Văn Đức", phone: "0901122334", staffName: "Lan Anh", roomId: "A201", date: "2025-04-21", time: "09:30", status: "Pending", requestId: "REQ003" },
  { id: "APT006", clientName: "Bùi Lan Chi", phone: "0945566778", staffName: "Minh Khoa", roomId: "B301", date: "2025-04-21", time: "11:00", status: "Pending", requestId: "REQ008" },
  { id: "APT007", clientName: "Hoàng Anh Khoa", phone: "0956677889", staffName: "Bảo Ngọc", roomId: "A103", date: "2025-04-19", time: "14:30", status: "Cancelled", requestId: "REQ005" },
  { id: "APT008", clientName: "Phạm Thu Hương", phone: "0934455667", staffName: "Bảo Ngọc", roomId: "C201", date: "2025-04-18", time: "10:00", status: "Shown", notes: "Khách đã đồng ý đặt cọc", requestId: "REQ004" },
];

export const customers: Customer[] = [
  {
    id: "CUS001", name: "Trần Minh Tuấn", phone: "0912345678", email: "tuan.tran@email.com",
    idNumber: "079201012345", dob: "1995-03-15", address: "123 Lê Lợi, Q1, TP.HCM",
    source: "Zalo Ads", status: "Scheduled", avatar: "TT", documents: [],
    interactions: [
      { id: "INT001", type: "Call", date: "2025-04-20 08:30", content: "Khách gọi hỏi phòng tầng 3 trở lên, giá dưới 4 triệu. Đã hẹn xem phòng lúc 9h sáng.", staff: "Lan Anh" },
      { id: "INT002", type: "Showing", date: "2025-04-18 14:00", content: "Đã dẫn khách xem phòng A201. Khách hài lòng về diện tích nhưng muốn có view đẹp hơn.", staff: "Lan Anh" },
      { id: "INT003", type: "Email", date: "2025-04-17 09:00", content: "Gửi email báo giá và danh sách phòng phù hợp.", staff: "System" },
    ]
  },
  {
    id: "CUS002", name: "Nguyễn Thị Hoa", phone: "0987654321", email: "hoa.nguyen@email.com",
    idNumber: "074198056789", dob: "1998-07-22", address: "45 Nguyễn Huệ, Q3, TP.HCM",
    source: "Facebook", status: "Scheduled", avatar: "NH", documents: ["CMND_front.jpg"],
    interactions: [
      { id: "INT004", type: "Call", date: "2025-04-19 10:00", content: "Khách muốn phòng đôi gần đại học, tầm 5-6 triệu. Đã đặt lịch xem ngày mai.", staff: "Minh Khoa" },
      { id: "INT005", type: "Note", date: "2025-04-19 10:15", content: "Khách đi cùng bạn, có thể chốt sớm nếu thấy phù hợp.", staff: "Minh Khoa" },
    ]
  },
  {
    id: "CUS003", name: "Phạm Thu Hương", phone: "0934455667", email: "huong.pham@email.com",
    idNumber: "075196034567", dob: "1996-11-08", address: "78 Đinh Tiên Hoàng, Q2, TP.HCM",
    source: "Referral", status: "Deposited", avatar: "PH", documents: ["CMND_front.jpg", "CMND_back.jpg", "HoKhau.pdf"],
    interactions: [
      { id: "INT006", type: "Deposit", date: "2025-04-17 15:00", content: "Khách đã nộp cọc 5 triệu cho phòng C201. Hợp đồng dự kiến ký ngày 01/05.", staff: "Bảo Ngọc" },
      { id: "INT007", type: "Showing", date: "2025-04-16 10:00", content: "Xem phòng C201, khách thích ngay và muốn đặt cọc luôn.", staff: "Bảo Ngọc" },
      { id: "INT008", type: "Call", date: "2025-04-15 09:00", content: "Khách gọi hỏi phòng cho gia đình 3 người. Đã hẹn xem ngày hôm sau.", staff: "Bảo Ngọc" },
    ]
  },
  {
    id: "CUS004", name: "Lê Văn Đức", phone: "0901122334", email: "duc.le@email.com",
    idNumber: "079200078901", dob: "2000-05-30", address: "12 Hai Bà Trưng, Q3, TP.HCM",
    source: "Website", status: "Shown", avatar: "LĐ", documents: [],
    interactions: [
      { id: "INT009", type: "Showing", date: "2025-04-18 14:00", content: "Xem phòng A201. Khách cần thêm thời gian suy nghĩ.", staff: "Lan Anh" },
    ]
  },
  {
    id: "CUS005", name: "Vũ Thanh Mai", phone: "0978899001", email: "mai.vu@email.com",
    idNumber: "075199023456", dob: "1999-12-01", address: "56 Lý Tự Trọng, Q1, TP.HCM",
    source: "Zalo Ads", status: "Pending", avatar: "VM", documents: [],
    interactions: [
      { id: "INT010", type: "Call", date: "2025-04-16 11:30", content: "Khách muốn phòng đôi khu vực Q1. Đang tổng hợp danh sách phòng phù hợp.", staff: "Lan Anh" },
    ]
  },
];

export const depositRecords: DepositRecord[] = [
  { id: "DEP001", clientName: "Phạm Thu Hương", phone: "0934455667", targetRoom: "C201 - Tầng 2, Tòa C", depositAmount: 5000000, monthlyRent: 7500000, status: "Deposited", submittedAt: "2025-04-17", approvedAt: "2025-04-17", paidAt: "2025-04-17", requestId: "REQ004" },
  { id: "DEP002", clientName: "Nguyễn Thị Hoa", phone: "0987654321", targetRoom: "B205 - Tầng 2, Tòa B", depositAmount: 5500000, monthlyRent: 5500000, status: "Pending Approval", submittedAt: "2025-04-20", requestId: "REQ002", note: "Khách muốn dọn vào ngày 01/05" },
  { id: "DEP003", clientName: "Đinh Quốc Hùng", phone: "0923344556", targetRoom: "C104 - Tầng 1, Tòa C", depositAmount: 4500000, monthlyRent: 4500000, status: "Awaiting Payment", submittedAt: "2025-04-19", approvedAt: "2025-04-19", requestId: "REQ007" },
  { id: "DEP004", clientName: "Bùi Lan Chi", phone: "0945566778", targetRoom: "B301 - Tầng 3, Tòa B", depositAmount: 6000000, monthlyRent: 6500000, status: "Pending Approval", submittedAt: "2025-04-18", requestId: "REQ008", note: "Khách cần xác nhận sớm" },
];

// ─── Staff list ───────────────────────────────────────────────────────────────
export const staffList = ["Lan Anh", "Minh Khoa", "Bảo Ngọc", "Quốc Bảo"];
