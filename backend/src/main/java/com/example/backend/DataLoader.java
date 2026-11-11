package com.example.backend;

import com.example.backend.model.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class DataLoader implements CommandLineRunner {

    @Autowired private UserRepository userRepository;
    @Autowired private ClubRepository clubRepository;
    @Autowired private EventRepository eventRepository;
    @Autowired private RoomRepository roomRepository;
    @Autowired private EquipmentRepository equipmentRepository;
    @Autowired private ReservationRepository reservationRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setFullName("Admin ENICarthage");
            admin.setEmail("admin@enicar.tn");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole("ADMINISTRATOR");
            userRepository.save(admin);

            User president = new User();
            president.setFullName("Ahmed Ben Ali");
            president.setEmail("ahmed@enicar.tn");
            president.setPassword(passwordEncoder.encode("123456"));
            president.setRole("CLUB_PRESIDENT");
            userRepository.save(president);

            Club c1 = new Club();
            c1.setName("Club IEEE");
            c1.setDescription("Électronique & informatique");
            c1.setPresidentId(president.getId());
            c1.setMembers(Arrays.asList(admin.getId(), president.getId()));
            clubRepository.save(c1);

            Event e1 = new Event();
            e1.setTitle("Hackathon IEEE 2025");
            e1.setClubId(c1.getId());
            e1.setDate("2025-05-10");
            e1.setStatus("APPROVED");
            e1.setRoom("Amphi A");
            e1.setAttendees(80);
            eventRepository.save(e1);

            Room r1 = new Room();
            r1.setName("Amphi A");
            r1.setCapacity(200);
            r1.setType("AMPHI");
            roomRepository.save(r1);

            Equipment eq1 = new Equipment();
            eq1.setName("Projecteur Epson");
            eq1.setType("VISUEL");
            eq1.setStatus("AVAILABLE");
            equipmentRepository.save(eq1);

            Equipment eq2 = new Equipment();
            eq2.setName("Microphone Sans Fil");
            eq2.setType("AUDIO");
            eq2.setStatus("IN_USE");
            equipmentRepository.save(eq2);

            Reservation res1 = new Reservation();
            res1.setClubId(c1.getId());
            res1.setResourceType("ROOM");
            res1.setResourceId(r1.getId());
            res1.setDate("2025-05-10");
            res1.setStatus("APPROVED");
            reservationRepository.save(res1);

            Reservation res2 = new Reservation();
            res2.setClubId(c1.getId());
            res2.setResourceType("EQUIPMENT");
            res2.setResourceId(eq1.getId());
            res2.setDate("2025-05-12");
            res2.setStatus("PENDING");
            reservationRepository.save(res2);
        }
    }
}
