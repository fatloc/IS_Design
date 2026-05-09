package com.homestay.dorm.exception;

import com.homestay.dorm.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Object> handleAccessDeniedException(AccessDeniedException ex) {
        return ApiResponse.error("Access Denied: You do not have permission to access this resource");
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        ApiResponse<Map<String, String>> response = new ApiResponse<>();
        response.setData(errors);
        response.setMessage("Dữ liệu không hợp lệ");
        return response;
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleDataIntegrityViolationException(DataIntegrityViolationException ex) {
        String msg = ex.getMostSpecificCause().getMessage();
        String userMsg = "Lỗi dữ liệu trùng lặp hoặc không hợp lệ.";
        if (msg != null) {
            if (msg.contains("Data truncation") || msg.contains("Data too long")) {
                if (msg.contains("SoDienThoai")) userMsg = "Số điện thoại quá dài (tối đa 10 số).";
                else if (msg.contains("CCCD")) userMsg = "CCCD quá dài (tối đa 12 số).";
                else if (msg.contains("Email")) userMsg = "Email quá dài (tối đa 50 ký tự).";
                else if (msg.contains("HoTen")) userMsg = "Họ tên quá dài (tối đa 50 ký tự).";
                else userMsg = "Dữ liệu nhập vào quá dài so với quy định.";
            } else {
                if (msg.contains("SoDienThoai") || msg.contains("KHACHHANG.UK_SO_DIEN_THOAI")) {
                    userMsg = "Số điện thoại này đã được đăng ký.";
                } else if (msg.contains("CCCD") || msg.contains("KHACHHANG.UK_CCCD")) {
                    userMsg = "CCCD này đã được đăng ký.";
                } else if (msg.contains("Email") || msg.contains("KHACHHANG.UK_EMAIL")) {
                    userMsg = "Email này đã được đăng ký.";
                }
            }
        }
        return ApiResponse.error(userMsg);
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Object> handleRuntimeException(RuntimeException ex) {
        String msg = ex.getMessage();
        if (msg != null) {
            if (msg.contains("Data truncation") || msg.contains("Data too long")) {
                if (msg.contains("SoDienThoai")) return ApiResponse.error("Số điện thoại quá dài (tối đa 10 số).");
                if (msg.contains("CCCD")) return ApiResponse.error("CCCD quá dài (tối đa 12 số).");
                if (msg.contains("Email")) return ApiResponse.error("Email quá dài (tối đa 50 ký tự).");
                if (msg.contains("HoTen")) return ApiResponse.error("Họ tên quá dài (tối đa 50 ký tự).");
                if (msg.contains("MaKhachHang")) return ApiResponse.error("Mã khách hàng tạo ra quá dài.");
                return ApiResponse.error("Dữ liệu nhập vào quá dài so với quy định.");
            }
            if (msg.contains("ConstraintViolationException") || msg.contains("Duplicate entry")) {
                 return ApiResponse.error("Lỗi trùng lặp dữ liệu (số điện thoại, email hoặc CCCD đã tồn tại).");
            }
        }
        return ApiResponse.error(msg);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Object> handleGlobalException(Exception ex) {
        return ApiResponse.error("Something went wrong: " + ex.getMessage());
    }
}
