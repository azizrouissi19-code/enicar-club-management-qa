package com.example.backend.web;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

/** Erreurs métier renvoyées au client avec un code HTTP 4xx explicite (au lieu d'une erreur 500). */
public final class ApiError {

    private ApiError() {
    }

    public static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    public static ResponseStatusException conflict(String message) {
        return new ResponseStatusException(HttpStatus.CONFLICT, message);
    }

    public static ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    public static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
