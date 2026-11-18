import PropTypes from "prop-types";
import { App, Upload } from "antd";
import { FileAudio, FileVideo, RefreshCw } from "lucide-react";
import { useEffect, useMemo } from "react";
import { formatDuration } from "../../lib/format";

const LIMITS_MB = { audio: 500, video: 2048 };

/**
 * Controlled media picker. value: { file?: File, url?: string, seconds?: number }.
 * `onPick(file)` lets the parent read duration etc.
 */
const MediaFileInput = ({ kind, value, onPick }) => {
  const { message } = App.useApp();
  const Icon = kind === "video" ? FileVideo : FileAudio;
  const previewUrl = useMemo(() => (value?.file ? URL.createObjectURL(value.file) : value?.url), [value?.file, value?.url]);

  useEffect(
    () => () => {
      if (value?.file && previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl, value?.file]
  );

  const beforeUpload = (file) => {
    if (!file.type.startsWith(`${kind}/`)) {
      message.error(`Please choose a${kind === "audio" ? "n audio" : " video"} file.`);
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > LIMITS_MB[kind]) {
      message.error(`File is too large (max ${LIMITS_MB[kind] >= 1024 ? `${LIMITS_MB[kind] / 1024}GB` : `${LIMITS_MB[kind]}MB`}).`);
      return Upload.LIST_IGNORE;
    }
    onPick(file);
    return false;
  };

  const picker = (children) => (
    <Upload.Dragger accept={`${kind}/*`} showUploadList={false} beforeUpload={beforeUpload} className="block [&_.ant-upload-btn]:!flex [&_.ant-upload-btn]:!items-center [&_.ant-upload-btn]:!justify-center [&_.ant-upload-drag]:!h-[220px] [&_.ant-upload-drag]:!rounded-xl">
      {children}
    </Upload.Dragger>
  );

  if (!previewUrl) {
    return picker(
      <div className="flex flex-col items-center gap-2 text-muted">
        <Icon size={30} strokeWidth={1.5} />
        <span className="text-sm font-medium text-ink">Click or drop the {kind} file</span>
        <span className="text-xs">{kind === "audio" ? "MP3, M4A, WAV, AAC" : "MP4, MOV, WEBM"}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-[220px] flex-col justify-center rounded-xl border border-line p-3">
      {kind === "video" ? (
        <video src={previewUrl} controls preload="metadata" className="max-h-36 w-full rounded-lg bg-black" />
      ) : (
        <audio src={previewUrl} controls preload="metadata" className="w-full" />
      )}
      <div className="mt-3 flex items-center gap-3">
        <Icon size={18} className="shrink-0 text-muted" />
        <div className="min-w-0 flex-1 text-sm">
          <div className="truncate font-medium text-ink">{value.file?.name || "Current file"}</div>
          <div className="text-xs text-muted">
            {value.file && `${(value.file.size / 1024 / 1024).toFixed(1)} MB · `}
            {value.seconds ? formatDuration(value.seconds) : value.file ? "Reading duration…" : "Uploaded"}
          </div>
        </div>
        <Upload accept={`${kind}/*`} showUploadList={false} beforeUpload={beforeUpload}>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink-soft hover:border-brand/40 hover:text-brand"
          >
            <RefreshCw size={14} /> Replace
          </button>
        </Upload>
      </div>
    </div>
  );
};

MediaFileInput.propTypes = {
  kind: PropTypes.oneOf(["audio", "video"]).isRequired,
  value: PropTypes.object,
  onPick: PropTypes.func.isRequired,
};

export default MediaFileInput;
