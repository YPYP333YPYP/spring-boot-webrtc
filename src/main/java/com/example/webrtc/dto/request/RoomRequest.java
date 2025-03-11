package com.example.webrtc.dto.request;

import lombok.Data;

@Data
public class RoomRequest {
    private String name;
    private Integer participantLimit;
}