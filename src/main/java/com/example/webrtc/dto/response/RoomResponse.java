package com.example.webrtc.dto.response;

import com.example.webrtc.domain.Room;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class RoomResponse {
    private String id;
    private String name;
    private LocalDateTime createdAt;
    private int participantLimit;
    private int participantCount;

    public static RoomResponse from(Room room, int participantCount) {
        RoomResponse response = new RoomResponse();
        response.setId(room.id());
        response.setName(room.name());
        response.setCreatedAt(room.createdAt());
        response.setParticipantLimit(room.participantLimit());
        response.setParticipantCount(participantCount);
        return response;
    }
}