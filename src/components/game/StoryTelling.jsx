// src/components/game/StoryTelling.jsx
import React, { useState, useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Timer from '../common/Timer';
import TwistNotification from './TwistNotification';
import { Clock, Users, Book, Zap } from 'lucide-react';

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
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (twist) {
      setShowTwist(true);
    }
  }, [twist]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTwistAcknowledge = () => {
    setShowTwist(false);
  };

  const storyMessages = messages.filter(msg => 
    msg.messageType === 'REGULAR' || msg.messageType === 'TWIST'
  );

  const systemMessages = messages.filter(msg => msg.messageType === 'SYSTEM');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
      {/* Story Chat - Main Column */}
      <div className="lg:col-span-3 flex flex-col">
        <div className="card flex-1 flex flex-col">
          {/* Story Header */}
          <div className="border-b border-white/20 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="fantasy-title text-xl font-bold text-white mb-1">
                  {roomData.room.title}
                </h2>
                {roomData.room.description && (
                  <p className="text-white/70 text-sm">{roomData.room.description}</p>
                )}
              </div>
              <div className="text-right">
                <Timer 
                  remainingTime={timer?.remainingTime}
                  totalTime={timer?.totalTime}
                  isCompleted={timer?.isCompleted}
                />
              </div>
            </div>
          </div>

          {/* Messages Display */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
            {storyMessages.length === 0 ? (
              <div className="text-center text-white/60 py-8">
                <Book className="w-12 h-12 mx-auto mb-4 text-white/40" />
                <p>The story begins now...</p>
                <p className="text-sm mt-2">Be the first to contribute to this tale!</p>
              </div>
            ) : (
              <>
                {storyMessages.map((message, index) => (
                  <ChatMessage
                    key={message.id || index}
                    message={message}
                    isCurrentUser={message.senderId === currentPlayer?.id}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Chat Input */}
          <ChatInput
            onSendMessage={onSendMessage}
            disabled={timer?.isCompleted}
            currentPlayer={currentPlayer}
          />
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-4">
        {/* Room Info */}
        <div className="card">
          <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Players</span>
          </h3>
          <div className="space-y-2">
            {roomData.players.map((player) => (
              <div key={player.id} className="flex items-center space-x-2 text-sm">
                <span className="text-lg">{player.role === 'PROTAGONIST' ? '🗡️' : 
                                                player.role === 'ANTAGONIST' ? '👹' : 
                                                player.role === 'NARRATOR' ? '📚' : '👤'}</span>
                <div className="flex-1">
                  <p className="text-white font-medium">{player.characterName || player.playerName}</p>
                  <p className="text-white/60 text-xs">{player.role.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Messages */}
        {systemMessages.length > 0 && (
          <div className="card">
            <h3 className="font-semibold text-white mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Updates</span>
            </h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {systemMessages.slice(-5).map((message, index) => (
                <div key={message.id || index} className="text-sm text-white/70 p-2 bg-white/5 rounded">
                  {message.content}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Story Button (Title Creator Only) */}
        {currentPlayer?.isTitleCreator && !timer?.isCompleted && (
          <button
            onClick={onCompleteStory}
            className="w-full btn-secondary flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Complete Story</span>
          </button>
        )}
      </div>

      {/* Twist Notification Modal */}
      {showTwist && twist && (
        <TwistNotification
          twist={twist}
          onAcknowledge={handleTwistAcknowledge}
        />
      )}
    </div>
  );
};

export default StoryTelling;