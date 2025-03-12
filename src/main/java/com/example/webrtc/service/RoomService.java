package com.example.webrtc.service;

import com.example.webrtc.domain.Participant;
import com.example.webrtc.domain.Room;
import com.example.webrtc.dto.request.RoomRequest;
import com.example.webrtc.dto.response.RoomResponse;
import com.example.webrtc.repository.ParticipantRepository;
import com.example.webrtc.repository.RoomRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final ParticipantRepository participantRepository;

    // 채팅방 생성
    @Transactional
    public Room createRoom(RoomRequest request) {
        Room room = Room.of(request.getName(), request.getParticipantLimit(), true);
        return roomRepository.save(room);
    }

    // 채팅방 단일 조회
    public Room getRoom(String roomId) {
        return roomRepository.findById(roomId).orElseThrow();
    }


    // 활성화된 모든 채팅방 조회
    public List<RoomResponse> getAllActiveRooms() {
        return roomRepository.findByIsActiveTrue().stream()
            .map(room -> RoomResponse.from(room, getParticipantCount(room.id())))
            .collect(Collectors.toList());
    }

    // 채팅방에 참가자 추가
    @Transactional
    public Participant addParticipant(String roomId,String participantName) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (roomOpt.isEmpty() || !roomOpt.get().isActive()) {
            return null;
        }

        Room room = roomOpt.get();
        if (getParticipantCount(roomId) >= room.participantLimit()) {
            return null; // 방이 꽉 찼을 때
        }

        Participant participant = new Participant(null, participantName, room.id(), LocalDateTime.now(),true, true);
        return participantRepository.save(participant);
    }

    // 채팅방에서 참가자 추방
    @Transactional
    public void removeParticipant(String roomId, String participantId) {
        participantRepository.findById(participantId).ifPresent(participant -> {
            participantRepository.delete(participant);

            // 방에 아무도 없으면 방 비활성화
            int count = participantRepository.countByRoomId(roomId);
            if (count == 0) {
                roomRepository.findById(roomId).ifPresent(room -> {
                    Room updatedRoom = new Room(
                        room.id(),
                        room.name(),
                        room.createdAt(),
                        room.participantLimit(),
                        false
                    );
                    roomRepository.save(updatedRoom);
                });
            }
        });
    }

    // 채팅방에 모든 참가자 조회
    public List<Participant> getRoomParticipants(String roomId) {
        return participantRepository.findByRoomId(roomId);
    }

    // 채팅방에 참가자 수 조회
    public int getParticipantCount(String roomId) {
        return participantRepository.countByRoomId(roomId);
    }

    // 채팅방이 가득 찼는지 확인
    public boolean isRoomFull(String roomId) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (roomOpt.isEmpty()) {
            return true;
        }

        Room room = roomOpt.get();
        int currentParticipants = getParticipantCount(roomId);
        return currentParticipants >= room.participantLimit();
    }
}
