package com.example.backend.controller;

import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            String dummyToken = "dummy-jwt-token-" + userOpt.get().getId();
            Map<String, Object> response = new HashMap<>();
            response.put("token", dummyToken);
            response.put("user", userOpt.get());
            return ResponseEntity.ok(response);
        }
        
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> data) {
        String fullName = data.get("fullName");
        String email = data.get("email");
        String password = data.get("password");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(400).body("Email already exists");
        }

        User newUser = new User();
        newUser.setFullName(fullName);
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password));
        newUser.setRole("CLUB_MEMBER");
        userRepository.save(newUser);

        String dummyToken = "dummy-jwt-token-" + newUser.getId();
        Map<String, Object> response = new HashMap<>();
        response.put("token", dummyToken);
        response.put("user", newUser);
        return ResponseEntity.ok(response);
    }
}
