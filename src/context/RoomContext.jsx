// src/context/RoomContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from './SessionContext';
import { roomApi } from '../api/roomApi';
import { gameApi } from '../api/gameApi';

const RoomContext = createContext();

export const useRoomContext = () => {
  const context = useContext(RoomContext);
  if (!context) {
    throw new Error('useRoomContext must be used within a RoomProvider');
  }
  return context;
};

export const RoomProvider = ({ children, roomCode }) => {
  const { playerId } = useSession();
  const [roomData, setRoomData] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Find current player in room data
  useEffect(() => {
    if (roomData && playerId) {
      const player = roomData.players.find(p => p.id === playerId);
      setCurrentPlayer(player || null);
    }
  }, [roomData, playerId]);

  // Fetch room data
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomCode) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await roomApi.getRoomStatus(roomCode);
        setRoomData(data);
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError(err.response?.data?.error || 'Failed to fetch room data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoomData();
  }, [roomCode, refreshTrigger]);

  // Game control functions
  const startRoleAssignment = async () => {
    try {
      await gameApi.startRoleAssignment(roomCode);
      refreshRoom();
    } catch (err) {
      throw err;
    }
  };

  const updateTitle = async (titleData) => {
    try {
      await roomApi.updateTitle(roomCode, titleData);
      refreshRoom();
    } catch (err) {
      throw err;
    }
  };

  const updateCharacter = async (characterName) => {
    try {
      await roomApi.updateCharacter(roomCode, { characterName });
      refreshRoom();
    } catch (err) {
      throw err;
    }
  };

  const startStorytelling = async () => {
    try {
      await gameApi.startStorytelling(roomCode);
      refreshRoom();
    } catch (err) {
      throw err;
    }
  };

  const completeStory = async () => {
    try {
      await gameApi.completeStory(roomCode);
      refreshRoom();
    } catch (err) {
      throw err;
    }
  };

  const refreshRoom = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <RoomContext.Provider
      value={{
        roomData,
        currentPlayer,
        loading,
        error,
        refreshRoom,
        startRoleAssignment,
        updateTitle,
        updateCharacter,
        startStorytelling,
        completeStory
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};