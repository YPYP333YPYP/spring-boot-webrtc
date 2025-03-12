package com.example.webrtc.domain;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

public record ChatMessage(

    @NotBlank(message = "The sender must be defined")
    String sender,

    @NotBlank(message = "The content must be defined")
    String content,

    @NotBlank(message = "The roomId must be defined")
    String roomId,

    LocalDateTime timestamp

) { public static ChatMessage of(
    String sender, String content, String roomId
) {
    return new ChatMessage(sender, content, roomId, LocalDateTime.now());
}

}
