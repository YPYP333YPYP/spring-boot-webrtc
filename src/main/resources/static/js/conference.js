document.addEventListener('DOMContentLoaded', function() {

  // 세션 스토리지에서 정보 가져오기
  const participantId = sessionStorage.getItem('participantId');
  console.log(participantId);
  const participantName = sessionStorage.getItem('participantName');
  console.log(participantName);
  const roomId = sessionStorage.getItem('roomId') || document.querySelector('meta[name="roomId"]').getAttribute('content');
  console.log(roomId);
  // 정보가 없으면 회의실 목록으로 리다이렉트
  if (!participantId || !participantName) {
    window.location.href = '/rooms';
    return;
  }

  // WebSocket 및 STOMP 관련 변수
  let stompClient = null;

  // WebRTC 관련 변수
  const peerConnections = {};
  const localStream = null;
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // UI 요소
  const videoGrid = document.getElementById('videoGrid');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const participantCountElement = document.getElementById('participantCount');
  const toggleChatBtn = document.getElementById('toggleChatBtn');

  // 현재 연결된 참가자 목록
  let participants = [];

  // 미디어 제어 상태
  let audioEnabled = true;
  let videoEnabled = true;

  // WebSocket 연결 및 STOMP 클라이언트 초기화
  function connectWebSocket() {
    console.log(window.Stomp);  // undefined가 아니어야 함
    const socket = new SockJS('/ws-endpoint');
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function() {
      console.log('Connected to WebSocket');

      // 신호 메시지 구독 (1:1)
      stompClient.subscribe(`/topic/signal/${participantId}`, function(message) {
        const signal = JSON.parse(message.body);
        handleSignal(signal);
      });

      // 방 공지 구독 (참가자 입장/퇴장)
      stompClient.subscribe(`/topic/room/${roomId}/participants`, function(message) {
        const newParticipant = JSON.parse(message.body);

        // 자신이 아닌 경우만 처리
        if (newParticipant.id !== participantId) {
          participants.push(newParticipant);
          updateParticipantCount();
          addSystemMessage(`${newParticipant.name}님이 입장했습니다.`);

          // 새 참가자에게 WebRTC 연결 시도
          if (localStream) {
            createPeerConnection(newParticipant.id);
          }
        }
      });

      // 퇴장 메시지 구독
      stompClient.subscribe(`/topic/room/${roomId}/leave`, function(message) {
        const leftParticipantId = message.body;

        // 연결 종료 및 UI 업데이트
        if (peerConnections[leftParticipantId]) {
          peerConnections[leftParticipantId].close();
          delete peerConnections[leftParticipantId];
        }

        // 참가자 목록에서 제거
        const leftParticipant = participants.find(p => p.id === leftParticipantId);
        if (leftParticipant) {
          addSystemMessage(`${leftParticipant.name}님이 퇴장했습니다.`);
          participants = participants.filter(p => p.id !== leftParticipantId);
          updateParticipantCount();
        }

        // 비디오 요소 제거
        const videoElement = document.getElementById(`video-${leftParticipantId}`);
        if (videoElement) {
          videoElement.closest('.video-item').remove();
        }
      });

      // 채팅 메시지 구독
      stompClient.subscribe(`/topic/chat/${roomId}`, function(message) {
        const chatMessage = JSON.parse(message.body);
        addChatMessage(chatMessage);
      });

      // 이제 참가자 목록을 가져오고, 미디어 스트림 초기화
      fetchParticipants().then(initializeMedia);
    }, function(error) {
      console.error('WebSocket 연결 오류:', error);
      addSystemMessage('서버 연결에 실패했습니다. 페이지를 새로고침하세요.', 'error');
    });
  }

  // 현재 방의 참가자 목록 가져오기
  async function fetchParticipants() {
    try {
      const response = await fetch(`/api/rooms/${roomId}/participants`);
      if (!response.ok) {
        throw new Error('참가자 목록을 가져오는데 실패했습니다.');
      }

      const data = await response.json();
      participants = data.filter(p => p.id !== participantId); // 자신 제외
      updateParticipantCount();
      return data;
    } catch (error) {
      console.error('Error:', error);
      addSystemMessage('참가자 정보를 가져오는데 실패했습니다.', 'error');
      return [];
    }
  }

  // 참가자 수 업데이트
  function updateParticipantCount() {
    participantCountElement.textContent = `${participants.length + 1}명 참여 중`;
  }

  // 시스템 메시지 추가
  function addSystemMessage(text, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `system-message ${type}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 채팅 메시지 추가
  function addChatMessage(message) {
    const isMe = message.sender === participantName;
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isMe ? 'my-message' : ''}`;

    messageDiv.innerHTML = `
            <div class="message-header">
                <span class="sender">${isMe ? '나' : message.sender}</span>
                <span class="time">${formatTime(message.timestamp)}</span>
            </div>
            <div class="message-content">${message.content}</div>
        `;

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // 시간 포맷 함수
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  // 미디어 스트림 초기화
  async function initializeMedia() {
    try {
      // 먼저 비디오와 오디오 모두 요청
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
      });

      // 성공한 경우 스트림 처리
      window.localStream = stream;
      addVideoStream(participantId, participantName, stream, true);
      // ...나머지 코드...

    } catch (error) {
      console.error('Media 가져오기 오류:', error);

      // 오류 종류에 따른 처리
      if (error.name === 'NotFoundError') {
        // 장치가 없는 경우 대체 옵션 제공
        addSystemMessage('카메라 또는 마이크를 찾을 수 없습니다. 오디오만으로 시도해볼까요?', 'warning');

        // 사용자에게 선택지를 제공하거나, 자동으로 오디오만 시도
        try {
          // 오디오만으로 다시 시도
          const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: false
          });

          window.localStream = audioOnlyStream;
          // 비디오 없이 참가자 표시 (아바타 이미지 등으로 대체)
          addVideoStream(participantId, participantName, audioOnlyStream, true, true); // 마지막 인자는 videoOnly 여부

          // 이미 접속해 있는 참가자들에게 연결
          participants.forEach(participant => {
            createPeerConnection(participant.id);
          });

          addSystemMessage('오디오 전용으로 연결되었습니다.');
        } catch (audioError) {
          console.error('오디오 가져오기 오류:', audioError);
          addSystemMessage('오디오 연결도 실패했습니다. 장치를 확인하고 페이지를 새로고침하세요.', 'error');
        }
      } else if (error.name === 'NotAllowedError') {
        addSystemMessage('카메라 또는 마이크 접근 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.', 'error');
      } else {
        addSystemMessage('미디어 장치 연결에 문제가 발생했습니다. 장치를 확인하고 페이지를 새로고침하세요.', 'error');
      }
    }
  }

  // 비디오 스트림 추가
  function addVideoStream(userId, userName, stream, isLocal = false, audioOnly = false) {
    const videoCol = document.createElement('div');
    videoCol.className = 'col-md-6 col-lg-4 video-item';

    const videoWrap = document.createElement('div');
    videoWrap.className = 'video-wrap';

    const video = document.createElement('video');
    video.id = `video-${userId}`;
    video.srcObject = stream;
    video.autoplay = true;

    if (isLocal) {
      video.muted = true; // 자기 자신의 소리는 음소거
      video.classList.add('local-video');
    }

    const videoInfo = document.createElement('div');
    videoInfo.className = 'video-info';
    videoInfo.innerHTML = `
        <span class="participant-name">${userName}${isLocal ? ' (나)' : ''}</span>
    `;

    if (isLocal) {
      const controls = document.createElement('div');
      controls.className = 'video-controls';

      // 각 버튼에 고유 ID 부여
      const toggleAudioBtn = document.createElement('button');
      toggleAudioBtn.className = `btn btn-sm ${audioEnabled ? 'btn-light' : 'btn-danger'}`;
      toggleAudioBtn.innerHTML = `<i class="bi ${audioEnabled ? 'bi-mic' : 'bi-mic-mute'}"></i>`;
      toggleAudioBtn.addEventListener('click', toggleAudio);

      const toggleVideoBtn = document.createElement('button');
      toggleVideoBtn.className = `btn btn-sm ${videoEnabled ? 'btn-light' : 'btn-danger'}`;
      toggleVideoBtn.innerHTML = `<i class="bi ${videoEnabled ? 'bi-camera-video' : 'bi-camera-video-off'}"></i>`;
      toggleVideoBtn.addEventListener('click', toggleVideo);

      const leaveBtn = document.createElement('button');
      leaveBtn.className = 'btn btn-sm btn-danger';
      leaveBtn.innerHTML = '<i class="bi bi-box-arrow-right"></i>';
      leaveBtn.addEventListener('click', leaveRoom);

      controls.appendChild(toggleAudioBtn);
      controls.appendChild(toggleVideoBtn);
      controls.appendChild(leaveBtn);
      videoInfo.appendChild(controls);
    }

    videoWrap.appendChild(video);
    videoWrap.appendChild(videoInfo);
    videoCol.appendChild(videoWrap);
    videoGrid.appendChild(videoCol);
  }

  // PeerConnection 생성
  function createPeerConnection(targetId) {
    if (peerConnections[targetId]) {
      console.log(`Existing connection to ${targetId}, skipping`);
      return;
    }

    const peerConnection = new RTCPeerConnection(configuration);
    peerConnections[targetId] = peerConnection;

    // 로컬 스트림의 모든 트랙을 피어 연결에 추가
    window.localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, window.localStream);
    });

    // ICE 후보 처리
    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        sendSignal({
          from: participantId,
          to: targetId,
          type: 'ice-candidate',
          data: event.candidate,
          roomId: roomId
        });
      }
    };

    // 스트림 추가 처리
    peerConnection.ontrack = event => {
      // 타겟 참가자 정보 찾기
      const participant = participants.find(p => p.id === targetId);
      if (participant && event.streams && event.streams[0]) {
        // 이미 비디오가 있는지 확인
        const existingVideo = document.getElementById(`video-${targetId}`);
        if (!existingVideo) {
          addVideoStream(targetId, participant.name, event.streams[0]);
        }
      }
    };

    // 연결 상태 변경 처리
    peerConnection.onconnectionstatechange = event => {
      switch(peerConnection.connectionState) {
        case "disconnected":
        case "failed":
          console.log(`Connection to ${targetId} was lost`);
          if (peerConnections[targetId]) {
            peerConnections[targetId].close();
            delete peerConnections[targetId];
          }
          break;
      }
    };

    // Offer 생성 및 전송
    peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .then(() => {
      sendSignal({
        from: participantId,
        to: targetId,
        type: 'offer',
        data: peerConnection.localDescription,
        roomId: roomId
      });
    })
    .catch(error => {
      console.error('Offer 생성 오류:', error);
    });

    return peerConnection;
  }

  // 신호 메시지 처리
  function handleSignal(signal) {
    const { from, type, data } = signal;

    // 해당 참가자와의 연결이 없으면 생성
    if (!peerConnections[from]) {
      if (type === 'offer') {
        peerConnections[from] = new RTCPeerConnection(configuration);

        // 로컬 스트림의 모든 트랙을 피어 연결에 추가
        window.localStream.getTracks().forEach(track => {
          peerConnections[from].addTrack(track, window.localStream);
        });

        // ICE 후보 처리
        peerConnections[from].onicecandidate = event => {
          if (event.candidate) {
            sendSignal({
              from: participantId,
              to: from,
              type: 'ice-candidate',
              data: event.candidate,
              roomId: roomId
            });
          }
        };

        // 스트림 추가 처리
        peerConnections[from].ontrack = event => {
          const participant = participants.find(p => p.id === from);
          if (participant && event.streams && event.streams[0]) {
            const existingVideo = document.getElementById(`video-${from}`);
            if (!existingVideo) {
              addVideoStream(from, participant.name, event.streams[0]);
            }
          }
        };
      }
    }

    // 시그널 타입에 따른 처리
    switch (type) {
      case 'offer':
        peerConnections[from].setRemoteDescription(new RTCSessionDescription(data))
        .then(() => peerConnections[from].createAnswer())
        .then(answer => peerConnections[from].setLocalDescription(answer))
        .then(() => {
          sendSignal({
            from: participantId,
            to: from,
            type: 'answer',
            data: peerConnections[from].localDescription,
            roomId: roomId
          });
        })
        .catch(error => {
          console.error('Answer 생성 오류:', error);
        });
        break;

      case 'answer':
        peerConnections[from].setRemoteDescription(new RTCSessionDescription(data))
        .catch(error => {
          console.error('Remote description 설정 오류:', error);
        });
        break;

      case 'ice-candidate':
        if (data) {
          peerConnections[from].addIceCandidate(new RTCIceCandidate(data))
          .catch(error => {
            console.error('ICE candidate 추가 오류:', error);
          });
        }
        break;
    }
  }

  // 시그널 전송
  function sendSignal(signal) {
    if (stompClient && stompClient.connected) {
      stompClient.send('/app/signal', {}, JSON.stringify(signal));
    } else {
      console.error('WebSocket이 연결되지 않았습니다.');
    }
  }

  // 오디오 토글
  function toggleAudio() {
    if (!window.localStream) return;

    const audioTrack = window.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioEnabled = !audioEnabled;
      audioTrack.enabled = audioEnabled;

      const btn = document.getElementById('toggleAudio');
      const icon = btn.querySelector('i');

      if (audioEnabled) {
        btn.classList.replace('btn-danger', 'btn-light');
        icon.classList.replace('bi-mic-mute', 'bi-mic');
      } else {
        btn.classList.replace('btn-light', 'btn-danger');
        icon.classList.replace('bi-mic', 'bi-mic-mute');
      }
    }
  }

  // 비디오 토글
  function toggleVideo() {
    if (!window.localStream) return;

    const videoTrack = window.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoEnabled = !videoEnabled;
      videoTrack.enabled = videoEnabled;

      const btn = document.getElementById('toggleVideo');
      const icon = btn.querySelector('i');

      if (videoEnabled) {
        btn.classList.replace('btn-danger', 'btn-light');
        icon.classList.replace('bi-camera-video-off', 'bi-camera-video');
      } else {
        btn.classList.replace('btn-light', 'btn-danger');
        icon.classList.replace('bi-camera-video', 'bi-camera-video-off');
      }
    }
  }

  // 회의실 나가기
  function leaveRoom() {
    if (confirm('정말로 회의를 떠나시겠습니까?')) {
      // 서버에 퇴장 알림
      fetch(`/api/rooms/${roomId}/leave?participantId=${participantId}`, {
        method: 'POST'
      })
      .then(() => {
        // 모든 연결 종료
        Object.values(peerConnections).forEach(pc => pc.close());

        // 로컬 스트림 종료
        if (window.localStream) {
          window.localStream.getTracks().forEach(track => track.stop());
        }

        // WebSocket 연결 종료
        if (stompClient) {
          stompClient.disconnect();
        }

        // 세션 스토리지 정리
        sessionStorage.removeItem('participantId');
        sessionStorage.removeItem('participantName');
        sessionStorage.removeItem('roomId');

        // 회의실 목록으로 이동
        window.location.href = '/rooms';
      })
      .catch(error => {
        console.error('Error:', error);
        // 에러가 있어도 강제로 나가기
        window.location.href = '/rooms';
      });
    }
  }

  // 채팅 메시지 전송
  chatForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const content = chatInput.value.trim();
    if (!content) return;

    const message = {
      sender: participantName,
      content: content,
      roomId: roomId
    };

    if (stompClient && stompClient.connected) {
      stompClient.send('/app/chat', {}, JSON.stringify(message));
      chatInput.value = '';
    } else {
      addSystemMessage('메시지 전송에 실패했습니다. 연결 상태를 확인하세요.', 'error');
    }
  });

  // 모바일에서 채팅창 토글
  toggleChatBtn.addEventListener('click', function() {
    const chatContainer = document.querySelector('.chat-container');
    const videoContainer = document.querySelector('.video-container');

    chatContainer.classList.toggle('d-none');
    videoContainer.classList.toggle('col-md-12');
    videoContainer.classList.toggle('col-md-9');
  });

  // 브라우저 닫기/새로고침 시 처리
  window.addEventListener('beforeunload', function() {
    // 서버에 퇴장 알림 시도
    navigator.sendBeacon(`/api/rooms/${roomId}/leave?participantId=${participantId}`);
  });

  // WebSocket 연결 시작
  connectWebSocket();
});