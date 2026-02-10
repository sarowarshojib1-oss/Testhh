/**
 * Video Source Type Definition
 */
export type VideoSource = {
  type: 'drive' | 'youtube' | 'facebook' | 'pinterest' | 'pixabay';
  id: string;
};

/**
 * Extracts the ID and Source Type from a URL (Google Drive, YouTube, Facebook, Pinterest, or Pixabay).
 * 
 * @param url The input URL string
 * @returns The source object { type, id } or null if not found
 */
export const extractVideoSource = (url: string): VideoSource | null => {
  if (!url) return null;
  const trimmed = url.trim();

  // 1. YouTube Patterns
  // Covers: youtube.com/watch?v=ID, youtube.com/embed/ID, youtu.be/ID
  const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const ytMatch = trimmed.match(youtubeRegex);
  if (ytMatch && ytMatch[1]) {
    return { type: 'youtube', id: ytMatch[1] };
  }

  // 2. Facebook Patterns
  // Covers: facebook.com/..., fb.watch/..., fb.com/...
  const fbRegex = /(?:https?:\/\/)?(?:www\.|web\.|m\.)?(?:facebook|fb)\.(?:com|watch)\/(?:.+)/i;
  if (fbRegex.test(trimmed)) {
    return { type: 'facebook', id: trimmed };
  }

  // 3. Pinterest Patterns
  // Covers: pinterest.com/pin/ID, pin.it/ID
  // We return the full URL as ID because the embed script needs the href
  const pinRegex = /(?:pinterest\.(?:com|co\.[a-z]{2}|ca|de|fr|jp)\/pin\/|pin\.it\/)/i;
  if (pinRegex.test(trimmed)) {
    return { type: 'pinterest', id: trimmed };
  }

  // 4. Pixabay Patterns (Direct MP4 links)
  // Covers: https://cdn.pixabay.com/.../video.mp4
  const pixabayRegex = /pixabay\.com\/.*\.mp4/i;
  if (pixabayRegex.test(trimmed)) {
    return { type: 'pixabay', id: trimmed };
  }

  // 5. Google Drive Patterns
  const drivePatterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // .../file/d/ID...
    /\/open\?id=([a-zA-Z0-9_-]+)/, // .../open?id=ID...
    /\/uc\?.*id=([a-zA-Z0-9_-]+)/, // .../uc?id=ID...
    /^([a-zA-Z0-9_-]{20,})$/       // Raw Drive ID (assuming long enough string)
  ];

  for (const pattern of drivePatterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return { type: 'drive', id: match[1] };
    }
  }

  return null;
};

// Deprecated: kept for backward compatibility if needed, but App.tsx will use extractVideoSource
export const extractDriveId = (url: string): string | null => {
  const result = extractVideoSource(url);
  return result && result.type === 'drive' ? result.id : null;
};