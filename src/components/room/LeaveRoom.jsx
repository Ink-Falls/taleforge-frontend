// src/components/room/LeaveRoom.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../../api/roomApi';
import { useSession } from '../../context/SessionContext';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { LogOut, AlertCircle } from 'lucide-react';

const LeaveRoom = ({ roomCode }) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { clearSession } = useSession();
  const navigate = useNavigate();

  const handleLeaveRoom = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await roomApi.leaveRoom(roomCode);
      clearSession();
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to leave the room.');
      console.error('Error leaving room:', err);
      setIsConfirmOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button 
        variant="ghost" 
        icon={<LogOut className="w-4 h-4" />}
        onClick={() => setIsConfirmOpen(true)}
        className="text-white/70 hover:text-white"
      >
        Leave Room
      </Button>
      
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title="Leave Room"
        footer={
          <>
            <Button 
              variant="ghost" 
              onClick={() => setIsConfirmOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleLeaveRoom}
              isLoading={loading}
            >
              Leave Room
            </Button>
          </>
        }
      >
        <div className="flex items-start space-x-4">
          <div className="bg-red-500/20 p-3 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">
              Are you sure you want to leave?
            </h3>
            <p className="text-white/70">
              This action cannot be undone. You'll lose your role and character if the story has already started.
            </p>
            {error && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-200">
                {error}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default LeaveRoom;