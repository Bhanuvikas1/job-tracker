package com.jobtracker.controller;

import com.jobtracker.dto.ApplicationDtos;
import com.jobtracker.dto.ApplicationDtos.HistoryResponse;
import com.jobtracker.model.JobApplication;
import com.jobtracker.repo.JobApplicationStatusHistoryRepository;
import com.jobtracker.service.ApplicationService;
import com.jobtracker.util.SessionUtil;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {

    private final ApplicationService service;
    private final JobApplicationStatusHistoryRepository historyRepo;

    public ApplicationController(ApplicationService service,
                                 JobApplicationStatusHistoryRepository historyRepo) {
        this.service = service;
        this.historyRepo = historyRepo;
    }

    @GetMapping
    public List<ApplicationDtos.ApplicationResponse> list(HttpSession session) {
        Long uid = requireUser(session);
        return service.listForUser(uid).stream().map(this::toResp).toList();
    }

    @PostMapping
    public ApplicationDtos.ApplicationResponse create(@Valid @RequestBody ApplicationDtos.CreateRequest req,
                                                      HttpSession session) {
        Long uid = requireUser(session);
        JobApplication a = service.create(uid, req);
        return toResp(a);
    }

    @PutMapping("/{id}/status")
    public ApplicationDtos.ApplicationResponse updateStatus(@PathVariable Long id,
                                                            @Valid @RequestBody ApplicationDtos.UpdateStatusRequest req,
                                                            HttpSession session) {
        Long uid = requireUser(session);
        JobApplication a = service.updateStatus(uid, id, req);
        return toResp(a);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, HttpSession session) {
        Long uid = requireUser(session);
        service.delete(uid, id);
    }

    @GetMapping("/{id}/history")
    public List<ApplicationDtos.HistoryResponse> history(@PathVariable Long id, HttpSession session) {
        Long uid = requireUser(session);

        service.getById(uid, id);

        return historyRepo.findByApplication_IdOrderByChangedAtAsc(id)
                .stream()
                .map(h -> new ApplicationDtos.HistoryResponse(h.getId(), h.getStatus(), h.getChangedAt()))
                .toList();
    }


    private Long requireUser(HttpSession session) {
        Long uid = SessionUtil.getUserId(session);
        if (uid == null) throw new UnauthorizedException("Not logged in");
        return uid;
    }

    private ApplicationDtos.ApplicationResponse toResp(JobApplication a) {
        return new ApplicationDtos.ApplicationResponse(
                a.getId(),
                a.getCompany(),
                a.getRole(),
                a.getStatus(),
                a.getNotes(),
                a.getCreatedAt(),
                a.getUpdatedAt()
        );
    }
}
