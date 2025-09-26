import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import Home from './pages/Home';
import Room from './pages/Room';
import NotFound from './pages/NotFound';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomCode" element={<Room />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" />} />
        </Routes>
      </Router>
    </SessionProvider>
  );
}

export default App;