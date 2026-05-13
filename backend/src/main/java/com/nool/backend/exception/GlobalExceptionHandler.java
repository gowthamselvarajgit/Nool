package com.nool.backend.exception;

import com.nool.backend.dto.common.ApiErrorResponse;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // NOT FOUND 404
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNotFound(ResourceNotFoundException exception, HttpServletRequest request){
        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message(exception.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }

    //DUPLICATE 409
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiErrorResponse> handleDuplicate(DuplicateResourceException exception, HttpServletRequest request){
        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error("Conflict")
                .message(exception.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }

    //VALIDATION ERROR (400)

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception, HttpServletRequest request){
        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse("Validation failed");

        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(message)
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    //FALLBACK 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenric(Exception exception, HttpServletRequest request) throws Exception {
        // Let Spring Security handle its own access-denied/authentication errors
        if (exception instanceof org.springframework.security.access.AccessDeniedException
                || exception instanceof org.springframework.security.core.AuthenticationException) {
            throw exception;
        }
        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message(exception.getMessage() != null ? exception.getMessage() : "An unexpected error occurred")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.internalServerError().body(errorResponse);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleBadRequest(BadRequestException exception, HttpServletRequest request){
        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(exception.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException exception, HttpServletRequest request){
        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message(exception.getMessage())
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException exception, HttpServletRequest request){

        String path = request.getRequestURI();
        String rootCause = extractRootCauseMessage(exception);
        String lowerCause = rootCause == null ? "" : rootCause.toLowerCase();

        String message;
        HttpStatus status = HttpStatus.CONFLICT;

        // ── Inspect the actual database error first, not just the URL ──────────
        if (lowerCause.contains("foreign key") || lowerCause.contains("a foreign key constraint fails")) {
            status = HttpStatus.CONFLICT;
            if (path.contains("/employees")) {
                message = "Cannot delete this employee — they have attendance, salary, or daily-work history. Mark them as 'Left Job' instead.";
            } else if (path.contains("/owners")) {
                message = "Cannot delete this owner — they have transaction or payment history. Mark them as 'Not Working' instead.";
            } else {
                message = "Cannot complete the action: related records exist. Underlying error: " + rootCause;
            }
        } else if (lowerCause.contains("duplicate entry") || lowerCause.contains("unique constraint")) {
            if (lowerCause.contains("mobile") || lowerCause.contains("mobile_number")) {
                message = "This mobile number is already registered. Please use a different one.";
            } else if (lowerCause.contains("attendance_date") || path.contains("/attendance")) {
                message = "Attendance is already marked for this employee on this date.";
            } else if (lowerCause.contains("work_date") || path.contains("/employee-daily-working")) {
                message = "A daily work entry already exists for this employee on this date.";
            } else if (path.contains("/salary")) {
                message = "A salary payment already exists for this period.";
            } else {
                message = "Duplicate entry detected. Underlying error: " + rootCause;
            }
        } else if (lowerCause.contains("cannot be null") || lowerCause.contains("not-null property")) {
            status = HttpStatus.BAD_REQUEST;
            message = "A required field is missing. Underlying error: " + rootCause;
        } else {
            message = "Data conflict. Underlying error: " + rootCause;
        }

        ApiErrorResponse errorResponse = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();

        return ResponseEntity.status(status).body(errorResponse);
    }

    private String extractRootCauseMessage(Throwable t) {
        Throwable cur = t;
        Throwable last = t;
        int depth = 0;
        while (cur != null && depth++ < 10) {
            last = cur;
            cur = cur.getCause();
        }
        return last.getMessage();
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleMessageNotReadable(
            HttpMessageNotReadableException ex,
            HttpServletRequest request) {

        ApiErrorResponse error = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Bad Request")
                .message("Invalid request body or enum/date value")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleNoHandler(
            NoHandlerFoundException ex,
            HttpServletRequest request) {

        ApiErrorResponse error = ApiErrorResponse.builder()
                .timeStamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Not Found")
                .message("API endpoint not found")
                .path(request.getRequestURI())
                .build();

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }
}
