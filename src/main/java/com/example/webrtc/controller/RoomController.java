package com.example.webrtc.controller;

import com.example.webrtc.domain.Participant;
import com.example.webrtc.domain.Room;
import com.example.webrtc.dto.request.RoomRequest;
import com.example.webrtc.dto.response.ParticipantResponse;
import com.example.webrtc.dto.response.RoomResponse;
import com.example.webrtc.service.RoomService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;
    private final SimpMessagingTemplate messagingTemplate;


    @GetMapping("/rooms")
    public String getRoomsPage(Model model) {
        model.addAttribute("title", "회의실 목록");
        return "rooms";
    }

    @GetMapping("/api/rooms")
    @ResponseBody
    public List<RoomResponse> getAllRooms() {
        return roomService.getAllActiveRooms();
    }

    @PostMapping("/api/rooms")
    @ResponseBody
    public ResponseEntity<RoomResponse> createRoom(@RequestBody RoomRequest request) {
        Room room = roomService.createRoom(request);
        RoomResponse response = RoomResponse.from(room, 0);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/room/{roomId}")
    public String getRoom(@PathVariable String roomId, Model model) {
        Room room = roomService.getRoom(roomId);
        if (room == null || !room.isActive()) {
            return "redirect:/rooms";
        }

        model.addAttribute("roomId", roomId);
        model.addAttribute("roomName", room.name());
        return "conference";
    }

    @GetMapping("/api/rooms/{roomId}/participants")
    @ResponseBody
    public List<ParticipantResponse> getRoomParticipants(@PathVariable String roomId) {
        List<Participant> participants = roomService.getRoomParticipants(roomId);
        return participants.stream()
            .map(ParticipantResponse::from)
            .collect(Collectors.toList());
    }

    @PostMapping("/api/rooms/{roomId}/join")
    @ResponseBody
    public ResponseEntity<?> joinRoom(@PathVariable String roomId, @RequestParam String name) {
        if (roomService.isRoomFull(roomId)) {
            return ResponseEntity.badRequest().body("Room is full");
        }

        Participant participant = roomService.addParticipant(roomId, name);
        if (participant == null) {
            return ResponseEntity.badRequest().body("Failed to join room");
        }

        // 새 참가자 입장을 방의 모든 사용자에게 알림
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/participants",
            ParticipantResponse.from(participant));

        return ResponseEntity.ok(ParticipantResponse.from(participant));
    }

    @PostMapping("/api/rooms/{roomId}/leave")
    @ResponseBody
    public ResponseEntity<?> leaveRoom(@PathVariable String roomId, @RequestParam String participantId) {
        roomService.removeParticipant(roomId, participantId);

        // 참가자 퇴장을 방의 모든 사용자에게 알림
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/leave", participantId);

        return ResponseEntity.ok().build();
    }
}
