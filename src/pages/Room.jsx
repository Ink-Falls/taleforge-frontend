// src/pages/Room.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { RoomProvider } from '../context/RoomContext';
import { WebSocketProvider } from '../context/WebSocketContext';
import { useSession } from '../context/SessionContext';
import { useRoom } from '../hooks/useRoom';
import RoomStatus from '../components/room/RoomStatus';
import TitleEditor from '../components/game/TitleEditor';
import RoleAssignment from '../components/game/RoleAssignment';
import StoryTelling from '../components/game/StoryTelling';
import StoryCompletion from '../components/game/StoryCompletion';
import LeaveRoom from '../components/room/LeaveRoom';
import { Loader2, AlertTriangle } from 'lucide-react';

const RoomContent = () => {
  const { roomCode } = useParams();
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
    completeStory
  } = useRoom(roomCode);

  const [titleSubmitting, setTitleSubmitting] = useState(false);

  // Handle title update
  const handleTitleUpdate = async (titleData) => {
    setTitleSubmitting(true);
    try {
      await updateTitle(titleData);
    } catch (err) {
      console.error('Error updating title:', err);
    } finally {
      setTitleSubmitting(false);
    }
  };

  // Handle message sending
  const handleSendMessage = (content, messageType) => {
    sendMessage(content, messageType);
  };

  // Determine what to show based on room status
  const renderRoomContent = () => {
    if (!roomData) return null;
    
    const status = roomData.room.status;
    
    switch (status) {
      case 'CREATED':
        // Show title editor only to title creator in CREATED state
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RoomStatus 
                roomData={roomData} 
                currentPlayer={currentPlayer} 
                onAction={handleAction} 
              />
            </div>
            {currentPlayer?.isTitleCreator && (
              <div>
                <TitleEditor 
                  currentTitle={roomData.room.title}
                  currentDescription={roomData.room.description}
                  onSave={handleTitleUpdate}
                  isLoading={titleSubmitting}
                />
              </div>
            )}
          </div>
        );
        
      case 'ROLE_ASSIGNMENT':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RoleAssignment 
                assignments={roomData.players}
                currentPlayerId={currentPlayer?.id}
                onUpdateCharacter={updateCharacter}
              />
            </div>
            <div>
              <RoomStatus 
                roomData={roomData} 
                currentPlayer={currentPlayer} 
                onAction={handleAction} 
              />
            </div>
          </div>
        );
        
      case 'STORYTELLING':
        return (
          <StoryTelling 
            messages={messages}
            timer={timer}
            twist={twist}
            currentPlayer={currentPlayer}
            roomData={roomData}
            onSendMessage={handleSendMessage}
            onCompleteStory={completeStory}
          />
        );
        
      case 'COMPLETED':
        return (
          <StoryCompletion 
            roomData={roomData}
            messages={messages}
          />
        );
        
      default:
        return (
          <div className="card text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Unknown Room Status</h3>
            <p className="text-white/70 mt-2">
              The room is in an unknown state: {status}
            </p>
          </div>
        );
    }
  };

  // Show loading state
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

  // Show error state
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card text-center max-w-md w-full p-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Failed to Load Room</h3>
          <p className="text-white/70 mb-6">{error}</p>
          <LeaveRoom roomCode={roomCode} />
        </div>
      </div>
    );
  }

  // WebSocket connection status
  const renderConnectionStatus = () => {
    if (!isConnected) {
      return (
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3 mb-6 flex items-center">
          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin mr-2" />
          <span className="text-yellow-200 text-sm">
            Connecting to server...
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="fantasy-title text-3xl font-bold text-white">
          Room: {roomCode}
        </h1>
        <LeaveRoom roomCode={roomCode} />
      </div>
      
      {renderConnectionStatus()}
      {renderRoomContent()}
    </div>
  );
};

const Room = () => {
  const { roomCode } = useParams();
  const { currentRoomCode } = useSession();

  // Redirect if no room code in session
  if (!currentRoomCode) {
    return <Navigate to="/" replace />;
  }

  return (
    <RoomProvider roomCode={roomCode}>
      <WebSocketProvider roomCode={roomCode}>
        <RoomContent />
      </WebSocketProvider>
    </RoomProvider>
  );
};

export default Room;