package com.example.backend.repository;

import com.example.backend.model.Room;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findFirstByName(String name);
}
