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

        // 1) Save application first (so it has an ID)
        JobApplication saved = appRepo.save(a);

        // 2) Create first history record (timeline start)
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

        //Update status
        a.setStatus(req.status());

        //  Save application
        JobApplication saved = appRepo.save(a);

        // Save status change to timeline (THIS FIXES YOUR ISSUE)
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
