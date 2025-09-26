// src/components/common/Timer.jsx
import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

const Timer = ({ remainingTime, totalTime, isCompleted }) => {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    setTimeLeft(remainingTime);
  }, [remainingTime]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!totalTime) return 0;
    return Math.max(0, (timeLeft / totalTime) * 100);
  };

  const getTimerColor = () => {
    if (isCompleted) return 'text-purple-400';
    if (timeLeft <= 60) return 'text-red-400';
    if (timeLeft <= 300) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getProgressColor = () => {
    if (isCompleted) return 'bg-purple-500';
    if (timeLeft <= 60) return 'bg-red-500';
    if (timeLeft <= 300) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (isCompleted) {
    return (
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Clock className="w-5 h-5 text-purple-400" />
          <span className="text-purple-400 font-bold">Story Complete!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <Clock className={`w-5 h-5 ${getTimerColor()}`} />
        <span className={`font-bold text-lg ${getTimerColor()}`}>
          {formatTime(timeLeft)}
        </span>
        {timeLeft <= 60 && (
          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
        )}
      </div>
      
      {/* Progress Bar */}
      <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full ${getProgressColor()} transition-all duration-1000 ease-linear`}
          style={{ width: `${getProgressPercentage()}%` }}
        />
      </div>
      
      {timeLeft <= 60 && timeLeft > 0 && (
        <p className="text-xs text-red-400 mt-1 animate-pulse">
          Time running out!
        </p>
      )}
    </div>
  );
};

export default Timer;