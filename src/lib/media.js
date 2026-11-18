/** Preach Clips (reels) may be at most 2 minutes long — mirrors the backend rule. */
export const CLIP_MAX_SECONDS = 120;

/** Best-effort detection of video media from its URL (S3 key prefix or extension). */
export const isVideoUrl = (url = "") => /podcast_video|\.(mp4|mov|webm|m4v|m3u8)(\?|$)/i.test(url);

/** Uses the backend's `mediaType` when present; falls back to URL detection for older records. */
export const isVideoPodcast = (podcast) =>
  podcast?.mediaType ? podcast.mediaType === "video" : isVideoUrl(podcast?.podcast_url);

/**
 * Server-side conversion to streaming formats (HLS). `processing` is absent for
 * podcasts uploaded before conversion existed (they play the original file).
 */
export const processingStatus = (podcast) => podcast?.processing?.status ?? null;

/** Still converting: show a badge and keep the list refreshing. */
export const isConverting = (podcast) => ["queued", "processing"].includes(processingStatus(podcast));

/** How often lists refresh while something is converting. */
export const CONVERTING_POLL_MS = 15000;
