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
  const [playerId, setPlayerId] = useState(localStorage.getItem('playerId') || '');
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || '');
  const [currentRoomCode, setCurrentRoomCode] = useState(localStorage.getItem('currentRoomCode') || '');

  useEffect(() => {
    if (playerId) {
      localStorage.setItem('playerId', playerId);
    } else {
      localStorage.removeItem('playerId');
    }
  }, [playerId]);

  useEffect(() => {
    if (playerName) {
      localStorage.setItem('playerName', playerName);
    } else {
      localStorage.removeItem('playerName');
    }
  }, [playerName]);

  useEffect(() => {
    if (currentRoomCode) {
      localStorage.setItem('currentRoomCode', currentRoomCode);
    } else {
      localStorage.removeItem('currentRoomCode');
    }
  }, [currentRoomCode]);

  const clearSession = () => {
    setPlayerId('');
    setPlayerName('');
    setCurrentRoomCode('');
    localStorage.removeItem('playerId');
    localStorage.removeItem('playerName');
    localStorage.removeItem('currentRoomCode');
  };

  return (
    <SessionContext.Provider value={{
      playerId,
      setPlayerId,
      playerName,
      setPlayerName,
      currentRoomCode,
      setCurrentRoomCode,
      clearSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};