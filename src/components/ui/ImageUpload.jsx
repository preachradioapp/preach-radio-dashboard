import PropTypes from "prop-types";
import { App, Upload } from "antd";
import { ImagePlus, X } from "lucide-react";
import { useEffect, useMemo } from "react";

const MAX_MB = 5;

/**
 * Controlled single-image picker that works as an antd Form field.
 * value: File (new selection) | string (existing URL) | null
 */
const ImageUpload = ({ value, onChange, aspect = "aspect-video", hint = `PNG, JPG or WEBP · up to ${MAX_MB}MB` }) => {
  const { message } = App.useApp();

  const preview = useMemo(() => {
    if (!value) return null;
    return typeof value === "string" ? value : URL.createObjectURL(value);
  }, [value]);

  useEffect(
    () => () => {
      if (preview && value instanceof Blob) URL.revokeObjectURL(preview);
    },
    [preview, value]
  );

  const beforeUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Please choose an image file.");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_MB) {
      message.error(`Image must be smaller than ${MAX_MB}MB.`);
      return Upload.LIST_IGNORE;
    }
    onChange?.(file);
    return false; // never auto-upload; the form submits it
  };

  return (
    <div className={`group relative w-full overflow-hidden rounded-xl ${aspect}`}>
      <Upload.Dragger
        accept="image/*"
        showUploadList={false}
        beforeUpload={beforeUpload}
        className="!absolute inset-0 block h-full [&_.ant-upload-btn]:!p-0 [&_.ant-upload-drag]:!h-full [&_.ant-upload-drag]:!rounded-xl [&_.ant-upload-drag]:overflow-hidden"
      >
        {preview ? (
          <img src={preview} alt="Selected" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-muted">
            <ImagePlus size={28} strokeWidth={1.5} />
            <span className="text-sm font-medium text-ink">Click or drop an image</span>
            <span className="text-xs">{hint}</span>
          </div>
        )}
      </Upload.Dragger>
      {preview && (
        <button
          type="button"
          aria-label="Remove image"
          onClick={() => onChange?.(null)}
          className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

ImageUpload.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func,
  aspect: PropTypes.string,
  hint: PropTypes.string,
};

export default ImageUpload;
