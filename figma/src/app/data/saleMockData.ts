// ─── Types ──────────────────────────────────────────────────────────────────

export type RequestStatus = "Pending" | "Scheduled" | "Shown" | "Deposited" | "Cancelled";
export type AppointmentStatus = "Pending" | "Shown" | "Cancelled";
export type DepositStatus = "Pending Approval" | "Awaiting Payment" | "Deposited" | "Cancelled";
export type RentalMode = "Whole Room" | "Shared Bed";
export type GenderPref = "Male" | "Female" | "Any";
export type BedStatus = "Available" | "Occupied" | "Reserved";
export type RoomGenderPolicy = "Male" | "Female" | "Mixed";

export const CRITERIA_OPTIONS = [
  "Không giờ giấc",
  "Khu vực yên tĩnh",
  "Có chỗ đậu xe",
  "Có máy lạnh",
  "Gần trường ĐH",
  "Có thang máy",
  "Phòng ban công",
  "Cho phép nấu ăn",
] as const;

export type Criteria = typeof CRITERIA_OPTIONS[number];

// ─── Bed Inventory ────────────────────────────────────────────────────────────

export interface Bed {
  id: string;       // "A", "B", "C", "D"
  status: BedStatus;
  occupantName?: string;
}

export interface DormRoom {
  id: string;         // "A101"
  building: string;
  floor: number;
  capacity: number;
  genderPolicy: RoomGenderPolicy;
  pricePerBed: number;
  priceWholeRoom: number;
  amenities: Criteria[];
  beds: Bed[];
  wholeRoomAvailable: boolean;
}

// ─── Request & Appointment ────────────────────────────────────────────────────

export interface SaleRequest {
  id: string;
  date: string;
  clientName: string;
  phone: string;
  email?: string;
  rentalMode: RentalMode;
  headcount: number;
  gender: GenderPref;
  budget: string;
  moveInDate: string;
  leaseTerm: string;
  criteria: Criteria[];
  status: RequestStatus;
  note?: string;
  staffName: string;
  matchedRoomIds?: string[];
}

export interface ShowingAppointment {
  id: string;
  clientName: string;
  phone: string;
  staffName: string;
  roomId: string;
  targetAssetLabel: string;   // e.g. "Phòng A101 – Toàn phòng" or "Phòng B202 – Giường A, B"
  rentalMode: RentalMode;
  date: string;
  time: string;
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
  rentalMode: RentalMode;
  roomId: string;
  reservedAsset: string;       // "Phòng A101 – Toàn phòng" or "Phòng B202 – Giường A, B"
  specificBeds?: string[];     // ["A","B"] for Shared Bed
  depositAmount: number;
  monthlyRent: number;
  status: DepositStatus;
  submittedAt?: string;
  approvedAt?: string;
  paidAt?: string;
  requestId: string;
  note?: string;
}

// ─── Dorm Room Inventory ──────────────────────────────────────────────────────

export const dormRooms: DormRoom[] = [
  {
    id: "A101", building: "A", floor: 1, capacity: 4, genderPolicy: "Female",
    pricePerBed: 1800000, priceWholeRoom: 6500000,
    amenities: ["Có máy lạnh", "Khu vực yên tĩnh"],
    wholeRoomAvailable: false,
    beds: [
      { id: "A", status: "Occupied", occupantName: "Nguyễn Thị B." },
      { id: "B", status: "Occupied", occupantName: "Trần Thị C." },
      { id: "C", status: "Available" },
      { id: "D", status: "Reserved" },
    ],
  },
  {
    id: "A102", building: "A", floor: 1, capacity: 4, genderPolicy: "Male",
    pricePerBed: 1700000, priceWholeRoom: 6000000,
    amenities: ["Có chỗ đậu xe", "Không giờ giấc"],
    wholeRoomAvailable: true,
    beds: [
      { id: "A", status: "Available" },
      { id: "B", status: "Available" },
      { id: "C", status: "Available" },
      { id: "D", status: "Available" },
    ],
  },
  {
    id: "B201", building: "B", floor: 2, capacity: 6, genderPolicy: "Female",
    pricePerBed: 1600000, priceWholeRoom: 9000000,
    amenities: ["Có máy lạnh", "Gần trường ĐH", "Có thang máy"],
    wholeRoomAvailable: false,
    beds: [
      { id: "A", status: "Occupied", occupantName: "Lê Thị D." },
      { id: "B", status: "Available" },
      { id: "C", status: "Available" },
      { id: "D", status: "Occupied", occupantName: "Phạm Thị E." },
      { id: "E", status: "Available" },
      { id: "F", status: "Reserved" },
    ],
  },
  {
    id: "B202", building: "B", floor: 2, capacity: 4, genderPolicy: "Mixed",
    pricePerBed: 2000000, priceWholeRoom: 7500000,
    amenities: ["Có máy lạnh", "Phòng ban công", "Không giờ giấc"],
    wholeRoomAvailable: false,
    beds: [
      { id: "A", status: "Available" },
      { id: "B", status: "Available" },
      { id: "C", status: "Occupied", occupantName: "Vũ Văn F." },
      { id: "D", status: "Occupied", occupantName: "Đặng G." },
    ],
  },
  {
    id: "C301", building: "C", floor: 3, capacity: 2, genderPolicy: "Male",
    pricePerBed: 2500000, priceWholeRoom: 4800000,
    amenities: ["Có máy lạnh", "Có thang máy", "Phòng ban công", "Không giờ giấc"],
    wholeRoomAvailable: true,
    beds: [
      { id: "A", status: "Available" },
      { id: "B", status: "Available" },
    ],
  },
  {
    id: "C302", building: "C", floor: 3, capacity: 4, genderPolicy: "Female",
    pricePerBed: 2200000, priceWholeRoom: 8000000,
    amenities: ["Có máy lạnh", "Gần trường ĐH", "Khu vực yên tĩnh", "Phòng ban công"],
    wholeRoomAvailable: false,
    beds: [
      { id: "A", status: "Available" },
      { id: "B", status: "Available" },
      { id: "C", status: "Available" },
      { id: "D", status: "Occupied", occupantName: "Hoàng Thị H." },
    ],
  },
];

// ─── Sale Requests ────────────────────────────────────────────────────────────

export const saleRequests: SaleRequest[] = [
  {
    id: "REQ001", date: "2025-04-20", clientName: "Trần Minh Tuấn", phone: "0912345678",
    email: "tuan.tran@email.com",
    rentalMode: "Shared Bed", headcount: 1, gender: "Male",
    budget: "1.5-2 triệu/giường", moveInDate: "2025-05-01", leaseTerm: "6 tháng",
    criteria: ["Không giờ giấc", "Có chỗ đậu xe"],
    status: "Pending", staffName: "Lan Anh", note: "Sinh viên, cần gần ĐH Bách Khoa",
  },
  {
    id: "REQ002", date: "2025-04-19", clientName: "Nguyễn Thị Hoa", phone: "0987654321",
    email: "hoa.nguyen@email.com",
    rentalMode: "Shared Bed", headcount: 2, gender: "Female",
    budget: "1.5-1.8 triệu/giường", moveInDate: "2025-05-05", leaseTerm: "1 năm",
    criteria: ["Có máy lạnh", "Gần trường ĐH", "Khu vực yên tĩnh"],
    status: "Scheduled", staffName: "Minh Khoa", note: "Đi cùng bạn, cần 2 giường liền nhau",
  },
  {
    id: "REQ003", date: "2025-04-18", clientName: "Lê Văn Đức", phone: "0901122334",
    rentalMode: "Whole Room", headcount: 1, gender: "Male",
    budget: "4-5 triệu/phòng", moveInDate: "2025-04-25", leaseTerm: "3 tháng",
    criteria: ["Không giờ giấc", "Có thang máy"],
    status: "Shown", staffName: "Lan Anh",
  },
  {
    id: "REQ004", date: "2025-04-17", clientName: "Phạm Thu Hương", phone: "0934455667",
    rentalMode: "Whole Room", headcount: 2, gender: "Female",
    budget: "7-8 triệu/phòng", moveInDate: "2025-05-01", leaseTerm: "1 năm",
    criteria: ["Có máy lạnh", "Phòng ban công", "Khu vực yên tĩnh"],
    status: "Deposited", staffName: "Bảo Ngọc", matchedRoomIds: ["C302"],
  },
  {
    id: "REQ005", date: "2025-04-16", clientName: "Hoàng Anh Khoa", phone: "0956677889",
    rentalMode: "Shared Bed", headcount: 1, gender: "Male",
    budget: "1.5-2 triệu/giường", moveInDate: "2025-04-20", leaseTerm: "3 tháng",
    criteria: ["Không giờ giấc"],
    status: "Cancelled", staffName: "Minh Khoa", note: "Khách đã tìm được chỗ khác",
  },
  {
    id: "REQ006", date: "2025-04-15", clientName: "Vũ Thanh Mai", phone: "0978899001",
    rentalMode: "Shared Bed", headcount: 1, gender: "Female",
    budget: "2-2.5 triệu/giường", moveInDate: "2025-05-01", leaseTerm: "6 tháng",
    criteria: ["Có máy lạnh", "Phòng ban công"],
    status: "Pending", staffName: "Lan Anh",
  },
  {
    id: "REQ007", date: "2025-04-14", clientName: "Đinh Quốc Hùng", phone: "0923344556",
    rentalMode: "Whole Room", headcount: 1, gender: "Male",
    budget: "4.5-5 triệu/phòng", moveInDate: "2025-05-10", leaseTerm: "6 tháng",
    criteria: ["Có máy lạnh", "Có thang máy", "Không giờ giấc"],
    status: "Scheduled", staffName: "Bảo Ngọc", matchedRoomIds: ["C301"],
  },
  {
    id: "REQ008", date: "2025-04-13", clientName: "Bùi Lan Chi", phone: "0945566778",
    rentalMode: "Shared Bed", headcount: 3, gender: "Female",
    budget: "1.8-2.2 triệu/giường", moveInDate: "2025-05-01", leaseTerm: "1 năm",
    criteria: ["Có máy lạnh", "Gần trường ĐH"],
    status: "Shown", staffName: "Minh Khoa",
  },
];

// ─── Showing Appointments ────────────────────────────────────────────────────

export const showingAppointments: ShowingAppointment[] = [
  {
    id: "APT001", clientName: "Trần Minh Tuấn", phone: "0912345678",
    staffName: "Lan Anh", roomId: "A102",
    targetAssetLabel: "Phòng A102 – Giường A (Nam)", rentalMode: "Shared Bed",
    date: "2025-04-20", time: "09:00", status: "Pending", requestId: "REQ001",
  },
  {
    id: "APT002", clientName: "Nguyễn Thị Hoa", phone: "0987654321",
    staffName: "Minh Khoa", roomId: "B201",
    targetAssetLabel: "Phòng B201 – Giường B & C (Nữ)", rentalMode: "Shared Bed",
    date: "2025-04-20", time: "10:30", status: "Pending", requestId: "REQ002",
  },
  {
    id: "APT003", clientName: "Vũ Thanh Mai", phone: "0978899001",
    staffName: "Lan Anh", roomId: "B202",
    targetAssetLabel: "Phòng B202 – Giường A (Hỗn hợp)", rentalMode: "Shared Bed",
    date: "2025-04-20", time: "14:00", status: "Pending", requestId: "REQ006",
  },
  {
    id: "APT004", clientName: "Đinh Quốc Hùng", phone: "0923344556",
    staffName: "Bảo Ngọc", roomId: "C301",
    targetAssetLabel: "Phòng C301 – Toàn phòng (Nam)", rentalMode: "Whole Room",
    date: "2025-04-20", time: "16:00", status: "Shown",
    notes: "Khách thích phòng, đang cân nhắc thêm 1 tuần", requestId: "REQ007",
  },
  {
    id: "APT005", clientName: "Lê Văn Đức", phone: "0901122334",
    staffName: "Lan Anh", roomId: "C301",
    targetAssetLabel: "Phòng C301 – Toàn phòng (Nam)", rentalMode: "Whole Room",
    date: "2025-04-21", time: "09:30", status: "Pending", requestId: "REQ003",
  },
  {
    id: "APT006", clientName: "Bùi Lan Chi", phone: "0945566778",
    staffName: "Minh Khoa", roomId: "C302",
    targetAssetLabel: "Phòng C302 – Giường A, B & C (Nữ)", rentalMode: "Shared Bed",
    date: "2025-04-21", time: "11:00", status: "Pending", requestId: "REQ008",
  },
  {
    id: "APT007", clientName: "Hoàng Anh Khoa", phone: "0956677889",
    staffName: "Bảo Ngọc", roomId: "A102",
    targetAssetLabel: "Phòng A102 – Giường B (Nam)", rentalMode: "Shared Bed",
    date: "2025-04-19", time: "14:30", status: "Cancelled", requestId: "REQ005",
  },
  {
    id: "APT008", clientName: "Phạm Thu Hương", phone: "0934455667",
    staffName: "Bảo Ngọc", roomId: "C302",
    targetAssetLabel: "Phòng C302 – Toàn phòng (Nữ)", rentalMode: "Whole Room",
    date: "2025-04-18", time: "10:00", status: "Shown",
    notes: "Khách đã đồng ý đặt cọc", requestId: "REQ004",
  },
];

// ─── Customers ────────────────────────────────────────────────────────────────

export const customers: Customer[] = [
  {
    id: "CUS001", name: "Trần Minh Tuấn", phone: "0912345678", email: "tuan.tran@email.com",
    idNumber: "079201012345", dob: "1995-03-15", address: "123 Lê Lợi, Q1, TP.HCM",
    source: "Zalo Ads", status: "Scheduled", avatar: "TT", documents: [],
    interactions: [
      { id: "INT001", type: "Call", date: "2025-04-20 08:30", content: "Khách hỏi giường đơn phòng Nam, không giờ giấc. Đã hẹn xem phòng A102 lúc 9h.", staff: "Lan Anh" },
      { id: "INT002", type: "Showing", date: "2025-04-18 14:00", content: "Dẫn khách xem phòng A102 – Giường A. Khách hài lòng, cân nhắc thêm.", staff: "Lan Anh" },
      { id: "INT003", type: "Email", date: "2025-04-17 09:00", content: "Gửi email báo giá và danh sách giường phù hợp.", staff: "System" },
    ],
  },
  {
    id: "CUS002", name: "Nguyễn Thị Hoa", phone: "0987654321", email: "hoa.nguyen@email.com",
    idNumber: "074198056789", dob: "1998-07-22", address: "45 Nguyễn Huệ, Q3, TP.HCM",
    source: "Facebook", status: "Scheduled", avatar: "NH", documents: ["CMND_front.jpg"],
    interactions: [
      { id: "INT004", type: "Call", date: "2025-04-19 10:00", content: "Khách muốn 2 giường Nữ liền nhau, gần trường ĐH. Đã hẹn xem phòng B201.", staff: "Minh Khoa" },
      { id: "INT005", type: "Note", date: "2025-04-19 10:15", content: "Đi cùng bạn thân, sẽ chốt ngay nếu có 2 giường liền.", staff: "Minh Khoa" },
    ],
  },
  {
    id: "CUS003", name: "Phạm Thu Hương", phone: "0934455667", email: "huong.pham@email.com",
    idNumber: "075196034567", dob: "1996-11-08", address: "78 Đinh Tiên Hoàng, Q2, TP.HCM",
    source: "Referral", status: "Deposited", avatar: "PH", documents: ["CMND_front.jpg", "CMND_back.jpg", "HoKhau.pdf"],
    interactions: [
      { id: "INT006", type: "Deposit", date: "2025-04-17 15:00", content: "Đặt cọc 5tr cho Phòng C302 – Toàn phòng (Nữ). Ký HĐ dự kiến 01/05.", staff: "Bảo Ngọc" },
      { id: "INT007", type: "Showing", date: "2025-04-16 10:00", content: "Xem phòng C302. Khách rất hài lòng, muốn đặt cọc luôn.", staff: "Bảo Ngọc" },
      { id: "INT008", type: "Call", date: "2025-04-15 09:00", content: "Khách hỏi phòng riêng cho 2 nữ, có ban công và AC.", staff: "Bảo Ngọc" },
    ],
  },
  {
    id: "CUS004", name: "Lê Văn Đức", phone: "0901122334", email: "duc.le@email.com",
    idNumber: "079200078901", dob: "2000-05-30", address: "12 Hai Bà Trưng, Q3, TP.HCM",
    source: "Website", status: "Shown", avatar: "LĐ", documents: [],
    interactions: [
      { id: "INT009", type: "Showing", date: "2025-04-18 14:00", content: "Xem phòng C301 – Toàn phòng. Khách cần thêm thời gian suy nghĩ.", staff: "Lan Anh" },
    ],
  },
  {
    id: "CUS005", name: "Vũ Thanh Mai", phone: "0978899001", email: "mai.vu@email.com",
    idNumber: "075199023456", dob: "1999-12-01", address: "56 Lý Tự Trọng, Q1, TP.HCM",
    source: "Zalo Ads", status: "Pending", avatar: "VM", documents: [],
    interactions: [
      { id: "INT010", type: "Call", date: "2025-04-16 11:30", content: "Khách muốn giường Nữ phòng có ban công và AC. Đang tìm B202 hoặc C302.", staff: "Lan Anh" },
    ],
  },
];

// ─── Deposit Records ──────────────────────────────────────────────────────────

export const depositRecords: DepositRecord[] = [
  {
    id: "DEP001", clientName: "Phạm Thu Hương", phone: "0934455667",
    rentalMode: "Whole Room", roomId: "C302",
    reservedAsset: "Phòng C302 – Toàn phòng (Nữ)",
    depositAmount: 8000000, monthlyRent: 8000000,
    status: "Deposited",
    submittedAt: "2025-04-17", approvedAt: "2025-04-17", paidAt: "2025-04-17",
    requestId: "REQ004",
  },
  {
    id: "DEP002", clientName: "Nguyễn Thị Hoa", phone: "0987654321",
    rentalMode: "Shared Bed", roomId: "B201",
    reservedAsset: "Phòng B201 – Giường B & C (Nữ)",
    specificBeds: ["B", "C"],
    depositAmount: 3200000, monthlyRent: 3200000,
    status: "Pending Approval",
    submittedAt: "2025-04-20",
    requestId: "REQ002", note: "Khách muốn dọn vào ngày 05/05",
  },
  {
    id: "DEP003", clientName: "Đinh Quốc Hùng", phone: "0923344556",
    rentalMode: "Whole Room", roomId: "C301",
    reservedAsset: "Phòng C301 – Toàn phòng (Nam)",
    depositAmount: 4800000, monthlyRent: 4800000,
    status: "Awaiting Payment",
    submittedAt: "2025-04-19", approvedAt: "2025-04-19",
    requestId: "REQ007",
  },
  {
    id: "DEP004", clientName: "Bùi Lan Chi", phone: "0945566778",
    rentalMode: "Shared Bed", roomId: "C302",
    reservedAsset: "Phòng C302 – Giường A, B & C (Nữ)",
    specificBeds: ["A", "B", "C"],
    depositAmount: 6600000, monthlyRent: 6600000,
    status: "Pending Approval",
    submittedAt: "2025-04-18",
    requestId: "REQ008", note: "3 giường cùng phòng, cần xác nhận sớm",
  },
];

// ─── Staff list ───────────────────────────────────────────────────────────────
export const staffList = ["Lan Anh", "Minh Khoa", "Bảo Ngọc", "Quốc Bảo"];
