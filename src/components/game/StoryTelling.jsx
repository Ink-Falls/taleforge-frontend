import React, { useState, useRef, useEffect } from 'react';
import { Users, Clock, AlertTriangle, Check, Download, Send, Sparkles } from 'lucide-react';
import LeaveRoom from '../room/LeaveRoom';

const Storytelling = ({ 
  messages, 
  timer, 
  twist, 
  currentPlayer, 
  roomData, 
  onSendMessage, 
  onCompleteStory 
}) => {
  const [message, setMessage] = useState('');
  const [isTwist, setIsTwist] = useState(false);
  const [showTwist, setShowTwist] = useState(false);
  const [twistContent, setTwistContent] = useState(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Show twist notification when a new twist arrives
  useEffect(() => {
    if (twist) {
      setTwistContent(twist);
      setShowTwist(true);
    }
  }, [twist]);
  
  // Log messages for debugging
  useEffect(() => {
    console.log('Storytelling - Messages updated:', messages);
  }, [messages]);
  
  // For local message preview while waiting for server response
  const [localMessages, setLocalMessages] = useState([]);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, localMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Add a helper function to safely get room data properties
  const getRoomData = () => {
    // If roomData has a 'room' property, use that
    if (roomData?.room) {
      return roomData.room;
    }
    
    // If roomData itself has properties like duration, status, etc. use roomData directly
    if (roomData?.duration || roomData?.roomCode || roomData?.status) {
      return roomData;
    }
    
    // Fallback to an empty object with default values
    return { duration: 1200, roomCode: '' };
  };
  
  // Get room data using the helper function
  const room = getRoomData();
  
  // Format remaining time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Get remaining time from timer or default
  const remainingTime = timer ? timer.remainingTime : room.duration;
  const totalTime = timer ? timer.totalTime : room.duration;
  const timeRemaining = formatTime(remainingTime);
  const progress = totalTime > 0 ? (remainingTime / totalTime) * 100 : 100;
  
  const handleSendMessage = async () => {
    if (!message.trim() || sending) return;
    
    // Create a temporary message to show immediately
    const tempMessage = {
      id: `temp-${Date.now()}`,
      content: message,
      messageType: isTwist ? 'TWIST' : 'REGULAR',
      senderName: currentPlayer?.playerName || 'You',
      senderRole: currentPlayer?.role,
      senderId: currentPlayer?.id,
      timestamp: new Date().toISOString(),
      isTemp: true // Flag to identify this as a temporary message
    };
    
    // Add to local messages
    setLocalMessages(prev => [...prev, tempMessage]);
    
    setSending(true);
    try {
      // Clear input field immediately for better UX
      const sentContent = message;
      const sentType = isTwist ? 'TWIST' : 'REGULAR';
      setMessage('');
      setIsTwist(false);
      
      await onSendMessage(sentContent, sentType);
      
      // Remove the temporary message when it's confirmed
      setTimeout(() => {
        setLocalMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      }, 2000);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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

  // Combine server messages and local temporary messages
  const allMessages = [...messages, ...localMessages.filter(m => 
    // Only include local messages that don't have matching server messages
    !messages.some(serverMsg => 
      (serverMsg.content === m.content && 
       serverMsg.senderId === m.senderId &&
       serverMsg.messageType === m.messageType)
    )
  )];

  return (
    <div>
      {/* Room Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="fantasy-title text-3xl font-bold text-white">
            {room.title || `Room: ${room.roomCode}`}
          </h1>
          {room.description && (
            <p className="text-white/70 mt-1">{room.description}</p>
          )}
        </div>
        <LeaveRoom roomCode={room.roomCode} />
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
          <button
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded flex items-center"
            onClick={() => setShowCompleteConfirm(true)}
          >
            <Check className="w-4 h-4 mr-1" />
            Complete Story
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chat Area - Main Content */}
        <div className="lg:col-span-3">
          {/* Timer Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="text-white/70">Time Remaining</span>
              <span className="text-white font-medium">{timeRemaining}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  progress > 50 ? 'bg-green-500' : 
                  progress > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Messages */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-4 h-[60vh] overflow-y-auto">
            {allMessages.length === 0 && (
              <div className="text-center py-8 text-white/50">
                <p>No messages yet. Start the story!</p>
              </div>
            )}
            
            {allMessages.map((msg, idx) => (
              <div 
                key={msg.id || `msg-${idx}`} 
                className={`p-3 rounded-lg mb-4 ${
                  msg.isTemp ? 'opacity-60 border border-dashed border-white/30 ' : ''
                }${
                  msg.messageType === 'SYSTEM' 
                    ? 'bg-white/10 text-yellow-200 border-l-4 border-yellow-500' : 
                  msg.messageType === 'TWIST' 
                    ? 'bg-purple-900/30 border-l-4 border-purple-500 text-white' :
                    msg.senderId === currentPlayer?.id
                      ? 'bg-primary-900/30 border-l-4 border-primary-500 text-white'
                      : 'bg-white/10 text-white'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    {msg.messageType === 'SYSTEM' ? (
                      <span className="font-bold">System</span>
                    ) : (
                      <>
                        <span className="mr-1">
                          {msg.senderRole === 'PROTAGONIST' ? '🗡️' : 
                          msg.senderRole === 'ANTAGONIST' ? '👹' :
                          msg.senderRole === 'NARRATOR' ? '📚' : '👤'}
                        </span>
                        <span className="font-bold">
                          {msg.messageType === 'TWIST' && (
                            <span className="bg-purple-500/40 text-xs px-2 py-0.5 rounded mr-1">TWIST</span>
                          )}
                          {msg.senderName || 'Unknown'}
                        </span>
                        {msg.senderRole && msg.messageType !== 'SYSTEM' && (
                          <span className="text-xs text-white/60 ml-2">
                            {msg.senderRole.replace('_', ' ')}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  {msg.timestamp && (
                    <span className="text-xs text-white/50">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-3">
            <div className="flex items-start">
              {/* Role/Character indicator */}
              <div className="bg-white/10 px-3 py-2 rounded-l-lg text-white/70 flex items-center">
                {currentPlayer?.role === 'PROTAGONIST' ? '🗡️' : 
                currentPlayer?.role === 'ANTAGONIST' ? '👹' :
                currentPlayer?.role === 'NARRATOR' ? '📚' : '👤'}
              </div>
              
              {/* Text input */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your story contribution..."
                className="flex-grow bg-white/10 border-0 px-4 py-2 text-white resize-none focus:ring-0 focus:outline-none"
                rows={2}
                disabled={sending || isCompleting}
              />
              
              {/* Action buttons */}
              <div className="flex">
                <button
                  className={`px-3 py-2 ${
                    isTwist ? 'bg-purple-700 text-white' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20'
                  }`}
                  onClick={() => setIsTwist(!isTwist)}
                  disabled={sending || isCompleting}
                >
                  <Sparkles className="w-4 h-4" />
                </button>
                
                <button
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg flex items-center"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || sending || isCompleting}
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            
            {isTwist && (
              <div className="mt-2 p-2 bg-purple-900/20 border border-purple-500/30 rounded text-white/90 text-sm">
                <span className="font-bold">Plot Twist Mode:</span> Your next message will be highlighted as a major twist in the story!
              </div>
            )}
          </div>
        </div>
        
        {/* Players Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <h2 className="text-lg font-bold text-white mb-4">Characters</h2>
            
            <div className="space-y-3">
              {roomData.players?.map(player => (
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
                  <span className="text-white">{formatGenre(room.genre)}</span>
                </div>
                <div>
                  <span className="text-white/60">Duration:</span>{' '}
                  <span className="text-white">{Math.floor(room.duration / 60)} minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Twist Notification Modal */}
      {showTwist && twistContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-500/30 rounded-lg p-6 max-w-md w-full animate-fade-in-up shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                Plot Twist Opportunity
              </h3>
              <button 
                onClick={() => setShowTwist(false)}
                className="text-white/70 hover:text-white"
              >
                <AlertTriangle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-white/90 mb-4">
                You've been chosen to introduce a plot twist to the story!
              </p>
              
              <div className="bg-purple-700/50 border border-purple-500/50 p-4 rounded-lg">
                <p className="text-white font-medium">{twistContent.twistPrompt}</p>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button 
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded"
                onClick={() => setShowTwist(false)}
              >
                I'll Add My Twist
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Complete Story Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white/5 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-500/20 p-3 rounded-full">
                <AlertTriangle className="w-6 h-6 text-primary-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Complete Story?</h3>
                <p className="text-white/70 mb-6">
                  Are you sure you want to complete the story? This will end the storytelling session for everyone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button 
                    className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded"
                    onClick={() => setShowCompleteConfirm(false)}
                    disabled={isCompleting}
                  >
                    Cancel
                  </button>
                  <button 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded flex items-center"
                    onClick={handleCompleteStory}
                    disabled={isCompleting}
                  >
                    {isCompleting ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Completing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Complete Story
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
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

export default Storytelling;