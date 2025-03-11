package com.example.webrtc.domain;

import org.springframework.data.annotation.Id;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public record Participant(
    @Id
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
        String name, String roomId
) {
    return new Participant(null, name, roomId, LocalDateTime.now(), true, true);
}

}
