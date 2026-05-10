export type SqlDate = string;
export type SqlTime = string;
export type SqlDecimal = string;
export type SqlBoolean = boolean;

export type Gender = "Nam" | "Nữ";

export interface Branch {
  maChiNhanh: string;
  tenChiNhanh: string | null;
  diaChi: string | null;
}

export interface Room {
  maPhong: string;
  sucChuaToiDa: number | null;
  giaThuePhong: SqlDecimal | null;
  trangThai: string | null;
  chiNhanh: string | null;
}

export interface Bed {
  maGiuong: string;
  giaThue: SqlDecimal | null;
  trangThai: string | null;
  maPhongChua: string | null;
}

export interface Asset {
  maTaiSan: string;
  tenTaiSan: string | null;
  ghiChu: string | null;
  tinhTrang: string | null;
  giaBoiThuong: SqlDecimal | null;
  maPhongChua: string | null;
}

export interface Customer {
  maKhachHang: string;
  hoTen: string | null;
  soDienThoai: string | null;
  email: string | null;
  phai: Gender | null;
  cccd: string | null;
  quocTich: string | null;
}

export interface Employee {
  maNhanVien: string;
  hoTen: string | null;
  tenDangNhap?: string | null;
  soDienThoai: string | null;
  email: string | null;
  phai: Gender | null;
  cccd: string | null;
  loaiNhanVien: string | null;
}

export type User = Customer | Employee;

export interface Document {
  maVanBan: string;
  loaiVanBan: string | null;
  ngayLap: SqlDate | null;
  gioLap: SqlTime | null;
  chiNhanh: string | null;
  nhanVienLap: string | null;
  khachHangSoHuu: string | null;
}

export interface ContractDocument extends Document {
  maHopDongThue: string;
}

export interface Contract {
  maHopDongThue: string;
  hinhThucThue: string | null;
  kyThanhToan: string | null;
  soLuongThanhVien: number | null;
}

export interface ContractMember {
  maThanhVien: string;
  hoTen: string | null;
  cccd: string | null;
  soDienThoai: string | null;
  phai: Gender | null;
  quocTich: string | null;
  maHopDongThue: string | null;
  nguoiDaiDien: string | null;
}

export interface Request {
  maYeuCau: string;
  soLuongNguoi: number | null;
  gioiTinhYeuCau: string | null;
  thoiGianBatDauThueDuKien: SqlDate | null;
  thoiGianBanGiaoPhongDuKien: SqlDate | null;
  coDieuHoa: SqlBoolean | null;
  khuVuc: string | null;
  mucGiaMongMuon: SqlDecimal | null;
  coBaiGuiXe: SqlBoolean | null;
  cacTieuChiKhac: string | null;
  khachHangYeuCau: string | null;
  khachHang?: Customer | null;
  nhanVienPhuTrach: string | null;
  trangThaiYeuCau?: string | null;
  isOverdue?: boolean;
}

export interface Appointment {
  maLichHen: string;
  thoiGianHen: SqlTime | null;
  trangThaiHen: string | null;
  ngayHen: SqlDate | null;
  khachHangXem: string | null;
  maYeuCau: string | null;
  nhanVienPhuTrach: string | null;
  maPhong: string | null;
  isOverdue?: boolean;
}

export interface AppointmentRoom {
  lichXemPhong: string;
  maPhongDuocXem: string;
}

export interface DepositFile {
  maHoSoDatCoc: string;
  mucTienCoc: SqlDecimal | null;
}

export interface DepositRoom {
  maPhong: string;
  maHoSoCoc: string;
}

export interface DepositBed {
  maGiuong: string;
  maHoSoCoc: string;
}

export interface ContractRoom {
  maPhong: string;
  maHopDongThue: string;
}

export interface ContractBed {
  maGiuong: string;
  maHopDongThue: string;
}

export interface Transaction {
  maPhieuThanhToan: string;
  hinhThucThanhToan: string | null;
  ghiChu: string | null;
  gioGiaoDich: SqlTime | null;
  ngayGiaoDich: SqlDate | null;
  trangThai: string | null;
  loaiGiaoDich: string | null;
  keToanLapPhieu: string | null;
  quanLyDoiChung: string | null;
  maChungTu: string | null;
  soTienGiaoDich: number | null;
}

export interface HandoverDocument {
  maBienBanBanGiao: string;
}

export interface ReturnDocument {
  maBienBanTraPhong: string;
}

export interface HandoverDetail {
  maBienBanBanGiao: string;
  maTaiSanBanGiao: string;
  soLuong: number | null;
}

export interface Service {
  maDichVu: string;
  tenDichVu: string | null;
  donGia: SqlDecimal | null;
  donViTinh: string | null;
}

export interface ContractService {
  maDichVu: string;
  maHopDongThue: string;
  soLuongDichVu: number | null;
}

export type SqlUser = User;
export type SqlRoom = Room;
export type SqlRequest = Request;
export type SqlAppointment = Appointment;
export type SqlContract = Contract;
export type SqlTransaction = Transaction;