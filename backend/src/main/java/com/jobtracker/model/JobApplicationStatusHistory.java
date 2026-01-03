package com.jobtracker.model;

import jakarta.persistence.*;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "job_application_status_history")
public class JobApplicationStatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Setter
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private JobApplication application;

    @Setter
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status;

    @Setter
    @Column(nullable = false)
    private Instant changedAt;

    public JobApplicationStatusHistory() {}

    public JobApplicationStatusHistory(JobApplication application, ApplicationStatus status, Instant changedAt) {
        this.application = application;
        this.status = status;
        this.changedAt = changedAt;
    }

    public Long getId() { return id; }
    public JobApplication getApplication() { return application; }

    public ApplicationStatus getStatus() { return status; }

    public Instant getChangedAt() { return changedAt; }
}
