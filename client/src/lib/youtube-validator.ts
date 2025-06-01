// YouTube URL validation regex pattern
const YOUTUBE_URL_REGEX = /(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;

export function validateYouTubeUrl(url: string): boolean | null {
  if (!url || url.trim() === "") {
    return null;
  }
  
  return YOUTUBE_URL_REGEX.test(url.trim());
}

export function extractVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_URL_REGEX);
  return match ? match[2] : null;
}

export function isAgeRestricted(url: string): boolean {
  // Simple check for demo purposes - in real app this would be determined by API
  const videoId = extractVideoId(url);
  return videoId === "dQw4w9WgXcQ"; // Rick Roll video as example
}
