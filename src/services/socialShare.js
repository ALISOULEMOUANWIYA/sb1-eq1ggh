import axios from 'axios';
import { authManager } from './auth.js';

const API_CONFIG = {
  facebook: {
    uploadUrl: 'https://graph-video.facebook.com/v13.0/me/videos',
    validateUrl: 'https://graph.facebook.com/v13.0/me/accounts'
  },
  instagram: {
    uploadUrl: 'https://graph.instagram.com/v13.0/me/media',
    validateUrl: 'https://graph.instagram.com/me'
  },
  youtube: {
    uploadUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
    validateUrl: 'https://www.googleapis.com/youtube/v3/channels?part=id&mine=true'
  },
  tiktok: {
    uploadUrl: 'https://open-api.tiktok.com/share/video/upload/',
    validateUrl: 'https://open-api.tiktok.com/v2/user/info/'
  }
};

class SocialShareService {
  constructor() {
    this.uploadProgress = new Map();
  }

  async shareToSocialMedia({ platform, video, metadata }) {
    try {
      const token = await this.ensureAuthenticated(platform);
      await this.validateAccess(platform, token);
      
      const uploadUrl = await this.getUploadUrl(platform, token, metadata);
      const response = await this.uploadVideo(platform, uploadUrl, video, token, metadata);
      
      return {
        success: true,
        platform,
        url: this.getShareUrl(platform, response)
      };
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      throw new Error(`Failed to share to ${platform}: ${error.message}`);
    }
  }

  async ensureAuthenticated(platform) {
    let token = await authManager.getToken(platform);
    if (!token) {
      token = await authManager.authenticate(platform);
    }
    return token;
  }

  async validateAccess(platform, token) {
    const config = API_CONFIG[platform];
    try {
      await axios.get(config.validateUrl, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      throw new Error(`Invalid access to ${platform}`);
    }
  }

  async getUploadUrl(platform, token, metadata) {
    const config = API_CONFIG[platform];
    
    switch (platform) {
      case 'youtube':
        return `${config.uploadUrl}?uploadType=resumable&part=snippet,status`;
      case 'facebook':
        return config.uploadUrl;
      case 'instagram':
        const response = await axios.post(config.uploadUrl, {
          media_type: 'VIDEO',
          ...this.formatMetadata(platform, metadata)
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return response.data.upload_url;
      default:
        return config.uploadUrl;
    }
  }

  formatMetadata(platform, metadata) {
    const { description, hashtags, mentions } = metadata;
    const formattedHashtags = hashtags.split(' ').join(' ');
    const formattedMentions = mentions.split(' ').join(' ');
    
    return {
      description: `${description}\n\n${formattedHashtags}\n${formattedMentions}`,
      privacy: 'PUBLIC'
    };
  }

  async uploadVideo(platform, url, video, token, metadata) {
    const formData = new FormData();
    formData.append('video', video);
    formData.append('description', metadata.description);

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        this.uploadProgress.set(platform, percentCompleted);
        this.notifyProgress(platform, percentCompleted);
      }
    };

    const response = await axios.post(url, formData, config);
    return response.data;
  }

  notifyProgress(platform, progress) {
    chrome.runtime.sendMessage({
      type: 'UPLOAD_PROGRESS',
      data: { platform, progress }
    });
  }

  getShareUrl(platform, response) {
    switch (platform) {
      case 'youtube':
        return `https://youtu.be/${response.id}`;
      case 'facebook':
        return `https://facebook.com/${response.id}`;
      case 'instagram':
        return `https://instagram.com/p/${response.id}`;
      case 'tiktok':
        return `https://tiktok.com/@${response.author}/video/${response.id}`;
      default:
        return '';
    }
  }
}

export const socialShareService = new SocialShareService();