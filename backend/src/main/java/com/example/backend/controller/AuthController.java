package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.TokenService;
import com.example.backend.web.ApiError;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /** ANO-03 : seules les adresses institutionnelles sont acceptées */
    private static final Pattern INSTITUTIONAL_EMAIL = Pattern.compile("^[A-Za-z0-9._%+-]+@enicar\\.tn$", Pattern.CASE_INSENSITIVE);
    private static final int MIN_PASSWORD_LENGTH = 6;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private TokenService tokenService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");
        if (ApiError.isBlank(email) || ApiError.isBlank(password)) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT));
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return ResponseEntity.ok(Map.of("token", tokenService.issue(userOpt.get().getId()), "user", userOpt.get()));
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        String fullName = data.get("fullName");
        String email = data.get("email") == null ? null : data.get("email").trim().toLowerCase(Locale.ROOT);
        String password = data.get("password");

        if (ApiError.isBlank(fullName)) {
            throw ApiError.badRequest("Le nom est obligatoire");
        }
        if (email == null || !INSTITUTIONAL_EMAIL.matcher(email).matches()) {
            throw ApiError.badRequest("Adresse institutionnelle @enicar.tn obligatoire");
        }
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            throw ApiError.badRequest("Mot de passe trop court (min. 6 caractères)");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(400).body("Email already exists");
        }

        User newUser = new User();
        newUser.setFullName(fullName.trim());
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole("CLUB_MEMBER"); // le rôle envoyé par le client est ignoré
        userRepository.save(newUser);

        return ResponseEntity.ok(Map.of("token", tokenService.issue(newUser.getId()), "user", newUser));
    }
}
