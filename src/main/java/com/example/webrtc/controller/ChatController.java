package com.example.webrtc.controller;


import com.example.webrtc.domain.ChatMessage;
import com.example.webrtc.service.ChatService;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @MessageMapping("/chat")
    public void sendMessage(ChatMessage message) {
        chatService.sendChatMessage(message);
    }


}
