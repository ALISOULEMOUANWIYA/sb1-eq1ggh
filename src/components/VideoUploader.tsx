import React, { useCallback } from 'react';
import { Upload, X } from 'lucide-react';

interface VideoUploaderProps {
  video: File | null;
  onVideoSelect: (file: File) => void;
  onVideoClear: () => void;
}

export function VideoUploader({ video, onVideoSelect, onVideoClear }: VideoUploaderProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">Vidéo à partager</h3>
      
      {!video ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 transition-colors"
        >
          <div className="flex flex-col items-center">
            <Upload className="w-10 h-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              Glissez votre vidéo ici ou{' '}
              <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer">
                parcourez
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Upload className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{video.name}</p>
              <p className="text-xs text-gray-500">
                {(video.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={onVideoClear}
            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      )}
    </div>
  );
}