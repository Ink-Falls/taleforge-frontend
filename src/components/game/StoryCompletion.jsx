// src/components/game/StoryCompletion.jsx
import React, { useState } from 'react';
import { Check, Download, Share } from 'lucide-react';
import Button from '../common/Button';

const StoryCompletion = ({ roomData, messages }) => {
  const [copied, setCopied] = useState(false);

  // Filter out system messages and sort by timestamp
  const storyMessages = messages
    .filter(msg => msg.messageType !== 'SYSTEM')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const generateStoryText = () => {
    const title = `# ${roomData.room.title}\n\n`;
    const description = roomData.room.description ? `${roomData.room.description}\n\n` : '';
    
    const players = '## Characters\n\n' + roomData.players
      .map(p => `- **${p.characterName || p.playerName}** (${p.role.replace('_', ' ')})`)
      .join('\n') + '\n\n';
    
    const story = '## Story\n\n' + storyMessages
      .map(msg => {
        const sender = msg.messageType === 'TWIST' 
          ? `**${msg.senderName} (BIG TWIST)**` 
          : `**${msg.senderName}**`;
        return `${sender}: ${msg.content}`;
      })
      .join('\n\n');
    
    const footer = `\n\n---\n*Created with TaleForge on ${new Date(roomData.room.completedAt).toLocaleDateString()}*`;
    
    return title + description + players + story + footer;
  };

  const handleCopyStory = () => {
    navigator.clipboard.writeText(generateStoryText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadStory = () => {
    const storyText = generateStoryText();
    const blob = new Blob([storyText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `${roomData.room.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center space-x-2 mb-6">
          <Check className="w-6 h-6 text-green-400" />
          <h3 className="fantasy-title text-xl font-bold text-white">
            Story Complete!
          </h3>
        </div>
        
        <div className="mb-6">
          <h2 className="fantasy-title text-2xl font-bold text-white mb-2">
            {roomData.room.title}
          </h2>
          {roomData.room.description && (
            <p className="text-white/70 mb-4">{roomData.room.description}</p>
          )}
          <div className="flex items-center space-x-4 text-sm text-white/60">
            <div>Room: {roomData.room.roomCode}</div>
            <div>Genre: {roomData.room.genre.replace('_', ' ')}</div>
            <div>
              {new Date(roomData.room.completedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-white font-medium mb-3">Characters</h4>
            <div className="space-y-2">
              {roomData.players.map(player => (
                <div key={player.id} className="flex items-center space-x-2 bg-white/5 p-2 rounded">
                  <div className="text-lg">
                    {player.role === 'PROTAGONIST' ? '🗡️' : 
                     player.role === 'ANTAGONIST' ? '👹' :
                     player.role === 'NARRATOR' ? '📚' : '👤'}
                  </div>
                  <div>
                    <div className="text-white font-medium">{player.characterName || player.playerName}</div>
                    <div className="text-sm text-white/60">{player.role.replace('_', ' ')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-medium mb-3">Statistics</h4>
            <div className="space-y-2">
              <div className="bg-white/5 p-3 rounded">
                <div className="text-sm text-white/60">Total Messages</div>
                <div className="text-lg font-medium text-white">{storyMessages.length}</div>
              </div>
              <div className="bg-white/5 p-3 rounded">
                <div className="text-sm text-white/60">Story Duration</div>
                <div className="text-lg font-medium text-white">
                  {Math.floor(roomData.room.duration / 60)} minutes
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={handleCopyStory} 
            icon={copied ? <Check className="w-4 h-4" /> : <Share className="w-4 h-4" />}
            variant={copied ? 'secondary' : 'primary'}
          >
            {copied ? 'Copied!' : 'Copy Story'}
          </Button>
          <Button 
            onClick={handleDownloadStory}
            icon={<Download className="w-4 h-4" />}
            variant="secondary"
          >
            Download as Markdown
          </Button>
        </div>
      </div>
      
      <div className="card">
        <h3 className="fantasy-title text-lg font-bold text-white mb-4">
          Story Transcript
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-white/5 rounded-lg">
          {storyMessages.map((message, index) => (
            <div key={message.id || index} className="leading-relaxed">
              <div className="font-medium text-white">
                {message.senderName} 
                {message.messageType === 'TWIST' && 
                  <span className="ml-2 text-xs bg-purple-500/50 px-2 py-1 rounded">BIG TWIST</span>}
                :
              </div>
              <div className="text-white/80 mt-1">{message.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoryCompletion;