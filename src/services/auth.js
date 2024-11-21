import { jwtDecode } from 'jwt-decode';

const AUTH_CONFIG = {
  facebook: {
    clientId: process.env.FACEBOOK_CLIENT_ID,
    scope: 'publish_video,pages_show_list',
    authUrl: 'https://www.facebook.com/v13.0/dialog/oauth'
  },
  instagram: {
    clientId: process.env.INSTAGRAM_CLIENT_ID,
    scope: 'instagram_content_publish',
    authUrl: 'https://api.instagram.com/oauth/authorize'
  },
  youtube: {
    clientId: process.env.YOUTUBE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/youtube.upload',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth'
  },
  tiktok: {
    clientId: process.env.TIKTOK_CLIENT_ID,
    scope: 'video.upload',
    authUrl: 'https://www.tiktok.com/auth/authorize/'
  }
};

class AuthManager {
  constructor() {
    this.tokens = {};
    this.loadStoredTokens();
  }

  async loadStoredTokens() {
    const stored = await chrome.storage.local.get('tokens');
    this.tokens = stored.tokens || {};
  }

  async saveTokens() {
    await chrome.storage.local.set({ tokens: this.tokens });
  }

  async getToken(platform) {
    const token = this.tokens[platform];
    if (!token) return null;

    if (this.isTokenExpired(token)) {
      return await this.refreshToken(platform);
    }

    return token.access_token;
  }

  isTokenExpired(token) {
    if (!token.expires_at) return true;
    return Date.now() >= token.expires_at;
  }

  async authenticate(platform) {
    const config = AUTH_CONFIG[platform];
    if (!config) throw new Error(`Platform ${platform} not supported`);

    const authUrl = this.buildAuthUrl(config);
    
    return new Promise((resolve, reject) => {
      chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
      }, async (redirectUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        try {
          const token = await this.handleAuthResponse(platform, redirectUrl);
          this.tokens[platform] = token;
          await this.saveTokens();
          resolve(token.access_token);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  buildAuthUrl(config) {
    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'token',
      scope: config.scope,
      redirect_uri: chrome.identity.getRedirectURL(),
      state: this.generateState()
    });

    return `${config.authUrl}?${params.toString()}`;
  }

  generateState() {
    return Math.random().toString(36).substring(2, 15);
  }

  async handleAuthResponse(platform, redirectUrl) {
    const params = new URLSearchParams(redirectUrl.split('#')[1]);
    const accessToken = params.get('access_token');
    const expiresIn = parseInt(params.get('expires_in'), 10);

    if (!accessToken) {
      throw new Error('Authentication failed');
    }

    return {
      access_token: accessToken,
      expires_at: Date.now() + (expiresIn * 1000),
      platform
    };
  }

  async refreshToken(platform) {
    // La plupart des plateformes nécessitent une nouvelle authentification
    // plutôt qu'un refresh token
    await this.authenticate(platform);
    return this.tokens[platform].access_token;
  }
}

export const authManager = new AuthManager();