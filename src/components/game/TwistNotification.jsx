// src/components/game/TwistNotification.jsx
import React from 'react';
import { Zap, X } from 'lucide-react';

const TwistNotification = ({ twist, onAcknowledge }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900 to-purple-800 border-2 border-purple-400 rounded-xl p-6 max-w-md w-full shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-6 h-6 text-purple-300" />
            <h3 className="fantasy-title text-xl font-bold text-white">
              Big Twist!
            </h3>
          </div>
          <button
            onClick={onAcknowledge}
            className="text-purple-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <p className="text-white leading-relaxed">
            {twist.content}
          </p>
        </div>

        <div className="text-center">
          <p className="text-purple-200 text-sm mb-4">
            Use this twist to dramatically change the story direction!
          </p>
          <button
            onClick={onAcknowledge}
            className="btn-primary w-full"
          >
            Got it! Let's twist this tale
          </button>
        </div>
      </div>
    </div>
  );
};

export default TwistNotification;