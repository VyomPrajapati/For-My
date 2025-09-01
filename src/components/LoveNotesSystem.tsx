import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoveNote {
  id: string;
  message: string;
  emoji: string;
  timestamp: number;
  likes: number;
  isLiked: boolean;
}

interface LoveNotesSystemProps {
  messageTemplates?: string[];
  customEmojis?: string[];
  theme?: any;
  isAdmin?: boolean;
}

const LoveNotesSystem: React.FC<LoveNotesSystemProps> = ({
  messageTemplates = [],
  customEmojis = [],
  theme,
  isAdmin = false
}) => {
  const [notes, setNotes] = useState<LoveNote[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('💖');
  const [showNotes, setShowNotes] = useState(false);
  const [filter, setFilter] = useState<'all' | 'recent' | 'popular'>('all');

  // Default emojis and templates
  const defaultEmojis = ['💖', '💕', '💗', '💓', '💞', '💘', '💝', '🌹', '🌸', '✨', '💫', '🌟'];
  const defaultTemplates = [
    "You make my heart smile every day! 💖",
    "Sending you all the love in the world! 💕",
    "You're the missing piece to my puzzle! 💗",
    "Every moment with you is pure magic! ✨",
    "You're my favorite person in the whole universe! 🌟"
  ];

  const allEmojis = [...defaultEmojis, ...customEmojis];
  const allTemplates = [...defaultTemplates, ...messageTemplates];

  // Load notes from localStorage
  useEffect(() => {
    const savedNotes = localStorage.getItem('loveNotes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
  }, []);

  // Escape key handler to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showNotes) {
        setShowNotes(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showNotes]);

  // Save notes to localStorage
  useEffect(() => {
    localStorage.setItem('loveNotes', JSON.stringify(notes));
  }, [notes]);

  // Add new love note
  const addLoveNote = () => {
    if (!newMessage.trim()) return;

    const note: LoveNote = {
      id: Date.now().toString(),
      message: newMessage.trim(),
      emoji: selectedEmoji,
      timestamp: Date.now(),
      likes: 0,
      isLiked: false
    };

    setNotes([note, ...notes]);
    setNewMessage('');
    setSelectedEmoji('💖');

    // Create particle effect
    createNoteParticles();
  };

  // Like a note
  const toggleLike = (noteId: string) => {
    setNotes(notes.map(note => {
      if (note.id === noteId) {
        return {
          ...note,
          likes: note.isLiked ? note.likes - 1 : note.likes + 1,
          isLiked: !note.isLiked
        };
      }
      return note;
    }));
  };

  // Delete a note (admin only)
  const deleteNote = (noteId: string) => {
    if (isAdmin) {
      if (window.confirm('Are you sure you want to delete this love note? This action cannot be undone.')) {
        setNotes(notes.filter(note => note.id !== noteId));
      }
    }
  };

  // Use random template
  const useRandomTemplate = () => {
    const randomTemplate = allTemplates[Math.floor(Math.random() * allTemplates.length)];
    setNewMessage(randomTemplate);
  };

  // Use random emoji
  const useRandomEmoji = () => {
    const randomEmoji = allEmojis[Math.floor(Math.random() * allEmojis.length)];
    setSelectedEmoji(randomEmoji);
  };

  // Create particle effect when note is added
  const createNoteParticles = () => {
    // This will be handled by the main CustomizationSystem
    // Just trigger a click event to create particles
    const event = new MouseEvent('click', {
      clientX: window.innerWidth / 2,
      clientY: window.innerHeight / 2
    });
    document.dispatchEvent(event);
  };

  // Filter notes
  const getFilteredNotes = () => {
    switch (filter) {
      case 'recent':
        return [...notes].sort((a, b) => b.timestamp - a.timestamp);
      case 'popular':
        return [...notes].sort((a, b) => b.likes - a.likes);
      default:
        return notes;
    }
  };

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <>
             {/* Floating Love Notes Button */}
       <div className="fixed bottom-4 left-4 z-50">
         <button
           onClick={() => setShowNotes(!showNotes)}
           className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-2 sm:p-3 rounded-full shadow-lg hover:scale-110 transition-transform text-lg sm:text-xl"
         >
           💌
         </button>
       </div>

      {/* Love Notes Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4"
            onClick={() => setShowNotes(false)} // Close when clicking outside
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white p-6 rounded-t-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">💌 Love Notes Wall</h2>
                    <p className="text-sm opacity-90">Share your love with the world!</p>
                  </div>
                  <button
                    onClick={() => setShowNotes(false)}
                    className="text-white hover:text-pink-200 transition-colors text-2xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                                 {/* Add New Note - Admin Only */}
                 {isAdmin && (
                   <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                     <h3 className="text-lg font-bold mb-3">💝 Write a Love Note (Admin Only)</h3>
                     
                     {/* Emoji Selection */}
                     <div className="mb-3">
                       <label className="block text-sm font-medium mb-2">Choose an emoji:</label>
                       <div className="flex flex-wrap gap-2">
                         {allEmojis.slice(0, 20).map((emoji, index) => (
                           <button
                             key={index}
                             onClick={() => setSelectedEmoji(emoji)}
                             className={`text-2xl p-2 rounded-lg transition-all ${
                               selectedEmoji === emoji
                                 ? 'bg-pink-200 scale-110'
                                 : 'hover:bg-pink-100 hover:scale-105'
                             }`}
                           >
                             {emoji}
                           </button>
                         ))}
                         <button
                           onClick={useRandomEmoji}
                           className="text-sm bg-pink-200 px-3 py-2 rounded-lg hover:bg-pink-300 transition-colors"
                         >
                           🎲 Random
                         </button>
                       </div>
                     </div>

                     {/* Message Input */}
                     <div className="mb-3">
                       <label className="block text-sm font-medium mb-2">Your love message:</label>
                       <textarea
                         value={newMessage}
                         onChange={(e) => setNewMessage(e.target.value)}
                         placeholder="Write something sweet and loving..."
                         className="w-full p-3 border border-pink-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                         rows={3}
                       />
                     </div>

                     {/* Quick Actions */}
                     <div className="flex gap-2 mb-3">
                       <button
                         onClick={useRandomTemplate}
                         className="bg-pink-200 text-pink-800 px-4 py-2 rounded-lg hover:bg-pink-300 transition-colors text-sm"
                       >
                         🎯 Use Template
                       </button>
                       <button
                         onClick={() => setNewMessage('')}
                         className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                       >
                         🗑️ Clear
                       </button>
                     </div>

                     {/* Submit Button */}
                     <button
                       onClick={addLoveNote}
                       disabled={!newMessage.trim()}
                       className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-3 rounded-lg hover:from-pink-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
                     >
                       💖 Send Love Note
                     </button>
                   </div>
                 )}

                 {/* User Notice - Non-Admin */}
                 {!isAdmin && (
                   <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                     <div className="text-2xl mb-2">👀</div>
                     <h3 className="text-lg font-bold mb-2 text-blue-800">Read-Only Mode</h3>
                     <p className="text-blue-700">You can view and like love notes, but only admins can add new ones.</p>
                   </div>
                 )}

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                  {[
                    { key: 'all', label: 'All Notes', icon: '💌' },
                    { key: 'recent', label: 'Recent', icon: '🕐' },
                    { key: 'popular', label: 'Popular', icon: '🔥' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setFilter(tab.key as any)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors ${
                        filter === tab.key
                          ? 'bg-pink-500 text-white'
                          : 'text-gray-600 hover:bg-pink-100'
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Notes Display */}
                <div className="space-y-4">
                  <h3 className="text-lg font-bold">💕 Love Notes ({getFilteredNotes().length})</h3>
                  
                  {getFilteredNotes().length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">💌</div>
                      <p>No love notes yet. Be the first to spread some love!</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {getFilteredNotes().map((note) => (
                        <motion.div
                          key={note.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-pink-50 to-red-50 p-4 rounded-lg border border-pink-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-3xl">{note.emoji}</div>
                            <div className="flex-1">
                              <p className="text-gray-800 mb-2">{note.message}</p>
                                                             <div className="flex items-center justify-between text-sm text-gray-500">
                                 <div className="flex items-center gap-2">
                                   <span>{formatTime(note.timestamp)}</span>
                                   {isAdmin && (
                                     <button
                                       onClick={() => deleteNote(note.id)}
                                       className="text-red-500 hover:text-red-700 transition-colors text-xs px-2 py-1 rounded-full hover:bg-red-50"
                                       title="Delete note (Admin only)"
                                     >
                                       🗑️
                                     </button>
                                   )}
                                 </div>
                                 <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                                   <span>💖</span>
                                   <span>{note.likes}</span>
                                 </div>
                               </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <div className="p-6 border-t">
                <button
                  onClick={() => setShowNotes(false)}
                  className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close Love Notes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoveNotesSystem;
