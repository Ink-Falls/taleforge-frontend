import React, { useState } from 'react';
import Button from '../common/Button';
import { Send, Sparkles } from 'lucide-react';

const ChatInput = ({ onSendMessage, disabled, currentRole }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isTwist, setIsTwist] = useState(false);
  
  const handleSend = async () => {
    if (!message.trim()) return;
    
    setSending(true);
    try {
      await onSendMessage(message, isTwist ? 'TWIST' : 'REGULAR');
      setMessage('');
      setIsTwist(false);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
      <div className="flex items-start">
        {/* Role/Character indicator */}
        <div className="bg-white/10 px-3 py-2 rounded-l-lg text-white/70 flex items-center">
          {currentRole === 'PROTAGONIST' ? '🗡️' : 
           currentRole === 'ANTAGONIST' ? '👹' :
           currentRole === 'NARRATOR' ? '📚' : '👤'}
        </div>
        
        {/* Text input */}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your story contribution..."
          className="flex-grow bg-white/10 border-0 px-4 py-2 text-white resize-none focus:ring-0 focus:outline-none"
          rows={2}
          disabled={disabled || sending}
        />
        
        {/* Action buttons */}
        <div className="flex">
          <Button
            variant={isTwist ? 'secondary' : 'ghost'}
            className="rounded-none"
            onClick={() => setIsTwist(!isTwist)}
            disabled={disabled || sending}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Twist
          </Button>
          
          <Button
            variant="primary"
            className="rounded-l-none rounded-r-lg"
            onClick={handleSend}
            disabled={!message.trim() || disabled || sending}
            isLoading={sending}
            icon={<Send className="w-4 h-4" />}
          >
            Send
          </Button>
        </div>
      </div>
      
      {isTwist && (
        <div className="mt-2 p-2 bg-secondary/20 border border-secondary/30 rounded text-white/90 text-sm">
          <span className="font-bold">Plot Twist Mode:</span> Your next message will be highlighted as a major twist in the story!
        </div>
      )}
    </div>
  );
};

export default ChatInput;