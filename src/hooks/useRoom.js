// src/hooks/useRoom.js
import { useEffect } from 'react';
import { useRoomContext } from '../context/RoomContext';
import { useWebSocketContext } from '../context/WebSocketContext';

export const useRoom = (roomCode) => {
  const {
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

  // Update room data when WebSocket status changes
  useEffect(() => {
    if (roomStatus) {
      refreshRoom();
    }
  }, [roomStatus, refreshRoom]);

  // Handle specific game actions
  const handleAction = async (actionType) => {
    try {
      switch (actionType) {
        case 'START_ROLE_ASSIGNMENT':
          await startRoleAssignment();
          break;
        case 'START_STORYTELLING':
          await startStorytelling();
          break;
        case 'COMPLETE_STORY':
          await completeStory();
          break;
        default:
          console.warn('Unknown action type:', actionType);
      }
    } catch (error) {
      console.error(`Error performing action ${actionType}:`, error);
      throw error;
    }
  };

  return {
    roomCode,
    roomData,
    currentPlayer,
    loading,
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