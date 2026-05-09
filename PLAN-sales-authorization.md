# Kế hoạch Triển khai Phân quyền Nhân viên Sales

Dựa trên tài liệu `system_usecase.md`, tính năng phân quyền cho Nhân viên Sales (SALE) đòi hỏi sự phối hợp giữa bảo mật ở phía Backend (Spring Boot Security) và hiển thị tương ứng ở phía Frontend (React/Vite).

## 1. Định nghĩa Mục tiêu Rõ ràng (Clear Goals)
- **Backend**: Cấu hình bảo mật chặn các request không có quyền hạn truy cập vào các API dành riêng cho Sales và Quản lý.
- **Frontend**: Điều hướng và ẩn/hiện giao diện tương ứng với role (vai trò) lấy từ token JWT.
- **Nghiệp vụ áp dụng (dựa theo `system_usecase.md`)**:
  - Lập yêu cầu thuê (SALE)
  - Quản lý lịch xem phòng (SALE)
  - Đặt cọc và xác nhận thuê (SALE, KẾ TOÁN, QUẢN LÝ)
  - Cập nhật hồ sơ khách hàng (SALE, QUẢN LÝ)
  - Lập hợp đồng thuê (SALE, QUẢN LÝ)

> [!IMPORTANT]
> **Rủi ro (Risks)**: Cấu hình `SecurityConfig.java` hiện tại đang `permitAll()` cho toàn bộ endpoint. Việc thay đổi sang `authenticated()` và thêm phân quyền có thể gây lỗi 401/403 cho các tính năng khác nếu Frontend chưa gửi đúng cấu trúc Token hoặc API chưa được thiết lập `@PreAuthorize` hợp lý.

## 2. Các câu hỏi mở (Open Questions)
> [!WARNING]
> **Cần ý kiến xác nhận từ User:**
> 1. Hiện tại Frontend đã có logic decode JWT để lấy Role chưa? Hay cần triển khai thêm ở Phase 2?
> 2. Các route frontend cụ thể dành cho Sales là gì (ví dụ: `/sales/dashboard`, `/sales/requests`)?
> 3. Trong `SecurityConfig.java`, ngoài `login` và `register`, chúng ta có cần ngoại lệ `permitAll()` cho các API public nào khác không (ví dụ lấy danh sách phòng public)?

## 3. Các bước triển khai (Phase-by-Phase Breakdown)

### Giai đoạn 1: Backend - Spring Security & Controller Authorization
Tập trung vào cấu hình phân quyền API.

#### [MODIFY] `SecurityConfig.java`
- Thêm Annotation `@EnableMethodSecurity` (hoặc `@EnableGlobalMethodSecurity(prePostEnabled = true)`).
- Chỉnh sửa `authorizeHttpRequests`:
  - `requestMatchers("/api/auth/**").permitAll()` (cho Login/Register).
  - `anyRequest().authenticated()` (yêu cầu đăng nhập cho tất cả các request khác).

#### [MODIFY] Các Controllers nghiệp vụ
- **`RequestController.java`**: Thêm `@PreAuthorize("hasRole('SALE') or hasRole('MANAGER')")` cho các endpoint *Tạo yêu cầu thuê* và *Xác nhận thuê*.
- **`AppointmentController.java`**: Thêm `@PreAuthorize("hasRole('SALE') or hasRole('MANAGER')")` cho quản lý lịch hẹn.
- **`CustomerController.java`**: Thêm `@PreAuthorize("hasRole('SALE') or hasRole('MANAGER')")` cho update hồ sơ.
- **`ContractController.java`**: Thêm `@PreAuthorize("hasRole('SALE') or hasRole('MANAGER')")` cho tạo hợp đồng.

### Giai đoạn 2: Frontend - Role-based UI & Routing
Bảo vệ giao diện người dùng.

#### [MODIFY] Auth Context / State Management
- Lấy role từ JWT Payload (ví dụ: `ROLE_SALE`, `ROLE_MANAGER`).
- Cung cấp `useAuth()` hook hỗ trợ hàm `hasRole(requiredRole)`.

#### [MODIFY] Route Guards
- Xây dựng component `<ProtectedRoute allowedRoles={['SALE', 'MANAGER']} />`.
- Bọc các route tương ứng của Sale vào `ProtectedRoute`.

#### [MODIFY] UI Components
- Ẩn/Hiện nút "Tạo yêu cầu thuê", "Lập hợp đồng", "Xác nhận thuê" dựa trên Role.

## 4. Kế hoạch Kiểm thử (Verification Plan)

### Automated Tests
- Gửi Request với token của CUSTOMER vào endpoint tạo hợp đồng -> Kì vọng HTTP 403 Forbidden.
- Gửi Request với token của SALE vào endpoint tạo hợp đồng -> Kì vọng HTTP 200/201.

### Manual Verification
- Chạy hệ thống, đăng nhập bằng tài khoản Sales.
- Xác nhận có thể nhìn thấy menu và bấm được các nút nghiệp vụ (Tạo yêu cầu, Lịch hẹn, Lập HĐ).
- Đăng nhập bằng tài khoản Customer.
- Cố gắng truy cập URL dành cho Sales. Kì vọng bị đá ra màn hình báo lỗi "Không có quyền truy cập".
