package com.jobtracker.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank @Size(max = 120) String name,
            @NotBlank @Email @Size(max = 200) String email,
            @NotBlank @Size(min = 6, max = 200) String password
    ) {}

    public record LoginRequest(
            @NotBlank @Email String email,
            @NotBlank String password
    ) {}

    public record UserResponse(Long id, String name, String email) {}
}
