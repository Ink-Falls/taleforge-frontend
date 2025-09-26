import React from 'react';
import { Sparkles } from 'lucide-react';

const ChatMessage = ({ message, isCurrentUser }) => {
  // Define message styles based on type and sender
  const getMessageStyles = () => {
    // System message
    if (message.messageType === 'SYSTEM') {
      return 'bg-white/10 text-yellow-200 border-l-4 border-yellow-500';
    }
    
    // Twist message
    if (message.messageType === 'TWIST') {
      return 'bg-purple-900/30 border-l-4 border-purple-500 text-white';
    }
    
    // Regular message - different styles for current user vs others
    return isCurrentUser 
      ? 'bg-primary-900/30 border-l-4 border-primary-500 text-white'
      : 'bg-white/10 text-white';
  };
  
  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Get the appropriate icon for the message type
  const getMessageIcon = () => {
    if (message.messageType === 'SYSTEM') {
      return '🔔';
    }
    if (message.messageType === 'TWIST') {
      return <Sparkles className="w-4 h-4 text-purple-400" />;
    }
    
    // Role-based icons
    if (message.senderRole === 'PROTAGONIST') {
      return '🗡️';
    }
    if (message.senderRole === 'ANTAGONIST') {
      return '👹';
    }
    if (message.senderRole === 'NARRATOR') {
      return '📚';
    }
    
    return '👤'; // Default
  };

  return (
    <div className={`p-3 rounded-lg mb-4 ${getMessageStyles()}`}>
      {/* Message Header */}
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          {message.messageType === 'SYSTEM' ? (
            <span className="font-bold">System</span>
          ) : (
            <>
              <span className="mr-1">{getMessageIcon()}</span>
              <span className="font-bold">
                {message.messageType === 'TWIST' && (
                  <span className="bg-purple-500/40 text-xs px-2 py-0.5 rounded mr-1">TWIST</span>
                )}
                {message.senderName || 'Unknown'}
              </span>
              {message.senderRole && message.messageType !== 'SYSTEM' && (
                <span className="text-xs text-white/60 ml-2">
                  {message.senderRole.replace('_', ' ')}
                </span>
              )}
            </>
          )}
        </div>
        <span className="text-xs text-white/50">
          {formatTime(message.timestamp)}
        </span>
      </div>
      
      {/* Message Content */}
      <div className="whitespace-pre-wrap">{message.content}</div>
    </div>
  );
};

export default ChatMessage;