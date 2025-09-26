import React, { useState } from 'react';
import Button from '../common/Button';
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
        
        <Button
          onClick={() => setEditing(true)}
          variant="ghost"
          size="sm"
          icon={<Edit className="w-4 h-4" />}
        >
          Edit Details
        </Button>
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
            className="w-full px-4 py-2 bg-white/10 border rounded-lg text-white 
                     placeholder-white/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 
                     transition-all duration-200 outline-none border-white/30"
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
            className="w-full px-4 py-2 bg-white/10 border rounded-lg text-white 
                     placeholder-white/60 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 
                     transition-all duration-200 outline-none border-white/30"
            placeholder="Set the scene for your story..."
            rows={4}
            maxLength={500}
          />
        </div>
        
        <Button
          onClick={handleSave}
          fullWidth
          isLoading={isLoading}
          icon={<Save className="w-4 h-4" />}
        >
          Save Story Details
        </Button>
      </div>
    </div>
  );
};

export default TitleEditor;