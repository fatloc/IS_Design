export type RoomStatus = "Vacant" | "Occupied" | "Reserved" | "Maintenance";
export type ContractStatus = "Active" | "Expiring" | "Expired" | "Pending";
export type Priority = "High" | "Medium" | "Low";

export interface Resident {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  idNumber: string;
}

export interface Room {
  id: string;
  building: "A" | "B" | "C";
  floor: number;
  number: string;
  type: "Single" | "Double" | "Triple";
  status: RoomStatus;
  capacity: number;
  price: number;
  resident?: Resident;
  contractId?: string;
  paymentStatus?: "Paid" | "Unpaid" | "Partial";
}

export interface Contract {
  id: string;
  residentName: string;
  residentPhone: string;
  roomId: string;
  startDate: string;
  endDate: string;
  status: ContractStatus;
  rentAmount: number;
  depositAmount: number;
}

export interface KanbanCard {
  id: string;
  guestName: string;
  room: string;
  amount: number;
  priority: Priority;
  status: string;
  date: string;
  salesperson: string;
  phone?: string;
}

export interface ShowingAppointment {
  id: string;
  guest: string;
  phone: string;
  roomType: string;
  targetRoom: string;
  salesperson: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  color: string;
  status: "Confirmed" | "Pending" | "Completed" | "Cancelled";
}

export interface FinancialEntry {
  id: string;
  type: "Receipt" | "Payment";
  description: string;
  amount: number;
  date: string;
  category: string;
  relatedTo: string;
  status: "Completed" | "Pending";
}

const residents: Resident[] = [
  { id: "r1", name: "Nguyễn Văn An", phone: "0901 234 567", email: "an.nv@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An", idNumber: "001234567890" },
  { id: "r2", name: "Trần Thị Bình", phone: "0912 345 678", email: "binh.tt@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Binh", idNumber: "001234567891" },
  { id: "r3", name: "Lê Hoàng Cường", phone: "0923 456 789", email: "cuong.lh@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cuong", idNumber: "001234567892" },
  { id: "r4", name: "Phạm Ngọc Dung", phone: "0934 567 890", email: "dung.pn@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dung", idNumber: "001234567893" },
  { id: "r5", name: "Hoàng Minh Đức", phone: "0945 678 901", email: "duc.hm@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Duc", idNumber: "001234567894" },
  { id: "r6", name: "Vũ Thanh Hà", phone: "0956 789 012", email: "ha.vt@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ha", idNumber: "001234567895" },
  { id: "r7", name: "Đặng Văn Hùng", phone: "0967 890 123", email: "hung.dv@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hung", idNumber: "001234567896" },
  { id: "r8", name: "Bùi Thị Lan", phone: "0978 901 234", email: "lan.bt@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lan", idNumber: "001234567897" },
  { id: "r9", name: "Ngô Quốc Minh", phone: "0989 012 345", email: "minh.nq@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Minh", idNumber: "001234567898" },
  { id: "r10", name: "Đinh Thị Nam", phone: "0990 123 456", email: "nam.dt@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nam", idNumber: "001234567899" },
];

export const rooms: Room[] = [
  // Building A - Floor 1
  { id: "A101", building: "A", floor: 1, number: "A101", type: "Single", status: "Occupied", capacity: 1, price: 3500000, resident: residents[0], contractId: "CT001", paymentStatus: "Paid" },
  { id: "A102", building: "A", floor: 1, number: "A102", type: "Double", status: "Occupied", capacity: 2, price: 4500000, resident: residents[1], contractId: "CT002", paymentStatus: "Unpaid" },
  { id: "A103", building: "A", floor: 1, number: "A103", type: "Single", status: "Vacant", capacity: 1, price: 3500000 },
  { id: "A104", building: "A", floor: 1, number: "A104", type: "Triple", status: "Reserved", capacity: 3, price: 5500000, resident: residents[2], contractId: "CT003", paymentStatus: "Partial" },
  { id: "A105", building: "A", floor: 1, number: "A105", type: "Double", status: "Maintenance", capacity: 2, price: 4500000 },
  // Building A - Floor 2
  { id: "A201", building: "A", floor: 2, number: "A201", type: "Single", status: "Vacant", capacity: 1, price: 3800000 },
  { id: "A202", building: "A", floor: 2, number: "A202", type: "Double", status: "Occupied", capacity: 2, price: 4800000, resident: residents[3], contractId: "CT004", paymentStatus: "Paid" },
  { id: "A203", building: "A", floor: 2, number: "A203", type: "Single", status: "Occupied", capacity: 1, price: 3800000, resident: residents[4], contractId: "CT005", paymentStatus: "Paid" },
  { id: "A204", building: "A", floor: 2, number: "A204", type: "Triple", status: "Reserved", capacity: 3, price: 5800000 },
  { id: "A205", building: "A", floor: 2, number: "A205", type: "Double", status: "Vacant", capacity: 2, price: 4800000 },
  // Building A - Floor 3
  { id: "A301", building: "A", floor: 3, number: "A301", type: "Single", status: "Occupied", capacity: 1, price: 3800000, resident: residents[5], contractId: "CT006", paymentStatus: "Paid" },
  { id: "A302", building: "A", floor: 3, number: "A302", type: "Single", status: "Maintenance", capacity: 1, price: 3800000 },
  { id: "A303", building: "A", floor: 3, number: "A303", type: "Double", status: "Vacant", capacity: 2, price: 4800000 },
  { id: "A304", building: "A", floor: 3, number: "A304", type: "Triple", status: "Occupied", capacity: 3, price: 5800000, resident: residents[6], contractId: "CT007", paymentStatus: "Unpaid" },
  { id: "A305", building: "A", floor: 3, number: "A305", type: "Single", status: "Reserved", capacity: 1, price: 3800000 },
  // Building A - Floor 4
  { id: "A401", building: "A", floor: 4, number: "A401", type: "Double", status: "Vacant", capacity: 2, price: 5000000 },
  { id: "A402", building: "A", floor: 4, number: "A402", type: "Single", status: "Occupied", capacity: 1, price: 4000000, resident: residents[7], contractId: "CT008", paymentStatus: "Paid" },
  { id: "A403", building: "A", floor: 4, number: "A403", type: "Triple", status: "Maintenance", capacity: 3, price: 6000000 },
  { id: "A404", building: "A", floor: 4, number: "A404", type: "Double", status: "Occupied", capacity: 2, price: 5000000, resident: residents[8], contractId: "CT009", paymentStatus: "Partial" },
  { id: "A405", building: "A", floor: 4, number: "A405", type: "Single", status: "Vacant", capacity: 1, price: 4000000 },
  // Building B - Floor 1
  { id: "B101", building: "B", floor: 1, number: "B101", type: "Single", status: "Occupied", capacity: 1, price: 3200000, resident: residents[9], contractId: "CT010", paymentStatus: "Paid" },
  { id: "B102", building: "B", floor: 1, number: "B102", type: "Double", status: "Vacant", capacity: 2, price: 4200000 },
  { id: "B103", building: "B", floor: 1, number: "B103", type: "Single", status: "Reserved", capacity: 1, price: 3200000 },
  { id: "B104", building: "B", floor: 1, number: "B104", type: "Triple", status: "Occupied", capacity: 3, price: 5200000, resident: residents[0], contractId: "CT011", paymentStatus: "Paid" },
  { id: "B105", building: "B", floor: 1, number: "B105", type: "Double", status: "Vacant", capacity: 2, price: 4200000 },
  // Building B - Floor 2
  { id: "B201", building: "B", floor: 2, number: "B201", type: "Single", status: "Maintenance", capacity: 1, price: 3400000 },
  { id: "B202", building: "B", floor: 2, number: "B202", type: "Double", status: "Occupied", capacity: 2, price: 4400000, resident: residents[1], contractId: "CT012", paymentStatus: "Unpaid" },
  { id: "B203", building: "B", floor: 2, number: "B203", type: "Triple", status: "Vacant", capacity: 3, price: 5400000 },
  { id: "B204", building: "B", floor: 2, number: "B204", type: "Single", status: "Occupied", capacity: 1, price: 3400000, resident: residents[2], contractId: "CT013", paymentStatus: "Paid" },
  { id: "B205", building: "B", floor: 2, number: "B205", type: "Double", status: "Reserved", capacity: 2, price: 4400000 },
  // Building B - Floor 3
  { id: "B301", building: "B", floor: 3, number: "B301", type: "Single", status: "Vacant", capacity: 1, price: 3600000 },
  { id: "B302", building: "B", floor: 3, number: "B302", type: "Double", status: "Occupied", capacity: 2, price: 4600000, resident: residents[3], contractId: "CT014", paymentStatus: "Paid" },
  { id: "B303", building: "B", floor: 3, number: "B303", type: "Triple", status: "Occupied", capacity: 3, price: 5600000, resident: residents[4], contractId: "CT015", paymentStatus: "Partial" },
  { id: "B304", building: "B", floor: 3, number: "B304", type: "Single", status: "Vacant", capacity: 1, price: 3600000 },
  { id: "B305", building: "B", floor: 3, number: "B305", type: "Double", status: "Maintenance", capacity: 2, price: 4600000 },
  // Building C - Floor 1
  { id: "C101", building: "C", floor: 1, number: "C101", type: "Single", status: "Occupied", capacity: 1, price: 3000000, resident: residents[5], contractId: "CT016", paymentStatus: "Paid" },
  { id: "C102", building: "C", floor: 1, number: "C102", type: "Double", status: "Vacant", capacity: 2, price: 4000000 },
  { id: "C103", building: "C", floor: 1, number: "C103", type: "Single", status: "Reserved", capacity: 1, price: 3000000 },
  { id: "C104", building: "C", floor: 1, number: "C104", type: "Triple", status: "Occupied", capacity: 3, price: 5000000, resident: residents[6], contractId: "CT017", paymentStatus: "Paid" },
  // Building C - Floor 2
  { id: "C201", building: "C", floor: 2, number: "C201", type: "Single", status: "Vacant", capacity: 1, price: 3200000 },
  { id: "C202", building: "C", floor: 2, number: "C202", type: "Double", status: "Occupied", capacity: 2, price: 4200000, resident: residents[7], contractId: "CT018", paymentStatus: "Unpaid" },
  { id: "C203", building: "C", floor: 2, number: "C203", type: "Single", status: "Maintenance", capacity: 1, price: 3200000 },
  { id: "C204", building: "C", floor: 2, number: "C204", type: "Triple", status: "Occupied", capacity: 3, price: 5200000, resident: residents[8], contractId: "CT019", paymentStatus: "Paid" },
];

export const contracts: Contract[] = [
  { id: "CT001", residentName: "Nguyễn Văn An", residentPhone: "0901 234 567", roomId: "A101", startDate: "2024-01-15", endDate: "2025-01-14", status: "Expiring", rentAmount: 3500000, depositAmount: 7000000 },
  { id: "CT002", residentName: "Trần Thị Bình", residentPhone: "0912 345 678", roomId: "A102", startDate: "2024-03-01", endDate: "2025-09-01", status: "Active", rentAmount: 4500000, depositAmount: 9000000 },
  { id: "CT003", residentName: "Lê Hoàng Cường", residentPhone: "0923 456 789", roomId: "A104", startDate: "2024-06-01", endDate: "2025-05-31", status: "Active", rentAmount: 5500000, depositAmount: 11000000 },
  { id: "CT004", residentName: "Phạm Ngọc Dung", residentPhone: "0934 567 890", roomId: "A202", startDate: "2024-02-15", endDate: "2025-02-14", status: "Expiring", rentAmount: 4800000, depositAmount: 9600000 },
  { id: "CT005", residentName: "Hoàng Minh Đức", residentPhone: "0945 678 901", roomId: "A203", startDate: "2024-04-01", endDate: "2025-10-01", status: "Active", rentAmount: 3800000, depositAmount: 7600000 },
  { id: "CT006", residentName: "Vũ Thanh Hà", residentPhone: "0956 789 012", roomId: "A301", startDate: "2024-05-01", endDate: "2025-04-30", status: "Active", rentAmount: 3800000, depositAmount: 7600000 },
  { id: "CT007", residentName: "Đặng Văn Hùng", residentPhone: "0967 890 123", roomId: "A304", startDate: "2023-12-01", endDate: "2024-11-30", status: "Expiring", rentAmount: 5800000, depositAmount: 11600000 },
  { id: "CT008", residentName: "Bùi Thị Lan", residentPhone: "0978 901 234", roomId: "A402", startDate: "2024-07-01", endDate: "2025-06-30", status: "Active", rentAmount: 4000000, depositAmount: 8000000 },
  { id: "CT009", residentName: "Ngô Quốc Minh", residentPhone: "0989 012 345", roomId: "A404", startDate: "2024-08-01", endDate: "2025-07-31", status: "Active", rentAmount: 5000000, depositAmount: 10000000 },
  { id: "CT010", residentName: "Đinh Thị Nam", residentPhone: "0990 123 456", roomId: "B101", startDate: "2024-09-01", endDate: "2025-08-31", status: "Active", rentAmount: 3200000, depositAmount: 6400000 },
  { id: "CT011", residentName: "Nguyễn Văn An", residentPhone: "0901 234 567", roomId: "B104", startDate: "2024-01-01", endDate: "2024-12-31", status: "Pending", rentAmount: 5200000, depositAmount: 10400000 },
  { id: "CT012", residentName: "Trần Thị Bình", residentPhone: "0912 345 678", roomId: "B202", startDate: "2024-03-15", endDate: "2025-03-14", status: "Active", rentAmount: 4400000, depositAmount: 8800000 },
  { id: "CT013", residentName: "Lê Hoàng Cường", residentPhone: "0923 456 789", roomId: "B204", startDate: "2024-11-01", endDate: "2025-10-31", status: "Active", rentAmount: 3400000, depositAmount: 6800000 },
  { id: "CT014", residentName: "Phạm Ngọc Dung", residentPhone: "0934 567 890", roomId: "B302", startDate: "2024-02-01", endDate: "2025-01-31", status: "Expiring", rentAmount: 4600000, depositAmount: 9200000 },
  { id: "CT015", residentName: "Hoàng Minh Đức", residentPhone: "0945 678 901", roomId: "B303", startDate: "2024-06-15", endDate: "2025-06-14", status: "Active", rentAmount: 5600000, depositAmount: 11200000 },
];

export type KanbanColumnId = "showing" | "deposit" | "lease" | "payment" | "checkout";

export const initialKanbanData: Record<KanbanColumnId, KanbanCard[]> = {
  showing: [
    { id: "K001", guestName: "Nguyễn Thái Sơn", room: "A103", amount: 3500000, priority: "High", status: "Scheduled", date: "2025-04-21", salesperson: "Minh Tuấn", phone: "0901 111 222" },
    { id: "K002", guestName: "Lưu Thị Phương", room: "B102", amount: 4200000, priority: "Medium", status: "Confirmed", date: "2025-04-22", salesperson: "Thu Hương", phone: "0902 333 444" },
    { id: "K003", guestName: "Trương Công Đạt", room: "C102", amount: 4000000, priority: "Low", status: "Pending", date: "2025-04-23", salesperson: "Minh Tuấn", phone: "0903 555 666" },
  ],
  deposit: [
    { id: "K004", guestName: "Hồ Ngọc Hà", room: "A201", amount: 7600000, priority: "High", status: "Awaiting Approval", date: "2025-04-19", salesperson: "Thu Hương", phone: "0904 777 888" },
    { id: "K005", guestName: "Đinh Công Thành", room: "B301", amount: 7200000, priority: "Medium", status: "Awaiting Approval", date: "2025-04-18", salesperson: "Quang Vinh", phone: "0905 999 000" },
  ],
  lease: [
    { id: "K006", guestName: "Phan Thị Loan", room: "A405", amount: 8000000, priority: "High", status: "Signing", date: "2025-04-17", salesperson: "Minh Tuấn", phone: "0906 111 333" },
    { id: "K007", guestName: "Cao Văn Lâm", room: "B304", amount: 7200000, priority: "Medium", status: "In Progress", date: "2025-04-16", salesperson: "Thu Hương", phone: "0907 222 444" },
  ],
  payment: [
    { id: "K008", guestName: "Lý Thị Mai", room: "C201", amount: 6400000, priority: "High", status: "Awaiting Payment", date: "2025-04-15", salesperson: "Quang Vinh", phone: "0908 333 555" },
    { id: "K009", guestName: "Dương Văn Nam", room: "A205", amount: 9600000, priority: "Low", status: "Processing", date: "2025-04-14", salesperson: "Minh Tuấn", phone: "0909 444 666" },
  ],
  checkout: [
    { id: "K010", guestName: "Tô Thị Oanh", room: "A102", amount: 4500000, priority: "High", status: "Checkout Pending", date: "2025-04-20", salesperson: "Thu Hương", phone: "0910 555 777" },
  ],
};

export const showingAppointments: ShowingAppointment[] = [
  { id: "SA001", guest: "Nguyễn Thái Sơn",  phone: "0901 234 567", roomType: "Single",  targetRoom: "A201", salesperson: "Minh Tuấn",  date: "2025-04-21", time: "09:00", duration: 60, notes: "Khách quan tâm tầng 2 trở lên",        color: "indigo",  status: "Confirmed" },
  { id: "SA002", guest: "Lưu Thị Phương",   phone: "0912 345 678", roomType: "Double",  targetRoom: "A303", salesperson: "Thu Hương",   date: "2025-04-21", time: "11:00", duration: 30, notes: "Cần phòng gần thang máy",             color: "emerald", status: "Confirmed" },
  { id: "SA003", guest: "Trương Công Đạt",  phone: "0923 456 789", roomType: "Single",  targetRoom: "B301", salesperson: "Minh Tuấn",  date: "2025-04-22", time: "10:00", duration: 60, notes: "Đã xem qua website",                  color: "indigo",  status: "Pending"   },
  { id: "SA004", guest: "Lê Văn Quân",      phone: "0934 567 890", roomType: "Triple",  targetRoom: "A104", salesperson: "Quang Vinh", date: "2025-04-22", time: "14:00", duration: 60, notes: "Nhóm 3 sinh viên",                    color: "amber",   status: "Confirmed" },
  { id: "SA005", guest: "Ngô Thị Hoa",      phone: "0945 678 901", roomType: "Double",  targetRoom: "B202", salesperson: "Thu Hương",   date: "2025-04-23", time: "09:30", duration: 30, notes: "Khách VIP giới thiệu",               color: "emerald", status: "Confirmed" },
  { id: "SA006", guest: "Bùi Tiến Dũng",   phone: "0956 789 012", roomType: "Single",  targetRoom: "A405", salesperson: "Quang Vinh", date: "2025-04-23", time: "15:00", duration: 60, notes: "",                                   color: "amber",   status: "Pending"   },
  { id: "SA007", guest: "Phạm Thị Lan",     phone: "0967 890 123", roomType: "Double",  targetRoom: "C201", salesperson: "Minh Tuấn",  date: "2025-04-24", time: "10:30", duration: 30, notes: "Muốn xem cả tòa B và C",             color: "indigo",  status: "Confirmed" },
  { id: "SA008", guest: "Hồ Ngọc Bảo",     phone: "0978 901 234", roomType: "Single",  targetRoom: "A103", salesperson: "Thu Hương",   date: "2025-04-24", time: "14:00", duration: 60, notes: "Giới thiệu từ bạn bè",               color: "emerald", status: "Confirmed" },
  { id: "SA009", guest: "Dương Văn Khoa",   phone: "0989 012 345", roomType: "Triple",  targetRoom: "B303", salesperson: "Quang Vinh", date: "2025-04-25", time: "09:00", duration: 60, notes: "Cần 3 giường riêng biệt",            color: "amber",   status: "Pending"   },
  { id: "SA010", guest: "Trần Minh Châu",   phone: "0990 123 456", roomType: "Single",  targetRoom: "A201", salesperson: "Minh Tuấn",  date: "2025-04-25", time: "11:30", duration: 30, notes: "Xem thử trước khi quyết định",       color: "indigo",  status: "Confirmed" },
  { id: "SA011", guest: "Vũ Lan Anh",       phone: "0901 111 222", roomType: "Double",  targetRoom: "A303", salesperson: "Thu Hương",   date: "2025-04-25", time: "15:30", duration: 30, notes: "Ở 2 người, cần ban công",           color: "emerald", status: "Cancelled" },
  { id: "SA012", guest: "Lý Thanh Tùng",    phone: "0912 222 333", roomType: "Single",  targetRoom: "B304", salesperson: "Quang Vinh", date: "2025-04-26", time: "10:00", duration: 60, notes: "Muốn phòng yên tĩnh",               color: "amber",   status: "Confirmed" },
  { id: "SA013", guest: "Nguyễn Khánh Vy",  phone: "0923 333 444", roomType: "Double",  targetRoom: "A205", salesperson: "Minh Tuấn",  date: "2025-04-26", time: "13:00", duration: 60, notes: "Cần gần trường đại học",             color: "indigo",  status: "Pending"   },
  { id: "SA014", guest: "Đoàn Thị Mỹ",     phone: "0934 444 555", roomType: "Single",  targetRoom: "C104", salesperson: "Thu Hương",   date: "2025-04-27", time: "09:00", duration: 30, notes: "Đặt lịch từ zalo",                  color: "emerald", status: "Confirmed" },
  { id: "SA015", guest: "Cao Quốc Bảo",     phone: "0945 555 666", roomType: "Triple",  targetRoom: "A104", salesperson: "Quang Vinh", date: "2025-04-27", time: "14:30", duration: 60, notes: "Nhóm công ty cần phòng cho nhân viên", color: "amber", status: "Confirmed" },
];

export const financialEntries: FinancialEntry[] = [
  { id: "FE001", type: "Receipt", description: "Tiền thuê tháng 4 - A101", amount: 3500000, date: "2025-04-05", category: "Rent", relatedTo: "CT001", status: "Completed" },
  { id: "FE002", type: "Receipt", description: "Tiền thuê tháng 4 - A102", amount: 4500000, date: "2025-04-05", category: "Rent", relatedTo: "CT002", status: "Completed" },
  { id: "FE003", type: "Receipt", description: "Tiền thuê tháng 4 - A202", amount: 4800000, date: "2025-04-06", category: "Rent", relatedTo: "CT004", status: "Completed" },
  { id: "FE004", type: "Receipt", description: "Đặt cọc - Hồ Ngọc Hà", amount: 7600000, date: "2025-04-18", category: "Deposit", relatedTo: "K004", status: "Pending" },
  { id: "FE005", type: "Receipt", description: "Tiền điện - A block tháng 4", amount: 2800000, date: "2025-04-10", category: "Electricity", relatedTo: "A-Block", status: "Completed" },
  { id: "FE006", type: "Payment", description: "Phí sửa chữa - A105", amount: 1500000, date: "2025-04-12", category: "Maintenance", relatedTo: "A105", status: "Completed" },
  { id: "FE007", type: "Payment", description: "Phí dịch vụ tháng 4", amount: 3200000, date: "2025-04-01", category: "Service", relatedTo: "General", status: "Completed" },
  { id: "FE008", type: "Receipt", description: "Tiền thuê tháng 4 - B101", amount: 3200000, date: "2025-04-07", category: "Rent", relatedTo: "CT010", status: "Completed" },
  { id: "FE009", type: "Payment", description: "Phí sửa chữa - B201", amount: 2000000, date: "2025-04-15", category: "Maintenance", relatedTo: "B201", status: "Completed" },
  { id: "FE010", type: "Receipt", description: "Tiền thuê tháng 4 - B302", amount: 4600000, date: "2025-04-08", category: "Rent", relatedTo: "CT014", status: "Completed" },
];

export const monthlyRevenue = [
  { month: "T1", revenue: 82000000, expense: 18000000 },
  { month: "T2", revenue: 79000000, expense: 16500000 },
  { month: "T3", revenue: 85000000, expense: 20000000 },
  { month: "T4", revenue: 88000000, expense: 19000000 },
  { month: "T5", revenue: 91000000, expense: 21000000 },
  { month: "T6", revenue: 87000000, expense: 22000000 },
  { month: "T7", revenue: 93000000, expense: 20000000 },
  { month: "T8", revenue: 96000000, expense: 23000000 },
  { month: "T9", revenue: 94000000, expense: 21500000 },
  { month: "T10", revenue: 98000000, expense: 22000000 },
  { month: "T11", revenue: 95000000, expense: 20000000 },
  { month: "T12", revenue: 102000000, expense: 25000000 },
];

export const occupancyData = [
  { month: "T1", rate: 82 }, { month: "T2", rate: 79 }, { month: "T3", rate: 85 },
  { month: "T4", rate: 88 }, { month: "T5", rate: 91 }, { month: "T6", rate: 87 },
  { month: "T7", rate: 93 }, { month: "T8", rate: 90 }, { month: "T9", rate: 88 },
  { month: "T10", rate: 92 }, { month: "T11", rate: 89 }, { month: "T12", rate: 95 },
];

export const conversionData = [
  { stage: "Lượt xem", value: 120 },
  { stage: "Xem phòng", value: 84 },
  { stage: "Đặt cọc", value: 52 },
  { stage: "Ký HĐ", value: 38 },
  { stage: "Check-in", value: 35 },
];

export const contractExpirationData = [
  { name: "Hết hạn <30 ngày", value: 4, color: "#EF4444" },
  { name: "Hết hạn 30-60 ngày", value: 7, color: "#F59E0B" },
  { name: "Hết hạn >60 ngày", value: 28, color: "#10B981" },
];

export const userAccounts = [
  { id: "U001", name: "Nguyễn Minh Tuấn", role: "Sale", email: "tuan.nm@rms.com", status: "Active", createdAt: "2024-01-15" },
  { id: "U002", name: "Trần Thu Hương", role: "Sale", email: "huong.tt@rms.com", status: "Active", createdAt: "2024-02-01" },
  { id: "U003", name: "Lê Quang Vinh", role: "Sale", email: "vinh.lq@rms.com", status: "Active", createdAt: "2024-03-10" },
  { id: "U004", name: "Phạm Hải Yến", role: "Accountant", email: "yen.ph@rms.com", status: "Active", createdAt: "2024-01-10" },
  { id: "U005", name: "Hoàng Văn Tú", role: "Accountant", email: "tu.hv@rms.com", status: "Locked", createdAt: "2024-04-01" },
];

export const pendingAccounts = [
  { id: "P001", name: "Đinh Thị Nhi", role: "Sale", email: "nhi.dt@rms.com", registeredAt: "2025-04-18" },
  { id: "P002", name: "Vũ Mạnh Cường", role: "Accountant", email: "cuong.vm@rms.com", registeredAt: "2025-04-17" },
];