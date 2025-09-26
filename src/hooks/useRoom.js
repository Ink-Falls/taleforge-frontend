import { useState, useEffect, useCallback } from 'react';
import { useRoomContext } from '../context/RoomContext';
import { useWebSocketContext } from '../context/WebSocketContext';
import { gameApi } from '../api/gameApi';

export const useRoom = (roomCode) => {
  const {
    roomData,
    currentPlayer,
    loading,
    error,
    refreshRoom,
    updateTitle,
    updateCharacter
  } = useRoomContext();

  const {
    isConnected,
    messages,
    roomStatus,
    roles,
    timer,
    twist,
    sendMessage
  } = useWebSocketContext();

  // Local loading state to override context if needed
  const [forceLoaded, setForceLoaded] = useState(false);
  
  // Debug log roomData structure
  useEffect(() => {
    if (roomData) {
      console.log("useRoom - roomData full object:", roomData);
      console.log("useRoom - roomData structure:", {
        hasRoomProperty: !!roomData.room,
        directStatus: roomData.status,
        nestedStatus: roomData.room?.status,
        directRoomId: roomData.roomId,
        playersCount: roomData.players?.length
      });
      
      // Try to determine the actual status
      const status = roomData.status || roomData.room?.status || (roomData.roomId && 'CREATED');
      console.log("useRoom - determined status:", status);
    }
  }, [roomData]);

  // If we have roomData but loading is still true after 5 seconds, force set loading to false
  useEffect(() => {
    let timeoutId;
    if (roomData && loading) {
      // Give it 2 seconds to finish loading naturally
      timeoutId = setTimeout(() => {
        console.log("Force setting loading to false after timeout");
        setForceLoaded(true);
      }, 2000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [roomData, loading]);

  // Listen for status updates from WebSocket to trigger refreshes
  useEffect(() => {
    if (roomStatus) {
      console.log('Room status updated via WebSocket:', roomStatus);
      refreshRoom();
    }
  }, [roomStatus, refreshRoom]);

  // Handle game progression actions
  const handleAction = useCallback(async (actionType) => {
    try {
      console.log('Handling action:', actionType);
      
      switch (actionType) {
        case 'START_ROLE_ASSIGNMENT':
          console.log('Attempting to start role assignment for room:', roomCode);
          await gameApi.startRoleAssignment(roomCode);
          break;
        
        case 'ASSIGN_ROLES':
          await gameApi.assignRoles(roomCode);
          break;
        
        case 'START_STORYTELLING':
          await gameApi.startStorytelling(roomCode);
          break;
        
        case 'COMPLETE_STORY':
          await gameApi.completeStory(roomCode);
          break;
          
        default:
          console.warn('Unknown action type:', actionType);
      }
      
      // Refresh room data after action
      refreshRoom();
      
      return true;
    } catch (error) {
      console.error(`Error performing action ${actionType}:`, error);
      // Provide more descriptive error message based on the response
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        `Failed to perform ${actionType.toLowerCase().replace('_', ' ')}`;
      
      // Re-throw with better message so the UI can handle it
      throw new Error(errorMessage);
    }
  }, [roomCode, refreshRoom]);

  // Handle story completion
  const completeStory = useCallback(async () => {
    try {
      await gameApi.completeStory(roomCode);
      refreshRoom();
      return true;
    } catch (error) {
      console.error('Error completing story:', error);
      return false;
    }
  }, [roomCode, refreshRoom]);

  return {
    roomCode,
    roomData,
    currentPlayer,
    loading: loading && !forceLoaded, // Override loading if we've force loaded
    error,
    isConnected,
    messages,
    timer,
    twist,
    roles,
    handleAction,
    sendMessage,
    updateTitle,
    updateCharacter,
    refreshRoom,
    completeStory
  };
};