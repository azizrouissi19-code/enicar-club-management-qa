package com.example.backend.controller;

import com.example.backend.model.Reservation;
import com.example.backend.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationRepository reservationRepository;

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @PostMapping
    public Reservation createReservation(@RequestBody Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    @DeleteMapping("/{id}")
    public void deleteReservation(@PathVariable Long id) {
        reservationRepository.deleteById(id);
    }

    @PutMapping("/{id}/status")
    public Reservation updateReservationStatus(@PathVariable Long id, @RequestBody java.util.Map<String, String> statusMap) {
        Reservation reservation = reservationRepository.findById(id).orElseThrow();
        reservation.setStatus(statusMap.get("status"));
        return reservationRepository.save(reservation);
    }
}
