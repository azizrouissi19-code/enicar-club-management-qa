package com.example.backend.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "reservations")
@Data
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long clubId;
    private String resourceType; // "ROOM" or "EQUIPMENT"
    private Long resourceId;
    private String date;
    private String status; // "APPROVED", "PENDING", "REJECTED"
}
