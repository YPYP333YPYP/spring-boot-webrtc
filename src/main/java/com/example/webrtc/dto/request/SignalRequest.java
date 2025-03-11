package com.example.webrtc.dto.request;

import lombok.Data;

@Data
public class SignalRequest {
    private String from;
    private String to;
    private String type; // offer, answer, ice-candidate
    private Object data; // SDP 또는 ICE candidate 정보
    private String roomId;
}
