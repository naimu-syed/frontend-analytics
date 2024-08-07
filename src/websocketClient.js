import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const socket = new SockJS('http://localhost:8080/ws');
const stompClient = new Client({
  webSocketFactory: () => socket,
  onConnect: () => console.log('WebSocket Connected'),
  onDisconnect: () => console.log('WebSocket Disconnected'),
});

export default stompClient;
