import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { roomApi } from '../../api/roomApi';

const LeaveRoom = ({ roomCode }) => {
  const navigate = useNavigate();
  const { clearSession } = useSession();

  const handleLeaveRoom = async () => {
    if (window.confirm('Are you sure you want to leave this room?')) {
      try {
        // Call the leave room API
        await roomApi.leaveRoom(roomCode);
        
        // Clear session and redirect to home
        clearSession();
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Error leaving room:', error);
        alert('Failed to leave room. Please try again.');
      }
    }
  };

  return (
    <button
      className="flex items-center bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded"
      onClick={handleLeaveRoom}
    >
      <LogOut className="w-4 h-4 mr-2" />
      Leave Room
    </button>
  );
};

export default LeaveRoom;