package com.example.webrtc.domain;


import org.springframework.data.annotation.Id;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record Room (
    @Id
    String id,

    @NotBlank(message = "The room name must be defined")
    String name,

    LocalDateTime createdAt,

    @Positive(message = "The room participant limit must be greater than zero")
    int participantLimit,


    boolean isActive

) {
    public static Room of(
        String name, int participantLimit, boolean isActive
    ) {
        return new Room(
            null, name, LocalDateTime.now(), participantLimit, isActive
        );
    }

}
