package com.example.backend.repository;

import com.example.backend.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    /** ANO-05 : une ressource ne peut être réservée qu'une fois par date (hors réservations rejetées) */
    boolean existsByResourceTypeAndResourceIdAndDateAndStatusNot(String resourceType, Long resourceId, String date, String status);
}
