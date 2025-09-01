import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Upload, X, Edit3, Image as ImageIcon, Download, Upload as UploadIcon, Trash2, Music, FileText, Heart } from 'lucide-react';
import { WebsiteContent, saveContentWithCompression, saveCustomImage, saveCustomMusic, getStorageSizeMB, exportContent, importContent, isFirebaseAvailable, handleImageUpload, cleanupAndFixContent } from '../utils/contentManager';

interface CustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onContentUpdate: (content: WebsiteContent) => void;
  currentContent: WebsiteContent;
  onGameReset?: (gameType: 'memoryCard' | 'loveSong' | 'flowerGarden' | 'quiz') => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  isOpen,
  onClose,
  onContentUpdate,
  currentContent,
  onGameReset
}) => {
  const [content, setContent] = useState<WebsiteContent>(currentContent);
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'music' | 'games'>('text');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageKey, setSelectedImageKey] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setContent(currentContent);
  }, [currentContent]);

  // Auto-save content changes after a delay
  useEffect(() => {
    if (isOpen && content !== currentContent) {
      const timeoutId = setTimeout(() => {
        // Only auto-save if there are actual changes
        if (JSON.stringify(content) !== JSON.stringify(currentContent)) {
          saveContentWithCompression(content);
        }
      }, 1000); // 1 second delay

      return () => clearTimeout(timeoutId);
    }
  }, [content, currentContent, isOpen]);

  // Refresh content when panel opens
  useEffect(() => {
    if (isOpen) {
      // Reload content from localStorage to ensure we have the latest
      const savedContent = localStorage.getItem('websiteContent');
      if (savedContent) {
        try {
          const parsed = JSON.parse(savedContent);
          
          // Merge with current content, prioritizing localStorage for user-editable fields
          const mergedContent = {
            ...currentContent,
            ...parsed,
            // Ensure sticky notes and game message are properly loaded
            stickyNotes: parsed.stickyNotes || currentContent.stickyNotes,
            gameMessage: parsed.gameMessage || currentContent.gameMessage
          };
          
      setContent(mergedContent);
        } catch (error) {
          console.error('Error parsing saved content:', error);
          setContent(currentContent);
        }
      } else {
        setContent(currentContent);
      }
    }
  }, [isOpen, currentContent]);

    // Function to handle multiple image uploads for Memory Card Game
  const handleMultipleImageUpload = async (files: File[]) => {
    try {
      console.log('handleMultipleImageUpload called with files:', files);
      
      if (!files || !Array.isArray(files) || files.length === 0) {
        alert('❌ No valid files provided for upload');
        return;
      }
      
      const currentImages = content.gameCustomization?.memoryCardGame?.customImages || [];
      const remainingSlots = 6 - currentImages.length;
      const filesToProcess = files.slice(0, remainingSlots);
      
      if (filesToProcess.length === 0) {
        alert('❌ No more image slots available!');
        return;
      }
      
      // Show processing message for large files
      const largeFiles = filesToProcess.filter(file => file.size > 5 * 1024 * 1024); // 5MB+
      if (largeFiles.length > 0) {
        alert(`🔄 Processing ${largeFiles.length} large image(s)... This may take a moment as we optimize them for the best quality!`);
      }
      
      // Process multiple images
      const newImages: string[] = [...currentImages];
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        try {
          console.log(`Processing file ${i + 1}:`, file.name, file.type, file.size);
          
          // Show progress for multiple files
          if (filesToProcess.length > 1) {
            const progress = Math.round(((i + 1) / filesToProcess.length) * 100);
            console.log(`Processing image ${i + 1}/${filesToProcess.length} (${progress}%)`);
          }
          
          // Use the new image handling function with automatic compression
          const compressedImage = await handleImageUpload(file, 0.2); // Target 200KB
          newImages.push(compressedImage);
          successCount++;
          
          console.log(`Successfully processed ${file.name}`);
          
          // Show individual success for large files
          if (file.size > 5 * 1024 * 1024) {
            const originalSize = (file.size / (1024 * 1024)).toFixed(1);
            const compressedSize = (compressedImage.length / (1024 * 1024)).toFixed(2);
            alert(`✅ ${file.name} compressed from ${originalSize}MB to ${compressedSize}MB!`);
          }
        } catch (error) {
          errorCount++;
          console.error(`Error processing file ${file.name}:`, error);
          if (error instanceof Error) {
            alert(`❌ Error processing ${file.name}: ${error.message}`);
          } else {
            alert(`❌ Error processing ${file.name}. Please try again.`);
          }
        }
      }
      
      // Update content with new images
      setContent({
        ...content,
        gameCustomization: {
          ...content.gameCustomization,
          memoryCardGame: {
            ...content.gameCustomization?.memoryCardGame,
            customImages: newImages
          }
        }
      });
      
      // Show comprehensive success message
      if (successCount > 0) {
        let message = '';
        if (successCount === 1) {
          message = `✅ Successfully added 1 image!`;
        } else {
          message = `✅ Successfully added ${successCount} images!`;
        }
        
        // Add compression info
        if (largeFiles.length > 0) {
          message += `\n\n🔄 Large images were automatically compressed to ~200KB for optimal performance while maintaining good quality.`;
        }
        
        alert(message);
      }
      
      if (errorCount > 0) {
        alert(`⚠️ ${errorCount} image(s) failed to upload. Please check the file format.`);
      }
      
    } catch (error) {
      console.error('Error in handleMultipleImageUpload:', error);
      if (error instanceof Error) {
        alert(`❌ ${error.message}`);
      } else {
        alert('❌ Error processing images. Please try again.');
      }
    }
  };



  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Create a copy of the current content to ensure we're working with the latest
      const contentToSave = { ...content };
      
      // Save text content and wait for it to complete
      await saveContentWithCompression(contentToSave);
    
    // Save custom images
      if (contentToSave.customImages.panel3) {
        await saveCustomImage('panel3', contentToSave.customImages.panel3);
    }
      if (contentToSave.customImages.envelope) {
        await saveCustomImage('envelope', contentToSave.customImages.envelope);
    }
    
    // Save custom music
      if (contentToSave.customMusic) {
        saveCustomMusic(contentToSave.customMusic);
      }
      
      // Also save to localStorage immediately for immediate access
      localStorage.setItem('websiteContent', JSON.stringify(contentToSave));
      
      // Update local state to ensure consistency
      setContent(contentToSave);
      
      // IMPORTANT: Update parent component AFTER content is saved
      onContentUpdate(contentToSave);
    
    // Show success message
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('❌ Error saving content. Please try again.');
    } finally {
    setIsSaving(false);
    }
  };

  const handleRegularImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setSelectedImage(result);
        setSelectedImageKey(imageKey);
        setImageFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSave = async () => {
    if (selectedImage && selectedImageKey) {
      try {
        // Save image to content system and wait for it to complete
        await saveCustomImage(selectedImageKey, selectedImage);
      
      // Update local content state
      const updatedContent = { ...content };
      updatedContent.customImages = updatedContent.customImages || {};
      updatedContent.customImages[selectedImageKey as keyof typeof updatedContent.customImages] = selectedImage;
      setContent(updatedContent);
      
        // IMPORTANT: Update parent component AFTER image is saved
      onContentUpdate(updatedContent);
      
      alert(`Image saved for ${selectedImageKey}! It will now appear on your website.`);
      setSelectedImage(null);
      setSelectedImageKey('');
      setImageFile(null);
      } catch (error) {
        console.error('Error saving image:', error);
        alert('❌ Error saving image. Please try again.');
      }
    }
  };

  const handleImageRemove = async (imageKey: string) => {
    try {
    const updatedContent = { ...content };
    if (updatedContent.customImages) {
      delete updatedContent.customImages[imageKey as keyof typeof updatedContent.customImages];
      setContent(updatedContent);
      
        // Save the updated content to ensure it persists
        await saveContentWithCompression(updatedContent);
        
        // IMPORTANT: Update parent component AFTER content is saved
      onContentUpdate(updatedContent);
      
      // Also remove from localStorage
      const currentContent = JSON.parse(localStorage.getItem('websiteContent') || '{}');
      if (currentContent.customImages) {
        delete currentContent.customImages[imageKey];
        localStorage.setItem('websiteContent', JSON.stringify(currentContent));
      }
      }
    } catch (error) {
      console.error('Error removing image:', error);
      alert('❌ Error removing image. Please try again.');
    }
  };

  const tabs = [
    { id: 'text', label: 'Text Content', icon: FileText },
    { id: 'images', label: 'Images', icon: ImageIcon },
    { id: 'music', label: 'Music', icon: Music },
    { id: 'games', label: 'Games Customize', icon: Heart }
  ];

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed at top */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Settings className="w-6 h-6" />
              Customize Your Website
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Firebase Status - Fixed below header */}
        <div className="bg-blue-50 border-b border-blue-200 p-3 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isFirebaseAvailable() ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <p className="text-sm font-medium text-blue-800">
              {isFirebaseAvailable() ? '🟢 Firebase Connected' : '🔴 Firebase Not Connected'}
            </p>
          </div>
          {isFirebaseAvailable() ? (
            <p className="text-xs text-blue-700 mt-1">
              ✨ All changes will automatically sync across all devices!
            </p>
          ) : (
            <p className="text-xs text-red-700 mt-1">
              ⚠️ Please follow FIREBASE_SETUP.md to enable cross-device sync.
            </p>
          )}
        </div>

        {/* Save Button - Fixed below Firebase status for mobile */}
        <div className="bg-gray-100 border-b border-gray-200 p-3 flex-shrink-0 md:hidden">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Heart className="w-5 h-5" />
                <span>Save All Changes</span>
              </>
            )}
          </button>
        </div>

        {/* Tabs - Fixed below save button */}
        <div className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex space-x-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'text' | 'images' | 'music' | 'games')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-pink-500 text-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Content based on active tab */}
          {activeTab === 'text' && (
            <div className="space-y-6">
              {/* Header Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Header</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Main Title
                    </label>
                    <input
                      type="text"
                      value={content.mainTitle}
                      onChange={(e) => setContent({ ...content, mainTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter your main title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={content.subtitle}
                      onChange={(e) => setContent({ ...content, subtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter your subtitle..."
                    />
                  </div>
                </div>
              </div>

              {/* Letter Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Letter Content</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Letter Title
                    </label>
                    <input
                      type="text"
                      value={content.letterTitle}
                      onChange={(e) => setContent({ ...content, letterTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter letter title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Letter Subtitle
                    </label>
                    <input
                      type="text"
                      value={content.letterSubtitle}
                      onChange={(e) => setContent({ ...content, letterSubtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter letter subtitle..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Letter Content
                    </label>
                    <textarea
                      value={content.letterContent}
                      onChange={(e) => setContent({ ...content, letterContent: e.target.value })}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Write your letter content here..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signature
                    </label>
                    <input
                      type="text"
                      value={content.letterSignature}
                      onChange={(e) => setContent({ ...content, letterSignature: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Your signature..."
                    />
                  </div>
                </div>
              </div>

              {/* Envelope Letter Section */}
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  ✉️ Envelope Letter (Slides Out)
                </h3>
                <p className="text-sm text-blue-600 mb-3">
                  This is the letter that slides out from inside the envelope when someone first visits your website.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Envelope Letter Title
                    </label>
                    <input
                      type="text"
                      value={content.envelopeLetterTitle}
                      onChange={(e) => setContent({ ...content, envelopeLetterTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter envelope letter title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-1">
                      Envelope Letter Content
                    </label>
                    <textarea
                      value={content.envelopeLetterContent}
                      onChange={(e) => setContent({ ...content, envelopeLetterContent: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Write the letter content that slides out from the envelope..."
                    />
                  </div>
                </div>
              </div>

              {/* Panels Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Panel Content</h3>
                <div className="space-y-4">
                  {[
                    { key: 'panel1', label: 'Panel 1', text: content.panel1Text, caption: content.panel1Caption },
                    { key: 'panel2', label: 'Panel 2', text: content.panel2Text, caption: content.panel2Caption },
                    { key: 'panel3', label: 'Panel 3', text: content.panel3Text, caption: content.panel3Caption }
                  ].map((panel) => (
                    <div key={panel.key} className="border-l-4 border-pink-300 pl-4">
                      <h4 className="font-medium text-gray-700 mb-2">{panel.label}</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={panel.text}
                          onChange={(e) => setContent({ 
                            ...content, 
                            [panel.key + 'Text']: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Panel text..."
                        />
                        <input
                          type="text"
                          value={panel.caption}
                          onChange={(e) => setContent({ 
                            ...content, 
                            [panel.key + 'Caption']: e.target.value 
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                          placeholder="Panel caption..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Poem Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Poem</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poem Title
                    </label>
                    <input
                      type="text"
                      value={content.poemTitle}
                      onChange={(e) => setContent({ ...content, poemTitle: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Enter poem title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poem Content
                    </label>
                    <textarea
                      value={content.poemContent}
                      onChange={(e) => setContent({ ...content, poemContent: e.target.value })}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      placeholder="Write your poem here... (use <br /> for line breaks)"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Notes Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sticky Notes</h3>
                <div className="space-y-3">
                  {content.stickyNotes.map((note, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={note}
                        onChange={(e) => {
                          const newNotes = [...content.stickyNotes];
                          newNotes[index] = e.target.value;
                          const updatedContent = { ...content, stickyNotes: newNotes };
                          setContent(updatedContent);
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder={`Sticky note ${index + 1}...`}
                      />
                      <button
                        onClick={() => {
                          const newNotes = content.stickyNotes.filter((_, i) => i !== index);
                          setContent({ ...content, stickyNotes: newNotes });
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setContent({
                      ...content,
                      stickyNotes: [...content.stickyNotes, '']
                    })}
                    className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-pink-500 hover:text-pink-500 transition-colors"
                  >
                    + Add Sticky Note
                  </button>
                </div>
              </div>

              {/* Game Message Section */}
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  🎮 Game Completion Message
                </h3>
                <div>
                  <label className="block text-sm font-medium text-green-700 mb-1">
                    Message shown when someone completes the game
                  </label>
                  <textarea
                    value={content.gameMessage}
                    onChange={(e) => {
                      const updatedContent = { ...content, gameMessage: e.target.value };
                      setContent(updatedContent);
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Write the message shown when someone completes the heart-catching game..."
                  />
                </div>
              </div>

              {/* Quiz Questions Section */}
              <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-400">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  🧠 Quiz Questions
                </h3>
                <p className="text-sm text-purple-600 mb-4">
                  Add quiz questions for your friend to answer. Each correct answer earns 1 heart!
                </p>
                
                <div className="space-y-4">
                  {content.quizQuestions.map((question, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-purple-700">Question {index + 1}</h4>
                        <button
                          onClick={() => {
                            const newQuestions = content.quizQuestions.filter((_, i) => i !== index);
                            setContent({ ...content, quizQuestions: newQuestions });
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => {
                              const newQuestions = [...content.quizQuestions];
                              newQuestions[index] = { ...question, question: e.target.value };
                              setContent({ ...content, quizQuestions: newQuestions });
                            }}
                            className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Enter your question..."
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                              Option 1
                            </label>
                            <input
                              type="text"
                              value={question.option1}
                              onChange={(e) => {
                                const newQuestions = [...content.quizQuestions];
                                newQuestions[index] = { ...question, option1: e.target.value };
                                setContent({ ...content, quizQuestions: newQuestions });
                              }}
                              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="First option..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-purple-700 mb-1">
                              Option 2
                            </label>
                            <input
                              type="text"
                              value={question.option2}
                              onChange={(e) => {
                                const newQuestions = [...content.quizQuestions];
                                newQuestions[index] = { ...question, option2: e.target.value };
                                setContent({ ...content, quizQuestions: newQuestions });
                              }}
                              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                              placeholder="Second option..."
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">
                            Correct Answer
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                value={1}
                                checked={question.correctAnswer === 1}
                                onChange={() => {
                                  const newQuestions = [...content.quizQuestions];
                                  newQuestions[index] = { ...question, correctAnswer: 1 };
                                  setContent({ ...content, quizQuestions: newQuestions });
                                }}
                                className="mr-2 text-purple-600 focus:ring-purple-500"
                              />
                              Option 1
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                value={2}
                                checked={question.correctAnswer === 2}
                                onChange={() => {
                                  const newQuestions = [...content.quizQuestions];
                                  newQuestions[index] = { ...question, correctAnswer: 2 };
                                  setContent({ ...content, quizQuestions: newQuestions });
                                }}
                                className="mr-2 text-purple-600 focus:ring-purple-500"
                              />
                              Option 2
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => setContent({
                      ...content,
                      quizQuestions: [...content.quizQuestions, {
                        question: '',
                        option1: '',
                        option2: '',
                        correctAnswer: 1
                      }]
                    })}
                    className="w-full py-3 border-2 border-dashed border-purple-300 rounded-lg text-purple-500 hover:border-purple-500 hover:text-purple-600 transition-colors font-medium"
                  >
                    + Add Quiz Question
                  </button>
                  
                  {content.quizQuestions.length > 0 && (
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <p className="text-sm text-purple-700 text-center">
                        💡 Total questions: {content.quizQuestions.length} | 
                        Maximum hearts possible: {content.quizQuestions.length}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Music Customization Section */}
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  🎵 Background Music
                </h3>
                <p className="text-sm text-yellow-600 mb-3">
                  Upload your own music file to replace the default background music. Supported formats: MP3, WAV, OGG
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 mb-1">
                      Choose Music File
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Check file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            alert('❌ File too large! Please choose a file smaller than 5MB.');
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setContent({ ...content, customMusic: result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <p className="text-xs text-yellow-600 mt-1">
                      Max file size: 5MB. Large files will be automatically compressed.
                    </p>
                  </div>
                  
                  {content.customMusic && (
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <p className="text-sm text-yellow-700 mb-2 font-medium">
                        ✅ Custom music uploaded successfully!
                      </p>
                      <div className="space-y-2">
                        <audio controls className="w-full">
                          <source src={content.customMusic} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                        <button
                          onClick={() => setContent({ ...content, customMusic: "" })}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove Music
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!content.customMusic && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        No custom music uploaded. The default music will play.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Upload Custom Images</h3>
                <p className="text-gray-600 mb-4">
                  Upload your own photos to replace the default images. Supported formats: JPG, PNG, GIF
                </p>
                
                <div className="space-y-6">
                  {/* Panel 3 Image - Main Customization */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-r from-pink-50 to-blue-50">
                    <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-pink-500" />
                      Main Panel Image (Panel 3)
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload your own photo to replace the default image in the third panel. This is the main image that will be displayed prominently on your website.
                    </p>
                    <div className="flex items-center gap-4">
                      {content.customImages?.panel3 && (
                        <div className="flex-shrink-0">
                          <img
                            src={content.customImages.panel3}
                            alt="Panel 3"
                            className="w-24 h-24 object-cover rounded-lg border-2 border-pink-200 shadow-md"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                                                        onChange={(e) => handleRegularImageUpload(e, 'panel3')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        {content.customImages?.panel3 && (
                          <button
                            onClick={() => handleImageRemove('panel3')}
                            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Optional: Envelope Image */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-700 mb-3">Envelope Animation Image (Optional)</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Optionally replace the floating animation above the envelope. This is the small animated image that appears when someone first visits your website.
                    </p>
                    <div className="flex items-center gap-4">
                      {content.customImages?.envelope && (
                        <div className="flex-shrink-0">
                          <img
                            src={content.customImages.envelope}
                            alt="Envelope"
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                                                        onChange={(e) => handleRegularImageUpload(e, 'envelope')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        />
                        {content.customImages?.envelope && (
                          <button
                            onClick={() => handleImageRemove('envelope')}
                            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                          >
                            Remove Image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Image Preview and Save */}
                {selectedImage && (
                  <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-3">Preview & Save</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-2">
                          Preview for {selectedImageKey}
                        </label>
                        <img
                          src={selectedImage}
                          alt="Preview"
                          className="w-full max-w-xs h-48 object-cover rounded-lg border"
                        />
                      </div>
                      <button
                        onClick={handleImageSave}
                        className="w-full py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Image for {selectedImageKey}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'music' && (
            <div className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
                <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  🎵 Background Music
                </h3>
                <p className="text-sm text-yellow-600 mb-3">
                  Upload your own music file to replace the default background music. Supported formats: MP3, WAV, OGG
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-yellow-700 mb-1">
                      Choose Music File
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Check file size (max 5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            alert('❌ File too large! Please choose a file smaller than 5MB.');
                            return;
                          }
                          
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const result = event.target?.result as string;
                            setContent({ ...content, customMusic: result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-3 py-2 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                    <p className="text-xs text-yellow-600 mt-1">
                      Max file size: 5MB. Large files will be automatically compressed.
                    </p>
                  </div>
                  
                  {content.customMusic && (
                    <div className="bg-yellow-100 p-3 rounded-lg">
                      <p className="text-sm text-yellow-700 mb-2 font-medium">
                        ✅ Custom music uploaded successfully!
                      </p>
                      <div className="space-y-2">
                        <audio controls className="w-full">
                          <source src={content.customMusic} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                        <button
                          onClick={() => setContent({ ...content, customMusic: "" })}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove Music
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!content.customMusic && (
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <p className="text-sm text-gray-600">
                        No custom music uploaded. The default music will play.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
                     {/* Games Customization Tab */}
           {activeTab === 'games' && (
             <div className="space-y-6">
               {/* Global Game Reset Control */}
               <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <h3 className="text-lg font-semibold text-orange-800 mb-2">🔄 Global Game Management</h3>
                     <p className="text-sm text-orange-600">
                       Reset all games at once or manage individual game resets below
                     </p>
                   </div>
                   <div className="flex gap-2">
                     <button
                       onClick={() => {
                         if (confirm('⚠️ DANGER: Are you sure you want to reset ALL games for ALL users? This will clear completion status for Memory Card, Love Song Puzzle, Flower Garden, and Quiz games. Users will need to play all games again to earn hearts.')) {
                           // Reset all games by updating localStorage and content
                           const currentContent = JSON.parse(localStorage.getItem('websiteContent') || '{}');
                           if (currentContent.gameStats) {
                             currentContent.gameStats.memoryCardCompleted = false;
                             currentContent.gameStats.loveSongCompleted = false;
                             currentContent.gameStats.flowerGardenCompleted = false;
                             currentContent.gameStats.quizCompleted = false;
                             localStorage.setItem('websiteContent', JSON.stringify(currentContent));
                             
                             // Also update the current content state to ensure it persists
                             const updatedContent = { ...content };
                             if (!updatedContent.gameStats) {
                               updatedContent.gameStats = {
                                 memoryCardCompleted: false,
                                 loveSongCompleted: false,
                                 flowerGardenCompleted: false,
                                 quizCompleted: false,
                                 gamesPlayed: 0,
                                 daysActive: 0,
                                 totalHearts: 0,
                               };
                             } else {
                               updatedContent.gameStats.memoryCardCompleted = false;
                               updatedContent.gameStats.loveSongCompleted = false;
                               updatedContent.gameStats.flowerGardenCompleted = false;
                               updatedContent.gameStats.quizCompleted = false;
                             }
                             setContent(updatedContent);
                             
                             // Save to Firebase if available
                             if (isFirebaseAvailable()) {
                               saveContentWithCompression(updatedContent);
                             }
                             
                             alert('✅ All games have been reset for all users!');
                           }
                         }
                       }}
                       className="px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors font-medium"
                     >
                       🔄 Reset All Games
                     </button>
                     
                     <button
                       onClick={async () => {
                         if (confirm('🧹 Clean up oversized images and content? This will compress large images to prevent Firebase errors.')) {
                           try {
                             // Import cleanupOldData function
                             const { cleanupOldData } = await import('../utils/contentManager');
                             
                             // Clean up oversized content
                             await cleanupOldData();
                             
                             // Reload content to show cleaned version
                             const savedContent = localStorage.getItem('websiteContent');
                             if (savedContent) {
                               const parsed = JSON.parse(savedContent);
                               setContent(parsed);
                             }
                             
                             alert('✅ Content cleaned up successfully! Large images have been compressed.');
                           } catch (error) {
                             alert('❌ Error cleaning up content. Please try again.');
                           }
                         }
                       }}
                       className="px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                     >
                       🧹 Clean Up Content
                     </button>
                     
                     <button
                       onClick={async () => {
                         if (confirm('🔧 Fix content structure issues and Firebase errors? This will clean up invalid data.')) {
                           try {
                             const fixedContent = await cleanupAndFixContent();
                             setContent(fixedContent);
                             alert('✅ Content issues fixed successfully! Firebase errors should be resolved.');
                           } catch (error) {
                             alert('❌ Error fixing content: ' + error);
                           }
                         }
                       }}
                       className="px-3 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                     >
                       🔧 Fix Issues
                     </button>
                   </div>
                 </div>
               </div>
               
               {/* Memory Card Game */}
               <div className="bg-gray-50 p-4 rounded-lg">
                 <h3 className="text-lg font-semibold text-gray-800 mb-3">🃏 Memory Card Game</h3>
                 <div className="space-y-3">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Game Title
                     </label>
                     <input
                       type="text"
                       value={content.gameCustomization?.memoryCardGame?.title || ""}
                       onChange={(e) => setContent({
                         ...content,
                         gameCustomization: {
                           ...content.gameCustomization,
                           memoryCardGame: {
                             ...content.gameCustomization?.memoryCardGame,
                             title: e.target.value
                           }
                         }
                       })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                       placeholder="Enter game title..."
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Game Description
                     </label>
                     <input
                       type="text"
                       value={content.gameCustomization?.memoryCardGame?.description || ""}
                       onChange={(e) => setContent({
                         ...content,
                         gameCustomization: {
                           ...content.gameCustomization,
                           memoryCardGame: {
                             ...content.gameCustomization?.memoryCardGame,
                             description: e.target.value
                           }
                         }
                       })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                       placeholder="Enter game description..."
                     />
                   </div>
                                       <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hearts Reward
                      </label>
                      <input
                        type="number"
                        value={content.gameCustomization?.memoryCardGame?.heartsReward || 10}
                        onChange={(e) => setContent({
                          ...content,
                          gameCustomization: {
                            ...content.gameCustomization,
                            memoryCardGame: {
                              ...content.gameCustomization?.memoryCardGame,
                              heartsReward: parseInt(e.target.value) || 10
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Enter hearts reward..."
                      />
                    </div>
                    
                    {/* Custom Images for Memory Card Game */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        🖼️ Custom Card Images ({content.gameCustomization?.memoryCardGame?.customImages?.length || 0}/6)
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Upload 6 images to create 12 cards (6 pairs). Each image will appear twice to create matching pairs.
                      </p>
                      
                      {/* Image Upload Area */}
                      <div className="space-y-3">
                        {/* Existing Images */}
                        {content.gameCustomization?.memoryCardGame?.customImages?.map((image, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                            <img
                              src={image}
                              alt={`Card ${index + 1}`}
                              className="w-16 h-16 object-cover rounded-lg border-2 border-pink-200"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-700">Card {index + 1}</p>
                              <p className="text-xs text-gray-500">Will create 2 matching cards</p>
                            </div>
                            <button
                              onClick={() => {
                                const newImages = content.gameCustomization?.memoryCardGame?.customImages?.filter((_, i) => i !== index) || [];
                                setContent({
                                  ...content,
                                  gameCustomization: {
                                    ...content.gameCustomization,
                                    memoryCardGame: {
                                      ...content.gameCustomization?.memoryCardGame,
                                      customImages: newImages
                                    }
                                  }
                                });
                              }}
                              className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                            >
                              ❌ Remove
                            </button>
                          </div>
                        ))}
                        
                        {/* Add New Image Button */}
                        {(!content.gameCustomization?.memoryCardGame?.customImages || content.gameCustomization.memoryCardGame.customImages.length < 6) && (
                          <div 
                            className="border-2 border-dashed border-pink-300 rounded-lg p-4 text-center hover:border-pink-400 transition-colors"
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.add('border-pink-500', 'bg-pink-50');
                            }}
                            onDragLeave={(e) => {
                              e.currentTarget.classList.remove('border-pink-500', 'bg-pink-50');
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              e.currentTarget.classList.remove('border-pink-500', 'bg-pink-50');
                              
                              try {
                                const files = Array.from(e.dataTransfer.files).filter(file => 
                                  file.type.startsWith('image/')
                                );
                                
                                if (files.length > 0) {
                                  console.log(`Dropped ${files.length} image files`);
                                  handleMultipleImageUpload(files);
                                }
                              } catch (error) {
                                console.error('Error in drag and drop:', error);
                                alert(`❌ Error processing dropped files: ${error}`);
                              }
                            }}
                          >
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
                                try {
                                  if (!e.target || !e.target.files) {
                                    console.error('File input event target or files is undefined');
                                    return;
                                  }
                                  
                                  const files = e.target.files;
                                  if (files && files.length > 0) {
                                    console.log(`Processing ${files.length} files...`);
                                    await handleMultipleImageUpload(Array.from(files));
                                    // Clear the input for future uploads
                                    e.target.value = '';
                                  }
                                } catch (error) {
                                  console.error('Error in file input onChange:', error);
                                  alert(`❌ Error processing files: ${error}`);
                                }
                              }}
                              className="hidden"
                              id="memory-card-image-upload"
                            />
                            <label
                              htmlFor="memory-card-image-upload"
                              className="cursor-pointer text-pink-500 hover:text-pink-600 font-medium"
                            >
                              📁 Click to add images {content.gameCustomization?.memoryCardGame?.customImages?.length || 0}/6
                            </label>
                            <p className="text-xs text-gray-500 mt-1">
                              Supported: JPG, PNG, GIF (automatically compressed to ~200KB)
                            </p>
                            <p className="text-xs text-blue-500 mt-1">
                              💡 You can select multiple images at once! (up to {6 - (content.gameCustomization?.memoryCardGame?.customImages?.length || 0)} remaining)
                            </p>
                            <p className="text-xs text-purple-500 mt-1">
                              🎯 Or drag & drop images here!
                            </p>
                            <p className="text-xs text-green-500 mt-1">
                              🚀 Any image size accepted! Automatically compressed to ~200KB for optimal performance
                            </p>
                          </div>
                        )}
                        
                        {/* Info about image count */}
                        {content.gameCustomization?.memoryCardGame?.customImages && content.gameCustomization.memoryCardGame.customImages.length > 0 && (
                          <div className="bg-pink-50 p-3 rounded-lg border border-pink-200">
                            <p className="text-sm text-pink-700 text-center">
                              💡 {content.gameCustomization.memoryCardGame.customImages.length} images = {content.gameCustomization.memoryCardGame.customImages.length * 2} cards ({content.gameCustomization.memoryCardGame.customImages.length} pairs)
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                                       <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        🎉 Celebration Message
                      </label>
                      <textarea
                        value={content.gameCustomization?.memoryCardGame?.celebrationMessage || ""}
                        onChange={(e) => setContent({
                          ...content,
                          gameCustomization: {
                            ...content.gameCustomization,
                            memoryCardGame: {
                              ...content.gameCustomization?.memoryCardGame,
                              celebrationMessage: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Message shown when player completes the game..."
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This message will appear in a big heart when someone wins the game! 💕
                      </p>
                    </div>
                    
                    {/* Game Reset Control */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800 text-sm">🔄 Game Reset Control</h4>
                          <p className="text-xs text-red-600 mt-1">
                            Reset this game's completion status for all users
                          </p>
                        </div>
                        <button
                                                     onClick={() => {
                             if (confirm('⚠️ Are you sure you want to reset the Memory Card Game for ALL users? This will clear their completion status and they will need to play again to earn hearts.')) {
                               // Reset the game by updating localStorage and content
                               const currentContent = JSON.parse(localStorage.getItem('websiteContent') || '{}');
                               if (currentContent.gameStats) {
                                 currentContent.gameStats.memoryCardCompleted = false;
                                 localStorage.setItem('websiteContent', JSON.stringify(currentContent));
                                 
                                 // Also update the current content state to ensure it persists
                                 const updatedContent = { ...content };
                                                                   if (!updatedContent.gameStats) {
                                    updatedContent.gameStats = {
                                      memoryCardCompleted: false,
                                      loveSongCompleted: false,
                                      flowerGardenCompleted: false,
                                      catchTheKittyCompleted: false,
                                      quizCompleted: false,
                                      gamesPlayed: 0,
                                      daysActive: 0,
                                      totalHearts: 0,
                                    };
                                  }
                                  updatedContent.gameStats.memoryCardCompleted = false;
                                 setContent(updatedContent);
                                 
                                 // Save to Firebase if available
                                 if (isFirebaseAvailable()) {
                                   saveContentWithCompression(updatedContent);
                                 }
                                 
                                 // Notify parent component about the reset
                                 if (onGameReset) {
                                   onGameReset('memoryCard');
                                 }
                                 
                                 alert('✅ Memory Card Game has been reset for all users!');
                               }
                             }
                           }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          Reset Game
                        </button>
                      </div>
                    </div>
                 </div>
               </div>

              {/* Love Song Puzzle Game */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🎵 Love Song Puzzle Game</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Game Title
                    </label>
                    <input
                      type="text"
                      value={content.gameCustomization?.loveSongPuzzleGame?.title || ""}
                      onChange={(e) => setContent({
                        ...content,
                        gameCustomization: {
                          ...content.gameCustomization,
                          loveSongPuzzleGame: {
                            ...content.gameCustomization?.loveSongPuzzleGame,
                            title: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter game title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Game Description
                    </label>
                    <input
                      type="text"
                      value={content.gameCustomization?.loveSongPuzzleGame?.description || ""}
                      onChange={(e) => setContent({
                        ...content,
                        gameCustomization: {
                          ...content.gameCustomization,
                          loveSongPuzzleGame: {
                            ...content.gameCustomization?.loveSongPuzzleGame,
                            description: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter game description..."
                    />
                  </div>
                  
                                     {/* Songs Management */}
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-2">
                       Songs ({content.gameCustomization?.loveSongPuzzleGame?.songs?.length || 0})
                     </label>
                     <div className="space-y-3">
                       {content.gameCustomization?.loveSongPuzzleGame?.songs?.map((song, index) => (
                         <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                           <div className="grid grid-cols-2 gap-2 mb-2">
                             <input
                               type="text"
                               value={song.title}
                               onChange={(e) => {
                                 const newSongs = [...(content.gameCustomization?.loveSongPuzzleGame?.songs || [])];
                                 newSongs[index] = { ...newSongs[index], title: e.target.value };
                                 setContent({
                                   ...content,
                                   gameCustomization: {
                                     ...content.gameCustomization,
                                     loveSongPuzzleGame: {
                                       ...content.gameCustomization?.loveSongPuzzleGame,
                                       songs: newSongs
                                     }
                                   }
                                 });
                               }}
                               className="px-2 py-1 border border-gray-300 rounded text-sm"
                               placeholder="Song title"
                             />
                             <input
                               type="text"
                               value={song.words?.join(', ') || ''}
                               onChange={(e) => {
                                 const newSongs = [...(content.gameCustomization?.loveSongPuzzleGame?.songs || [])];
                                 const words = e.target.value.split(',').map(word => word.trim()).filter(word => word.length > 0);
                                 newSongs[index] = { ...newSongs[index], words: words };
                                 setContent({
                                   ...content,
                                   gameCustomization: {
                                     ...content.gameCustomization,
                                     loveSongPuzzleGame: {
                                       ...content.gameCustomization?.loveSongPuzzleGame,
                                       songs: newSongs
                                     }
                                   }
                                 });
                               }}
                               onKeyDown={(e) => {
                                 if (e.key === ',') {
                                   e.preventDefault();
                                   const currentValue = e.currentTarget.value;
                                   const newValue = currentValue + ', ';
                                   e.currentTarget.value = newValue;
                                   e.currentTarget.dispatchEvent(new Event('input', { bubbles: true }));
                                 }
                               }}
                               className="px-2 py-1 border border-gray-300 rounded text-sm"
                               placeholder="Words (comma separated)"
                             />
                           </div>
                           <div className="grid grid-cols-3 gap-2 mb-2">
                             <select
                               value={song.difficulty}
                               onChange={(e) => {
                                 const newSongs = [...(content.gameCustomization?.loveSongPuzzleGame?.songs || [])];
                                 newSongs[index] = { ...newSongs[index], difficulty: e.target.value as 'easy' | 'medium' | 'hard' };
                                 setContent({
                                   ...content,
                                   gameCustomization: {
                                     ...content.gameCustomization,
                                     loveSongPuzzleGame: {
                                       ...content.gameCustomization?.loveSongPuzzleGame,
                                       songs: newSongs
                                     }
                                   }
                                 });
                               }}
                               className="px-2 py-1 border border-gray-300 rounded text-sm"
                             >
                               <option value="easy">Easy</option>
                               <option value="medium">Medium</option>
                               <option value="hard">Hard</option>
                             </select>
                             <input
                               type="number"
                               value={song.heartsReward}
                               onChange={(e) => {
                                 const newSongs = [...(content.gameCustomization?.loveSongPuzzleGame?.songs || [])];
                                 newSongs[index] = { ...newSongs[index], heartsReward: parseInt(e.target.value) || 1 };
                                 setContent({
                                   ...content,
                                   gameCustomization: {
                                     ...content.gameCustomization,
                                     loveSongPuzzleGame: {
                                       ...content.gameCustomization?.loveSongPuzzleGame,
                                       songs: newSongs
                                     }
                                   }
                                 });
                               }}
                               className="px-2 py-1 border border-gray-300 rounded text-sm"
                               placeholder="Hearts"
                             />
                             <button
                               onClick={() => {
                                 const newSongs = content.gameCustomization?.loveSongPuzzleGame?.songs?.filter((_, i) => i !== index) || [];
                                 setContent({
                                   ...content,
                                   gameCustomization: {
                                     ...content.gameCustomization,
                                     loveSongPuzzleGame: {
                                       ...content.gameCustomization?.loveSongPuzzleGame,
                                       songs: newSongs
                                     }
                                   }
                                 });
                               }}
                               className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                             >
                               ❌
                             </button>
                           </div>
                         </div>
                       ))}
                     </div>
                     <button
                       onClick={() => {
                         const newSong = {
                           title: "New Song",
                           words: ["Word1", "Word2", "Word3"],
                           difficulty: "easy" as const,
                           heartsReward: 1
                         };
                         const newSongs = [...(content.gameCustomization?.loveSongPuzzleGame?.songs || []), newSong];
                         setContent({
                           ...content,
                           gameCustomization: {
                             ...content.gameCustomization,
                             loveSongPuzzleGame: {
                               ...content.gameCustomization?.loveSongPuzzleGame,
                               songs: newSongs
                             }
                           }
                         });
                       }}
                       className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                     >
                       ➕ Add New Song
                     </button>
                   </div>
                   
                                       {/* Celebration Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        🎉 Celebration Message
                      </label>
                      <textarea
                        value={content.gameCustomization?.loveSongPuzzleGame?.celebrationMessage || ""}
                        onChange={(e) => setContent({
                          ...content,
                          gameCustomization: {
                            ...content.gameCustomization,
                            loveSongPuzzleGame: {
                              ...content.gameCustomization?.loveSongPuzzleGame,
                              celebrationMessage: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Message shown when player completes the game..."
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This message will appear in a big heart when someone wins the game! 🎵
                      </p>
                    </div>
                    
                    {/* Game Reset Control */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800 text-sm">🔄 Game Reset Control</h4>
                          <p className="text-xs text-red-600 mt-1">
                            Reset this game's completion status for all users
                          </p>
                        </div>
                        <button
                                                     onClick={() => {
                             if (confirm('⚠️ Are you sure you want to reset the Love Song Puzzle Game for ALL users? This will clear their completion status and they will need to play again to earn hearts.')) {
                               // Reset the game by updating localStorage and content
                               const currentContent = JSON.parse(localStorage.getItem('websiteContent') || '{}');
                               if (currentContent.gameStats) {
                                 currentContent.gameStats.loveSongCompleted = false;
                                 localStorage.setItem('websiteContent', JSON.stringify(currentContent));
                                 
                                 // Also update the current content state to ensure it persists
                                 const updatedContent = { ...content };
                                                                   if (!updatedContent.gameStats) {
                                    updatedContent.gameStats = {
                                      memoryCardCompleted: false,
                                      loveSongCompleted: false,
                                      flowerGardenCompleted: false,
                                      catchTheKittyCompleted: false,
                                      quizCompleted: false,
                                      gamesPlayed: 0,
                                      daysActive: 0,
                                      totalHearts: 0,
                                    };
                                  }
                                  updatedContent.gameStats.loveSongCompleted = false;
                                 setContent(updatedContent);
                                 
                                 // Save to Firebase if available
                                 if (isFirebaseAvailable()) {
                                   saveContentWithCompression(updatedContent);
                                 }
                                 
                                 alert('✅ Love Song Puzzle Game has been reset for all users!');
                               }
                             }
                           }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          Reset Game
                        </button>
                      </div>
                    </div>
                 </div>
               </div>

              {/* Flower Garden Game */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">🌺 Flower Garden Game</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Game Title
                    </label>
                    <input
                      type="text"
                      value={content.gameCustomization?.flowerGardenGame?.title || ""}
                      onChange={(e) => setContent({
                        ...content,
                        gameCustomization: {
                          ...content.gameCustomization,
                          flowerGardenGame: {
                            ...content.gameCustomization?.flowerGardenGame,
                            title: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter game title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Game Description
                    </label>
                    <input
                      type="text"
                      value={content.gameCustomization?.flowerGardenGame?.description || ""}
                      onChange={(e) => setContent({
                        ...content,
                        gameCustomization: {
                          ...content.gameCustomization,
                          flowerGardenGame: {
                            ...content.gameCustomization?.flowerGardenGame,
                            description: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter game description..."
                    />
                  </div>
                                     <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Starting Water Level
                       </label>
                       <input
                         type="number"
                         value={content.gameCustomization?.flowerGardenGame?.waterLevel || 10}
                         onChange={(e) => setContent({
                           ...content,
                           gameCustomization: {
                             ...content.gameCustomization,
                             flowerGardenGame: {
                               ...content.gameCustomization?.flowerGardenGame,
                               waterLevel: parseInt(e.target.value) || 10
                             }
                           }
                         })}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                         placeholder="Water level..."
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">
                         Garden Grid Size
                       </label>
                       <input
                         type="number"
                         value={content.gameCustomization?.flowerGardenGame?.gridSize || 6}
                         onChange={(e) => setContent({
                           ...content,
                           gameCustomization: {
                             ...content.gameCustomization,
                             flowerGardenGame: {
                               ...content.gameCustomization?.flowerGardenGame,
                               gridSize: parseInt(e.target.value) || 6
                             }
                           }
                         })}
                         className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                         placeholder="Grid size..."
                       />
                     </div>
                   </div>
                   
                                       {/* Celebration Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        🎉 Celebration Message
                      </label>
                      <textarea
                        value={content.gameCustomization?.flowerGardenGame?.celebrationMessage || ""}
                        onChange={(e) => setContent({
                          ...content,
                          gameCustomization: {
                            ...content.gameCustomization,
                            flowerGardenGame: {
                              ...content.gameCustomization?.flowerGardenGame,
                              celebrationMessage: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Message shown when player completes the game..."
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This message will appear in a big heart when someone wins the game! 🌺
                      </p>
                    </div>
                    
                    {/* Game Reset Control */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800 text-sm">🔄 Game Reset Control</h4>
                          <p className="text-xs text-red-600 mt-1">
                            Reset this game's completion status for all users
                          </p>
                        </div>
                        <button
                                                     onClick={() => {
                             if (confirm('⚠️ Are you sure you want to reset the Flower Garden Game for ALL users? This will clear their completion status and they will need to play again to earn hearts.')) {
                               // Reset the game by updating localStorage and content
                               const currentContent = JSON.parse(localStorage.getItem('websiteContent') || '{}');
                               if (currentContent.gameStats) {
                                 currentContent.gameStats.flowerGardenCompleted = false;
                                 localStorage.setItem('websiteContent', JSON.stringify(currentContent));
                                 
                                 // Also update the current content state to ensure it persists
                                 const updatedContent = { ...content };
                                                                   if (!updatedContent.gameStats) {
                                    updatedContent.gameStats = {
                                      memoryCardCompleted: false,
                                      loveSongCompleted: false,
                                      flowerGardenCompleted: false,
                                      catchTheKittyCompleted: false,
                                      quizCompleted: false,
                                      gamesPlayed: 0,
                                      daysActive: 0,
                                      totalHearts: 0,
                                    };
                                  }
                                  updatedContent.gameStats.flowerGardenCompleted = false;
                                 setContent(updatedContent);
                                 
                                 // Save to Firebase if available
                                 if (isFirebaseAvailable()) {
                                   saveContentWithCompression(updatedContent);
                                 }
                                 
                                 alert('✅ Flower Garden Game has been reset for all users!');
                               }
                             }
                           }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          Reset Game
                        </button>
                      </div>
                    </div>
                 </div>
               </div>

                             {/* Quiz Game */}
               <div className="bg-gray-50 p-4 rounded-lg">
                 <h3 className="text-lg font-semibold text-gray-800 mb-3">🧠 Quiz Game</h3>
                                   <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        🎉 Celebration Message
                      </label>
                      <textarea
                        value={content.gameCustomization?.quizGame?.celebrationMessage || ""}
                        onChange={(e) => setContent({
                          ...content,
                          gameCustomization: {
                            ...content.gameCustomization,
                            quizGame: {
                              ...content.gameCustomization?.quizGame,
                              celebrationMessage: e.target.value
                            }
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Message shown when player completes the quiz..."
                        rows={3}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This message will appear in a big heart when someone wins the quiz! 🧠
                      </p>
                    </div>
                    
                    {/* Game Reset Control */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-red-800 text-sm">🔄 Game Reset Control</h4>
                          <p className="text-xs text-red-600 mt-1">
                            Reset this game's completion status for all users
                          </p>
                        </div>
                        <button
                                                     onClick={() => {
                             if (confirm('⚠️ Are you sure you want to reset the Quiz Game for ALL users? This will clear their completion status and they will need to play again to earn hearts.')) {
                               // Reset the game by updating localStorage and content
                               const currentContent = JSON.parse(localStorage.getItem('websiteContent') || '{}');
                               if (currentContent.gameStats) {
                                 currentContent.gameStats.quizCompleted = false;
                                 localStorage.setItem('websiteContent', JSON.stringify(currentContent));
                                 
                                 // Also update the current content state to ensure it persists
                                 const updatedContent = { ...content };
                                                                   if (!updatedContent.gameStats) {
                                    updatedContent.gameStats = {
                                      memoryCardCompleted: false,
                                      loveSongCompleted: false,
                                      flowerGardenCompleted: false,
                                      catchTheKittyCompleted: false,
                                      quizCompleted: false,
                                      gamesPlayed: 0,
                                      daysActive: 0,
                                      totalHearts: 0,
                                    };
                                  }
                                  updatedContent.gameStats.quizCompleted = false;
                                 setContent(updatedContent);
                                 
                                 // Save to Firebase if available
                                 if (isFirebaseAvailable()) {
                                   saveContentWithCompression(updatedContent);
                                 }
                                 
                                 alert('✅ Quiz Game has been reset for all users!');
                               }
                             }
                           }}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                        >
                          Reset Game
                        </button>
                      </div>
                    </div>
                  </div>
               </div>



               {/* Achievement System */}
               <div className="bg-gray-50 p-4 rounded-lg">
                 <h3 className="text-lg font-semibold text-gray-800 mb-3">🏆 Achievement System</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Title
                    </label>
                    <input
                      type="text"
                      value={content.gameCustomization?.achievementSystem?.title || ""}
                      onChange={(e) => setContent({
                        ...content,
                        gameCustomization: {
                          ...content.gameCustomization,
                          achievementSystem: {
                            ...content.gameCustomization?.achievementSystem,
                            title: e.target.value
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter system title..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      System Description
                    </label>
                    <input
                      type="text"
                      value={content.gameCustomization?.achievementSystem?.description || ""}
                      onChange={(e) => setContent({
                        ...content,
                        gameCustomization: {
                          ...content.gameCustomization,
                          achievementSystem: {
                             ...content.gameCustomization?.achievementSystem,
                             title: e.target.value
                           }
                         }
                       })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                       placeholder="Enter system description..."
                     />
                   </div>
                   <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                       Celebration Message
                     </label>
                     <textarea
                       value={content.gameCustomization?.achievementSystem?.celebrationMessage || ""}
                       onChange={(e) => setContent({
                         ...content,
                         gameCustomization: {
                           ...content.gameCustomization,
                           achievementSystem: {
                             ...content.gameCustomization?.achievementSystem,
                             celebrationMessage: e.target.value
                           }
                         }
                       })}
                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                       placeholder="Enter celebration message..."
                       rows={3}
                     />
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Footer - Desktop only (mobile has save button at top) */}
        <div className="hidden md:flex flex-col md:flex-row items-center justify-between p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4 mb-4 md:mb-0">
            <div className={`text-xs ${getStorageSizeMB() > 4 ? 'text-red-500' : 'text-gray-500'}`}>
              Storage: {getStorageSizeMB().toFixed(2)} MB / 5 MB
              {getStorageSizeMB() > 4 && (
                <span className="block text-red-600 font-semibold">
                  ⚠️ Storage almost full! Large files will be compressed.
                </span>
              )}
            </div>
            {isFirebaseAvailable() && (
              <div className="text-xs text-green-600">
                🔥 Firebase: Real-time sync active
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-pink-500 hover:bg-pink-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Success Message */}
      {showSuccessMessage && (
        <motion.div
          className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
        >
          ✅ Content saved successfully!
        </motion.div>
      )}
    </motion.div>
  );
};

export default CustomizationPanel;
