// src/utils/constants.js
export const ROOM_STATUSES = {
  CREATED: 'CREATED',
  ROLE_ASSIGNMENT: 'ROLE_ASSIGNMENT',
  STORYTELLING: 'STORYTELLING',
  COMPLETED: 'COMPLETED'
};

export const MESSAGE_TYPES = {
  REGULAR: 'REGULAR',
  SYSTEM: 'SYSTEM',
  TWIST: 'TWIST'
};

export const PLAYER_ROLES = {
  PROTAGONIST: {
    name: 'Protagonist',
    description: 'The hero of the story, driving the main narrative forward.',
    icon: '🗡️'
  },
  ANTAGONIST: {
    name: 'Antagonist',
    description: 'The primary opposition, creating conflict and challenges.',
    icon: '👹'
  },
  NARRATOR: {
    name: 'Narrator',
    description: 'The storyteller, providing context and world-building.',
    icon: '📚'
  },
  SIDE_CHARACTER: {
    name: 'Side Character',
    description: 'Supporting characters that enrich the story world.',
    icon: '👤'
  }
};

export const GENRES = [
  { value: 'FANTASY', label: 'Fantasy' },
  { value: 'SCI_FI', label: 'Science Fiction' },
  { value: 'MYSTERY', label: 'Mystery' },
  { value: 'HORROR', label: 'Horror' },
  { value: 'ADVENTURE', label: 'Adventure' }
];