package com.example.webrtc.repository;

import com.example.webrtc.domain.Room;
import java.util.List;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface RoomRepository extends CrudRepository<Room, String> {

    @Query("SELECT * FROM room")
    List<Room> findAllRooms();

    @Transactional
    @Query("SELECT * FROM room WHERE is_active = TRUE")
    List<Room> findByIsActiveTrue();
}
