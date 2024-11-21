import { socialShareService } from './socialShare';
import { authManager } from './auth';

// Check if we're running in a Chrome extension context
const isExtension = typeof chrome !== 'undefined' && chrome.runtime?.id;

// Mock data for development
const mockAuthStatus = {
  facebook: false,
  instagram: false,
  youtube: false
};

export const platformService = {
  async checkAuth(platform: string) {
    if (isExtension) {
      return chrome.runtime.sendMessage({ type: 'CHECK_AUTH', platform });
    }
    
    // Development mock
    return { isAuthenticated: mockAuthStatus[platform as keyof typeof mockAuthStatus] };
  },

  async authenticate(platform: string) {
    if (isExtension) {
      return chrome.runtime.sendMessage({ type: 'AUTHENTICATE', platform });
    }
    
    // Development mock
    mockAuthStatus[platform as keyof typeof mockAuthStatus] = true;
    return { success: true };
  },

  async shareVideo(data: { platform: string; video: File; metadata: any }) {
    if (isExtension) {
      return chrome.runtime.sendMessage({ type: 'SHARE_VIDEO', data });
    }
    
    // Development mock
    console.log('Development mode: Simulating video share', data);
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ success: true, url: 'https://example.com/shared-video' });
      }, 2000);
    });
  }
};