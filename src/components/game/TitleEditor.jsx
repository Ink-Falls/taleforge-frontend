import React, { useState } from 'react';
import { Save, Edit } from 'lucide-react';

const TitleEditor = ({ 
  currentTitle, 
  currentDescription, 
  onSave, 
  isLoading 
}) => {
  const [title, setTitle] = useState(currentTitle || '');
  const [description, setDescription] = useState(currentDescription || '');
  const [editing, setEditing] = useState(!currentTitle);
  
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Title cannot be empty');
      return;
    }
    
    try {
      await onSave({ title, description });
      setEditing(false);
    } catch (error) {
      console.error('Error saving title:', error);
    }
  };
  
  if (!editing) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center">
          Story Details
        </h2>
        
        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-white/60 text-sm mb-1">Title</label>
            <div className="font-medium text-white text-lg">{currentTitle}</div>
          </div>
          
          {currentDescription && (
            <div>
              <label className="block text-white/60 text-sm mb-1">Description</label>
              <div className="text-white/90">{currentDescription}</div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setEditing(true)}
          className="text-white bg-primary-600/50 hover:bg-primary-600/70 px-3 py-1 rounded-md text-sm flex items-center"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit Details
        </button>
      </div>
    );
  }
  
  return (
    <div className="card">
      <h2 className="text-xl font-bold text-white mb-4">Create Story Details</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-white font-medium mb-2">
            Story Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/60 focus:border-primary-500 transition-all duration-200 outline-none border-white/30"
            placeholder="Enter a captivating title..."
            maxLength={100}
          />
        </div>
        
        <div>
          <label className="block text-white font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border rounded-lg text-white placeholder-white/60 focus:border-primary-500 transition-all duration-200 outline-none border-white/30"
            placeholder="Set the scene for your story..."
            rows={4}
            maxLength={500}
          />
        </div>
        
        <button
          onClick={handleSave}
          className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Story Details
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TitleEditor;