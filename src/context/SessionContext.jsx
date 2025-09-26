import React, { createContext, useContext, useState, useEffect } from 'react';

const SessionContext = createContext();

export const useSession = () => {
  return useContext(SessionContext);
};

export const SessionProvider = ({ children }) => {
  // Use consistent naming with taleforge_ prefix for all session storage items
  const [playerId, setPlayerId] = useState(() => {
    const storedId = sessionStorage.getItem('taleforge_playerId');
    console.log('SessionContext init - playerId from storage:', storedId);
    return storedId || null;
  });

  const [playerName, setPlayerName] = useState(() => {
    const storedName = sessionStorage.getItem('taleforge_playerName');
    console.log('SessionContext init - playerName from storage:', storedName);
    return storedName || '';
  });

  const [roomCode, setRoomCode] = useState(() => {
    const storedCode = sessionStorage.getItem('taleforge_roomCode');
    console.log('SessionContext init - roomCode from storage:', storedCode);
    return storedCode || null;
  });

  // Sync playerId with session storage
  useEffect(() => {
    console.log("SessionContext - Setting playerId in session:", playerId);
    if (playerId) {
      sessionStorage.setItem('taleforge_playerId', playerId);
    } else {
      sessionStorage.removeItem('taleforge_playerId');
    }
  }, [playerId]);

  // Sync playerName with session storage
  useEffect(() => {
    console.log("SessionContext - Setting playerName in session:", playerName);
    if (playerName) {
      sessionStorage.setItem('taleforge_playerName', playerName);
    } else {
      sessionStorage.removeItem('taleforge_playerName');
    }
  }, [playerName]);

  // Sync roomCode with session storage
  useEffect(() => {
    console.log("SessionContext - Setting roomCode in session:", roomCode);
    if (roomCode) {
      sessionStorage.setItem('taleforge_roomCode', roomCode);
    } else {
      sessionStorage.removeItem('taleforge_roomCode');
    }
  }, [roomCode]);

  // Enhanced clear session to be more robust
  const clearSession = () => {
    console.log("SessionContext - Clearing session");
    // Clear state
    setPlayerId(null);
    setPlayerName('');
    setRoomCode(null);
    
    // Clear storage
    sessionStorage.removeItem('taleforge_playerId');
    sessionStorage.removeItem('taleforge_playerName');
    sessionStorage.removeItem('taleforge_roomCode');
    
    // Additional cleanup if needed
    console.log("Session cleared successfully");
  };

  return (
    <SessionContext.Provider
      value={{
        playerId,
        setPlayerId,
        playerName,
        setPlayerName,
        roomCode,
        setRoomCode,
        clearSession
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};