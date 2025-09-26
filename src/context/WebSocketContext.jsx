// src/context/WebSocketContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Connect to WebSocket when roomCode changes
  useEffect(() => {
    if (roomCode) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [roomCode, connect, disconnect]);

  // Reconnect if connection is lost
  useEffect(() => {
    let reconnectTimeout;
    
    if (!isConnected && roomCode && !isReconnecting) {
      setIsReconnecting(true);
      reconnectTimeout = setTimeout(() => {
        console.log('Attempting to reconnect WebSocket...');
        connect();
        setIsReconnecting(false);
      }, 3000);
    }
    
    return () => {
      clearTimeout(reconnectTimeout);
    };
  }, [isConnected, roomCode, connect, isReconnecting]);

  // Handle message sending with current player ID
  const handleSendMessage = (content, messageType = 'REGULAR') => {
    sendMessage(content, messageType, playerId);
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