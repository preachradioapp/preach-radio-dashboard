import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";

const HLS_MIME = "application/vnd.apple.mpegurl";

/**
 * Plays a podcast or clip. Uses the adaptive HLS stream (`hlsUrl`) when there is one
 * and falls back to the original file (`src`) when there isn't, or if the stream
 * fails. Safari plays HLS natively; other browsers load hls.js on demand.
 */
const MediaPlayer = ({ kind, src, hlsUrl, poster, autoPlay = false, className = "" }) => {
  const ref = useRef(null);
  // "hls" while the stream is used, "file" after falling back to the original.
  const [mode, setMode] = useState(hlsUrl ? "hls" : "file");

  useEffect(() => setMode(hlsUrl ? "hls" : "file"), [hlsUrl, src]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (mode !== "hls") {
      el.src = src || "";
      return undefined;
    }
    if (el.canPlayType(HLS_MIME)) {
      el.src = hlsUrl;
      const fallback = () => setMode("file");
      el.addEventListener("error", fallback, { once: true });
      return () => el.removeEventListener("error", fallback);
    }

    let hls;
    let cancelled = false;
    import("hls.js")
      .then(({ default: Hls }) => {
        if (cancelled) return;
        if (!Hls.isSupported()) {
          setMode("file");
          return;
        }
        hls = new Hls({ capLevelToPlayerSize: true, startLevel: -1 });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal) return;
          // One recovery attempt for media errors, otherwise play the original file.
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !hls.recovered) {
            hls.recovered = true;
            hls.recoverMediaError();
          } else {
            setMode("file");
          }
        });
        hls.loadSource(hlsUrl);
        hls.attachMedia(el);
      })
      .catch(() => !cancelled && setMode("file"));

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [mode, hlsUrl, src]);

  // Autoplay after the source is attached (the browser allows sound: the user clicked to open).
  useEffect(() => {
    if (!autoPlay) return;
    const el = ref.current;
    const play = () => el?.play().catch(() => {});
    el?.addEventListener("loadedmetadata", play, { once: true });
    return () => el?.removeEventListener("loadedmetadata", play);
  }, [autoPlay, mode, hlsUrl, src]);

  const Tag = kind === "video" ? "video" : "audio";
  return (
    <Tag
      ref={ref}
      controls
      playsInline
      preload="metadata"
      poster={kind === "video" ? poster || undefined : undefined}
      className={className}
      data-stream={mode}
    />
  );
};

MediaPlayer.propTypes = {
  kind: PropTypes.oneOf(["audio", "video"]).isRequired,
  /** The original upload (podcast_url). */
  src: PropTypes.string,
  /** The adaptive stream, when conversion has finished. */
  hlsUrl: PropTypes.string,
  poster: PropTypes.string,
  autoPlay: PropTypes.bool,
  className: PropTypes.string,
};

export default MediaPlayer;
