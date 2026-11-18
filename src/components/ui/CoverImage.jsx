import PropTypes from "prop-types";
import { useState } from "react";
import { Radio } from "lucide-react";

/**
 * A podcast/clip cover. Covers are optional, so when there is none (or the file
 * fails to load) a branded placeholder fills the same box instead of a broken image.
 */
const CoverImage = ({ src, className = "", iconSize = 20 }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        aria-hidden="true"
        className={`grid place-items-center bg-gradient-to-br from-[#2a1013] via-[#16161b] to-[#0b0b0e] text-brand/80 ${className}`}
      >
        <Radio size={iconSize} strokeWidth={1.6} />
      </div>
    );
  }
  return <img src={src} alt="" loading="lazy" onError={() => setFailed(true)} className={className} />;
};

CoverImage.propTypes = { src: PropTypes.string, className: PropTypes.string, iconSize: PropTypes.number };

export default CoverImage;
