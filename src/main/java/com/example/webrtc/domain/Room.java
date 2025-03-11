package com.example.webrtc.domain;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.data.annotation.CreatedDate;

public record Room (

    String id,

    @NotBlank(message = "The room name must be defined")
    String name,

    @CreatedDate
    LocalDateTime createdAt,

    @Positive(message = "The room participant limit must be greater than zero")
    int participantLimit,

    boolean isActive

) {
    public static Room of(
        String name, int participantLimit, boolean isActive
    ) {
        return new Room(
            UUID.randomUUID().toString(), name, null, participantLimit, isActive
        );
    }
}
