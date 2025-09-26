import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { RoomProvider } from '../context/RoomContext';
import { WebSocketProvider } from '../context/WebSocketContext';
import { useSession } from '../context/SessionContext';
import { useRoom } from '../hooks/useRoom';

// Component imports
import RoomLobby from '../components/room/RoomLobby';
import Storytelling from '../components/game/StoryTelling';
import StoryCompletion from '../components/game/StoryCompletion';
import Layout from '../components/layout/Layout';
import { Loader2, AlertTriangle } from 'lucide-react';

const RoomContent = () => {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const {
    roomData,
    currentPlayer,
    loading,
    error,
    isConnected,
    messages,
    timer,
    twist,
    handleAction,
    sendMessage,
    updateTitle,
    updateCharacter,
    completeStory,
    refreshRoom
  } = useRoom(roomCode);

  // Add debug logs for development
  useEffect(() => {
    console.log('Room component - roomData:', roomData);
    console.log('Room component - currentPlayer:', currentPlayer);
    console.log('Room component - status:', roomData?.room?.status);
  }, [roomData, currentPlayer]);

  // Handle errors
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Loading Room</h3>
          <p className="text-white/70 mt-2">Preparing your storytelling adventure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card text-center max-w-md w-full p-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Room</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  if (!roomData || !roomData.room) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Connecting to Room</h3>
          <p className="text-white/70 mt-2">Please wait while we establish connection...</p>
          <button 
            onClick={refreshRoom}
            className="mt-6 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Render based on room status
  const renderContent = () => {
    const status = roomData.room.status;

    // Pre-storytelling: CREATED or ROLE_ASSIGNMENT
    if (status === 'CREATED' || status === 'ROLE_ASSIGNMENT') {
      return (
        <RoomLobby
          roomData={roomData}
          currentPlayer={currentPlayer}
          onStartRoleAssignment={() => handleAction('START_ROLE_ASSIGNMENT')}
          onUpdateTitle={updateTitle}
          onUpdateCharacter={updateCharacter}
          onAssignRoles={() => handleAction('ASSIGN_ROLES')}
          onStartStorytelling={() => handleAction('START_STORYTELLING')}
          isConnected={isConnected}
        />
      );
    }
    
    // Active storytelling
    if (status === 'STORYTELLING') {
      return (
        <Storytelling 
          messages={messages}
          timer={timer}
          twist={twist}
          currentPlayer={currentPlayer}
          roomData={roomData}
          onSendMessage={sendMessage}
          onCompleteStory={() => handleAction('COMPLETE_STORY')}
        />
      );
    }
    
    // Completed story
    if (status === 'COMPLETED') {
      return (
        <StoryCompletion 
          roomData={roomData}
          messages={messages}
        />
      );
    }
    
    // Unknown state
    return (
      <div className="card text-center py-8">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white">Unknown Room Status</h3>
        <p className="text-white/70 mt-2">
          The room is in an unknown state: {status}
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {!isConnected && (
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3 mb-6 flex items-center">
          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin mr-2" />
          <span className="text-yellow-200 text-sm">
            Connecting to server...
          </span>
        </div>
      )}
      {renderContent()}
    </div>
  );
};

const Room = () => {
  const { roomCode } = useParams();
  const { currentRoomCode } = useSession();
  const navigate = useNavigate();

  // Redirect if no room code in session
  useEffect(() => {
    if (!currentRoomCode) {
      navigate('/', { replace: true });
    }
  }, [currentRoomCode, navigate]);

  if (!currentRoomCode) {
    return null; // Will redirect via useEffect
  }

  return (
    <Layout>
      <RoomProvider roomCode={roomCode}>
        <WebSocketProvider roomCode={roomCode}>
          <RoomContent />
        </WebSocketProvider>
      </RoomProvider>
    </Layout>
  );
};

export default Room;