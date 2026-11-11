package com.example.backend.security;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

/**
 * ANO-01 : jetons de session aléatoires (256 bits) délivrés à la connexion et vérifiés à chaque requête.
 * Les jetons sont conservés en mémoire ; une évolution vers des JWT signés est recommandée.
 */
@Service
public class TokenService {

    private final SecureRandom random = new SecureRandom();
    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public String issue(Long userId) {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        tokens.put(token, userId);
        return token;
    }

    public Optional<Long> userIdFor(String token) {
        return Optional.ofNullable(tokens.get(token));
    }
}
