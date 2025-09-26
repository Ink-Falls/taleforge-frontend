// src/components/game/TitleEditor.jsx
import React, { useState } from 'react';
import { Save, Sparkles } from 'lucide-react';

const TitleEditor = ({ currentTitle, currentDescription, onSave, isLoading }) => {
  const [title, setTitle] = useState(currentTitle || '');
  const [description, setDescription] = useState(currentDescription || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onSave({ title: title.trim(), description: description.trim() });
    }
  };

  return (
    <div className="card">
      <div className="flex items-center space-x-2 mb-6">
        <Sparkles className="w-6 h-6 text-fantasy-gold" />
        <h3 className="fantasy-title text-xl font-bold text-white">
          Create Your Story
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Story Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder="Enter an epic title..."
            maxLength={100}
            required
          />
        </div>

        <div>
          <label className="block text-white font-medium mb-2">
            Story Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field resize-none"
            rows={4}
            placeholder="Set the scene for your adventure..."
            maxLength={500}
          />
        </div>

        <button
          type="submit"
          disabled={!title.trim() || isLoading}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <Save className="w-4 h-4" />
          <span>{isLoading ? 'Saving...' : 'Save Story Details'}</span>
        </button>
      </form>
    </div>
  );
};

export default TitleEditor;