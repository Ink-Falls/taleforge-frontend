// src/hooks/useWebSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import '../utils/socket-polyfill';

export const useWebSocket = (roomCode) => {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [roomStatus, setRoomStatus] = useState(null);
  const [roles, setRoles] = useState(null);
  const [timer, setTimer] = useState(null);
  const [twist, setTwist] = useState(null);
  
  const clientRef = useRef(null);
  const subscriptionsRef = useRef([]);
  const connectingRef = useRef(false);
  const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

  // Cleanup function to properly disconnect
  const cleanupConnection = useCallback(() => {
    if (clientRef.current) {
      try {
        // Clear all subscriptions first
        subscriptionsRef.current.forEach(sub => {
          try {
            if (sub && sub.unsubscribe) {
              sub.unsubscribe();
            }
          } catch (e) {
            console.error("Failed to unsubscribe:", e);
          }
        });
        subscriptionsRef.current = [];
        
        // Then disconnect the client
        if (clientRef.current.connected) {
          clientRef.current.deactivate();
        }
        clientRef.current = null;
        setIsConnected(false);
      } catch (e) {
        console.error("Error during WebSocket cleanup:", e);
      }
    }
  }, []);

  // Main connect function
  const connect = useCallback(() => {
    if (!roomCode || isConnected || connectingRef.current || clientRef.current) {
      return;
    }
    
    console.log("Initializing WebSocket connection to:", wsUrl);
    connectingRef.current = true;

    const client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      debug: (str) => console.log('WebSocket:', str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        console.log('Connected to WebSocket');
        setIsConnected(true);
        connectingRef.current = false;

        // Store subscriptions to clean them up later
        const messageSub = client.subscribe(`/topic/room/${roomCode}/messages`, (message) => {
          try {
            const messageData = JSON.parse(message.body);
            setMessages(prev => [...prev, messageData]);
          } catch (e) {
            console.error("Error parsing message:", e);
          }
        });
        
        const statusSub = client.subscribe(`/topic/room/${roomCode}/status`, (message) => {
          try {
            const statusData = JSON.parse(message.body);
            setRoomStatus(statusData);
          } catch (e) {
            console.error("Error parsing status:", e);
          }
        });
        
        const rolesSub = client.subscribe(`/topic/room/${roomCode}/roles`, (message) => {
          try {
            const rolesData = JSON.parse(message.body);
            setRoles(rolesData);
          } catch (e) {
            console.error("Error parsing roles:", e);
          }
        });
        
        const timerSub = client.subscribe(`/topic/room/${roomCode}/timer`, (message) => {
          try {
            const timerData = JSON.parse(message.body);
            setTimer(timerData);
          } catch (e) {
            console.error("Error parsing timer:", e);
          }
        });
        
        const twistSub = client.subscribe(`/user/queue/room/${roomCode}/twist`, (message) => {
          try {
            const twistData = JSON.parse(message.body);
            setTwist(twistData);
          } catch (e) {
            console.error("Error parsing twist:", e);
          }
        });
        
        subscriptionsRef.current = [messageSub, statusSub, rolesSub, timerSub, twistSub];
      },

      onDisconnect: () => {
        console.log('Disconnected from WebSocket');
        setIsConnected(false);
        connectingRef.current = false;
      },

      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
        setIsConnected(false);
        connectingRef.current = false;
      }
    });

    client.activate();
    clientRef.current = client;
  }, [roomCode, isConnected, wsUrl]);

  const disconnect = useCallback(() => {
    console.log("Manually disconnecting WebSocket");
    cleanupConnection();
  }, [cleanupConnection]);

  const sendMessage = useCallback((content, messageType = 'REGULAR', playerId) => {
    if (clientRef.current && isConnected) {
      try {
        const message = {
          content,
          messageType,
          playerId
        };
        
        clientRef.current.publish({
          destination: `/app/room/${roomCode}/send`,
          body: JSON.stringify(message),
          headers: {
            'content-type': 'application/json'
          }
        });
        return true;
      } catch (error) {
        console.error("Error sending message:", error);
        return false;
      }
    } else {
      console.warn("Cannot send message: WebSocket not connected");
      return false;
    }
  }, [roomCode, isConnected]);

  // Connect effect - only runs when roomCode changes or component mounts
  useEffect(() => {
    if (roomCode) {
      connect();
    }
    
    // Critical cleanup function
    return () => {
      cleanupConnection();
    };
  }, [roomCode, connect, cleanupConnection]);

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