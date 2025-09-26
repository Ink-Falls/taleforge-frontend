import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SessionProvider } from './context/SessionContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Room from './pages/Room';
import NotFound from './pages/NotFound';

function App() {
  return (
    <SessionProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomCode" element={<Room />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Layout>
      </Router>
    </SessionProvider>
  );
}

export default App;