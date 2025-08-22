import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Upload, X, Edit3, Image as ImageIcon, Download, Upload as UploadIcon, Trash2, Music, FileText, Heart } from 'lucide-react';
import { WebsiteContent, saveContentWithCompression, saveCustomImage, saveCustomMusic, getStorageSizeMB, exportContent, importContent, isFirebaseAvailable } from '../utils/contentManager';

interface CustomizationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onContentUpdate: (content: WebsiteContent) => void;
  currentContent: WebsiteContent;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  isOpen,
  onClose,
  onContentUpdate,
  currentContent
}) => {
  const [content, setContent] = useState<WebsiteContent>(currentContent);
  const [activeTab, setActiveTab] = useState<'text' | 'images' | 'music'>('text');
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, imageKey: string) => {
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
    { id: 'music', label: 'Music', icon: Music }
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
                onClick={() => setActiveTab(tab.id as 'text' | 'images' | 'music')}
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
                          onChange={(e) => handleImageUpload(e, 'panel3')}
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
                          onChange={(e) => handleImageUpload(e, 'envelope')}
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
