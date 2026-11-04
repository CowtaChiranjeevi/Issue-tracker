package com.tracker.dto.issue;

import com.tracker.model.enums.IssuePriority;
import com.tracker.model.enums.IssueStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class IssueDTOs {

    public record CreateIssueRequest(
            @NotBlank(message = "Title is required") String title,
            String description,
            @NotNull(message = "Priority is required") IssuePriority priority,
            @NotNull(message = "Project ID is required") Long projectId,
            Long assigneeId
    ) {}

    public record UpdateIssueStatusRequest(
            @NotNull(message = "Status is required") IssueStatus status,
            Long version
    ) {}

    public record IssueResponse(
            Long id,
            String title,
            String description,
            IssueStatus status,
            IssuePriority priority,
            Long projectId,
            String projectKey,
            Long assigneeId,
            String assigneeName,
            Long reporterId,
            String reporterName,
            Long version,
            Instant createdAt,
            Instant updatedAt
    ) {}

    public record UpdateIssueRequest(
            @NotBlank(message = "Title is required") String title,
            String description,
            @NotNull(message = "Priority is required") IssuePriority priority,
            @NotNull(message = "Status is required") IssueStatus status
    ) {}
}