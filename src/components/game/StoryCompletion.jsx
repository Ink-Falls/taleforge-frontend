import React, { useEffect, useState } from 'react';
import { Download, BookOpen, Share2, Check, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { gameApi } from '../../api/gameApi';
import LeaveRoom from '../room/LeaveRoom';

const StoryCompletion = ({ roomData, messages }) => {
  const navigate = useNavigate();
  const [copied, setCopied] = React.useState(false);
  const [room, setRoom] = useState({});
  
  // Safely extract room data when component mounts or roomData changes
  useEffect(() => {
    // Extract room data safely
    const extractRoomData = () => {
      // Case 1: roomData itself is the room object
      if (roomData && (roomData.roomCode || roomData.title || roomData.genre)) {
        return roomData;
      }
      // Case 2: roomData has a room property
      else if (roomData && roomData.room) {
        return roomData.room;
      }
      // Default fallback with empty values to prevent errors
      return {
        roomCode: '',
        title: 'Untitled Story',
        description: '',
        genre: '',
        completedAt: new Date().toISOString(),
        duration: 1200
      };
    };
    
    setRoom(extractRoomData());
  }, [roomData]);
  
  // Helper to format date to readable format
  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown date';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleDownload = () => {
    try {
      if (!room.roomCode) {
        console.error('Room code is missing, cannot download story');
        alert('Unable to download: room code is missing');
        return;
      }
      
      console.log('Initiating story download for room:', room.roomCode);
      
      // Use the gameApi helper for downloading
      gameApi.downloadStory(room.roomCode);
    } catch (error) {
      console.error('Error downloading story:', error);
      alert('Failed to download. Please try again.');
    }
  };
  
  const handleCopyLink = () => {
    try {
      // Create a shareable link (you can adjust this based on your app's URL structure)
      const shareableLink = `${window.location.origin}/room/${room.roomCode}`;
      navigator.clipboard.writeText(shareableLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Failed to copy link. Please try again.');
    }
  };
  
  // Process messages for display
  const storyMessages = messages?.filter(msg => 
    msg.messageType !== 'SYSTEM'
  ) || [];
  
  // Safely get players (with fallback to empty array)
  const players = roomData?.players || [];
  
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
            disabled={!room.roomCode}
          >
            <Download className="w-5 h-5 mr-2" />
            Download Story
          </button>
          <button 
            className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-md flex items-center"
            onClick={handleCopyLink}
            disabled={!room.roomCode}
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-5 h-5 mr-2" />
                Share Link
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          {room.title || "Untitled Story"}
        </h2>
        {room.description && (
          <p className="text-white/70 mb-6">{room.description}</p>
        )}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="bg-white/10 px-4 py-2 rounded-full text-white/70 text-sm">
            {formatGenre(room.genre)}
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full text-white/70 text-sm">
            {players.length || 0} Contributors
          </div>
          <div className="bg-white/10 px-4 py-2 rounded-full text-white/70 text-sm">
            Completed {formatDate(room.completedAt || new Date())}
          </div>
        </div>
      </div>
      
      <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Story Transcript</h3>
          <button 
            onClick={handleDownload} 
            className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg"
            title="Download Story"
            disabled={!room.roomCode}
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-4">
          {storyMessages.length === 0 ? (
            <p className="text-white/50 text-center py-10">No messages found in this story.</p>
          ) : (
            storyMessages.map((msg, idx) => (
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
            ))
          )}
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-xl font-bold text-white mb-4">Contributors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {players.map(player => (
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
                    as {player.characterName || 'Unknown'} ({player.role?.replace('_', ' ')})
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {players.length === 0 && (
            <div className="col-span-full text-center py-4 text-white/50">
              No contributor information available
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          {/* Replace the simple button with LeaveRoom component */}
          <LeaveRoom 
            roomCode={room.roomCode} 
            customLabel="Back to Home"
            customIcon={<Home className="w-5 h-5 mr-2" />}
            className="inline-flex items-center bg-primary-600/50 hover:bg-primary-600 text-white px-6 py-2 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to format genre
function formatGenre(genre) {
  if (!genre) return 'General';
  return genre.replace('_', ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default StoryCompletion;