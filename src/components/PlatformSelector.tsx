import React from 'react';
import { Facebook, Instagram, Youtube } from 'lucide-react';

interface Platform {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface PlatformSelectorProps {
  selectedPlatforms: string[];
  onTogglePlatform: (platform: string) => void;
}

const platforms: Platform[] = [
  { id: 'facebook', name: 'Facebook', icon: <Facebook className="w-5 h-5" /> },
  { id: 'instagram', name: 'Instagram', icon: <Instagram className="w-5 h-5" /> },
  { id: 'youtube', name: 'YouTube', icon: <Youtube className="w-5 h-5" /> }
];

export function PlatformSelector({ selectedPlatforms, onTogglePlatform }: PlatformSelectorProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Plateformes de partage</h3>
      <div className="flex flex-wrap gap-2">
        {platforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => onTogglePlatform(platform.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
              selectedPlatforms.includes(platform.id)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-600'
            }`}
          >
            {platform.icon}
            <span>{platform.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}