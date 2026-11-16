package com.example.backend.web;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * ANO-19 : une donnée refusée par la base (texte trop long, valeur en double…) est une erreur
 * de saisie du client : réponse 400 explicite au lieu d'une erreur serveur 500.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> dataIntegrity(DataIntegrityViolationException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
            "status", 400,
            "error", "Bad Request",
            "message", "Donnée refusée : un champ dépasse la longueur autorisée (255 caractères) ou est déjà utilisé"));
    }
}
