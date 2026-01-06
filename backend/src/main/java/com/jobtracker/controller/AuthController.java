package com.jobtracker.controller;

import com.jobtracker.dto.AuthDtos;
import com.jobtracker.model.User;
import com.jobtracker.repo.UserRepository;
import com.jobtracker.service.AuthService;
import com.jobtracker.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepo;

    public AuthController(AuthService authService, UserRepository userRepo) {
        this.authService = authService;
        this.userRepo = userRepo;
    }

    @PostMapping("/register")
    public AuthDtos.UserResponse register(@Valid @RequestBody AuthDtos.RegisterRequest req,
                                          HttpSession session) {
        User u = authService.register(req);
        SessionUtil.setUserId(session, u.getId());
        return toUser(u);
    }

    @PostMapping("/login")
    public AuthDtos.UserResponse login(@Valid @RequestBody AuthDtos.LoginRequest req,
                                       HttpSession session) {
        User u = authService.login(req);
        SessionUtil.setUserId(session, u.getId());
        return toUser(u);
    }

    @GetMapping("/me")
    public AuthDtos.UserResponse me(HttpSession session) {
        Long uid = SessionUtil.getUserId(session);
        if (uid == null) throw new UnauthorizedException("Not logged in");

        User u = userRepo.findById(uid)
                .orElseThrow(() -> new UnauthorizedException("Not logged in"));
        return toUser(u);
    }

    @PostMapping("/logout")
    public void logout(HttpSession session) {
        session.invalidate();
    }

    private AuthDtos.UserResponse toUser(User u) {
        return new AuthDtos.UserResponse(u.getId(), u.getName(), u.getEmail());
    }
}
