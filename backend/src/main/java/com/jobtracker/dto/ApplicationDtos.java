package com.jobtracker.dto;

import com.jobtracker.model.ApplicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class ApplicationDtos {

    public record ApplicationResponse(
            Long id,
            String company,
            String role,
            ApplicationStatus status,
            String notes,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record CreateRequest(
            @NotBlank @Size(max = 200) String company,
            @NotBlank @Size(max = 200) String role,
            @NotNull ApplicationStatus status,
            @Size(max = 2000) String notes
    ) {}

    public record UpdateStatusRequest(
            @NotNull ApplicationStatus status
    ) {}

    public record HistoryResponse(
            Long id,
            ApplicationStatus status,
            Instant changedAt
    ) {}

}
