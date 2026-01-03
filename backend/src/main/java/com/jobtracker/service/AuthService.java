package com.jobtracker.service;

import com.jobtracker.dto.AuthDtos;
import com.jobtracker.model.User;
import com.jobtracker.repo.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public User register(AuthDtos.RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        User u = new User();
        u.setName(req.name().trim());
        u.setEmail(email);
        u.setPasswordHash(passwordEncoder.encode(req.password()));
        return userRepository.save(u);
    }

    public User login(AuthDtos.LoginRequest req) {
        User u = userRepository.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(req.password(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        return u;
    }
}
