import { processVideo } from './videoProcessor.js';
import { shareToSocialMedia } from './socialShare.js';

document.addEventListener('DOMContentLoaded', () => {
  const videoInput = document.getElementById('video-input');
  const videoPreview = document.getElementById('video-preview');
  const previewSection = document.querySelector('.preview-section');
  const shareButton = document.getElementById('share-button');
  const statusMessage = document.getElementById('status-message');
  const formatSelect = document.getElementById('format-select');

  let currentVideo = null;

  videoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      currentVideo = file;
      const videoUrl = URL.createObjectURL(file);
      videoPreview.src = videoUrl;
      previewSection.hidden = false;
      
      statusMessage.textContent = '';
      statusMessage.className = '';
      
      // Afficher les informations de la vidéo
      const duration = await new Promise((resolve) => {
        videoPreview.onloadedmetadata = () => resolve(videoPreview.duration);
      });
      
      showStatus(`Durée: ${Math.floor(duration)}s, Taille: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
    } catch (error) {
      showError('Erreur lors du chargement de la vidéo');
      console.error(error);
    }
  });

  shareButton.addEventListener('click', async () => {
    if (!currentVideo) {
      showError('Veuillez sélectionner une vidéo');
      return;
    }

    const platform = formatSelect.value;
    const description = document.getElementById('description').value;
    const hashtags = document.getElementById('hashtags').value;
    const mentions = document.getElementById('mentions').value;

    try {
      shareButton.disabled = true;
      showStatus('Traitement de la vidéo en cours...');

      const processedVideo = await processVideo(currentVideo, platform);
      showStatus('Partage en cours...');
      
      const result = await shareToSocialMedia({
        platform,
        video: processedVideo,
        metadata: {
          description,
          hashtags,
          mentions
        }
      });

      showSuccess('Vidéo partagée avec succès !');
    } catch (error) {
      showError(error.message || 'Erreur lors du partage');
      console.error(error);
    } finally {
      shareButton.disabled = false;
    }
  });

  function showStatus(message) {
    statusMessage.textContent = message;
    statusMessage.className = '';
  }

  function showSuccess(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'success';
  }

  function showError(message) {
    statusMessage.textContent = message;
    statusMessage.className = 'error';
  }
});