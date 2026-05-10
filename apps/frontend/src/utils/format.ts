/**
 * Chứa các hàm utility cho việc định dạng dữ liệu (tiền tệ, ngày tháng...)
 */

/**
 * Định dạng chuỗi nhập liệu thành định dạng tiền tệ có dấu phẩy phân cách hàng nghìn.
 * Phù hợp để dùng trực tiếp trong onChange của ô Input.
 * Ví dụ: "150000" -> "150,000"
 */
export const formatVNDInput = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null) return "";
  
  // Chỉ lấy các chữ số
  const stringValue = String(value).replace(/\D/g, "");
  
  if (!stringValue) return "";
  
  // Chuyển sang format có dấu phẩy
  return Number(stringValue).toLocaleString("en-US");
};

/**
 * Loại bỏ các ký tự không phải số để lấy giá trị thực tế trước khi gửi lên API hoặc lưu vào state số.
 * Ví dụ: "150,000" -> "150000"
 */
export const parseVNDInput = (value: string): string => {
  return value.replace(/\D/g, "");
};
