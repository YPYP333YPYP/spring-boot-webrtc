package com.example.webrtc.dto.request;

import lombok.Data;

@Data
public class JoinRoomRequest {
    private String name;
    private String roomId;
}
