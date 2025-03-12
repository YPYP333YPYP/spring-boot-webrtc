document.addEventListener('DOMContentLoaded', function() {
  const roomsList = document.getElementById('roomsList');
  const loadingRooms = document.getElementById('loadingRooms');
  const noRooms = document.getElementById('noRooms');
  const joinRoomModal = new bootstrap.Modal(document.getElementById('joinRoomModal'));
  const joinRoomForm = document.getElementById('joinRoomForm');
  const joinRoomButton = document.getElementById('joinRoomButton');
  const joinRoomId = document.getElementById('joinRoomId');
  const participantName = document.getElementById('participantName');

  // 회의실 목록 로드
  function loadRooms() {
    fetch('/api/rooms')
    .then(response => response.json())
    .then(rooms => {
      // 로딩 표시 제거
      loadingRooms.classList.add('d-none');

      // 회의실 목록 표시
      if (rooms.length === 0) {
        noRooms.classList.remove('d-none');
      } else {
        rooms.forEach(room => {
          const roomCard = createRoomCard(room);
          roomsList.appendChild(roomCard);
        });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      loadingRooms.classList.add('d-none');
      roomsList.innerHTML = `
                    <div class="col-12 text-center">
                        <p class="text-danger">회의실 목록을 불러오는 데 실패했습니다.</p>
                        <button class="btn btn-primary mt-2" onclick="location.reload()">새로고침</button>
                    </div>
                `;
    });
  }

  // 회의실 카드 생성 함수
  function createRoomCard(room) {
    const col = document.createElement('div');
    col.className = 'col-md-4';

    const isFull = room.participantCount >= room.participantLimit;
    const statusClass = isFull ? 'text-danger' : 'text-success';
    const statusText = isFull ? '꽉 참' : '참여 가능';

    col.innerHTML = `
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${room.name}</h5>
                    <p class="card-text">
                        <small class="text-muted">생성: ${formatDate(room.createdAt)}</small><br>
                        <span class="${statusClass}">
                            <i class="bi ${isFull ? 'bi-x-circle' : 'bi-check-circle'}"></i> 
                            ${statusText} (${room.participantCount}/${room.participantLimit})
                        </span>
                    </p>
                </div>
                <div class="card-footer bg-transparent">
                    <button class="btn btn-primary w-100 join-room-btn" 
                            data-room-id="${room.id}" 
                            data-room-name="${room.name}" 
                            ${isFull ? 'disabled' : ''}>
                        ${isFull ? '입장 불가' : '참가하기'}
                    </button>
                </div>
            </div>
        `;

    // 참가 버튼에 이벤트 리스너 추가
    const joinButton = col.querySelector('.join-room-btn');
    if (!isFull) {
      joinButton.addEventListener('click', function() {
        joinRoomId.value = room.id;
        joinRoomModal.show();
      });
    }

    return col;
  }

  // 날짜 포맷 함수
  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString();
  }

  // 참가 버튼 클릭 처리
  joinRoomButton.addEventListener('click', function() {
    const roomId = joinRoomId.value;
    const name = participantName.value.trim();

    if (!name) {
      alert('이름을 입력해주세요.');
      return;
    }

    // 참가자 ID 생성 (UUID)
    const participantId = generateUUID();

    // 세션 스토리지에 참가자 정보 저장
    sessionStorage.setItem('participantId', participantId);
    sessionStorage.setItem('participantName', name);
    sessionStorage.setItem('roomId', roomId);

    // 회의실 참가 요청
    fetch(`/api/rooms/${roomId}/join?name=${encodeURIComponent(name)}&participantId=${participantId}`, {
      method: 'POST'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('회의실 참가에 실패했습니다.');
      }
      return response.json();
    })
    .then(() => {
      // 회의실 페이지로 이동
      window.location.href = `/room/${roomId}`;
    })
    .catch(error => {
      console.error('Error:', error);
      alert('회의실 참가 중 오류가 발생했습니다: ' + error.message);
    });
  });

  // UUID 생성 함수
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 페이지 로드 시 회의실 목록 로드
  loadRooms();
});