package com.example.backend.controller;

import com.example.backend.model.Reservation;
import com.example.backend.repository.EquipmentRepository;
import com.example.backend.repository.ReservationRepository;
import com.example.backend.repository.RoomRepository;
import com.example.backend.web.ApiError;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private static final Set<String> STATUSES = Set.of("PENDING", "APPROVED", "REJECTED");

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EquipmentRepository equipmentRepository;

    @GetMapping
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    @PostMapping
    public Reservation createReservation(@RequestBody Reservation reservation) {
        // ANO-05 : la ressource doit exister et ne pas être déjà réservée à cette date
        Long id = reservation.getResourceId();
        boolean exists = switch (String.valueOf(reservation.getResourceType())) {
            case "ROOM" -> id != null && roomRepository.existsById(id);
            case "EQUIPMENT" -> id != null && equipmentRepository.existsById(id);
            default -> false;
        };
        if (!exists) {
            throw ApiError.badRequest("Ressource inexistante");
        }
        if (ApiError.isBlank(reservation.getDate())) {
            throw ApiError.badRequest("La date est obligatoire");
        }
        if (reservationRepository.existsByResourceTypeAndResourceIdAndDateAndStatusNot(
                reservation.getResourceType(), id, reservation.getDate(), "REJECTED")) {
            throw ApiError.conflict("Ressource déjà réservée à cette date");
        }
        reservation.setStatus("PENDING"); // seule l'administration peut approuver
        return reservationRepository.save(reservation);
    }

    @DeleteMapping("/{id}")
    public void deleteReservation(@PathVariable Long id) {
        reservationRepository.deleteById(id);
    }

    @PutMapping("/{id}/status")
    public Reservation updateReservationStatus(@PathVariable Long id, @RequestBody Map<String, String> statusMap) {
        String status = statusMap.get("status");
        if (!STATUSES.contains(status)) {
            throw ApiError.badRequest("Statut invalide : " + status);
        }
        Reservation reservation = reservationRepository.findById(id)
            .orElseThrow(() -> ApiError.notFound("Réservation introuvable : " + id));
        reservation.setStatus(status);
        return reservationRepository.save(reservation);
    }
}
