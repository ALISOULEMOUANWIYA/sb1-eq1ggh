import React, { useState, useEffect } from 'react';
import { AuthStatus } from './components/AuthStatus';
import { PlatformSelector } from './components/PlatformSelector';
import { VideoUploader } from './components/VideoUploader';
import { Share } from 'lucide-react';
import { platformService } from './services/platformService';

function App() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [authStatus, setAuthStatus] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const platforms = ['facebook', 'instagram', 'youtube'];
    const status: Record<string, boolean> = {};

    for (const platform of platforms) {
      const response = await platformService.checkAuth(platform);
      status[platform] = response.isAuthenticated;
    }

    setAuthStatus(status);
  };

  const handleConnect = async (platform: string) => {
    try {
      await platformService.authenticate(platform);
      await checkAuthStatus();
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleShare = async () => {
    if (!video || selectedPlatforms.length === 0) return;

    setIsLoading(true);
    try {
      for (const platform of selectedPlatforms) {
        await platformService.shareVideo({
          platform,
          video,
          metadata: {
            description: '',
            hashtags: '',
            mentions: ''
          }
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b">
            <Share className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Partage Social Pro
            </h1>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-sm font-medium text-gray-700">État des connexions</h2>
              <div className="space-y-2">
                {Object.entries(authStatus).map(([platform, isAuthenticated]) => (
                  <AuthStatus
                    key={platform}
                    platform={platform}
                    isAuthenticated={isAuthenticated}
                    onConnect={() => handleConnect(platform)}
                  />
                ))}
              </div>
            </div>

            <VideoUploader
              video={video}
              onVideoSelect={setVideo}
              onVideoClear={() => setVideo(null)}
            />

            <PlatformSelector
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={(platform) => {
                setSelectedPlatforms((prev) =>
                  prev.includes(platform)
                    ? prev.filter((p) => p !== platform)
                    : [...prev, platform]
                );
              }}
            />

            <button
              onClick={handleShare}
              disabled={!video || selectedPlatforms.length === 0 || isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                !video || selectedPlatforms.length === 0 || isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isLoading ? 'Partage en cours...' : 'Partager la vidéo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;