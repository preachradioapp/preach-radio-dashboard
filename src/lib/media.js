/** Preach Clips (reels) may be at most 2 minutes long — mirrors the backend rule. */
export const CLIP_MAX_SECONDS = 120;

/** Best-effort detection of video media from its URL (S3 key prefix or extension). */
export const isVideoUrl = (url = "") => /podcast_video|\.(mp4|mov|webm|m4v|m3u8)(\?|$)/i.test(url);

/** Uses the backend's `mediaType` when present; falls back to URL detection for older records. */
export const isVideoPodcast = (podcast) =>
  podcast?.mediaType ? podcast.mediaType === "video" : isVideoUrl(podcast?.podcast_url);
