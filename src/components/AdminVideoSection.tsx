import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface VideoData {
  videoUrl: string;
  note: string;
  title: string;
  uploadedAt: string;
}

interface AdminVideoSectionProps {
  isAdmin: boolean;
  video: VideoData;
  onVideoUpdate: (video: VideoData) => void;
}

const AdminVideoSection: React.FC<AdminVideoSectionProps> = ({
  isAdmin,
  video,
  onVideoUpdate
}) => {

  const VideoCard: React.FC<{ video: VideoData }> = ({ video }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
      <motion.div
        className="bg-yellow-200 border-2 border-orange-300 rounded-lg p-3 sm:p-4 md:p-6 relative mx-2 sm:mx-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        {/* Speech Bubble */}
        <div className="relative mb-4 px-2 sm:px-0">
          <div className="bg-white rounded-lg p-3 sm:p-4 border-2 border-blue-200 relative">
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-blue-200"></div>
            <p className="text-gray-800 font-comic text-sm sm:text-base leading-relaxed">
              {video.note || "Add your note here..."}
            </p>
          </div>
        </div>

        {/* Video Player */}
        <div className="relative mb-4">
          <video
            ref={videoRef}
            src={video.videoUrl}
            className="w-full h-40 sm:h-48 md:h-56 lg:h-64 object-cover rounded-lg border-2 border-pink-200"
            poster="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZmZlNGU0Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5MzM2NiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkhlbGxvIEtpdHR5PC90ZXh0Pjwvc3ZnPg=="
            autoPlay
            muted
            loop
            controls
            playsInline
            preload="auto"
            onLoadedData={() => {
              if (videoRef.current) {
                videoRef.current.play().catch(error => {
                  console.error('Autoplay failed:', error);
                });
              }
            }}
          />
        </div>

        {/* Video Title */}
        <h3 className="text-center font-comic font-bold text-gray-800 text-sm md:text-base mb-2">
          {video.title}
        </h3>

        {/* Decorative Elements */}
        <div className="flex justify-center items-center mt-3 gap-2">
          <Heart className="w-4 h-4 text-pink-500" fill="currentColor" />
          <span className="text-pink-500 text-lg">🍒</span>
          <span className="text-pink-500 text-lg">🍒</span>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <ScrollReveal animation="fade" duration={0.8}>
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-pink-600 mb-2 font-comic">
            💕 Special Video 💕
          </h2>
          <p className="text-gray-600 font-comic">
            Watch special video with love note
          </p>
        </div>
      </ScrollReveal>


      {/* Video Display */}
      {video.videoUrl ? (
        <div className="flex justify-center">
          <VideoCard video={video} />
        </div>
      ) : (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="bg-yellow-200 border-2 border-orange-300 rounded-lg p-8 max-w-md mx-auto">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-bold text-gray-800 font-comic mb-2">
              No video yet
            </h3>
            <p className="text-gray-600 font-comic">
              Check back later for special video!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ScrollReveal component (simplified version)
const ScrollReveal: React.FC<{ 
  children: React.ReactNode; 
  animation?: string; 
  duration?: number; 
}> = ({ children, animation = "fade", duration = 0.6 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration }}
    >
      {children}
    </motion.div>
  );
};

export default AdminVideoSection;

