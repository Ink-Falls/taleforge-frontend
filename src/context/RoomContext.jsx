import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [fetchAttempts, setFetchAttempts] = useState(0);

  
  // Debug when playerId changes
  useEffect(() => {
    console.log("RoomContext - playerId changed:", playerId);
  }, [playerId]);

  // Find current player in room data
  useEffect(() => {
    if (roomData && playerId && roomData.players) {
      console.log("RoomContext - finding current player with ID:", playerId);
      const player = roomData.players.find(p => p.id === playerId);
      console.log("RoomContext - current player found:", player);
      setCurrentPlayer(player || null);
    } else if (roomData && !playerId) {
      console.log("RoomContext - room data exists but no playerId");
    }
  }, [roomData, playerId]);

  // Fetch room data with retry logic
  useEffect(() => {
    const fetchRoomData = async () => {
      if (!roomCode) return;
      
      setLoading(true);
      
      try {
        console.log(`RoomContext - Fetching room data for ${roomCode} (attempt ${fetchAttempts + 1})`);
        const data = await roomApi.getRoomStatus(roomCode);
        console.log("RoomContext - Room data received:", data);
        
        // Add more detailed debugging to understand the structure
        console.log("RoomContext - Room data structure:", {
          hasRoomProperty: !!data.room,
          directStatus: data.status,
          nestedStatus: data.room?.status,
          directId: data.roomId,
          playersCount: data.players?.length,
          fullData: JSON.stringify(data)
        });
        
        // If the API response doesn't contain a status, add a default one
        if (!data.status && !data.room?.status) {
          // If we have roomId, it's probably CREATED status
          if (data.roomId || data.room?.roomId) {
            // Either add to an existing room property, or add to the data directly
            if (data.room) {
              data.room.status = 'CREATED';
            } else {
              data.status = 'CREATED';
            }
            console.log("RoomContext - Added default CREATED status to room data");
          }
        }
        
        setRoomData(data);
        setError(null);
        
        // Find the current player as soon as we have data
        if (playerId && data.players) {
          const player = data.players.find(p => p.id === playerId);
          console.log("RoomContext - Current player match:", player);
          setCurrentPlayer(player || null);
        }
        
        setLoading(false); // Successfully loaded data
      } catch (err) {
        console.error('Error fetching room data:', err);
        setError(err.response?.data?.error || 'Failed to fetch room data');
        
        // If we've tried less than 3 times and it's a network error, try again after a delay
        if (fetchAttempts < 3) {
          console.log(`RoomContext - Retrying in 2 seconds (attempt ${fetchAttempts + 1})`);
          setTimeout(() => {
            setFetchAttempts(prev => prev + 1);
          }, 2000);
        } else {
          setLoading(false); // Stop loading after 3 failed attempts
        }
      }
    };
    
    fetchRoomData();
  }, [roomCode, refreshTrigger, fetchAttempts, playerId]);


  // Failsafe: If we're still loading after 10 seconds with roomData, force stop loading
  useEffect(() => {
    let timeoutId;
    if (loading && roomData) {
      timeoutId = setTimeout(() => {
        console.log("RoomContext - Force ending loading state due to timeout");
        setLoading(false);
      }, 10000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [loading, roomData]);

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

  const refreshRoom = useCallback(() => {
    console.log("RoomContext - Refreshing room data");
    setRefreshTrigger(prev => prev + 1);
  }, []);

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