package com.tracker.dto.auth;

import com.tracker.model.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public record RegisterRequest(
            @NotBlank(message = "Full name is required") String fullName,
            @NotBlank(message = "Email is required") @Email(message = "Invalid email format") String email,
            @NotBlank(message = "Password is required") @Size(min = 6, message = "Password must be at least 6 characters") String password,
            Role role
    ) {}

    public record LoginRequest(
            @NotBlank(message = "Email is required") @Email String email,
            @NotBlank(message = "Password is required") String password
    ) {}

    public record AuthResponse(
            String token,
            String tokenType,
            Long userId,
            String email,
            String fullName,
            String role
    ) {
        public AuthResponse(String token, Long userId, String email, String fullName, String role) {
            this(token, "Bearer", userId, email, fullName, role);
        }
    }
}