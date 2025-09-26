// src/components/room/CreateRoom.jsx
import React, { useState } from 'react';
import { roomApi } from '../../api/roomApi';
import Input from '../common/Input';
import Button from '../common/Button';
import { useSession } from '../../context/SessionContext';
import { Plus, Clock } from 'lucide-react';

const CreateRoom = ({ onSuccess }) => {
  const { setPlayerId, setPlayerName, setCurrentRoomCode } = useSession();
  const [formData, setFormData] = useState({
    playerName: '',
    genre: 'FANTASY',
    duration: 20, // minutes
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convert duration to seconds
      const data = { ...formData, duration: formData.duration * 60 };
      const response = await roomApi.createRoom(data);
      
      // Save session data
      setPlayerId(response.playerId);
      setPlayerName(formData.playerName);
      setCurrentRoomCode(response.roomCode);
      
      // Notify parent component
      onSuccess(response.roomCode);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room. Please try again.');
      console.error('Error creating room:', err);
    } finally {
      setLoading(false);
    }
  };

  const genreOptions = [
    { value: 'FANTASY', label: 'Fantasy' },
    { value: 'SCI_FI', label: 'Science Fiction' },
    { value: 'MYSTERY', label: 'Mystery' },
    { value: 'HORROR', label: 'Horror' },
    { value: 'ADVENTURE', label: 'Adventure' },
  ];

  return (
    <div className="card animate-fade-in">
      <h2 className="fantasy-title text-xl font-bold text-white mb-6">Create a New Story Room</h2>
      
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
        
        <div>
          <label className="block text-white font-medium mb-2">
            Genre
          </label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleInputChange}
            className="w-full px-4 py-2 bg-white/10 border border-white/30 rounded-lg text-white 
                     focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            required
          >
            {genreOptions.map(option => (
              <option key={option.value} value={option.value} className="bg-fantasy-darker text-white">
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            Story Duration (minutes)
          </label>
          <input
            type="range"
            name="duration"
            min="5"
            max="60"
            step="5"
            value={formData.duration}
            onChange={handleInputChange}
            className="w-full accent-primary-500"
          />
          <div className="flex justify-between text-sm text-white/70 mt-1">
            <span>5 min</span>
            <span className="text-white font-medium">{formData.duration} min</span>
            <span>60 min</span>
          </div>
        </div>
        
        <Button 
          type="submit" 
          fullWidth 
          isLoading={loading}
          icon={<Plus className="w-4 h-4" />}
        >
          Create Room
        </Button>
      </form>
    </div>
  );
};

export default CreateRoom;