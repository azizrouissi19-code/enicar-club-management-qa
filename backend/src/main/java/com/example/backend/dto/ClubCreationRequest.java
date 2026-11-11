package com.example.backend.dto;

import lombok.Data;

@Data
public class ClubCreationRequest {
    private String name;
    private String description;
    private String presidentName;
    private String presidentEmail;
    private String presidentPassword;
}
