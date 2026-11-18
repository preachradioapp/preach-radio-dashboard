import { useCallback } from "react";
import { useGetPresignedUrlMutation } from "../api/mediaApi";

/** PUTs a file to a presigned S3 URL, reporting progress (0–100). */
const putWithProgress = (url, file, onProgress) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (HTTP ${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed. Check your connection and try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));
    xhr.send(file);
  });

/**
 * Returns `upload(file, fileCategory, onProgress) => publicUrl`.
 * fileCategory: "podcast_audio" | "podcast_video" | "podcast_cover" (see backend presigned route).
 * The presigned URL expires after 60s, so it is requested immediately before the PUT.
 */
export const useS3Upload = () => {
  const [getPresignedUrl] = useGetPresignedUrlMutation();

  return useCallback(
    async (file, fileCategory, onProgress) => {
      const { uploadURL } = await getPresignedUrl({ fileType: file.type, fileCategory }).unwrap();
      if (!uploadURL) throw new Error("Could not prepare the upload. Please try again.");
      await putWithProgress(uploadURL, file, onProgress);
      return uploadURL.split("?")[0];
    },
    [getPresignedUrl]
  );
};

/**
 * Reads a local audio/video file's metadata: duration in seconds and, for video,
 * the size as displayed (browsers apply the rotation flag of phone videos).
 */
export const readMediaInfo = (file) =>
  new Promise((resolve, reject) => {
    const el = document.createElement(file.type.startsWith("video") ? "video" : "audio");
    const url = URL.createObjectURL(file);
    el.preload = "metadata";
    el.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ seconds: el.duration, width: el.videoWidth || undefined, height: el.videoHeight || undefined });
    };
    el.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read media duration"));
    };
    el.src = url;
  });

/** Reads duration (seconds) from a local audio/video file's metadata. */
export const readMediaDuration = async (file) => (await readMediaInfo(file)).seconds;
