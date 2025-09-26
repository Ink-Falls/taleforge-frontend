import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scroll, Users, Sparkles } from 'lucide-react';
import CreateRoom from '../components/room/CreateRoom';
import JoinRoom from '../components/room/JoinRoom';
import Layout from '../components/layout/Layout';
import { useSession } from '../context/SessionContext';

const Home = () => {
  const [activeTab, setActiveTab] = useState('create');
  const navigate = useNavigate();
  const { currentRoomCode } = useSession();

  // Redirect if already in a room
  useEffect(() => {
    if (currentRoomCode) {
      navigate(`/room/${currentRoomCode}`);
    }
  }, [currentRoomCode, navigate]);

  const handleRoomSuccess = (roomCode) => {
    navigate(`/room/${roomCode}`);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <div className="bg-primary-600 p-6 rounded-full">
                <Scroll className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="fantasy-title text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-fantasy-gold via-white to-fantasy-silver bg-clip-text text-transparent">
              TaleForge
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
              Forge epic tales together in real-time collaborative storytelling adventures
            </p>
            
            <div className="flex flex-wrap justify-center gap-8 mb-12">
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
          
          {/* How It Works Section */}
          <div className="mt-20 text-center">
            <h2 className="fantasy-title text-3xl font-bold mb-12 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              How TaleForge Works
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card flex flex-col items-center p-6">
                <div className="bg-primary-500/20 p-4 rounded-full mb-4">
                  <Users className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="fantasy-title text-xl font-bold mb-3">Create a Room</h3>
                <p className="text-white/70">Start a new story room and invite friends to join using a unique room code.</p>
              </div>
              
              <div className="card flex flex-col items-center p-6">
                <div className="bg-primary-500/20 p-4 rounded-full mb-4">
                  <Scroll className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="fantasy-title text-xl font-bold mb-3">Get Your Role</h3>
                <p className="text-white/70">Each player receives a unique role like Protagonist, Antagonist or Narrator.</p>
              </div>
              
              <div className="card flex flex-col items-center p-6">
                <div className="bg-primary-500/20 p-4 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary-400" />
                </div>
                <h3 className="fantasy-title text-xl font-bold mb-3">Tell the Story</h3>
                <p className="text-white/70">Collaborate in real-time to craft an epic tale with unexpected twists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;