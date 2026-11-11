package com.example.backend.controller;

import com.example.backend.model.Room;
import com.example.backend.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @GetMapping
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @PostMapping
    public Room createRoom(@RequestBody Room room) {
        // ANO-07 : nom obligatoire et capacité strictement positive
        if (com.example.backend.web.ApiError.isBlank(room.getName()) || room.getCapacity() == null || room.getCapacity() <= 0) {
            throw com.example.backend.web.ApiError.badRequest("Nom obligatoire et capacité strictement positive");
        }
        return roomRepository.save(room);
    }

    @DeleteMapping("/{id}")
    public void deleteRoom(@PathVariable Long id) {
        roomRepository.deleteById(id);
    }
}
