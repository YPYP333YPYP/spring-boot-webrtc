package com.example.webrtc.controller;

import com.example.webrtc.dto.request.SignalRequest;
import com.example.webrtc.service.WebRTCService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class WebRTCController {

    private final WebRTCService webRTCService;

    @MessageMapping("/signal")
    public void processSignal(SignalRequest signalRequest) {
        webRTCService.processSignal(signalRequest);
    }
}
