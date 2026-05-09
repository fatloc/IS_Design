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

**Đặt cọc và xác nhận thuê **^^

**Xác nhận thuê phòng **^^

**Tóm tắt:** Use case chính cho phép Nhân viên sale, Nhân viên kế toán và Quản lý tương tác để hoàn tất thủ tục chốt phòng và đặt cọc cho Khách hàng. ^^**Tác nhân:** Nhân viên sale, Nhân viên kế toán, Quản lý ^^**Use case liên quan:** - <> Đăng nhập, <> Thanh toán tiền cọc, <> Cập nhật hồ sơ khách hàng. ^^**Điều kiện tiên quyết:** Khách hàng đã chọn được phòng hợp lệ. ^^**Hậu điều kiện:** Phòng được khóa trạng thái, ghi nhận đã có người thuê chính thức. ^^

**Dòng sự kiện chính:**

1. **Nhân viên sale chọn Yêu cầu thuê đang chờ trên hệ thống để tiến hành xác nhận. **^^
2. **Hệ thống kiểm tra xác thực, tự động gọi Use case Đăng nhập (<>) nếu phiên làm việc chưa tồn tại. **^^
3. **Nhân viên sale kiểm tra lại thông tin tổng thể và bấm yêu cầu chốt phòng. **^^
4. **Hệ thống tự động chuyển luồng sang Use case Thanh toán tiền cọc (<>) để Nhân viên kế toán thao tác thu tiền. **^^
5. **Sau khi kế toán xác nhận thu tiền xong, hệ thống hiển thị hồ sơ để Quản lý phê duyệt. **^^
6. **Quản lý xem xét và nhấn nút đồng ý cho thuê. **^^
7. Hệ thống cập nhật trạng thái phòng thành "Đã cho thuê". **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A3 - Hồ sơ khách hàng thiếu thông tin (Hệ thống phát hiện thiếu CCCD/SĐT trước khi chuyển sang thanh toán). **^^
- i. **Hệ thống tạm dừng quá trình xác nhận và hiển thị cảnh báo thiếu dữ liệu. **^^
- ii. **Hệ thống rẽ nhánh kích hoạt Use case Cập nhật hồ sơ khách hàng (<>). **^^
- iii. **Sau khi hoàn tất cập nhật, hệ thống tự động quay lại Bước 3 trong luồng sự kiện chính. **^^
- **A6 - Quản lý từ chối phê duyệt (Quản lý phát hiện sai sót hoặc có thay đổi phút chót). **^^
- i. **Quản lý chọn chức năng từ chối và nhập lý do vào khung văn bản. **^^
- ii. **Hệ thống ghi nhận trạng thái từ chối, gửi thông báo cho Nhân viên sale. **^^
- iii. Hệ thống trả Yêu cầu thuê về lại trạng thái chờ xử lý. **Kết thúc Use-Case. **^^

---

**Thanh toán tiền cọc **^^

**Tóm tắt:** Use case thực thi việc ghi nhận số tiền cọc mà khách hàng nộp, là bước bắt buộc trong quá trình chốt phòng. ^^**Tác nhân:** Nhân viên kế toán, Quản lý ^^**Use case liên quan:** - Được <> bởi Xác nhận thuê phòng. ^^**Điều kiện tiên quyết:** Được kích hoạt tự động từ Use case Xác nhận thuê phòng. ^^**Hậu điều kiện:** Khoản tiền cọc được hệ thống ghi nhận thành công, sinh ra mã biên lai. ^^

**Dòng sự kiện chính:**

1. **Kế toán tính toán số tiền cọc theo công thức: (Tiền thuê 2 tháng) x (Số giường thuê) và gửi yêu cầu thanh toán. **^^
2. **Hệ thống tiếp nhận chứng từ/hình ảnh giao dịch và gửi cho Quản lý. **^^
3. **Quản lý đối chiếu và xác nhận đã nhận được khoản tiền cọc hợp lệ. **^^
4. Nhân viên sale nhận thông báo thành công và thống nhất thời gian nhận phòng với khách. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A3.1 - Số tiền thanh toán không đủ (Số tiền thực nộp nhỏ hơn mức cọc tối thiểu). **^^
- i. **Hệ thống hiển thị thông báo lỗi "Số tiền cọc không đủ tiêu chuẩn". **^^
- ii. **Quay lại Bước 2 để nhập lại số tiền đúng hoặc chờ Khách hàng bổ sung. **^^
- **A3.2 - Hủy giao dịch thanh toán (Khách hàng chưa có đủ tiền nộp ngay). **^^
- i. **Người dùng bấm nút "Hủy giao dịch". **^^
- ii. Hệ thống xác nhận không lưu dữ liệu, trả kết quả "Thất bại" về luồng gốc để Sale nắm thông tin. **Kết thúc Use-Case. **^^

---

### Cập nhật hồ sơ khách hàng

**Tóm tắt:** Use case cho phép nhập liệu bổ sung các thông tin cá nhân bắt buộc của khách hàng để đảm bảo tính pháp lý trước khi làm hợp đồng. ^^**Tác nhân:** Nhân viên sale, Quản lí ^^**Use case liên quan:** <> tới Xác nhận thuê phòng ^^**Điều kiện tiên quyết:** Hệ thống phát hiện thiếu dữ liệu và tự động kích hoạt chức năng này. ^^**Hậu điều kiện:** Hồ sơ khách hàng trên hệ thống được làm đầy đủ dữ liệu theo đúng chuẩn. ^^

**Dòng sự kiện chính:**

1. **Hệ thống hiển thị màn hình biểu mẫu hồ sơ khách hàng với các trường thông tin còn trống. **^^
2. **Nhân viên sale/ quản lí nhập các thông tin bổ sung (CCCD, địa chỉ thường trú...) vào biểu mẫu. **^^
3. **Người dùng nhấn nút Lưu hồ sơ. **^^
4. **Hệ thống rà soát tính hợp lệ của dữ liệu (chuẩn định dạng, không bỏ trống). **^^
5. **Hệ thống lưu trữ thông tin mới vào cơ sở dữ liệu và thông báo cập nhật thành công. **^^
6. Trả luồng điều khiển về lại cho Use case gốc. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A4 - Dữ liệu nhập sai định dạng hoặc bỏ trống (Hệ thống phát hiện lỗi validation). **^^
- i. Hệ thống hiển thị thông báo lỗi màu đỏ tại ngay dưới các trường nhập sai. **Quay lại Bước 2 để nhập lại số tiền đúng hoặc chờ Khách hàng bổ sung. **^^
- ii. **Quay lại Bước 2 để người dùng tiến hành chỉnh sửa. **^^

---

**Nhận phòng & Ký hợp đồng **^^

### Lập hợp đồng thuê

**Tóm tắt:** Usecase ghi nhận sự thỏa thuận chính thức giữa ký túc xá và khách thuê bằng hợp đồng, kèm theo việc kiểm tra nghiêm ngặt các điều kiện lưu trú. ^^**Tác nhân:** Nhân viên sale, Quản lý ^^**Use case liên quan:** - <> Đăng nhập, <> Quản lý thông tin cư trú ^^**Điều kiện tiên quyết:** Khách hàng đã hoàn tất việc đặt cọc. ^^**Hậu điều kiện:** Hợp đồng được lưu trữ hợp lệ trên hệ thống, làm cơ sở để thu phí đầu kỳ. ^^

**Dòng sự kiện chính:**

1. Nhân viên sale chọn Yêu cầu thuê đã đặt cọc thành công. **Hệ thống gọi Use case Đăng nhập (<>). **^^
2. **Hệ thống bắt buộc gọi Use case Quản lý thông tin cư trú (<>) để thu thập dữ liệu người ở thực tế. **^^
3. **Quản lý sử dụng hệ thống để kiểm tra điều kiện lưu trú (giới tính, khu vực, quy định nhóm) dựa trên hồ sơ vừa cung cấp. **^^
4. Quản lý xác nhận đủ điều kiện. **Nhân viên sale tạo hợp đồng với các điều khoản: giá thuê, phí dịch vụ, quy định cọc và nội quy. **^^
5. Khách hàng ký xác nhận. Hệ thống lưu trữ hợp đồng và chuyển sang chờ thanh toán. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A4 - Khách thuê không đáp ứng điều kiện lưu trú (Quản lý phát hiện vi phạm quy định ký túc xá). **^^
- i. **Quản lý chọn từ chối ký hợp đồng trên hệ thống. **^^
- ii. (Nếu thuê cá nhân) **Hệ thống ghi nhận hủy hợp đồng. **^^
- iii. (Nếu thuê nhóm) **Khách hàng chọn loại bỏ thành viên vi phạm để tiếp tục hoặc hủy toàn bộ. **^^
- iv. **Quay lại Bước 3 hoặc kết thúc Use-Case. **^^

---

### Quản lý thông tin cư trú

**Tóm tắt:** Usecase thu thập, đối chiếu giấy tờ tùy thân của người thuê chính và những người ở ghép (nếu có) để phục vụ quản lý lưu trú. ^^**Tác nhân:** Khách hàng ^^**Use case liên quan:** - Được <> bởi Lập hợp đồng thuê ^^**Điều kiện tiên quyết:** Được gọi tự động từ Use case Lập hợp đồng thuê. ^^**Hậu điều kiện:** Danh sách người lưu trú thực tế được ghi nhận chính xác vào cơ sở dữ liệu. ^^

**Dòng sự kiện chính:**

1. **Hệ thống hiển thị biểu mẫu khai báo cư trú khi thủ tục làm hợp đồng bắt đầu. **^^
2. **Khách hàng (hoặc đại diện nhóm) cung cấp giấy tờ tùy thân và điền thông tin của tất cả các thành viên sẽ vào ở. **^^
3. **Hệ thống đối chiếu số lượng người khai báo với sức chứa tối đa của phòng/giường đã đặt. **^^
4. **Hệ thống lưu trữ hồ sơ cư trú thành công và trả luồng về cho Use case gốc. **^^
5. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A3 - Số người vượt quy định hoặc thiếu giấy tờ (Hệ thống phát hiện số lượng khai báo lớn hơn sức chứa hoặc bỏ trống trường dữ liệu). **^^
- i. **Hệ thống cảnh báo đỏ yêu cầu bổ sung giấy tờ hoặc giảm bớt người đăng ký. **^^
- ii. **Quay lại Bước 2 để Khách hàng điều chỉnh lại thông tin. **^^

---

### Thanh toán phí đầu kỳ

**Tóm tắt:** Usecase thực hiện tính toán và thu các khoản phí trước khi khách nhận phòng (tiền phòng kỳ 1, dịch vụ điện nước, v.v.). ^^**Tác nhân:** Nhân viên kế toán ^^**Use case liên quan:** <> Đăng nhập ^^**Điều kiện tiên quyết:** Hợp đồng thuê đã được hai bên ký xác nhận. ^^**Hậu điều kiện:** Các khoản tài chính đầu kỳ hoàn tất, phòng sẵn sàng để bàn giao. ^^

**Dòng sự kiện chính:**

1. Nhân viên kế toán truy cập danh sách hợp đồng chờ thanh toán. **Hệ thống gọi Use case Đăng nhập (<>). **^^
2. **Hệ thống tự động tính toán các khoản cần thanh toán khi vào ở dựa trên hợp đồng đã ký. **^^
3. **Nhân viên kế toán đợi khách hàng thực hiện nộp tiền (tiền mặt/chuyển khoản). **^^
4. **Nhân viên kế toán xác nhận đã thu đủ tiền trên hệ thống. **^^
5. **Hệ thống sinh biên lai thu tiền và mở khóa trạng thái cho phép bàn giao phòng. **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A4 - Khách hàng thanh toán chưa đủ (Số tiền khách nộp thực tế nhỏ hơn tổng phí đầu kỳ yêu cầu). **^^
- i. **Nhân viên kế toán ghi nhận số tiền đã thu (tạm ứng). **^^
- ii. **Hệ thống cảnh báo chưa hoàn tất nghĩa vụ tài chính, chặn chức năng bàn giao phòng. **^^
- iii. **Quay lại Bước 3 chờ khách hàng đóng đủ phần còn thiếu. **^^

---

### Lập biên bản bàn giao

**Tóm tắt:** Usecase giúp quản lý ghi nhận tình trạng cơ sở vật chất, bàn giao tài sản và chìa khóa cho khách để chính thức bắt đầu kỳ lưu trú. ^^**Tác nhân:** Quản lý ^^**Use case liên quan:** - <> Đăng nhập ^^**Điều kiện tiên quyết:** Khách hàng đã thanh toán đủ các khoản phí đầu kỳ. ^^**Hậu điều kiện:** Khách hàng chính thức nhận phòng, tài sản được gắn với trách nhiệm bảo quản của khách. ^^

**Dòng sự kiện chính:**

1. Quản lý chọn phòng đã hoàn tất thanh toán phí đầu kỳ. **Hệ thống gọi Use case Đăng nhập (<>). **^^
2. **Quản lý kiểm tra và tích chọn hiện trạng tài sản (giường, nệm, tủ, chìa khóa/thẻ từ) trên biểu mẫu hệ thống. **^^
3. **Quản lý hướng dẫn quy định sử dụng tiện ích chung và lưu ý an toàn. **^^
4. **Quản lý kiểm tra và xác nhận vào biên bản bàn giao trên hệ thống. **^^
5. **Hệ thống lưu biên bản, chuyển trạng thái khách hàng sang "Đang lưu trú" chính thức. **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A2 - Tài sản phòng có hư hỏng hoặc thiếu sót (Quản lý hoặc khách hàng phát hiện lỗi tài sản trước khi nhận). **^^
- i. **Quản lý ghi chú chi tiết tình trạng hư hỏng/thiếu sót vào biên bản để tránh tranh chấp bồi thường sau này. **^^
- ii. **Tiếp tục Bước 3. **^^

---

**Trả phòng & Hoàn cọc **^^

### Thanh lý hợp đồng

**Tóm tắt:** Usecase giúp phối hợp giữa Quản lý và Kế toán để kiểm tra hiện trạng, chốt công nợ, chấm dứt hợp đồng và giải phóng phòng. ^^**Tác nhân:** Quản lý, Nhân viên kế toán ^^**Use case liên quan:** - <> Đăng nhập, - <> Đối soát chi phí, <> Thanh toán trả phòng (Thu thêm/Hoàn cọc). ^^**Điều kiện tiên quyết:** Khách hàng đã đăng ký lịch trả phòng và đang có hợp đồng lưu trú/phiếu cọc hợp lệ. ^^**Hậu điều kiện:** Hợp đồng chính thức chấm dứt, phòng được dọn dẹp và cập nhật vào kho phòng trống. ^^

**Dòng sự kiện chính:**

1. Quản lý tiếp nhận yêu cầu trả phòng và truy cập chức năng thanh lý. **Hệ thống gọi Đăng nhập (<>). **^^
2. **Quản lý kiểm tra thực tế và ghi nhận tình trạng tài sản, vệ sinh, hư hỏng (nếu có) lên hệ thống. **^^
3. Quản lý chuyển trạng thái hồ sơ. **Hệ thống tự động gọi Use case Đối soát chi phí (<>) để Kế toán xử lý số liệu. **^^
4. **Kế toán hoàn tất bảng đối soát, Quản lý thông báo và xác nhận kết quả với khách hàng. **^^
5. **Nếu phát sinh chênh lệch tài chính, hệ thống gọi Use case Thanh toán trả phòng (<>) để xử lý thu/chi. **^^
6. **Quản lý và Khách hàng ký biên bản trả phòng và xác nhận thanh lý hợp đồng trên hệ thống. **^^
7. **Hệ thống thu hồi quyền truy cập (chìa khóa/thẻ), cập nhật phòng thành trạng thái "Trống" để sẵn sàng cho thuê mới. **^^
8. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A4 - Khách hàng khiếu nại kết quả đối soát (Khách không đồng ý với các khoản phạt hoặc phí bồi thường). **^^
- i. **Quản lý giải trình và thỏa thuận lại với khách dựa trên nội quy, tình trạng thực tế. **^^
- ii. **Quay lại Bước 2 hoặc 3 để cập nhật lại thông tin tài sản/chi phí nếu có sự thống nhất mới. **^^

---

### Đối soát chi phí

**Tóm tắt:** Usecase giúp tính toán tự động hoặc thủ công tỷ lệ hoàn cọc và các khoản khấu trừ phát sinh trong suốt kỳ lưu trú của khách. ^^**Tác nhân:** Nhân viên kế toán ^^**Use case liên quan:** - Được <> bởi Thanh lý hợp đồng ^^**Điều kiện tiên quyết:** Quản lý đã hoàn tất việc kiểm tra và cập nhật hiện trạng tài sản hư hỏng (nếu có). ^^**Hậu điều kiện:** Bảng đối soát chi phí được thiết lập xong với con số chênh lệch cuối cùng (âm hoặc dương). ^^

**Dòng sự kiện chính:**

1. **Nhân viên kế toán mở hồ sơ đối soát từ luồng Thanh lý hợp đồng. **^^
2. **Hệ thống (hoặc Kế toán) xác định tỷ lệ hoàn cọc cơ bản: Hoàn 80% (chưa ký HĐ), 50% (lưu trú < 6 tháng), 70% (lưu trú > 6 tháng), hoặc 100% (hết hạn HĐ). **^^
3. **Kế toán nhập/xác nhận các khoản khấu trừ phát sinh (nợ tiền phòng, phí dịch vụ điện nước cuối kỳ, bồi thường hư hỏng theo ghi nhận của Quản lý). **^^
4. **Hệ thống tính toán tổng chênh lệch: Tiền cọc được hoàn trừ đi (-) Tổng các khoản khấu trừ. **^^
5. **Hệ thống sinh ra bảng đối soát chi tiết và trả kết quả về cho luồng chính. **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A3 - Thiếu dữ liệu chốt phí dịch vụ (Chưa có chỉ số điện/nước hoặc mức bồi thường tài sản cụ thể). **^^
- i. **Hệ thống báo lỗi không thể hoàn tất đối soát do thiếu tham số đầu vào. **^^
- ii. **Kế toán lưu nháp, yêu cầu Quản lý cập nhật số liệu và thực hiện lại Bước 3 sau khi có đủ thông tin. **^^

---

### Thanh toán trả phòng (Thu thêm/Hoàn cọc)

**Tóm tắt:** Usecase giúp xử lý giao dịch tài chính cuối cùng, thu thêm tiền nếu nợ phí vượt quá cọc, hoặc hoàn trả phần cọc còn dư cho khách. ^^**Tác nhân:** Nhân viên kế toán ^^**Use case liên quan:** <> tới Thanh lý hợp đồng ^^**Điều kiện tiên quyết:** Bảng đối soát đã được khách hàng và Quản lý đồng ý thông qua. ^^**Hậu điều kiện:** Giao dịch tài chính (thu hoặc chỉ) được lưu vào sổ sách kế toán của hệ thống. ^^

**Dòng sự kiện chính:**

1. **Hệ thống hiển thị số tiền chênh lệch cuối cùng từ bảng đối soát. **^^
2. **Nếu kết quả là số ÂM (khách nợ): Kế toán lập yêu cầu thu thêm, Khách hàng thực hiện thanh toán phần thiếu, Kế toán xác nhận thu tiền. **^^
3. **Nếu kết quả là số DƯ (hoàn cọc): Kế toán lập phiếu chi và thực hiện chuyển khoản/trả tiền mặt cho Khách hàng. **^^
4. **Kế toán xác nhận đã hoàn tất giao dịch tài chính lên hệ thống. **^^
5. **Hệ thống trả luồng điều khiển về Use case Thanh lý hợp đồng. **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A2 - Khách hàng chưa có khả năng thanh toán phần thu thêm (Khách nợ tiền và chưa thể đóng ngay). **^^
- i. **Kế toán lập biên bản ghi nhận nợ đính kèm vào hệ thống. **^^
- ii. **Hệ thống ghi nhận trạng thái chưa hoàn tất nghĩa vụ tài chính và trả kết quả cảnh báo về luồng chính để Quản lý có hướng xử lý. **^^

---

**Quản lý hệ thống **^^

### Quản lý danh mục Phòng/Giường

**Tóm tắt:** Usecase giúp Quản lý thêm mới, cập nhật thông tin, trạng thái hoặc xóa các phòng/giường trong kho dữ liệu của ký túc xá. ^^**Tác nhân:** Quản lý ^^**Use case liên quan:** - <> Đăng nhập ^^**Điều kiện tiên quyết:** Không có. ^^**Hậu điều kiện:** Danh mục phòng/giường được cập nhật để Nhân viên sale có dữ liệu mới nhất khi tư vấn. ^^

**Dòng sự kiện chính:**

1. Quản lý chọn chức năng Quản lý danh mục Phòng/Giường. **Hệ thống gọi Use case Đăng nhập (<>). **^^
2. **Hệ thống hiển thị danh sách các phòng/giường hiện có cùng các công cụ Thêm, Sửa, Xóa. **^^
3. **Quản lý nhập liệu thông tin phòng mới hoặc thay đổi thông tin phòng cũ (mã phòng, sức chứa, khu vực, trạng thái). **^^
4. **Quản lý nhấn nút xác nhận lưu thay đổi. **^^
5. **Hệ thống rà soát tính hợp lệ, lưu dữ liệu vào cơ sở dữ liệu và thông báo thành công. **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A4.1 - Trùng mã phòng hoặc dữ liệu không hợp lệ (Mã phòng đã tồn tại hoặc bỏ trống sức chứa tối đa). **^^
- i. **Hệ thống cảnh báo lỗi màu đỏ ngay tại trường dữ liệu tương ứng. **^^
- ii. **Quay lại Bước 3 để Quản lý tiến hành chỉnh sửa. **^^
- **A4.2 - Xóa phòng đang sử dụng (Quản lý bấm xóa một phòng đang có người thuê hoặc đang được đặt cọc)). **^^
- i. **Hệ thống chặn thao tác và hiển thị cảnh báo ràng buộc dữ liệu. **^^
- ii. **Quay lại Bước 2. **^^

---

### Quản lý đơn giá dịch vụ

**Tóm tắt:** Usecase giúp Quản lý thiết lập và cập nhật các bảng giá nền tảng bao gồm giá thuê theo loại phòng, giá điện, nước, gửi xe và dịch vụ đi kèm. ^^**Tác nhân:** Quản lý ^^**Use case liên quan:** - <> Đăng nhập ^^**Điều kiện tiên quyết:** Không có. ^^**Hậu điều kiện:** Bảng giá hệ thống được cập nhật thành công (Không làm thay đổi giá của các hợp đồng cũ đã ký). ^^

**Dòng sự kiện chính:**

1. Quản lý truy cập chức năng Quản lý đơn giá dịch vụ. **Hệ thống gọi Use case Đăng nhập (<>). **^^
2. **Hệ thống hiển thị bảng giá hiện hành của tất cả các loại phòng và tiện ích. **^^
3. **Quản lý chọn hạng mục cần điều chỉnh, nhập mức giá mới hoặc tạo thêm danh mục phí mới. **^^
4. **Quản lý bấm lưu thông số. **^^
5. **Hệ thống ghi nhận bảng giá mới vào cơ sở dữ liệu để áp dụng làm cơ sở tính toán cho các hợp đồng và kỳ thu phí tiếp theo. **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A4 - Đơn giá nhập vào không hợp lệ (Quản lý nhập số âm, nhập chữ vào ô tiền tệ hoặc bỏ trống). **^^
- iii. **Hệ thống từ chối lưu và hiển thị thông báo lỗi định dạng. **^^
- iv. **Quay lại Bước 3 để Quản lý nhập lại mức giá chính xác. **^^

---

### Quản lý tài khoản người dùng

**Tóm tắt:** Usecase giúp Quản lý tạo tài khoản, phân quyền truy cập hoặc khóa tài khoản của các nhân sự (Sale, Kế toán) tham gia sử dụng hệ thống. ^^**Tác nhân:** Quản lý ^^**Use case liên quan:** <> Đăng nhập ^^**Điều kiện tiên quyết:** Tài khoản Quản lý đang thao tác phải có quyền admin (quyền cao nhất). ^^**Hậu điều kiện:** Tài khoản nhân sự được tạo mới hoặc cập nhật trạng thái truy cập hệ thống. ^^

**Dòng sự kiện chính:**

1. Quản lý chọn chức năng Quản lý tài khoản. **Hệ thống gọi Use case Đăng nhập (<>). **^^
2. **Hệ thống hiển thị danh sách các nhân viên đang có tài khoản truy cập phần mềm. **^^
3. **Quản lý chọn thao tác tạo mới tài khoản hoặc nhấp vào tài khoản cũ để đổi quyền/khóa hoạt động. **^^
4. **Quản lý nhập thông tin (Tên đăng nhập, mật khẩu tạm, vai trò: Sale/Kế toán) và nhấn lưu. **^^
5. **Hệ thống khởi tạo hoặc cập nhật tài khoản, phân đúng chức năng giao diện theo vai trò. **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A4 - Tên đăng nhập đã tồn tại (Tên user vừa tạo bị trùng với một nhân viên khác trong hệ thống). **^^
- i. **Hệ thống báo lỗi "Tên đăng nhập đã được sử dụng". **^^
- ii. **Quay lại Bước 4 để Quản lý điền một tên đăng nhập khác. **^^

---

**Nhóm các usecase khác **^^

### Đăng nhập

**Tóm tắt:** Usecase giúp xác thực danh tính người dùng (Nhân viên sale, Kế toán, Quản lý) trước khi cho phép họ truy cập và thực hiện các nghiệp vụ trên hệ thống. ^^**Tác nhân:** Nhân viên sale, Nhân viên kế toán, Quản lý ^^
**Use case liên quan:** Được <> bởi hầu hết các Use Case nghiệp vụ chính. **Nhận <> từ Use case Đăng ký. **^^**Điều kiện tiên quyết:** Hệ thống phải kết nối được với cơ sở dữ liệu chứa thông tin người dùng. ^^**Hậu điều kiện:** Phiên đăng nhập được thiết lập, hệ thống ghi nhận được danh tính và quyền hạn của người đang thao tác. ^^

**Dòng sự kiện chính:**

1. **Người dùng mở ứng dụng/website hoặc hệ thống tự động gọi màn hình xác thực khi người dùng thao tác chức năng cần quyền. **^^
2. **Hệ thống hiển thị biểu mẫu yêu cầu nhập Tên đăng nhập và Mật khẩu. **^^
3. **Người dùng nhập thông tin và nhấn nút "Đăng nhập". **^^
4. **Hệ thống mã hóa thông tin, đối chiếu với cơ sở dữ liệu tài khoản. **^^
5. **Hệ thống xác nhận hợp lệ, khởi tạo phiên làm việc (session) và điều hướng người dùng vào giao diện làm việc tương ứng với phân quyền (Sale/Kế toán/Quản lý). **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A4 - Sai thông tin đăng nhập (Tên đăng nhập không tồn tại hoặc sai mật khẩu). **^^
- i. **Hệ thống từ chối truy cập và hiển thị thông báo lỗi (ví dụ: "Tên đăng nhập hoặc mật khẩu không chính xác"). **^^
- ii. **Quay lại Bước 2 để người dùng nhập lại hoặc thực hiện khôi phục mật khẩu. **^^
- **A2 - Người dùng chưa có tài khoản (Hệ thống ghi nhận thao tác người dùng muốn tạo tài khoản mới). **^^
- i. **Người dùng bấm chọn liên kết "Đăng ký tài khoản" trên màn hình. **^^
- ii. **Hệ thống gọi Use case Đăng ký (<>). **^^
- iii. **Sau khi hoàn tất đăng ký, quay lại Bước 2. **^^

---

### Đăng ký

**Tóm tắt:** Usecase cho phép người dùng mới tạo lập tài khoản truy cập hệ thống trong trường hợp chưa được cấp phát tự động. ^^**Tác nhân:** Nhân viên sale, Nhân viên kế toán, Quản lý ^^**Use case liên quan:** - <> tới Đăng nhập. ^^**Điều kiện tiên quyết:** Kích hoạt từ màn hình Đăng nhập khi người dùng nhấn chọn chức năng tạo tài khoản. ^^**Hậu điều kiện:** Một tài khoản mới được ghi nhận vào cơ sở dữ liệu của hệ thống. ^^

**Dòng sự kiện chính:**

1. **Hệ thống hiển thị biểu mẫu đăng ký tài khoản với các trường thông tin bắt buộc (Họ tên, SĐT, Email, Tên đăng nhập, Mật khẩu...). **^^
2. **Người dùng điền đầy đủ thông tin vào biểu mẫu và nhấn nút "Đăng ký". **^^
3. **Hệ thống kiểm tra tính hợp lệ của dữ liệu (định dạng email, độ mạnh mật khẩu, trùng lặp tên đăng nhập). **^^
4. **Hệ thống lưu tài khoản mới vào cơ sở dữ liệu với trạng thái "Chờ phê duyệt" (hoặc kích hoạt ngay tùy quy định). **^^
5. **Hệ thống thông báo tạo tài khoản thành công và trả luồng về lại màn hình Đăng nhập. **^^
6. **Kết thúc Use-Case. **^^

**Dòng sự kiện phụ:**

- **A3 - Tên đăng nhập hoặc Email đã tồn tại (Hệ thống rà soát thấy thông tin định danh bị trùng với tài khoản cũ). **^^
- i. **Hệ thống báo lỗi "Tên đăng nhập/Email đã được sử dụng". **^^
- ii. **Quay lại Bước 2 để người dùng thay đổi thông tin. **^^
- **A3 - Mật khẩu không khớp hoặc quá yếu (Hệ thống phát hiện mật khẩu xác nhận bị sai lệch hoặc không đủ ký tự). **^^
- i. **Hệ thống cảnh báo lỗi dưới ô nhập liệu. **^^
- ii. **Quay lại Bước 2. **^^
