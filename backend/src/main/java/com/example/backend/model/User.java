package com.example.backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    
    @Column(unique = true)
    private String email;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY) // ANO-02 : le hash n'est jamais renvoyé par l'API
    private String password;
    private String role; // "CLUB_PRESIDENT", "CLUB_MEMBER", "ADMINISTRATOR"
}
