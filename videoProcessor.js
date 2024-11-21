import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg = null;

const platformSpecs = {
  instagram: {
    maxDuration: 60,
    aspectRatio: '1:1',
    maxFileSize: 100 * 1024 * 1024,
    codec: 'libx264',
    format: 'mp4',
    resolution: '1080x1080'
  },
  tiktok: {
    maxDuration: 180,
    aspectRatio: '9:16',
    maxFileSize: 287 * 1024 * 1024,
    codec: 'libx264',
    format: 'mp4',
    resolution: '1080x1920'
  },
  facebook: {
    maxDuration: 240,
    aspectRatio: '16:9',
    maxFileSize: 1024 * 1024 * 1024,
    codec: 'libx264',
    format: 'mp4',
    resolution: '1920x1080'
  },
  youtube: {
    maxDuration: 43200,
    aspectRatio: '16:9',
    maxFileSize: 128 * 1024 * 1024 * 1024,
    codec: 'libx264',
    format: 'mp4',
    resolution: '1920x1080'
  }
};

async function initFFmpeg() {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  ffmpeg.on('log', ({ message }) => {
    console.log(message);
  });

  await ffmpeg.load();
  return ffmpeg;
}

async function getVideoDuration(videoFile) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.src = URL.createObjectURL(videoFile);
  });
}

async function validateVideo(videoFile, platform) {
  const specs = platformSpecs[platform];
  const duration = await getVideoDuration(videoFile);
  
  if (duration > specs.maxDuration) {
    throw new Error(`La vidéo est trop longue. Maximum ${specs.maxDuration} secondes pour ${platform}`);
  }
  
  if (videoFile.size > specs.maxFileSize) {
    throw new Error(`Fichier trop volumineux. Maximum ${Math.floor(specs.maxFileSize / 1024 / 1024)}MB pour ${platform}`);
  }
  
  return true;
}

export async function processVideo(videoFile, platform) {
  await validateVideo(videoFile, platform);
  const specs = platformSpecs[platform];
  
  const ffmpeg = await initFFmpeg();
  const inputFileName = 'input' + videoFile.name.substring(videoFile.name.lastIndexOf('.'));
  const outputFileName = `output.${specs.format}`;
  
  try {
    // Charger le fichier vidéo
    await ffmpeg.writeFile(inputFileName, await fetchFile(videoFile));
    
    // Traiter la vidéo selon les spécifications de la plateforme
    await ffmpeg.exec([
      '-i', inputFileName,
      '-c:v', specs.codec,
      '-c:a', 'aac',
      '-vf', `scale=${specs.resolution}:force_original_aspect_ratio=decrease,pad=${specs.resolution}:(ow-iw)/2:(oh-ih)/2`,
      '-movflags', '+faststart',
      '-y',
      outputFileName
    ]);
    
    // Récupérer le fichier traité
    const data = await ffmpeg.readFile(outputFileName);
    const processedVideo = new Blob([data], { type: `video/${specs.format}` });
    
    // Nettoyer les fichiers temporaires
    await ffmpeg.deleteFile(inputFileName);
    await ffmpeg.deleteFile(outputFileName);
    
    return processedVideo;
  } catch (error) {
    console.error('Erreur lors du traitement de la vidéo:', error);
    throw new Error('Échec du traitement de la vidéo');
  }
}