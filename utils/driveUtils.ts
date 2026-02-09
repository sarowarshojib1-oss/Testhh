/**
 * Extracts the Google Drive File ID from a variety of URL formats.
 * 
 * Supported formats:
 * - https://drive.google.com/file/d/VIDEO_ID/view
 * - https://drive.google.com/file/d/VIDEO_ID/preview
 * - https://drive.google.com/open?id=VIDEO_ID
 * - https://docs.google.com/file/d/VIDEO_ID/edit
 * 
 * @param url The input URL string
 * @returns The extracted ID or null if not found
 */
export const extractDriveId = (url: string): string | null => {
  if (!url) return null;

  // Regex to match /d/ID/ or id=ID patterns
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/, // matches .../file/d/ID...
    /\/open\?id=([a-zA-Z0-9_-]+)/, // matches .../open?id=ID...
    /^([a-zA-Z0-9_-]+)$/           // matches raw ID provided directly
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
};