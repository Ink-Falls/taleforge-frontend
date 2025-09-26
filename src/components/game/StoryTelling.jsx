import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Timer from '../common/Timer';
import TwistNotification from './TwistNotification';
import LeaveRoom from '../room/LeaveRoom';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Users, Clock, AlertTriangle, Check, Download } from 'lucide-react';

const StoryTelling = ({ 
  messages, 
  timer, 
  twist, 
  currentPlayer, 
  roomData, 
  onSendMessage, 
  onCompleteStory 
}) => {
  const [showTwist, setShowTwist] = useState(false);
  const [twistContent, setTwistContent] = useState(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  
  // Show twist notification when a new twist arrives
  useEffect(() => {
    if (twist) {
      setTwistContent(twist);
      setShowTwist(true);
    }
  }, [twist]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Format remaining time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get remaining time from timer or default
  const remainingTime = timer ? timer.remainingTime : roomData.room.duration;
  const totalTime = timer ? timer.totalTime : roomData.room.duration;
  const timeRemaining = formatTime(remainingTime);
  const progress = (remainingTime / totalTime) * 100;
  
  const handleSendMessage = (content, messageType) => {
    onSendMessage(content, messageType);
  };
  
  const handleCompleteStory = async () => {
    setIsCompleting(true);
    try {
      await onCompleteStory();
      setShowCompleteConfirm(false);
    } catch (error) {
      console.error('Error completing story:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div>
      {/* Room Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="fantasy-title text-3xl font-bold text-white">
            {roomData.room.title || `Room: ${roomData.room.roomCode}`}
          </h1>
          {roomData.room.description && (
            <p className="text-white/70 mt-1">{roomData.room.description}</p>
          )}
        </div>
        <LeaveRoom roomCode={roomData.room.roomCode} />
      </div>
      
      {/* Status Bar */}
      <div className="bg-white/5 rounded-lg p-3 mb-6 flex items-center justify-between">
        <div className="flex gap-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 text-white/70 mr-2" />
            <span className="text-white">{roomData.players.length} Players</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 text-white/70 mr-2" />
            <span className="text-white">{timeRemaining}</span>
          </div>
        </div>
        
        {/* Complete button (visible only to room creator) */}
        {currentPlayer?.isTitleCreator && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowCompleteConfirm(true)}
            icon={<Check className="w-4 h-4" />}
          >
            Complete Story
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area - Main Content */}
        <div className="lg:col-span-3">
          {/* Timer Bar */}
          <div className="mb-4">
            <Timer 
              timeRemaining={remainingTime} 
              totalTime={totalTime} 
            />
          </div>
          
          {/* Messages */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 h-[60vh] overflow-y-auto">
            {messages.length === 0 && (
              <div className="text-center py-8 text-white/50">
                <p>No messages yet. Start the story!</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <ChatMessage 
                key={msg.id || idx}
                message={msg}
                isCurrentUser={msg.senderId === currentPlayer?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <ChatInput 
            onSendMessage={handleSendMessage}
            disabled={isCompleting}
            currentRole={currentPlayer?.role}
          />
        </div>
        
        {/* Players Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4">Characters</h2>
            
            <div className="space-y-3">
              {roomData.players.map(player => (
                <div 
                  key={player.id} 
                  className={`p-3 rounded-lg ${
                    player.id === currentPlayer?.id 
                      ? 'bg-primary-600/20 border border-primary-600/30' 
                      : 'bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="text-lg">
                      {player.role === 'PROTAGONIST' ? '🗡️' : 
                       player.role === 'ANTAGONIST' ? '👹' :
                       player.role === 'NARRATOR' ? '📚' : '👤'}
                    </div>
                    <div>
                      <div className="font-medium text-white">
                        {player.characterName || player.playerName}
                        {player.id === currentPlayer?.id && (
                          <span className="text-xs ml-1 text-white/60">(You)</span>
                        )}
                      </div>
                      <div className="text-xs text-white/60">
                        {player.role?.replace('_', ' ')} · {player.playerName}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-3 bg-white/5 rounded-lg border border-white/10">
              <h3 className="font-medium text-white mb-2">Story Information</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-white/60">Genre:</span>{' '}
                  <span className="text-white">{formatGenre(roomData.room.genre)}</span>
                </div>
                <div>
                  <span className="text-white/60">Duration:</span>{' '}
                  <span className="text-white">{Math.floor(roomData.room.duration / 60)} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Twist Notification */}
      {showTwist && twistContent && (
        <TwistNotification 
          twist={twistContent} 
          onClose={() => setShowTwist(false)} 
        />
      )}
      
      {/* Complete Story Confirmation Modal */}
      <Modal
        isOpen={showCompleteConfirm}
        onClose={() => setShowCompleteConfirm(false)}
        title="Complete Story"
        footer={
          <>
            <Button 
              variant="ghost" 
              onClick={() => setShowCompleteConfirm(false)}
              disabled={isCompleting}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleCompleteStory}
              isLoading={isCompleting}
            >
              Complete Story
            </Button>
          </>
        }
      >
        <div className="flex items-start space-x-4">
          <div className="bg-primary-500/20 p-3 rounded-full">
            <AlertTriangle className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <p className="text-white mb-4">
              Are you sure you want to complete the story? This will end the storytelling session for everyone.
            </p>
            <p className="text-white/70 text-sm">
              You'll be able to view and download the final story after completion.
            </p>
          </div>
        </div>
      </Modal>
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

export default StoryTelling;