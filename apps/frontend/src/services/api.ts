import axios, { AxiosError, AxiosHeaders, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type {
  Appointment,
  Contract,
  Customer,
  Employee,
  Request as RoomRequest,
  Room,
  Transaction,
  User,
  Document,
  DepositFile,
  Deposit
} from "../types";

const API_BASE_URL = "http://localhost:8888/api";
const AUTH_TOKEN_KEY = "token";

export type ApiListResponse<T> = {
  data: T[];
  totalElements?: number;
  totalPages?: number;
  page?: number;
  size?: number;
};

export type ApiResponse<T> = {
  data: T;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  username?: string;
  email: string;
  password: string;
  role: "Sale" | "Manager" | "Accountant";
};

export type LoginResponse = {
  token: string;
  user: User;
};

export type CreateRoomPayload = Omit<Room, "maPhong">;
export type UpdateRoomPayload = Partial<Room>;

export type CreateRequestPayload = Omit<RoomRequest, "maYeuCau">;
export type UpdateRequestPayload = Partial<RoomRequest>;

export type CreateAppointmentPayload = Omit<Appointment, "maLichHen">;
export type UpdateAppointmentPayload = Partial<Appointment>;

export type ApiContract = Contract & Document;
export type CreateContractPayload = Omit<ApiContract, "maHopDongThue" | "maVanBan">;
export type UpdateContractPayload = Partial<ApiContract>;

export type CreateTransactionPayload = Omit<Transaction, "maPhieuThanhToan">;
export type UpdateTransactionPayload = Partial<Transaction>;


export type CreateDepositPayload = Omit<Deposit, "maVanBan" | "maHoSoDatCoc">;
export type UpdateDepositPayload = Partial<Deposit>;

export type OperationAsset = {
  asset: string;
  present: boolean;
  condition: "Tốt" | "Bình thường" | "Cần sửa chữa";
  notes: string;
};

export type OperationCheckinItem = {
  id: string;
  room: string;
  tenant: string;
  avatar: string;
  roomType: string;
  moveIn: string;
  deposit: number;
  status: "Chờ bàn giao" | "Đã bàn giao";
  assets: OperationAsset[];
};

export type OperationCheckoutItem = {
  id: string;
  room: string;
  tenant: string;
  avatar: string;
  roomType: string;
  moveOut: string;
  deposit: number;
  netAmount?: number | null;
  daysLeft: number;
  status: "Chờ thanh lý" | "Chờ đối soát" | "Đã đối soát" | "Đã đối soát và thanh lý" | "Đã trả phòng";
  assets: OperationAsset[];
};

export type OperationsResponse = {
  checkins: OperationCheckinItem[];
  checkouts: OperationCheckoutItem[];
};

export type DashboardTask = {
  id: string;
  title: string;
  desc: string;
  source: "approvals" | "operations";
  priority: "critical" | "high" | "medium";
  time: string;
  tag: string;
};

export type DashboardResponse = {
  totalRooms: number;
  roomStatusCounts: Record<string, number>;
  pendingRequests: number;
  pendingAppointments: number;
  pendingTransactions: number;
  activeTenants: number;
  totalCapacity: number;
  fullRooms: number;
  monthlyRevenue: number;
  urgentTasks: DashboardTask[];
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

function getAuthToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(AUTH_TOKEN_KEY);
}

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();

    if (token) {
      config.headers = AxiosHeaders.from(config.headers);
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      clearAuthToken();

      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.assign("/");
      }
    }

    return Promise.reject(error);
  }
);

export async function login(payload: LoginPayload) {
  const response = await api.post<ApiResponse<LoginResponse>>("/auth/login", payload);
  return response.data.data;
}

export async function register(payload: RegisterPayload) {
  const response = await api.post<ApiResponse<LoginResponse>>("/auth/register", payload);
  return response.data.data;
}

export async function getCurrentUser() {
  const response = await api.get<ApiResponse<User>>("/auth/me");
  return response.data.data;
}

export type CreateEmployeePayload = {
  hoTen: string;
  tenDangNhap?: string;
  soDienThoai?: string;
  email: string;
  matKhau?: string;
  phai?: string;
  cccd?: string;
  loaiNhanVien: string;
};

export type UpdateEmployeePayload = Partial<CreateEmployeePayload>;

export async function getUsers(params?: Record<string, unknown>) {
  const response = await api.get<ApiListResponse<Customer | Employee>>("/users", { params });
  return response.data;
}

export async function getUserById(maNhanVien: string) {
  const response = await api.get<ApiResponse<Employee>>(`/users/${maNhanVien}`);
  return response.data.data;
}

export async function createEmployee(payload: CreateEmployeePayload) {
  const response = await api.post<ApiResponse<Employee>>("/users", payload);
  return response.data.data;
}

export async function updateEmployee(maNhanVien: string, payload: UpdateEmployeePayload) {
  const response = await api.put<ApiResponse<Employee>>(`/users/${maNhanVien}`, payload);
  return response.data.data;
}

export async function deleteEmployee(maNhanVien: string) {
  await api.delete(`/users/${maNhanVien}`);
}

export async function getCustomers(params?: Record<string, unknown>) {
  const response = await api.get<ApiListResponse<Customer>>("/customers", { params });
  return response.data;
}

export async function updateCustomer(maKhachHang: string, data: Partial<Customer>) {
  const response = await api.put<ApiResponse<Customer>>(`/customers/${maKhachHang}`, data);
  return response.data.data;
}

export async function createCustomer(data: Partial<Customer>) {
  const response = await api.post<ApiResponse<Customer>>("/customers", data);
  return response.data.data;
}

export async function deleteCustomer(maKhachHang: string) {
  await api.delete(`/customers/${maKhachHang}`);
}


export type AvailableRoomParams = {
  loaiPhong: string;
  khuVuc: string;
  mucGia: number;
  soLuongNguoi: number;
};

export async function getAvailableRooms(params: AvailableRoomParams) {
  const response = await api.get<ApiResponse<Room[]>>("/rooms/available", { params });
  return response.data.data;
}

export async function getRooms(params?: Record<string, unknown>) {
  const response = await api.get<ApiListResponse<Room>>("/rooms", { params });
  return response.data;
}

export async function getRoomStatusCounts() {
  const response = await api.get<ApiResponse<Record<string, number>>>("/rooms/status-counts");
  return response.data.data;
}

export async function getRoomById(maPhong: string) {
  const response = await api.get<ApiResponse<Room>>(`/rooms/${maPhong}`);
  return response.data.data;
}

export async function createRoom(payload: CreateRoomPayload) {
  const response = await api.post<ApiResponse<Room>>("/rooms", payload);
  return response.data.data;
}

export async function updateRoom(maPhong: string, payload: UpdateRoomPayload) {
  const response = await api.put<ApiResponse<Room>>(`/rooms/${maPhong}`, payload);
  return response.data.data;
}

export async function deleteRoom(maPhong: string) {
  const response = await api.delete(`/rooms/${maPhong}`);
  return response.data;
}

export async function getRequests(params?: Record<string, unknown>) {
  const response = await api.get<ApiListResponse<RoomRequest>>("/requests", { params });
  return response.data;
}

export async function getRequestStatusCounts() {
  const response = await api.get<ApiResponse<Record<string, number>>>("/requests/status-counts");
  return response.data.data;
}

export async function createRequest(payload: CreateRequestPayload) {
  const response = await api.post<ApiResponse<RoomRequest>>("/requests", payload);
  return response.data.data;
}

export async function updateRequest(maYeuCau: string, payload: UpdateRequestPayload) {
  const response = await api.put<ApiResponse<RoomRequest>>(`/requests/${maYeuCau}`, payload);
  return response.data.data;
}

export type ApproveRequestResponse = {
  yeuCau: RoomRequest;
  hopDong: {
    maVanBan: string;
    hinhThucThue: string | null;
    kyThanhToan: string | null;
    soLuongThanhVien: number | null;
    ngayKetThuc: string | null;
    trangThaiThanhLy: string | null;
  };
  message: string;
};

export async function approveRequest(maYeuCau: string) {
  const response = await api.post<ApiResponse<ApproveRequestResponse>>(`/requests/${maYeuCau}/approve`);
  return response.data.data;
}

export async function rejectRequest(maYeuCau: string, lyDo?: string) {
  const response = await api.post<ApiResponse<RoomRequest>>(`/requests/${maYeuCau}/reject`, { lyDo });
  return response.data.data;
}

export async function getAppointments(params?: Record<string, unknown>) {
  const response = await api.get<ApiListResponse<Appointment>>("/appointments", { params });
  return response.data;
}

export async function getAppointmentByRequest(maYeuCau: string) {
  const response = await api.get<ApiResponse<Appointment>>(`/appointments/by-request/${maYeuCau}`);
  return response.data.data;
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  const response = await api.post<ApiResponse<Appointment>>("/appointments", payload);
  return response.data.data;
}

export async function updateAppointment(maLichHen: string, payload: UpdateAppointmentPayload) {
  const response = await api.put<ApiResponse<Appointment>>(`/appointments/${maLichHen}`, payload);
  return response.data.data;
}

export async function getContracts(params?: Record<string, unknown>) {
  const response = await api.get<ApiListResponse<ApiContract>>("/contracts", { params });
  return response.data;
}

export type ContractDetail = {
  maHopDongThue: string;
  danhSachPhong: string[];
  danhSachGiuong: string[];
  thanhVienList: {
    maThanhVien: string;
    hoTen: string | null;
    soDienThoai: string | null;
    phai: string | null;
    cccd: string | null;
    quocTich: string | null;
    nguoiDaiDien: boolean;
  }[];
};

export async function getContractDetails(maHopDongThue: string) {
  const response = await api.get<ApiResponse<ContractDetail>>(`/contracts/${maHopDongThue}/details`);
  return response.data.data;
}

export async function getContractStats() {
  const response = await api.get<ApiResponse<Record<string, number>>>("/contracts/stats");
  return response.data.data;
}

export async function getOperationalContracts(params?: Record<string, unknown>) {
  const response = await api.get<ApiResponse<any[]>>("/contracts/operational", { params });
  return response.data.data ?? [];
}

export async function getSettlementContracts(trangThai?: string) {
  const params = trangThai ? { trangThai } : {};
  const response = await api.get<ApiResponse<any[]>>("/contracts/settlement", { params });
  return response.data.data ?? [];
}

export async function updateContractSettlementStatus(maHopDongThue: string, trangThai: string) {
  const response = await api.put<ApiResponse<any>>(`/contracts/${maHopDongThue}/settlement-status`, null, { params: { trangThai } });
  return response.data.data;
}

export async function createContract(payload: CreateContractPayload) {
  const response = await api.post<ApiResponse<ApiContract>>("/contracts", payload);
  return response.data.data;
}

export async function updateContract(maHopDongThue: string, payload: UpdateContractPayload) {
  const response = await api.put<ApiResponse<ApiContract>>(`/contracts/${maHopDongThue}`, payload);
  return response.data.data;
}

export async function getTransactions(params?: Record<string, unknown>) {
  const response = await api.get<ApiListResponse<Transaction>>("/transactions", { params });
  return response.data;
}

export async function createTransaction(payload: CreateTransactionPayload) {
  const response = await api.post<ApiResponse<Transaction>>("/transactions", payload);
  return response.data.data;
}

export async function updateTransaction(maPhieuThanhToan: string, payload: UpdateTransactionPayload) {
  const response = await api.put<ApiResponse<Transaction>>(`/transactions/${maPhieuThanhToan}`, payload);
  return response.data.data;
}

export async function getDeposits(params?: Record<string, unknown>) {
  const response = await api.get<ApiListResponse<Deposit>>("/deposits", { params });
  return response.data;
}

export async function createDeposit(payload: CreateDepositPayload) {
  const response = await api.post<ApiResponse<Deposit>>("/deposits", payload);
  return response.data.data;
}

export async function updateDeposit(maHoSoDatCoc: string, payload: UpdateDepositPayload) {
  const response = await api.put<ApiResponse<Deposit>>(`/deposits/${maHoSoDatCoc}`, payload);
  return response.data.data;
}

export async function getOperations() {
  const response = await api.get<ApiResponse<OperationsResponse>>("/operations");
  return response.data.data;
}

export async function confirmHandover(data: any) {
  await api.post("/operations/handover", data);
}

export async function confirmCheckout(data: any) {
  await api.post("/operations/checkout", data);
}

export async function finishCheckout(id: string) {
  await api.post(`/operations/finish-checkout/${id}`);
}

export async function getDashboardStats() {
  const response = await api.get<ApiResponse<DashboardResponse>>("/dashboard/stats");
  return response.data.data;
}

export function hasAuthToken() {
  return Boolean(getAuthToken());
}

export default api;