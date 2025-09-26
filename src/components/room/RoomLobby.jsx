import React, { useState, useEffect } from 'react';
import { Users, Clock, Edit, Check, RefreshCw, ArrowRight } from 'lucide-react';
import TitleEditor from '../game/TitleEditor';
import LeaveRoom from './LeaveRoom';

const RoomLobby = ({
  roomData,
  currentPlayer,
  onStartRoleAssignment,
  onUpdateTitle,
  onUpdateCharacter,
  onAssignRoles,
  onStartStorytelling,
  isConnected
}) => {
  const [titleSubmitting, setTitleSubmitting] = useState(false);
  const [characterSubmitting, setCharacterSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [rolesAssigned, setRolesAssigned] = useState(false);
  
  // Add detailed debug log to check roomData structure
  console.log("RoomLobby - roomData:", roomData);
  console.log("RoomLobby - roomData structure:", {
    hasRoomProperty: !!roomData?.room,
    directStatus: roomData?.status,
    nestedStatus: roomData?.room?.status,
    directId: roomData?.roomId
  });
  
  // Handle the case where room data structure is different than expected
  const getRoomData = () => {
    // If roomData has a 'room' property, use that
    if (roomData?.room) {
      return roomData.room;
    }
    
    // If roomData itself has roomId, status, etc. it's probably the room object directly
    if (roomData?.roomId) {
      return roomData;
    }
    
    // Fallback - return an empty object to avoid errors
    return {};
  };
  
  // Get room data using the helper function
  const room = getRoomData();
  
  if (!roomData || (!roomData.room && !roomData.roomId)) {
    console.log("RoomLobby - Missing or invalid room data");
    return (
      <div className="card text-center p-8">
        <h3 className="text-xl font-bold text-white mb-4">Loading Room...</h3>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-primary-600/30 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  const isOwner = currentPlayer?.isTitleCreator;
  const status = room.status || roomData.status || 'CREATED'; // Default to CREATED if no status
  const isCreated = status === 'CREATED';
  const isRoleAssignment = status === 'ROLE_ASSIGNMENT';
  
  // Check if players have roles assigned (which happens after clicking "Assign Roles")
  const hasRolesAssigned = roomData.players?.every(p => p.role) || false;
  
  // Update rolesAssigned state when roles are detected
  useEffect(() => {
    if (hasRolesAssigned && isRoleAssignment) {
      setRolesAssigned(true);
    }
  }, [hasRolesAssigned, isRoleAssignment]);
  
  // Check if all players have characters (for enabling Start Storytelling)
  const allPlayersHaveCharacters = roomData.players?.every(p => 
    p.characterName && p.characterName.trim() !== ''
  ) || false;
  
  // Handle title update
  const handleTitleUpdate = async (titleData) => {
    setTitleSubmitting(true);
    try {
      await onUpdateTitle(titleData);
    } catch (err) {
      console.error('Error updating title:', err);
    } finally {
      setTitleSubmitting(false);
    }
  };
  
  // Handle character update
  const handleCharacterUpdate = async (characterName) => {
    setCharacterSubmitting(true);
    try {
      await onUpdateCharacter(characterName);
    } catch (err) {
      console.error('Error updating character:', err);
    } finally {
      setCharacterSubmitting(false);
    }
  };
  
  // Handle start role assignment with proper error handling
  const handleStartRoleAssignment = async () => {
    setActionLoading(true);
    setActionError(null);
    
    try {
      await onStartRoleAssignment();
    } catch (err) {
      console.error("Failed to start role assignment:", err);
      setActionError("Failed to start role assignment. Please try again.");
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle role assignment with proper error handling
  const handleAssignRoles = async () => {
    setActionLoading(true);
    setActionError(null);
    
    try {
      await onAssignRoles();
      setRolesAssigned(true); // Mark roles as assigned when successful
    } catch (err) {
      console.error("Failed to assign roles:", err);
      setActionError("Failed to assign roles. Please try again.");
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle storytelling start with proper error handling
  const handleStartStorytelling = async () => {
    setActionLoading(true);
    setActionError(null);
    
    try {
      await onStartStorytelling();
      // The websocket will handle redirecting all users once the game starts
    } catch (err) {
      console.error("Failed to start storytelling:", err);
      setActionError("Failed to start storytelling. Please try again.");
      
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setActionError(null), 5000);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // If the parent component provided a refresh function, call it
      if (typeof window.refreshRoom === 'function') {
        await window.refreshRoom();
      } else {
        // Otherwise, just reload the page as a fallback
        window.location.reload();
      }
    } catch (err) {
      console.error('Error refreshing room data:', err);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 500); // Show the spinner for at least 500ms
    }
  };

  return (
    <div>
      {/* Room Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="fantasy-title text-3xl font-bold text-white mr-3">
            Room: {room.roomCode || roomData.roomCode}
          </h1>
          {/* Add refresh button visible to all players */}
          <button
            onClick={handleRefresh}
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors flex items-center"
            disabled={refreshing}
            title="Refresh room data"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-white/70">
            <span className="text-white font-medium">{status}</span>
          </div>
          <LeaveRoom roomCode={room.roomCode || roomData.roomCode} />
        </div>
      </div>
      
      {/* Room Status Pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="bg-white/10 px-4 py-2 rounded-full flex items-center">
          <Users className="w-4 h-4 mr-2 text-white/70" />
          <span className="text-white">{roomData.players?.length || 0} Players</span>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-full flex items-center">
          <Clock className="w-4 h-4 mr-2 text-white/70" />
          <span className="text-white">{Math.floor((room.duration || 1200) / 60)} Minutes</span>
        </div>
        <div className="bg-primary-600/30 border border-primary-600/50 px-4 py-2 rounded-full flex items-center">
          <span className="text-white font-medium">{status}</span>
        </div>
      </div>
      
      {/* Show error message if any action fails */}
      {actionError && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-lg mb-6">
          {actionError}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Players and Controls */}
        <div className="lg:col-span-2">
          {/* Player List */}
          <div className="card mb-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" /> Players in Room
            </h2>
            
            <div className="space-y-2">
              {roomData.players.map((player) => (
                <div 
                  key={player.id} 
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.id === currentPlayer?.id 
                      ? 'bg-primary-600/20 border border-primary-600/30' 
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center">
                    <div className="mr-3">
                      {player.isTitleCreator 
                        ? <span className="text-lg">👑</span>
                        : <span className="text-lg">👤</span>
                      }
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {player.playerName}
                        {player.id === currentPlayer?.id && 
                          <span className="text-xs ml-2 text-white/60">(You)</span>
                        }
                      </div>
                      {isRoleAssignment && (
                        <div className="text-sm text-white/60">
                          {player.role ? `Role: ${player.role.replace('_', ' ')}` : 'Awaiting role'}
                        </div>
                      )}
                      {isRoleAssignment && player.characterName && (
                        <div className="text-sm text-primary-300">
                          Character: {player.characterName}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {player.id === currentPlayer?.id && isRoleAssignment && (
                    <div>
                      <button
                        onClick={() => {
                          const name = prompt("Enter your character's name:", player.characterName || "");
                          if (name && name.trim() !== "") {
                            handleCharacterUpdate(name);
                          }
                        }}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white py-1 px-2 rounded flex items-center"
                        disabled={characterSubmitting}
                      >
                        <Edit className="w-3 h-3 mr-1" /> 
                        {player.characterName ? "Edit" : "Set"} Character
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Game Flow Controls */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-4">Game Progress</h2>
            
            <div className="space-y-4">
              {/* Step 1: Setup Story */}
              <div className={`p-4 rounded-lg border ${
                isCreated 
                  ? 'bg-primary-600/20 border-primary-600/40' 
                  : 'bg-white/5 border-white/20'
              }`}>
                <h3 className="font-bold text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-white/20 inline-flex items-center justify-center mr-2 text-sm">1</span>
                  Setup Story
                </h3>
                <p className="text-white/70 text-sm mt-1 mb-3">
                  The room creator sets the story title and description.
                </p>
                
                {isOwner && isCreated && (
                  <div className="flex justify-end">
                    <button 
                      className="btn-primary"
                      onClick={handleStartRoleAssignment}
                      disabled={titleSubmitting || actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Starting...
                        </>
                      ) : (
                        "Start Role Assignment"
                      )}
                    </button>
                  </div>
                )}
                
                {!isOwner && isCreated && (
                  <div className="flex justify-end items-center text-white/70 text-sm">
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-primary-400 rounded-full animate-spin"></div>
                    Waiting for room creator...
                  </div>
                )}
              </div>
              
              {/* Step 2: Role Assignment */}
              <div className={`p-4 rounded-lg border ${
                isRoleAssignment && !rolesAssigned
                  ? 'bg-primary-600/20 border-primary-600/40' 
                  : 'bg-white/5 border-white/20'
              }`}>
                <h3 className="font-bold text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-white/20 inline-flex items-center justify-center mr-2 text-sm">2</span>
                  Character Creation
                </h3>
                <p className="text-white/70 text-sm mt-1 mb-3">
                  Players name their characters based on assigned roles.
                </p>
                
                {isRoleAssignment && !rolesAssigned && (
                  <div className="mb-3">
                    <div className="text-sm bg-primary-600/20 p-2 rounded border border-primary-600/30 text-white">
                      {isOwner 
                        ? "All players should name their characters." 
                        : "Name your character and wait for the room creator to start."}
                    </div>
                  </div>
                )}
                
                {isOwner && isRoleAssignment && !rolesAssigned && (
                  <div className="flex justify-end">
                    <button 
                      className="btn-primary flex items-center"
                      onClick={handleAssignRoles}
                      disabled={!allPlayersHaveCharacters || actionLoading}
                    >
                      {actionLoading ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Assign Roles
                        </>
                      )}
                    </button>
                  </div>
                )}
                
                {!isOwner && isRoleAssignment && !rolesAssigned && (
                  <div className="flex justify-end items-center text-white/70 text-sm">
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-primary-400 rounded-full animate-spin"></div>
                    Waiting for room creator to assign roles...
                  </div>
                )}
              </div>
              
              {/* Step 3: Storytelling */}
              <div className={`p-4 rounded-lg border ${
                rolesAssigned 
                  ? 'bg-primary-600/20 border-primary-600/40' 
                  : 'bg-white/5 border-white/20 opacity-80'
              }`}>
                <h3 className="font-bold text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-white/20 inline-flex items-center justify-center mr-2 text-sm">3</span>
                  Storytelling
                </h3>
                <p className="text-white/70 text-sm mt-1 mb-3">
                  Collaborative storytelling begins once all players are ready.
                </p>

                {rolesAssigned && (
                  <div className="mt-4">
                    <div className="text-sm bg-green-600/20 p-2 mb-4 rounded border border-green-600/30 text-white">
                      <Check className="w-4 h-4 inline mr-1" /> Roles have been assigned! 
                      {isOwner 
                        ? " You can now start the storytelling phase." 
                        : " Waiting for the room creator to start storytelling."}
                    </div>
                    
                    {/* Show Enter Storytelling Mode button only to the room creator */}
                    {isOwner && (
                      <button 
                        onClick={handleStartStorytelling}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-bold flex items-center justify-center text-lg"
                        disabled={actionLoading}
                      >
                        {actionLoading ? (
                          <>
                            <div className="w-5 h-5 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Starting...
                          </>
                        ) : (
                          <>
                            <ArrowRight className="w-5 h-5 mr-2" />
                            Start Storytelling Phase
                          </>
                        )}
                      </button>
                    )}
                    
                    {/* For non-owners, show a waiting message */}
                    {!isOwner && (
                      <div className="flex justify-center items-center text-white/70 text-sm p-3 mt-2">
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-primary-400 rounded-full animate-spin"></div>
                        Waiting for room creator to start storytelling...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Column - Title Editor or Character Editor */}
        <div className="lg:col-span-1">
          {/* Title Editor (Owner Only) */}
          {isOwner && isCreated && (
            <TitleEditor 
              currentTitle={room.title}
              currentDescription={room.description}
              onSave={handleTitleUpdate}
              isLoading={titleSubmitting}
            />
          )}
          
          {/* Character Editor (Role Assignment) */}
          {isRoleAssignment && currentPlayer?.role && (
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" /> Your Role
              </h2>
              
              <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
                <div className="text-lg font-medium text-white mb-1">
                  {currentPlayer.role.replace('_', ' ')}
                </div>
                <p className="text-white/70 text-sm">
                  {getRoleDescription(currentPlayer.role)}
                </p>
              </div>
              
              <div className="space-y-4">
                <label className="block text-white font-medium">Character Name</label>
                <div className="flex">
                  <input
                    type="text"
                    value={currentPlayer.characterName || ''}
                    onChange={() => {}} // Handled by update button
                    className="flex-1 bg-white/10 border border-white/30 rounded-l-lg px-3 py-2 text-white"
                    placeholder="Enter character name"
                  />
                  <button
                    onClick={() => {
                      const name = prompt("Enter your character's name:", currentPlayer.characterName || "");
                      if (name && name.trim() !== "") {
                        handleCharacterUpdate(name);
                      }
                    }}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg"
                    disabled={characterSubmitting}
                  >
                    {characterSubmitting ? "..." : "Update"}
                  </button>
                </div>
                <p className="text-white/60 text-xs">
                  Choose a name that fits your role and the story genre.
                </p>
              </div>
            </div>
          )}
          
          {/* Story Info */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Story Information</h2>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-sm block mb-1">Title</label>
                <div className="font-medium text-white">
                  {room.title || "Not set yet"}
                </div>
              </div>
              
              <div>
                <label className="text-white/60 text-sm block mb-1">Description</label>
                <div className="text-white/90">
                  {room.description || "No description yet"}
                </div>
              </div>
              
              <div>
                <label className="text-white/60 text-sm block mb-1">Genre</label>
                <div className="text-white/90">
                  {formatGenre(room.genre)}
                </div>
              </div>
              
              <div>
                <label className="text-white/60 text-sm block mb-1">Duration</label>
                <div className="text-white/90">
                  {Math.floor((room.duration || 1200) / 60)} minutes
                </div>
              </div>
            </div>
            
            {/* Add a notice for non-owners */}
            {!isOwner && isCreated && (
              <div className="mt-4 p-2 bg-white/5 rounded text-white/70 text-sm flex items-center">
                <RefreshCw className="w-3.5 h-3.5 mr-2 text-primary-400" />
                <span>Waiting for the room creator to set up the story...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function formatGenre(genre) {
  if (!genre) return '';
  return genre.replace('_', ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function getRoleDescription(role) {
  const descriptions = {
    'PROTAGONIST': 'The hero of the story, driving the main narrative forward.',
    'ANTAGONIST': 'The primary opposition, creating conflict and challenges.',
    'NARRATOR': 'The storyteller, providing context and world-building.',
    'SIDE_CHARACTER': 'A supporting character who enriches the story world.'
  };
  
  return descriptions[role] || 'A character in the story.';
}

export default RoomLobby;