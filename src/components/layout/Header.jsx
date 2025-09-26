// src/components/layout/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Scroll, LogOut } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import Button from '../common/Button';

const Header = () => {
  const { currentRoomCode, clearSession } = useSession();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to leave? You will lose your current session.')) {
      clearSession();
      navigate('/');
    }
  };

  return (
    <header className="bg-gradient-to-r from-fantasy-dark/90 to-fantasy-darker/90 backdrop-blur-sm border-b border-white/10 sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <div className="bg-primary-600 p-2 rounded-full">
            <Scroll className="w-6 h-6 text-white" />
          </div>
          <span className="fantasy-title text-xl md:text-2xl font-bold bg-gradient-to-r from-fantasy-gold via-white to-fantasy-silver bg-clip-text text-transparent">
            TaleForge
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          {currentRoomCode && (
            <>
              <div className="hidden md:flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-md">
                <span className="text-sm text-white/70">Room:</span>
                <Link
                  to={`/room/${currentRoomCode}`}
                  className="font-mono text-sm font-medium text-white hover:text-primary-300 transition-colors"
                >
                  {currentRoomCode}
                </Link>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={<LogOut className="w-4 h-4" />}
                onClick={handleLogout}
                className="text-white/70 hover:text-white"
              >
                Leave
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;