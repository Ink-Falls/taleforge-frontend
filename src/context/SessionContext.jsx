// src/context/SessionContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
  // Get initial values from localStorage
  const [playerId, setPlayerId] = useState(() => {
    return localStorage.getItem('taleforge_playerId') || null;
  });
  
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('taleforge_playerName') || null;
  });
  
  const [currentRoomCode, setCurrentRoomCode] = useState(() => {
    return localStorage.getItem('taleforge_roomCode') || null;
  });
  
  // Update localStorage when session values change
  useEffect(() => {
    if (playerId) {
      localStorage.setItem('taleforge_playerId', playerId);
    } else {
      localStorage.removeItem('taleforge_playerId');
    }
  }, [playerId]);
  
  useEffect(() => {
    if (playerName) {
      localStorage.setItem('taleforge_playerName', playerName);
    } else {
      localStorage.removeItem('taleforge_playerName');
    }
  }, [playerName]);
  
  useEffect(() => {
    if (currentRoomCode) {
      localStorage.setItem('taleforge_roomCode', currentRoomCode);
    } else {
      localStorage.removeItem('taleforge_roomCode');
    }
  }, [currentRoomCode]);
  
  const clearSession = () => {
    setPlayerId(null);
    setPlayerName(null);
    setCurrentRoomCode(null);
    // Clear all related localStorage items
    localStorage.removeItem('taleforge_playerId');
    localStorage.removeItem('taleforge_playerName');
    localStorage.removeItem('taleforge_roomCode');
  };
  
  return (
    <SessionContext.Provider
      value={{
        playerId,
        setPlayerId,
        playerName,
        setPlayerName,
        currentRoomCode,
        setCurrentRoomCode,
        clearSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};