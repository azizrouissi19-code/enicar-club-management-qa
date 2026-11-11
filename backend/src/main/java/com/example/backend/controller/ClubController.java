package com.example.backend.controller;

import com.example.backend.dto.ClubCreationRequest;
import com.example.backend.model.Club;
import com.example.backend.model.User;
import com.example.backend.repository.ClubRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.web.ApiError;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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
        // ANO-06 : champs obligatoires et e-mail du président unique (409 au lieu d'une erreur 500)
        if (ApiError.isBlank(request.getName()) || ApiError.isBlank(request.getPresidentName())
                || ApiError.isBlank(request.getPresidentEmail()) || ApiError.isBlank(request.getPresidentPassword())) {
            throw ApiError.badRequest("Nom du club et informations du président obligatoires");
        }
        String email = request.getPresidentEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw ApiError.conflict("Un compte existe déjà avec l'e-mail " + email);
        }

        User president = new User();
        president.setFullName(request.getPresidentName().trim());
        president.setEmail(email);
        president.setPassword(passwordEncoder.encode(request.getPresidentPassword()));
        president.setRole("CLUB_PRESIDENT");
        User savedPresident = userRepository.save(president);

        Club club = new Club();
        club.setName(request.getName().trim());
        club.setDescription(request.getDescription());
        club.setPresidentId(savedPresident.getId());
        club.setMembers(List.of(savedPresident.getId()));
        return clubRepository.save(club);
    }

    @DeleteMapping("/{id}")
    public void deleteClub(@PathVariable Long id) {
        clubRepository.deleteById(id);
    }
}
