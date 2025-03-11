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
        response.setId(participant.getId());
        response.setName(participant.getName());
        response.setHasAudio(participant.isHasAudio());
        response.setHasVideo(participant.isHasVideo());
        return response;
    }
}