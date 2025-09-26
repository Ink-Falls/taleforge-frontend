import React, { useState, useEffect } from 'react';
import TitleEditor from '../game/TitleEditor';
import RoleAssignment from '../game/RoleAssignment';
import LeaveRoom from './LeaveRoom';
import Button from '../common/Button';
import { Clock, Users, Play, Edit, UserCheck } from 'lucide-react';

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
  const [showManualLink, setShowManualLink] = useState(false);
  
  const isOwner = currentPlayer?.isTitleCreator;
  const status = roomData.room.status;
  const isCreated = status === 'CREATED';
  const isRoleAssignment = status === 'ROLE_ASSIGNMENT';
  
  // Check if all players have character names (for enabling Start Storytelling)
  const allPlayersHaveCharacters = roomData.players.every(p => 
    p.characterName && p.characterName.trim() !== ''
  );
  
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
  
  // Show manual link after 20 seconds if we're in role assignment phase
  useEffect(() => {
    if (isRoleAssignment) {
      const timer = setTimeout(() => {
        setShowManualLink(true);
      }, 20000);
      
      return () => clearTimeout(timer);
    }
  }, [isRoleAssignment]);
  
  return (
    <div>
      {/* Room Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="fantasy-title text-3xl font-bold text-white">
            Room: {roomData.room.roomCode}
          </h1>
          <p className="text-white/70 mt-1">
            {isCreated ? 'Setting up the story' : 'Preparing for storytelling'}
          </p>
        </div>
        <LeaveRoom roomCode={roomData.room.roomCode} />
      </div>
      
      {/* Room Status Pills */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="bg-white/10 px-4 py-2 rounded-full flex items-center">
          <Users className="w-4 h-4 mr-2 text-white/70" />
          <span className="text-white">{roomData.players.length} Players</span>
        </div>
        <div className="bg-white/10 px-4 py-2 rounded-full flex items-center">
          <Clock className="w-4 h-4 mr-2 text-white/70" />
          <span className="text-white">{Math.floor(roomData.room.duration / 60)} Minutes</span>
        </div>
        <div className="bg-primary-600/30 border border-primary-600/50 px-4 py-2 rounded-full flex items-center">
          <span className="text-white font-medium">{status}</span>
        </div>
      </div>
      
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
                    <Button 
                      size="sm"
                      onClick={onStartRoleAssignment}
                      isLoading={titleSubmitting}
                    >
                      Start Role Assignment
                    </Button>
                  </div>
                )}
                
                {!isOwner && isCreated && (
                  <div className="flex justify-end items-center text-white/70 text-sm">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Waiting for room creator...
                  </div>
                )}
              </div>
              
              {/* Step 2: Role Assignment */}
              <div className={`p-4 rounded-lg border ${
                isRoleAssignment 
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
                
                {isRoleAssignment && (
                  <div className="mb-3">
                    <div className="text-sm bg-primary-600/20 p-2 rounded border border-primary-600/30 text-white">
                      {isOwner 
                        ? "All players should name their characters." 
                        : "Name your character and wait for the room creator to start."}
                    </div>
                  </div>
                )}
                
                {isOwner && isRoleAssignment && (
                  <div className="flex justify-end">
                    <Button 
                      size="sm"
                      onClick={onStartStorytelling}
                      disabled={!allPlayersHaveCharacters}
                      icon={<Play className="w-4 h-4" />}
                    >
                      Start Storytelling
                    </Button>
                  </div>
                )}
                
                {!isOwner && isRoleAssignment && (
                  <div className="flex justify-end items-center text-white/70 text-sm">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Waiting for room creator to start...
                  </div>
                )}
              </div>
              
              {/* Step 3: Storytelling */}
              <div className="p-4 rounded-lg border bg-white/5 border-white/20 opacity-80">
                <h3 className="font-bold text-white flex items-center">
                  <span className="w-6 h-6 rounded-full bg-white/20 inline-flex items-center justify-center mr-2 text-sm">3</span>
                  Storytelling
                </h3>
                <p className="text-white/70 text-sm mt-1 mb-3">
                  Collaborative storytelling begins once all players are ready.
                </p>
              </div>
              
              {/* Manual redirect link */}
              {showManualLink && isRoleAssignment && (
                <div className="mt-6 text-center">
                  <p className="text-white/70 text-sm mb-2">
                    Not being redirected automatically?
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onStartStorytelling}
                    icon={<Play className="w-4 h-4" />}
                  >
                    Enter Storytelling Mode
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Right Column - Title Editor or Character Editor */}
        <div className="lg:col-span-1">
          {/* Title Editor (Owner Only) */}
          {isOwner && isCreated && (
            <TitleEditor 
              currentTitle={roomData.room.title}
              currentDescription={roomData.room.description}
              onSave={handleTitleUpdate}
              isLoading={titleSubmitting}
            />
          )}
          
          {/* Character Editor (Role Assignment) */}
          {isRoleAssignment && currentPlayer?.role && (
            <div className="card">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <UserCheck className="w-5 h-5 mr-2" /> Your Role
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
                    onChange={(e) => {}} // Handled by update button
                    className="flex-1 bg-white/10 border border-white/30 rounded-l-lg px-3 py-2 text-white"
                    placeholder="Enter character name"
                    disabled={characterSubmitting}
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
                    Update
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
            <h2 className="text-xl font-bold text-white mb-4">Story Information</h2>
            
            <div className="space-y-3">
              <div>
                <label className="text-white/60 text-sm block mb-1">Title</label>
                <div className="font-medium text-white">
                  {roomData.room.title || "Not set yet"}
                </div>
              </div>
              
              <div>
                <label className="text-white/60 text-sm block mb-1">Description</label>
                <div className="text-white/90">
                  {roomData.room.description || "No description yet"}
                </div>
              </div>
              
              <div>
                <label className="text-white/60 text-sm block mb-1">Genre</label>
                <div className="text-white/90">
                  {formatGenre(roomData.room.genre)}
                </div>
              </div>
              
              <div>
                <label className="text-white/60 text-sm block mb-1">Duration</label>
                <div className="text-white/90">
                  {Math.floor(roomData.room.duration / 60)} minutes
                </div>
              </div>
            </div>
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