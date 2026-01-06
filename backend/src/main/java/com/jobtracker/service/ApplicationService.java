package com.jobtracker.service;

import com.jobtracker.dto.ApplicationDtos;
import com.jobtracker.model.JobApplication;
import com.jobtracker.model.JobApplicationStatusHistory;
import com.jobtracker.model.User;
import com.jobtracker.repo.JobApplicationRepository;
import com.jobtracker.repo.JobApplicationStatusHistoryRepository;
import com.jobtracker.repo.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class ApplicationService {

    private final JobApplicationRepository appRepo;
    private final UserRepository userRepo;
    private final JobApplicationStatusHistoryRepository historyRepo;

    public ApplicationService(JobApplicationRepository appRepo,
                              UserRepository userRepo,
                              JobApplicationStatusHistoryRepository historyRepo) {
        this.appRepo = appRepo;
        this.userRepo = userRepo;
        this.historyRepo = historyRepo;
    }

    public List<JobApplication> listForUser(Long userId) {
        return appRepo.findAllByUser_IdOrderByUpdatedAtDesc(userId);
    }

    @Transactional
    public JobApplication create(Long userId, ApplicationDtos.CreateRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        JobApplication a = new JobApplication();
        a.setCompany(req.company().trim());
        a.setRole(req.role().trim());
        a.setStatus(req.status());
        a.setNotes(req.notes());
        a.setUser(user);

        JobApplication saved = appRepo.save(a);

        historyRepo.save(new JobApplicationStatusHistory(
                saved,
                saved.getStatus(),
                Instant.now()
        ));

        return saved;
    }

    @Transactional
    public JobApplication updateStatus(Long userId, Long appId, ApplicationDtos.UpdateStatusRequest req) {
        JobApplication a = appRepo.findByIdAndUser_Id(appId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));


        a.setStatus(req.status());


        JobApplication saved = appRepo.save(a);

        historyRepo.save(new JobApplicationStatusHistory(
                saved,
                saved.getStatus(),
                Instant.now()
        ));

        return saved;
    }


    @Transactional
    public void delete(Long userId, Long appId) {
        JobApplication a = appRepo.findByIdAndUser_Id(appId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        historyRepo.deleteByApplication_Id(appId);

        appRepo.delete(a);
    }


    public JobApplication getById(Long userId, Long appId) {
        JobApplication app = appRepo.findById(appId)
                .orElseThrow(() -> new IllegalArgumentException("Application not found"));

        if (app.getUser() == null || app.getUser().getId() == null || !app.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You don't have access to this application");
        }

        return app;
    }
}
