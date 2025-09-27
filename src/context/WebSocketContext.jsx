import React, { createContext, useContext, useState, useEffect } from 'react';
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
  const [sendError, setSendError] = useState(null);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastReconnectTime, setLastReconnectTime] = useState(0);
  
  const {
    isConnected,
    messages,
    roomStatus,
    roles,
    timer,
    twist,
    sendMessage: baseSendMessage,
    connect // Import the connect function from useWebSocket
  } = useWebSocket(roomCode);

  // Wrap the sendMessage function to provide better error handling
  const sendMessageWithErrorHandling = async (content, messageType = 'REGULAR') => {
    setSendError(null);
    
    try {
      if (!isConnected) {
        throw new Error('Cannot send message: WebSocket not connected');
      }
      
      await baseSendMessage(content, messageType);
      return true;
    } catch (error) {
      console.error('Error sending message:', error.message);
      setSendError(error.message);
      throw error;
    }
  };
  
  // Expose a reconnect function to the app
  const reconnectWebSocket = () => {
    const now = Date.now();
    // Rate limit reconnection attempts (max once per 3 seconds)
    if (now - lastReconnectTime < 3000) {
      console.log('Reconnect attempt too frequent, skipping');
      return;
    }
    
    setLastReconnectTime(now);
    setReconnecting(true);
    
    // Call connect from useWebSocket
    connect();
    
    // Reset reconnecting flag after a timeout
    setTimeout(() => {
      setReconnecting(false);
    }, 2000);
  };
  
  // Expose the reconnect function to window for global access
  useEffect(() => {
    window.reconnectWebSocket = reconnectWebSocket;
    
    return () => {
      delete window.reconnectWebSocket;
    };
  }, [reconnectWebSocket]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        messages,
        roomStatus,
        roles,
        timer,
        twist,
        sendMessage: sendMessageWithErrorHandling,
        sendError,
        reconnect: reconnectWebSocket,
        reconnecting
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};