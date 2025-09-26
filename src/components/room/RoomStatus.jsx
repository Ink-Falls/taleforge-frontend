// src/components/room/RoomStatus.jsx
import React from 'react';
import { Users, Crown, Clock, Play, Scroll } from 'lucide-react';

const RoomStatus = ({ roomData, currentPlayer, onAction }) => {
  const { room, players } = roomData;
  
  const getRoleIcon = (role) => {
    const icons = {
      'PROTAGONIST': '🗡️',
      'ANTAGONIST': '👹',
      'NARRATOR': '📚',
      'SIDE_CHARACTER': '👤'
    };
    return icons[role] || '👤';
  };

  const getStatusColor = (status) => {
    const colors = {
      'CREATED': 'text-blue-400',
      'ROLE_ASSIGNMENT': 'text-yellow-400',
      'STORYTELLING': 'text-green-400',
      'COMPLETED': 'text-purple-400'
    };
    return colors[status] || 'text-gray-400';
  };

  const canStartRoleAssignment = () => {
    return room.status === 'CREATED' && 
           players.length >= 2 && 
           currentPlayer?.isTitleCreator;
  };

  const canStartStorytelling = () => {
    return room.status === 'ROLE_ASSIGNMENT' && 
           currentPlayer?.isTitleCreator &&
           room.title && 
           players.every(p => p.characterName);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="fantasy-title text-2xl font-bold text-white mb-2">
            {room.title || 'Untitled Story'}
          </h2>
          <p className="text-white/70">Room: {room.roomCode}</p>
          <p className={`font-medium ${getStatusColor(room.status)}`}>
            Status: {room.status.replace('_', ' ')}
          </p>
        </div>
        <div className="text-right">
          <div className="flex items-center space-x-2 text-white/70 mb-2">
            <Users className="w-4 h-4" />
            <span>{players.length} Players</span>
          </div>
          <div className="flex items-center space-x-2 text-white/70">
            <Clock className="w-4 h-4" />
            <span>{Math.floor(room.duration / 60)} min</span>
          </div>
        </div>
      </div>

      {/* Players List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Players</h3>
        <div className="grid gap-2">
          {players.map((player) => (
            <div 
              key={player.id} 
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-xl">{getRoleIcon(player.role)}</span>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-white font-medium">{player.playerName}</span>
                    {player.isTitleCreator && (
                      <Crown className="w-4 h-4 text-fantasy-gold" />
                    )}
                  </div>
                  {player.role && (
                    <p className="text-sm text-white/60">
                      {player.role.replace('_', ' ')} 
                      {player.characterName && ` - ${player.characterName}`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {canStartRoleAssignment() && (
          <button
            onClick={() => onAction('START_ROLE_ASSIGNMENT')}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Role Assignment</span>
          </button>
        )}

        {canStartStorytelling() && (
          <button
            onClick={() => onAction('START_STORYTELLING')}
            className="w-full btn-primary flex items-center justify-center space-x-2"
          >
            <Scroll className="w-4 h-4" />
            <span>Start Storytelling</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default RoomStatus;