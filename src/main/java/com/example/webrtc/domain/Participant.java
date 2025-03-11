package com.example.webrtc.domain;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public record Participant(

    String id,

    @NotBlank(message = "The participant name must be defined")
    String name,

    @NotBlank(message = "The participant room id must be defined")
    String roomId,

    LocalDateTime joinedAt,

    boolean hasAudio,
    boolean hasVideo
) {
    public static Participant of(
        String id, String name, String roomId
) {
    return new Participant(id, name, roomId, LocalDateTime.now(), true, true);
}

}
