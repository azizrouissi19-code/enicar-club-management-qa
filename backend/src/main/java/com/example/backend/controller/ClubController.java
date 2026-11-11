package com.example.backend.controller;

import com.example.backend.model.Club;
import com.example.backend.model.User;
import com.example.backend.dto.ClubCreationRequest;
import com.example.backend.repository.ClubRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clubs")
public class ClubController {

    @Autowired
    private ClubRepository clubRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }

    @PostMapping
    public Club createClub(@RequestBody ClubCreationRequest request) {
        // Create the president user first
        User president = new User();
        president.setFullName(request.getPresidentName());
        president.setEmail(request.getPresidentEmail());
        president.setPassword(passwordEncoder.encode(request.getPresidentPassword()));
        president.setRole("CLUB_PRESIDENT");
        User savedPresident = userRepository.save(president);

        // Create the club and link the president
        Club club = new Club();
        club.setName(request.getName());
        club.setDescription(request.getDescription());
        club.setPresidentId(savedPresident.getId());
        return clubRepository.save(club);
    }

    @DeleteMapping("/{id}")
    public void deleteClub(@PathVariable Long id) {
        clubRepository.deleteById(id);
    }
}
