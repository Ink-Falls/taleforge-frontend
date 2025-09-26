import React from 'react';
import { Download, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StoryCompletion = ({ roomData, messages }) => {
  const navigate = useNavigate();
  
  const handleDownload = () => {
    // Create download link
    const downloadUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/stories/${roomData.room.roomCode}/download`;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `story_${roomData.room.roomCode}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-block p-3 bg-primary-600/20 rounded-full mb-4">
          <BookOpen className="w-12 h-12 text-primary-400" />
        </div>
        <h1 className="fantasy-title text-3xl font-bold text-white mb-2">
          Story Complete!
        </h1>
        <p className="text-white/70">
          Your collaborative tale has come to an end. You can read through it below or download it.
        </p>
        
        <div className="flex justify-center mt-6 gap-4">
          <button 
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-md flex items-center"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Story
          </button>
          <button 
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-md"
            onClick={() => navigate('/')}
          >
            Create New Story
          </button>
        </div>
      </div>
      
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {roomData.room.title}
        </h2>
        {roomData.room.description && (
          <p className="text-white/70 mb-6">{roomData.room.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-white/10 px-4 py-2 rounded-full text-white/70 text-sm">
            {formatGenre(roomData.room.genre)}
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full text-white/70 text-sm">
            {roomData.players.length} Contributors
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-white mb-4">Story Transcript</h3>
        
        <div className="space-y-4">
          {messages.filter(msg => msg.messageType !== 'SYSTEM').map((msg, idx) => (
            <div key={idx} className="border-b border-white/10 pb-4">
              <div className="flex items-center mb-2">
                <div className="text-lg mr-2">
                  {msg.senderRole === 'PROTAGONIST' ? '🗡️' : 
                   msg.senderRole === 'ANTAGONIST' ? '👹' :
                   msg.senderRole === 'NARRATOR' ? '📚' : '👤'}
                </div>
                <div>
                  <div className="font-medium text-white">
                    {msg.messageType === 'TWIST' && (
                      <span className="bg-purple-500/40 text-xs px-2 py-0.5 rounded mr-1">TWIST</span>
                    )}
                    {msg.senderName || 'Unknown'}
                  </div>
                  {msg.senderRole && (
                    <div className="text-xs text-white/60">
                      {msg.senderRole.replace('_', ' ')}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-white/90 pl-8">{msg.content}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Contributors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {roomData.players.map(player => (
            <div key={player.id} className="bg-white/5 p-3 rounded-lg">
              <div className="flex items-center">
                <div className="text-lg mr-2">
                  {player.role === 'PROTAGONIST' ? '🗡️' : 
                   player.role === 'ANTAGONIST' ? '👹' :
                   player.role === 'NARRATOR' ? '📚' : '👤'}
                </div>
                <div>
                  <div className="font-medium text-white">{player.playerName}</div>
                  <div className="text-sm text-white/60">
                    as {player.characterName} ({player.role?.replace('_', ' ')})
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper function to format genre
function formatGenre(genre) {
  if (!genre) return '';
  return genre.replace('_', ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default StoryCompletion;