import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateRoom from '../components/room/CreateRoom';
import JoinRoom from '../components/room/JoinRoom';
import { Scroll, Users, Sparkles } from 'lucide-react';

const Home = () => {
  const [activeTab, setActiveTab] = useState('create');
  const navigate = useNavigate();

  const handleRoomSuccess = (roomCode) => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="bg-primary-600 p-4 rounded-full">
              <Scroll className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="fantasy-title text-5xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-fantasy-gold via-white to-fantasy-silver bg-clip-text text-transparent">
            TaleForge
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
            Forge epic tales together in real-time collaborative storytelling adventures
          </p>
          
          <div className="flex justify-center space-x-8 mb-12">
            <div className="flex items-center space-x-2 text-white/70">
              <Users className="w-5 h-5" />
              <span>Multiplayer</span>
            </div>
            <div className="flex items-center space-x-2 text-white/70">
              <Sparkles className="w-5 h-5" />
              <span>Real-time</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'create'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'join'
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              Join Room
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'create' ? (
            <CreateRoom onSuccess={handleRoomSuccess} />
          ) : (
            <JoinRoom onSuccess={handleRoomSuccess} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;