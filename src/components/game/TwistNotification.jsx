import React from 'react';
import { X, Sparkles } from 'lucide-react';
import Button from '../common/Button';

const TwistNotification = ({ twist, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-gradient-to-br from-purple-800 to-indigo-900 border border-purple-500/30 rounded-lg p-6 max-w-md w-full animate-fade-in-up shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
            Plot Twist Opportunity
          </h3>
          <button 
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-white/90 mb-4">
            You've been chosen to introduce a plot twist to the story!
          </p>
          
          <div className="bg-purple-700/50 border border-purple-500/50 p-4 rounded-lg">
            <p className="text-white font-medium">{twist.twistPrompt}</p>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={onClose}>
            I'll Add My Twist
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TwistNotification;