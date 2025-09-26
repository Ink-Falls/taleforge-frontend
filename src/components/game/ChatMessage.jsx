// src/components/game/ChatMessage.jsx
import React from 'react';
import { Zap, Clock } from 'lucide-react';

const ChatMessage = ({ message, isCurrentUser }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getMessageStyle = () => {
    if (message.messageType === 'SYSTEM') {
      return 'bg-blue-500/20 border-blue-500/40 text-blue-100';
    }
    if (message.messageType === 'TWIST') {
      return 'bg-purple-500/20 border-purple-500/40 text-purple-100 relative overflow-hidden';
    }
    if (isCurrentUser) {
      return 'bg-primary-600/20 border-primary-500/40 text-white ml-8';
    }
    return 'bg-white/5 border-white/20 text-white/90 mr-8';
  };

  const getRoleIcon = (role) => {
    const icons = {
      'PROTAGONIST': '🗡️',
      'ANTAGONIST': '👹',
      'NARRATOR': '📚',
      'SIDE_CHARACTER': '👤'
    };
    return icons[role] || '👤';
  };

  return (
    <div className={`p-4 rounded-lg border ${getMessageStyle()}`}>
      {message.messageType === 'TWIST' && (
        <div className="absolute top-0 right-0 p-2">
          <Zap className="w-4 h-4 text-purple-300" />
        </div>
      )}
      
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {message.messageType !== 'SYSTEM' && (
            <span className="text-sm">{getRoleIcon(message.senderRole)}</span>
          )}
          <span className="font-medium">
            {message.messageType === 'SYSTEM' ? 'SYSTEM' : message.senderName}
          </span>
          {message.messageType === 'TWIST' && (
            <span className="text-xs bg-purple-500/50 px-2 py-1 rounded">
              BIG TWIST
            </span>
          )}
        </div>
        
        {message.timestamp && (
          <div className="flex items-center space-x-1 text-xs opacity-60">
            <Clock className="w-3 h-3" />
            <span>{formatTime(message.timestamp)}</span>
          </div>
        )}
      </div>
      
      <div className="text-sm leading-relaxed">
        {message.content}
      </div>
    </div>
  );
};

export default ChatMessage;