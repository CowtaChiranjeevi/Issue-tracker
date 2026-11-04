package com.tracker.service;

import com.tracker.dto.auth.AuthDTOs.AuthResponse;
import com.tracker.dto.auth.AuthDTOs.LoginRequest;
import com.tracker.dto.auth.AuthDTOs.RegisterRequest;
import com.tracker.exception.BadRequestException;
import com.tracker.model.User;
import com.tracker.model.enums.Role;
import com.tracker.repository.UserRepository;
import com.tracker.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered: " + request.email());
        }

        Role assignedRole = request.role() != null ? request.role() : Role.ROLE_MEMBER;

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(assignedRole)
                .build();

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateTokenFromUsername(savedUser.getEmail());

        return new AuthResponse(token, savedUser.getId(), savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));

        String token = tokenProvider.generateTokenFromUsername(user.getEmail());

        return new AuthResponse(token, user.getId(), user.getEmail(), user.getFullName(), user.getRole().name());
    }

    @Transactional(readOnly = true)
    public java.util.List<com.tracker.dto.auth.AuthDTOs.AuthResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new com.tracker.dto.auth.AuthDTOs.AuthResponse(
                        null,
                        u.getId(),
                        u.getEmail(),
                        u.getFullName(),
                        u.getRole().name()
                ))
                .toList();
    }

    @Transactional
    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new com.tracker.exception.ResourceNotFoundException("User not found with id: " + userId);
        }
        userRepository.deleteById(userId);
    }
}