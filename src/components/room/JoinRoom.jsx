// src/components/room/JoinRoom.jsx
import React, { useState } from 'react';
import { roomApi } from '../../api/roomApi';
import Input from '../common/Input';
import Button from '../common/Button';
import { useSession } from '../../context/SessionContext';
import { LogIn } from 'lucide-react';

const JoinRoom = ({ onSuccess }) => {
  const { setPlayerId, setPlayerName, setCurrentRoomCode } = useSession();
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
      
      // Save session data
      setPlayerId(response.playerId);
      setPlayerName(formData.playerName);
      setCurrentRoomCode(formData.roomCode);
      
      // Notify parent component
      onSuccess(formData.roomCode);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to join room. Please check the room code.');
      console.error('Error joining room:', err);
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