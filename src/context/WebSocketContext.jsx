import React, { createContext, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const WebSocketContext = createContext();

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children, roomCode }) => {
  const {
    isConnected,
    messages,
    roomStatus,
    roles,
    timer,
    twist,
    sendMessage
  } = useWebSocket(roomCode);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        messages,
        roomStatus,
        roles,
        timer,
        twist,
        sendMessage
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};