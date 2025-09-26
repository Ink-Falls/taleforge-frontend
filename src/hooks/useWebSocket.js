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
  const connectingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const subscriptionsRef = useRef([]);
  
  const wsUrl = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

  // Clean up function to properly disconnect
  const cleanupConnection = useCallback(() => {
    if (clientRef.current) {
      try {
        // Clear subscriptions
        subscriptionsRef.current.forEach(sub => {
          if (sub && sub.unsubscribe) sub.unsubscribe();
        });
        subscriptionsRef.current = [];
        
        // Deactivate client
        if (clientRef.current.connected) {
          clientRef.current.deactivate();
        }
        clientRef.current = null;
        setIsConnected(false);
        console.log('WebSocket: Cleaned up connection');
      } catch (e) {
        console.error('WebSocket: Error during cleanup', e);
      }
    }
  }, []);

  // Connect function
  const connect = useCallback(() => {
    if (!roomCode || isConnected || connectingRef.current || clientRef.current) {
      return;
    }
    
    console.log('WebSocket: Initializing connection for room', roomCode);
    connectingRef.current = true;

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        debug: (str) => console.log('WebSocket:', str),
        reconnectDelay: 5000,
        
        onConnect: () => {
          console.log('Connected to WebSocket');
          setIsConnected(true);
          connectingRef.current = false;
          
          // Subscribe to topics
          const subs = [
            client.subscribe(`/topic/room/${roomCode}/messages`, (message) => {
              try {
                const messageData = JSON.parse(message.body);
                setMessages(prev => [...prev, messageData]);
              } catch (e) {
                console.error('Error parsing message data', e);
              }
            }),
            
            client.subscribe(`/topic/room/${roomCode}/status`, (message) => {
              try {
                const statusData = JSON.parse(message.body);
                setRoomStatus(statusData);
              } catch (e) {
                console.error('Error parsing status data', e);
              }
            }),
            
            client.subscribe(`/topic/room/${roomCode}/roles`, (message) => {
              try {
                const rolesData = JSON.parse(message.body);
                setRoles(rolesData);
              } catch (e) {
                console.error('Error parsing roles data', e);
              }
            }),
            
            client.subscribe(`/topic/room/${roomCode}/timer`, (message) => {
              try {
                const timerData = JSON.parse(message.body);
                setTimer(timerData);
              } catch (e) {
                console.error('Error parsing timer data', e);
              }
            }),
            
            client.subscribe(`/user/queue/room/${roomCode}/twist`, (message) => {
              try {
                const twistData = JSON.parse(message.body);
                setTwist(twistData);
              } catch (e) {
                console.error('Error parsing twist data', e);
              }
            })
          ];
          
          subscriptionsRef.current = subs;
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
    } catch (err) {
      console.error('Error creating WebSocket connection', err);
      connectingRef.current = false;
    }
  }, [roomCode, isConnected, wsUrl]);

  // Send message function
  const sendMessage = useCallback((content, messageType = 'REGULAR') => {
    if (!clientRef.current || !isConnected || !roomCode) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }
    
    try {
      const playerId = localStorage.getItem('taleforge_playerId');
      if (!playerId) {
        console.error('Cannot send message: No player ID found');
        return false;
      }
      
      const message = {
        content,
        messageType,
        playerId
      };
      
      clientRef.current.publish({
        destination: `/app/room/${roomCode}/send`,
        body: JSON.stringify(message),
        headers: { 'content-type': 'application/json' }
      });
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }, [roomCode, isConnected]);

  // Connect only when roomCode changes or component mounts
  useEffect(() => {
    // Only initialize once
    if (roomCode && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      connect();
    }
    
    return () => {
      // Only clean up if we've initialized
      if (hasInitializedRef.current) {
        cleanupConnection();
        hasInitializedRef.current = false;
      }
    };
  }, [roomCode, connect, cleanupConnection]);

  return {
    isConnected,
    messages,
    roomStatus,
    roles,
    timer,
    twist,
    sendMessage
  };
};