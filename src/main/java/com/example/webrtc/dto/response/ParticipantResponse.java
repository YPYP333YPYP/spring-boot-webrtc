package com.example.webrtc.dto.response;

import com.example.webrtc.domain.Participant;
import lombok.Data;

@Data
public class ParticipantResponse {
    private String id;
    private String name;
    private boolean hasAudio;
    private boolean hasVideo;

    public static ParticipantResponse from(Participant participant) {
        ParticipantResponse response = new ParticipantResponse();
        response.setId(participant.id());
        response.setName(participant.name());
        response.setHasAudio(participant.hasAudio());
        response.setHasVideo(participant.hasVideo());
        return response;
    }
}