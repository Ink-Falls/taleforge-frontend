// src/pages/NotFound.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center card">
        <FileQuestion className="w-20 h-20 text-white/40 mx-auto mb-6" />
        <h1 className="fantasy-title text-3xl font-bold text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-white/70 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          className="btn-primary inline-flex items-center justify-center"
        >
          <Home className="w-4 h-4 mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;