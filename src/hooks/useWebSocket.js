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

  // Add a debugging function for messages
  const logMessageReceived = (message, source) => {
    console.log(`WebSocket: Message received from ${source}:`, message);
  };
  
  // Connect function
  const connect = useCallback(() => {
    if (!roomCode) {
      console.warn('Cannot connect: No room code provided');
      return;
    }
    
    // Only allow one connection attempt at a time
    if (connectingRef.current) {
      console.log('Already attempting to connect, skipping');
      return;
    }
    
    // If we already have a client and it's connected, don't reconnect
    if (clientRef.current?.connected) {
      console.log('Already connected, skipping connection attempt');
      return;
    }
    
    // Clear any existing client before creating a new one
    if (clientRef.current) {
      cleanupConnection();
    }
    
    console.log('WebSocket: Initializing connection for room', roomCode);
    connectingRef.current = true;
    setIsConnected(false);

    try {
      const client = new Client({
        webSocketFactory: () => new SockJS(wsUrl),
        debug: (str) => console.log('WebSocket:', str),
        reconnectDelay: 5000,
        
        onConnect: () => {
          console.log('Connected to WebSocket');
          connectingRef.current = false;
          setIsConnected(true);
          
          // Subscribe to topics
          const subs = [
            client.subscribe(`/topic/room/${roomCode}/messages`, (message) => {
              try {
                const messageData = JSON.parse(message.body);
                logMessageReceived(messageData, 'room messages topic');
                
                // Use a function to update state to ensure we always have the latest messages
                setMessages(prev => {
                  // Check if we already have this message (by id or other unique identifier)
                  if (messageData.id && prev.some(m => m.id === messageData.id)) {
                    return prev;
                  }
                  return [...prev, messageData];
                });
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
      
      // Store the client reference BEFORE activating
      clientRef.current = client;
      
      // Then activate the client
      client.activate();
    } catch (err) {
      console.error('Error creating WebSocket connection', err);
      connectingRef.current = false;
      clientRef.current = null;
      setIsConnected(false);
    }
  }, [roomCode, wsUrl, cleanupConnection]);

  // Send message function
  const sendMessage = useCallback((content, messageType = 'REGULAR') => {
    console.log('Attempting to send message', { 
      content, 
      messageType, 
      isConnected, 
      clientExists: !!clientRef.current,
      clientConnected: clientRef.current?.connected 
    });
    
    return new Promise((resolve, reject) => {
      // If client doesn't exist but we think we're connected, try to reconnect
      if (!clientRef.current && isConnected) {
        console.warn('Client missing despite connected state, attempting to reconnect');
        connect();
        reject(new Error('WebSocket client not initialized'));
        return;
      }
      
      if (!clientRef.current) {
        console.warn('Cannot send message: No WebSocket client');
        reject(new Error('WebSocket client not initialized'));
        return;
      }
      
      if (!clientRef.current.connected) {
        console.warn('Cannot send message: WebSocket not connected');
        
        // If we think we're connected but the client isn't, reset connection
        if (isConnected) {
          console.warn('Connection state mismatch, attempting to reconnect');
          setIsConnected(false);
          connect();
        }
        
        reject(new Error('WebSocket not connected'));
        return;
      }
      
      try {
        // Use sessionStorage instead of localStorage for consistency with the rest of the app
        const playerId = sessionStorage.getItem('taleforge_playerId');
        if (!playerId) {
          console.error('Cannot send message: No player ID found');
          reject(new Error('No player ID found'));
          return;
        }
        
        const message = {
          content,
          messageType,
          playerId
        };
        
        console.log('WebSocket: Sending message:', message);
        
        clientRef.current.publish({
          destination: `/app/room/${roomCode}/send`,
          body: JSON.stringify(message),
          headers: { 'content-type': 'application/json' }
        });
        
        console.log('Message sent successfully');
        resolve();
      } catch (error) {
        console.error('Error sending message:', error);
        reject(error);
      }
    });
  }, [roomCode, isConnected, connect]);

  // Connect only when roomCode changes or component mounts
  useEffect(() => {
    // Only initialize once
    if (roomCode && !hasInitializedRef.current) {
      hasInitializedRef.current = true;
      
      // Add a short delay before connecting to ensure component is fully mounted
      setTimeout(() => {
        connect();
      }, 100);
    }
    
    // Cleanup function
    return () => {
      if (hasInitializedRef.current) {
        cleanupConnection();
        hasInitializedRef.current = false;
      }
    };
  }, [roomCode, connect, cleanupConnection]);
  
  // Add connection health check
  useEffect(() => {
    const checkInterval = setInterval(() => {
      // If we think we're connected but client is null or not connected,
      // there's a state mismatch that needs fixing
      if (isConnected && (!clientRef.current || !clientRef.current.connected)) {
        console.warn('Connection state mismatch detected in health check');
        setIsConnected(false);
        
        // Try to reconnect if not already connecting
        if (!connectingRef.current) {
          console.log('Health check: attempting reconnection');
          connect();
        }
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(checkInterval);
  }, [isConnected, connect]);

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