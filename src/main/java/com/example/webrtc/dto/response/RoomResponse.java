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
        response.setId(room.getId());
        response.setName(room.getName());
        response.setCreatedAt(room.getCreatedAt());
        response.setParticipantLimit(room.getParticipantLimit());
        response.setParticipantCount(participantCount);
        return response;
    }
}