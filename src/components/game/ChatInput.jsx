// src/components/game/ChatInput.jsx
import React, { useState } from 'react';
import { Send, Zap } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled, currentPlayer }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      setIsTyping(true);
      onSendMessage(message.trim(), 'REGULAR');
      setMessage('');
      setTimeout(() => setIsTyping(false), 500);
    }
  };

  const handleTwistSubmit = () => {
    if (message.trim() && !disabled) {
      setIsTyping(true);
      onSendMessage(message.trim(), 'TWIST');
      setMessage('');
      setTimeout(() => setIsTyping(false), 500);
    }
  };

  if (disabled) {
    return (
      <div className="p-4 bg-gray-500/20 rounded-lg border border-gray-500/40">
        <p className="text-center text-gray-400">Story has been completed</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex space-x-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 input-field"
          placeholder="Continue the story..."
          maxLength={500}
          disabled={isTyping}
        />
        <button
          type="submit"
          disabled={!message.trim() || isTyping}
          className="btn-primary px-4 flex items-center space-x-2"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={handleTwistSubmit}
          disabled={!message.trim() || isTyping}
          className="btn-secondary text-sm flex items-center space-x-1"
        >
          <Zap className="w-3 h-3" />
          <span>Send as Big Twist</span>
        </button>
        
        <div className="text-xs text-white/60">
          {message.length}/500 characters
        </div>
      </div>
    </form>
  );
};

export default ChatInput;