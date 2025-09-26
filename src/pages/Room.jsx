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
  const { playerId } = useSession(); // Get playerId from session
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

  // Debug logging to track state changes
  console.log('Room render - loading:', loading);
  console.log('Room render - roomData:', roomData);
  console.log('Room render - isConnected:', isConnected);
  console.log('Room render - currentPlayer:', currentPlayer);
  console.log('Room render - playerId:', playerId);

  // Debug session values
  useEffect(() => {
    console.log("Room component - playerId from session:", playerId);
    console.log("Room component - session storage playerId:", sessionStorage.getItem('taleforge_playerId'));
  }, [playerId]);

  // Manual refresh button handler
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    refreshRoom();
  };

  // Expose the refresh function to window for other components to access
  useEffect(() => {
    window.refreshRoom = refreshRoom;
    
    // Clean up on component unmount
    return () => {
      delete window.refreshRoom;
    };
  }, [refreshRoom]);

  // Check for required session data
  if (!playerId) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="card text-center max-w-md w-full p-8">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Session Error</h3>
          <p className="text-white/70 mb-6">No player ID found in session. You may need to join the room again.</p>
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

  // Handle errors
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

  // Fix for stuck loading state
  // Only show loading if we're truly loading (not just waiting for WebSocket)
  if (loading && !roomData) {
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

  // If room data exists but we're still connecting to WebSocket
  if (roomData && !isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-lg p-3 mb-6 flex items-center">
          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin mr-2" />
          <span className="text-yellow-200 text-sm">
            Connecting to server...
          </span>
        </div>
        
        {/* Render room content even while WebSocket is connecting */}
        {renderContent()}
      </div>
    );
  }

  // If we have roomData but loading is still true, force set loading to false
  // This fixes potential state inconsistencies
  if (roomData && loading) {
    console.log('Room data exists but loading is still true, rendering content anyway');
  }

  // Not loading, but no room data - likely an edge case
  if (!loading && !roomData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Connecting to Room</h3>
          <p className="text-white/70 mt-2">Please wait while we establish connection...</p>
          <button 
            onClick={handleManualRefresh}
            className="mt-6 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md"
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  // Render based on room status
  function renderContent() {
    if (!roomData) return null;
    
    // Debug the roomData object structure more thoroughly
    console.log('Room render - full roomData:', roomData);
    console.log('Room data structure check:', {
      hasRoomProperty: !!roomData.room,
      directDuration: roomData.duration,
      nestedDuration: roomData.room?.duration,
      directStatus: roomData.status,
      nestedStatus: roomData.room?.status
    });
    
    // Try multiple possible paths to get the status
    const status = roomData.status || 
                  roomData.room?.status || 
                  (roomData.roomId && 'CREATED') || // If we have a roomId but no status, assume CREATED
                  'UNKNOWN';
    
    console.log('Room render - room status determined as:', status);

    // Pre-storytelling: CREATED or ROLE_ASSIGNMENT
    if (status === 'CREATED' || status === 'ROLE_ASSIGNMENT') {
        return (
        <RoomLobby
            roomData={roomData} // Pass the entire roomData object
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
    
    // Unknown state - show debugging information
    return (
        <div className="card text-center py-8">
          <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white">Room Status: {status}</h3>
          <p className="text-white/70 mt-4 mb-6">
            The room is in an unexpected state. This could be temporary while the room is initializing.
          </p>
          <div className="bg-black/30 p-4 rounded-lg text-left overflow-auto max-h-60 mb-6">
            <pre className="text-xs text-white/70 whitespace-pre-wrap">
              {JSON.stringify(roomData, null, 2)}
            </pre>
          </div>
          <button
            onClick={handleManualRefresh}
            className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg"
          >
            Refresh Room Data
          </button>
        </div>
    );
  }

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
  const { roomCode: urlRoomCode } = useParams();
  const { roomCode: sessionRoomCode, playerId } = useSession();
  const navigate = useNavigate();
  const redirectAttempted = React.useRef(false);

  // Debug logging
  console.log('Room component - roomCode from URL:', urlRoomCode);
  console.log('Room component - roomCode from session:', sessionRoomCode);
  console.log('Room component - playerId from session:', playerId);

  // Check session validity - but only redirect once to prevent loops
  useEffect(() => {
    // If we don't have session data AND we haven't tried to redirect yet
    if (!sessionRoomCode && !playerId && !redirectAttempted.current) {
      console.log('Missing session data, redirecting to home (one-time)');
      redirectAttempted.current = true;
      navigate('/', { replace: true });
    }
  }, [sessionRoomCode, playerId, navigate]);

  // Don't render if no session data
  if (!sessionRoomCode || !playerId) {
    console.log('No session data, showing loading placeholder');
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-primary-400 animate-spin mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white">Initializing Session</h3>
            <p className="text-white/70 mt-2">Please wait...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Make sure the URL roomCode matches session roomCode
  // This prevents issues with manually entered URLs
  if (urlRoomCode !== sessionRoomCode) {
    console.log('URL room code mismatch, redirecting to correct room');
    return <Navigate to={`/room/${sessionRoomCode}`} replace />;
  }

  return (
    <Layout>
      <RoomProvider roomCode={urlRoomCode}>
        <WebSocketProvider roomCode={urlRoomCode}>
          <RoomContent />
        </WebSocketProvider>
      </RoomProvider>
    </Layout>
  );
};

export default Room;