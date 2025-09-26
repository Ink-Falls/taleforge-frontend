import React, { useEffect, useState } from 'react';

const Timer = ({ timeRemaining, totalTime }) => {
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    // Calculate progress as percentage
    const percentage = (timeRemaining / totalTime) * 100;
    setProgress(Math.max(0, Math.min(100, percentage)));
  }, [timeRemaining, totalTime]);

  // Format time for display (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get color based on remaining time
  const getColor = () => {
    if (progress > 50) return 'bg-green-500';
    if (progress > 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="text-white/70">Time Remaining</span>
        <span className="text-white font-medium">{formatTime(timeRemaining)}</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${getColor()}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default Timer;