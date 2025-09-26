// src/components/room/JoinRoom.jsx
import React, { useState } from 'react';
import { roomApi } from '../../api/roomApi';
import Input from '../common/Input';
import Button from '../common/Button';
import { useSession } from '../../context/SessionContext';
import { LogIn } from 'lucide-react';

const JoinRoom = ({ onSuccess }) => {
  // Use the correct function name from SessionContext
  const { setPlayerId, setPlayerName, setRoomCode } = useSession();
  const [formData, setFormData] = useState({
    playerName: '',
    roomCode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Auto-convert to uppercase for room code
    const formattedValue = name === 'roomCode' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await roomApi.joinRoom(formData.roomCode, { 
        playerName: formData.playerName 
      });
      
      console.log('Join response:', response);
      
      // Find the player in the response that matches our name
      const joinedPlayer = response.players.find(
        p => p.playerName === formData.playerName
      );
      
      if (!joinedPlayer) {
        throw new Error('Could not find player data in the response');
      }

      // Store values in sessionStorage with the taleforge_ prefix
      sessionStorage.setItem('taleforge_playerId', joinedPlayer.id);
      sessionStorage.setItem('taleforge_playerName', formData.playerName);
      sessionStorage.setItem('taleforge_roomCode', formData.roomCode);
      
      console.log('Session data saved:', {
        playerId: joinedPlayer.id,
        playerName: formData.playerName,
        roomCode: formData.roomCode
      });
      
      // Update context values in correct order
      setPlayerId(joinedPlayer.id);
      setPlayerName(formData.playerName);
      setRoomCode(formData.roomCode);
      
      // Notify parent component - AFTER context is updated
      onSuccess(formData.roomCode);
    } catch (err) {
      console.error('Error joining room:', err);
      setError(err.response?.data?.error || 'Failed to join room. Please check the room code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card animate-fade-in">
      <h2 className="fantasy-title text-xl font-bold text-white mb-6">Join an Existing Room</h2>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/40 text-red-200 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Your Name"
          name="playerName"
          value={formData.playerName}
          onChange={handleInputChange}
          placeholder="Enter your name"
          required
          maxLength={30}
        />
        
        <Input
          label="Room Code"
          name="roomCode"
          value={formData.roomCode}
          onChange={handleInputChange}
          placeholder="Enter 6-character code"
          required
          maxLength={6}
          minLength={6}
          className="font-mono uppercase"
        />
        
        <Button 
          type="submit" 
          fullWidth 
          isLoading={loading}
          icon={<LogIn className="w-4 h-4" />}
        >
          Join Room
        </Button>
      </form>
    </div>
  );
};

export default JoinRoom;