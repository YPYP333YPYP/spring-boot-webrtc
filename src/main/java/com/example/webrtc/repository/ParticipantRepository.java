package com.example.webrtc.repository;

import com.example.webrtc.domain.Participant;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParticipantRepository extends CrudRepository<Participant, String> {

    int countByRoomId(String roomId);

    List<Participant> findByRoomId(String roomId);
}
