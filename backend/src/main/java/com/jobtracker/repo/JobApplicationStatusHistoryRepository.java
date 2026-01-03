package com.jobtracker.repo;

import com.jobtracker.model.JobApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationStatusHistoryRepository extends JpaRepository<JobApplicationStatusHistory, Long> {

    List<JobApplicationStatusHistory> findByApplication_IdOrderByChangedAtAsc(Long appId);
}
