import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export const useWebSocket = (roomCode) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomStatus, setRoomStatus] = useState(null);
  const [roles, setRoles] = useState(null);
  const [timer, setTimer] = useState(null);
  const [twist, setTwist] = useState(null);
  
  const clientRef = useRef(null);

  const connect = useCallback(() => {
    if (!roomCode || isConnected) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => console.log('WebSocket:', str),
      
      onConnect: () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);

        // Subscribe to room topics
        client.subscribe(`/topic/room/${roomCode}/messages`, (message) => {
          const messageData = JSON.parse(message.body);
          setMessages(prev => [...prev, messageData]);
        });

        client.subscribe(`/topic/room/${roomCode}/status`, (message) => {
          const statusData = JSON.parse(message.body);
          setRoomStatus(statusData);
        });

        client.subscribe(`/topic/room/${roomCode}/roles`, (message) => {
          const rolesData = JSON.parse(message.body);
          setRoles(rolesData);
        });

        client.subscribe(`/topic/room/${roomCode}/timer`, (message) => {
          const timerData = JSON.parse(message.body);
          setTimer(timerData);
        });

        client.subscribe(`/user/queue/room/${roomCode}/twist`, (message) => {
          const twistData = JSON.parse(message.body);
          setTwist(twistData);
        });
      },

      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
      },

      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
        setIsConnected(false);
      }
    });

    client.activate();
    clientRef.current = client;
  }, [roomCode, isConnected]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((content, messageType = 'REGULAR', playerId) => {
    if (clientRef.current && isConnected) {
      const message = {
        content,
        messageType,
        playerId
      };
      
      clientRef.current.publish({
        destination: `/app/room/${roomCode}/send`,
        body: JSON.stringify(message)
      });
    }
  }, [roomCode, isConnected]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    messages,
    roomStatus,
    roles,
    timer,
    twist,
    connect,
    disconnect,
    sendMessage
  };
};