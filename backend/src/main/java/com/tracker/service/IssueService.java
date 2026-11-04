package com.tracker.service;

import com.tracker.dto.issue.IssueDTOs.CreateIssueRequest;
import com.tracker.dto.issue.IssueDTOs.IssueResponse;
import com.tracker.dto.issue.IssueDTOs.UpdateIssueStatusRequest;
import com.tracker.exception.ResourceNotFoundException;
import com.tracker.model.Issue;
import com.tracker.model.Project;
import com.tracker.model.User;
import com.tracker.model.enums.IssueStatus;
import com.tracker.repository.IssueRepository;
import com.tracker.repository.ProjectRepository;
import com.tracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class IssueService {

    private final IssueRepository issueRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public IssueResponse createIssue(CreateIssueRequest request, Long reporterId) {
        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + request.projectId()));

        User reporter = userRepository.findById(reporterId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reporterId));

        User assignee = null;
        if (request.assigneeId() != null) {
            assignee = userRepository.findById(request.assigneeId()).orElse(null);
        }

        Issue issue = Issue.builder()
                .title(request.title())
                .description(request.description())
                .status(IssueStatus.BACKLOG)
                .priority(request.priority())
                .project(project)
                .reporter(reporter)
                .assignee(assignee)
                .build();

        return mapToResponse(issueRepository.save(issue));
    }

    @Transactional(readOnly = true)
    public List<IssueResponse> getIssuesByProject(Long projectId) {
        return issueRepository.findByProjectId(projectId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public IssueResponse updateStatus(Long issueId, UpdateIssueStatusRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + issueId));

        issue.setStatus(request.status());
        return mapToResponse(issueRepository.save(issue));
    }

    private IssueResponse mapToResponse(Issue issue) {
        return new IssueResponse(
                issue.getId(),
                issue.getTitle(),
                issue.getDescription(),
                issue.getStatus(),
                issue.getPriority(),
                issue.getProject().getId(),
                issue.getProject().getKey(),
                issue.getAssignee() != null ? issue.getAssignee().getId() : null,
                issue.getAssignee() != null ? issue.getAssignee().getFullName() : "Unassigned",
                issue.getReporter().getId(),
                issue.getReporter().getFullName(),
                issue.getVersion(),
                issue.getCreatedAt(),
                issue.getUpdatedAt()
        );
    }

    @Transactional
    public IssueResponse updateIssue(Long issueId, com.tracker.dto.issue.IssueDTOs.UpdateIssueRequest request) {
        Issue issue = issueRepository.findById(issueId)
                .orElseThrow(() -> new ResourceNotFoundException("Issue not found: " + issueId));

        issue.setTitle(request.title());
        issue.setDescription(request.description());
        issue.setPriority(request.priority());
        issue.setStatus(request.status());

        return mapToResponse(issueRepository.save(issue));
    }

    @Transactional
    public void deleteIssue(Long issueId) {
        if (!issueRepository.existsById(issueId)) {
            throw new ResourceNotFoundException("Issue not found: " + issueId);
        }
        issueRepository.deleteById(issueId);
    }
}