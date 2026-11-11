package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "events")
@Data
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private Long clubId;
    private String date; // Using String to match frontend mock, or LocalDate
    private String status; // "APPROVED", "PENDING", "DRAFT"
    private String room;
    private Integer attendees;
}
