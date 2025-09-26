// src/context/WebSocketContext.jsx
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useSession } from './SessionContext';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children, roomCode }) => {
  const { playerId } = useSession();
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef(null);
  const hasInitializedRef = useRef(false);
  
  const {
    isConnected,
    messages,
    roomStatus,
    roles,
    timer,
    twist,
    connect,
    disconnect,
    sendMessage
  } = useWebSocket(roomCode);

  // Connect to WebSocket once when component mounts
  useEffect(() => {
    if (roomCode && !hasInitializedRef.current) {
      console.log("Initial WebSocket connection for room:", roomCode);
      hasInitializedRef.current = true;
      connect();
    }
    
    return () => {
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Only disconnect when component unmounts
      if (hasInitializedRef.current) {
        console.log("Disconnecting WebSocket on unmount");
        disconnect();
        hasInitializedRef.current = false;
      }
    };
    // Intentionally only run on mount and unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reconnection logic
  useEffect(() => {
    // Only attempt reconnect if we were connected before and now we're not
    if (!isConnected && roomCode && hasInitializedRef.current && !isReconnecting) {
      setIsReconnecting(true);
      console.log("Lost connection, attempting to reconnect in 5s...");
      
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log("Reconnection attempt for room:", roomCode);
        connect();
        setIsReconnecting(false);
      }, 5000);
    }
    
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isConnected, roomCode, connect, isReconnecting]);

  // Handle message sending with current player ID
  const handleSendMessage = (content, messageType = 'REGULAR') => {
    return sendMessage(content, messageType, playerId);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        isReconnecting,
        messages,
        roomStatus,
        roles,
        timer,
        twist,
        sendMessage: handleSendMessage,
        disconnect
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};