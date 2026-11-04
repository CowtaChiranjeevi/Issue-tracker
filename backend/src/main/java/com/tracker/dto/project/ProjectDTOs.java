package com.tracker.dto.project;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public class ProjectDTOs {

    public record CreateProjectRequest(
            @NotBlank(message = "Project name is required") String name,
            @NotBlank(message = "Project key is required") @Size(min = 2, max = 10) String key,
            String description
    ) {}

    public record ProjectResponse(
            Long id,
            String name,
            String key,
            String description,
            Long ownerId,
            String ownerName,
            Instant createdAt
    ) {}
}