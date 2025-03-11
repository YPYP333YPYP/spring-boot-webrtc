package com.example.webrtc.service;


import com.example.webrtc.domain.ChatMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * WebSocket을 통한 메세지 전달
     */
    public void sendChatMessage(ChatMessage message) {
        messagingTemplate.convertAndSend("/topic/chat/" + message.roomId(), message);
    }
}
