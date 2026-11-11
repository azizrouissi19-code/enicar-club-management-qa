package com.example.backend.controller;

import com.example.backend.model.Event;
import com.example.backend.model.Room;
import com.example.backend.repository.ClubRepository;
import com.example.backend.repository.EventRepository;
import com.example.backend.repository.RoomRepository;
import com.example.backend.web.ApiError;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
public class EventController {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ClubRepository clubRepository;

    @GetMapping
    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        // ANO-04 : règles métier de l'exigence EF-06
        if (ApiError.isBlank(event.getTitle())) {
            throw ApiError.badRequest("Le titre est obligatoire");
        }
        if (event.getClubId() == null || !clubRepository.existsById(event.getClubId())) {
            throw ApiError.badRequest("Club inexistant");
        }
        Room room = roomRepository.findFirstByName(event.getRoom())
            .orElseThrow(() -> ApiError.badRequest("Salle inexistante : " + event.getRoom()));
        int attendees = event.getAttendees() == null ? 0 : event.getAttendees();
        if (attendees < 0 || attendees > room.getCapacity()) {
            throw ApiError.badRequest("Participants entre 0 et " + room.getCapacity() + " (capacité de la salle)");
        }
        if (parseDate(event.getDate()).isBefore(LocalDate.now())) {
            throw ApiError.badRequest("La date de l'événement est passée");
        }
        event.setAttendees(attendees);
        event.setStatus("PENDING"); // le statut initial ne peut pas être choisi par le client
        return eventRepository.save(event);
    }

    private static LocalDate parseDate(String date) {
        if (date == null) {
            throw ApiError.badRequest("La date est obligatoire");
        }
        try {
            return LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            throw ApiError.badRequest("Date invalide (format AAAA-MM-JJ)", e);
        }
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        eventRepository.deleteById(id);
    }
}
