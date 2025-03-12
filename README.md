# WebRTC 기본 개념 정리

## 📌 WebRTC란?
**WebRTC (Web Real-Time Communication)**
- 브라우저 간 **실시간 오디오, 비디오, 데이터 전송**을 지원하는 기술
- 화상 통화, P2P 파일 전송 등에 사용됨
- 브라우저에서 별도 플러그인 없이 동작 가능

## 🏗 WebRTC 핵심 개념

### 1️⃣ **Peer (피어)**
- WebRTC 연결에 참여하는 사용자 (예: 나, 친구)
- 서로 직접 연결을 맺는 대상

### 2️⃣ **ICE (Interactive Connectivity Establishment)**
- 피어 간 **연결 가능한 네트워크 경로를 찾는 과정**
- 방화벽이나 공유기 뒤에서도 연결할 수 있도록 도와줌

### 3️⃣ **STUN / TURN 서버**
#### ✅ **STUN (Session Traversal Utilities for NAT)**
- **공인 IP 주소 확인**을 도와주는 서버
- 대부분의 경우 **P2P 직접 연결**이 가능하게 함
- 예시: `stun:stun.l.google.com:19302`

#### ❌ **TURN (Traversal Using Relays around NAT)**
- **P2P 연결이 안 될 때 중계 서버 역할**
- 방화벽이 있는 환경에서 사용 (속도 느림, 비용 발생 가능)

| 서버 종류 | 역할 | 속도 | 비용 |
|-----------|-------------|-----|------|
| **STUN** | 공인 IP 확인, 직접 연결 지원 | 빠름 ⚡ | 무료 |
| **TURN** | 중계 서버 역할 (P2P 불가능 시) | 느림 🐢 | 유료 가능 |

## 🔄 WebRTC 연결 과정
1. **Signaling (시그널링) →** WebSocket 등을 이용해 피어 간 연결 정보 교환
2. **ICE Candidate Gathering →** STUN 서버를 통해 공인 IP 확인 및 네트워크 경로 탐색
3. **P2P Connection →** P2P 연결 가능 시 직접 연결, 불가능하면 TURN 서버 경유

## 📝 정리
| 개념 | 설명 |
|------|------|
| **Peer (피어)** | WebRTC 연결에 참여하는 사용자 |
| **P2P (Peer-to-Peer)** | 서버 없이 피어 간 직접 연결 |
| **ICE (Interactive Connectivity Establishment)** | 피어 간 연결을 성립하는 과정 |
| **STUN 서버** | 공인 IP 확인, 직접 연결 지원 |
| **TURN 서버** | 중계 서버 역할 (P2P 불가능 시) |
| **Signaling (시그널링)** | WebSocket 등을 이용해 연결 정보 교환 |

> **📌 참고:** WebRTC 자체에는 시그널링 기능이 없기 때문에 WebSocket(STOMP) 같은 별도 서버가 필요함.

