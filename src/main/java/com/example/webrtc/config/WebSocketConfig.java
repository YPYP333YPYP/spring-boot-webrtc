package com.example.webrtc.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker // STOMP 프로토콜 기반 메세지 브로커 기반의 WebSocket 통신
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Websocket 연결 엔드포인트
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-endpoint")
            .setAllowedOriginPatterns("*") // CORS Setting
            .withSockJS();
    }


    /**
     * 메세지 브로커 동작 설정
     * /topic -> subscriber broadcast
     * /app -> 메세지 처리 컨트롤러 주소 지정
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
}
