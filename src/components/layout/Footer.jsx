// src/components/layout/Footer.jsx
import React from 'react';
import { Github, Code } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-fantasy-darker/50 border-t border-white/5 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center text-white/60 text-sm">
          <div className="mb-2 md:mb-0">
            © {year} TaleForge. All rights reserved.
          </div>
          <div className="flex items-center space-x-6">
            <a
              href="https://github.com/yourusername/taleforge"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>API Docs</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;