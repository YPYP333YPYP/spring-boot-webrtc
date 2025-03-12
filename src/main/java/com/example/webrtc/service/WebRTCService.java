package com.example.webrtc.service;

import com.example.webrtc.dto.request.SignalRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;


@Service
@RequiredArgsConstructor
public class WebRTCService {

    private final SimpMessagingTemplate simpMessagingTemplate;

    /*
     * WebSocket을 통한 시그널링 처리
     */

    public void processSignal(SignalRequest request) {
        if (request.getTo() != null && !request.getTo().isEmpty()) {
            // 특정 참가자에게 전달 (1:1)
            simpMessagingTemplate.convertAndSend("/topic/signal/" + request.getTo(), request);
        } else {
            // 방 전체에 전달 (브로드캐스트)
            simpMessagingTemplate.convertAndSend("/topic/signal/room/" + request.getRoomId(), request);
        }
    }
}
