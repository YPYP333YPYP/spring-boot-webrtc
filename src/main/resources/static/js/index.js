document.addEventListener('DOMContentLoaded', function() {
  const createRoomForm = document.getElementById('createRoomForm');

  createRoomForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const roomName = document.getElementById('roomName').value;
    const participantLimit = document.getElementById('participantLimit').value;

    // 회의실 생성 요청
    fetch('/api/rooms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: roomName,
        participantLimit: parseInt(participantLimit)
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('회의실 생성에 실패했습니다.');
      }
      return response.json();
    })
    .then(data => {
      // 생성된 회의실로 이동
      window.location.href = `/rooms`;
    })
    .catch(error => {
      console.error('Error:', error);
      alert('회의실 생성 중 오류가 발생했습니다: ' + error.message);
    });
  });
});