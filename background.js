chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installée');
});

// Gestion des messages depuis le popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SHARE_VIDEO') {
    handleVideoShare(request.data)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Indique que la réponse sera envoyée de manière asynchrone
  }
});

async function handleVideoShare(data) {
  // Cette fonction sera implémentée plus tard pour gérer le partage en arrière-plan
  return {
    success: true,
    message: 'Vidéo partagée avec succès'
  };
}