// src/components/game/RoleAssignment.jsx
import React, { useState } from 'react';
import { Users, Shuffle, CheckCircle } from 'lucide-react';

const RoleAssignment = ({ assignments, currentPlayerId, onUpdateCharacter }) => {
  const [characterNames, setCharacterNames] = useState({});
  const [updatingCharacter, setUpdatingCharacter] = useState(null);

  const getRoleInfo = (role) => {
    const roleMap = {
      'PROTAGONIST': {
        icon: '🗡️',
        name: 'Protagonist',
        description: 'The hero of the story, driving the main narrative forward.',
        color: 'text-blue-400'
      },
      'ANTAGONIST': {
        icon: '👹',
        name: 'Antagonist',
        description: 'The primary opposition, creating conflict and challenges.',
        color: 'text-red-400'
      },
      'NARRATOR': {
        icon: '📚',
        name: 'Narrator',
        description: 'The storyteller, providing context and world-building.',
        color: 'text-purple-400'
      },
      'SIDE_CHARACTER': {
        icon: '👤',
        name: 'Side Character',
        description: 'Supporting characters that enrich the story world.',
        color: 'text-green-400'
      }
    };
    return roleMap[role] || { icon: '👤', name: role, description: '', color: 'text-gray-400' };
  };

  const handleCharacterNameSubmit = async (playerId, role) => {
    const characterName = characterNames[playerId]?.trim();
    if (!characterName) return;

    setUpdatingCharacter(playerId);
    try {
      await onUpdateCharacter(characterName);
      setCharacterNames(prev => ({ ...prev, [playerId]: '' }));
    } catch (error) {
      console.error('Failed to update character name:', error);
    } finally {
      setUpdatingCharacter(null);
    }
  };

  const currentPlayer = assignments?.find(p => p.playerId === currentPlayerId);
  const allPlayersHaveCharacters = assignments?.every(p => p.characterName);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Shuffle className="w-6 h-6 text-fantasy-gold" />
          <h3 className="fantasy-title text-xl font-bold text-white">
            Role Assignment Complete!
          </h3>
        </div>

        <div className="grid gap-4">
          {assignments?.map((player) => {
            const roleInfo = getRoleInfo(player.role);
            const isCurrentPlayer = player.playerId === currentPlayerId;
            const hasCharacterName = !!player.characterName;

            return (
              <div
                key={player.playerId}
                className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                  isCurrentPlayer 
                    ? 'border-fantasy-gold bg-fantasy-gold/10' 
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{roleInfo.icon}</span>
                    <div>
                      <h4 className="text-white font-semibold flex items-center space-x-2">
                        <span>{player.playerName}</span>
                        {isCurrentPlayer && (
                          <span className="text-xs bg-fantasy-gold text-black px-2 py-1 rounded">
                            YOU
                          </span>
                        )}
                      </h4>
                      <p className={`font-medium ${roleInfo.color}`}>
                        {roleInfo.name}
                      </p>
                    </div>
                  </div>
                  
                  {hasCharacterName && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Ready</span>
                    </div>
                  )}
                </div>

                <p className="text-white/70 text-sm mb-4">{roleInfo.description}</p>

                {isCurrentPlayer && !hasCharacterName && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={characterNames[player.playerId] || ''}
                      onChange={(e) => setCharacterNames(prev => ({
                        ...prev,
                        [player.playerId]: e.target.value
                      }))}
                      className="input-field"
                      placeholder="Enter your character name..."
                      maxLength={50}
                    />
                    <button
                      onClick={() => handleCharacterNameSubmit(player.playerId, player.role)}
                      disabled={!characterNames[player.playerId]?.trim() || updatingCharacter === player.playerId}
                      className="btn-primary w-full"
                    >
                      {updatingCharacter === player.playerId ? 'Saving...' : 'Set Character Name'}
                    </button>
                  </div>
                )}

                {player.characterName && (
                  <div className="p-3 bg-white/10 rounded-lg">
                    <p className="text-white font-medium">
                      Character: {player.characterName}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {allPlayersHaveCharacters && currentPlayer?.isTitleCreator && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500/40 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-green-400 font-medium">All players are ready!</span>
            </div>
            <p className="text-white/80 text-sm">
              You can now start the storytelling phase from the room controls.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleAssignment;