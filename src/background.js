import { socialShareService } from './services/socialShare.js';
import { authManager } from './services/auth.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'SHARE_VIDEO':
      handleVideoShare(request.data)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ error: error.message }));
      return true;
      
    case 'CHECK_AUTH':
      checkAuthentication(request.platform)
        .then(result => sendResponse(result))
        .catch(error => sendResponse({ error: error.message }));
      return true;
  }
});

async function handleVideoShare(data) {
  try {
    const result = await socialShareService.shareToSocialMedia(data);
    return { success: true, ...result };
  } catch (error) {
    console.error('Share error:', error);
    return { success: false, error: error.message };
  }
}

async function checkAuthentication(platform) {
  try {
    const token = await authManager.getToken(platform);
    return { isAuthenticated: !!token };
  } catch (error) {
    console.error('Auth check error:', error);
    return { isAuthenticated: false, error: error.message };
  }
}