**Đăng kí thuê phòng **^^

### Lập yêu cầu thuê

**Tóm tắt:** Use case cho phép Nhân viên sale ghi nhận nhu cầu của Khách hàng, rà soát kho phòng trống và tạo lập một yêu cầu thuê mới trên hệ thống. ^^**Tác nhân:** Nhân viên sale ^^**Use case liên quan:** - <> Đăng nhập ^^**Điều kiện tiên quyết:** Không có. ^^**Hậu điều kiện:** Một bản ghi "Yêu cầu thuê" mới được khởi tạo và lưu trữ trên hệ thống. ^^

**Dòng sự kiện chính:**

1. **Nhân viên sale chọn chức năng lập yêu cầu thuê trên hệ thống. **^^
2. **Hệ thống kiểm tra xác thực, tự động gọi Use case Đăng nhập (<>) nếu phiên làm việc chưa tồn tại. **^^
3. **Khách hàng cung cấp thông tin cá nhân và tiêu chí tìm phòng (Khu vực, mức giá, loại phòng). **^^
4. **Nhân viên sale nhập dữ liệu vào biểu mẫu và yêu cầu tìm kiếm. **^^
5. **Hệ thống truy xuất và trả về danh sách các phòng trống thỏa mãn tiêu chí. **^^
6. **Nhân viên sale và Khách hàng chọn phòng phù hợp, sau đó Nhân viên sale bấm xác nhận lưu. **^^
7. Hệ thống ghi nhận tạo lập "Yêu cầu thuê" thành công. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A5 - Không tìm thấy phòng trống phù hợp (Hệ thống truy xuất không có dữ liệu khớp tiêu chí). **^^
- i. **Hệ thống hiển thị thông báo "Không có phòng phù hợp với yêu cầu". **^^
- ii. **Quay lại Bước 3 để Khách hàng/Nhân viên sale đổi tiêu chí tìm kiếm khác hoặc kết thúc Use-Case. **^^

---

### Quản lý lịch xem phòng

**Tóm tắt:** Use case hỗ trợ Nhân viên sale thiết lập thời gian và phân công người dẫn Khách hàng đi khảo sát thực tế các phòng đã được lên yêu cầu. ^^**Tác nhân:** Nhân viên sale ^^**Use case liên quan:** - <> Đăng nhập ^^**Điều kiện tiên quyết:** Có sẵn ít nhất một Yêu cầu thuê hợp lệ đang ở trạng thái chờ xem phòng. ^^**Hậu điều kiện:** Bản ghi lịch hẹn xem phòng được lưu trữ thành công trên hệ thống. ^^

**Dòng sự kiện chính:**

1. **Nhân viên sale truy cập vào giao diện quản lý lịch xem phòng. **^^
2. **Hệ thống kiểm tra xác thực, tự động gọi Use case Đăng nhập (<>) nếu cần. **^^
3. **Hệ thống hiển thị danh sách các Yêu cầu thuê đang chờ sắp xếp lịch hẹn. **^^
4. **Nhân viên sale chọn một yêu cầu cụ thể, nhập thời gian (Ngày, giờ) và chỉ định nhân viên phụ trách dẫn khách. **^^
5. **Nhân viên sale bấm lưu thông tin. **^^
6. Hệ thống thực hiện kiểm tra, lưu bản ghi lịch hẹn và cập nhật trạng thái yêu cầu. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A6 - Trùng lịch nhân viên phụ trách (Hệ thống phát hiện nhân viên được chỉ định đã có lịch bận trong khung giờ vừa chọn). **^^
- i. **Hệ thống chặn thao tác lưu và hiển thị cảnh báo lỗi trùng lịch. **^^
- ii. **Quay lại Bước 4 để Nhân viên sale điều chỉnh lại thời gian hoặc chọn phân công người khác. **^^

---

