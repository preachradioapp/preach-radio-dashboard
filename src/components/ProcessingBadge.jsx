import PropTypes from "prop-types";
import { Button, Tooltip } from "antd";
import { AlertTriangle, LoaderCircle, RotateCw } from "lucide-react";
import { useReprocessPodcastMutation } from "../api/mediaApi";
import { useAction } from "../hooks/useAction";
import { processingStatus } from "../lib/media";

const LABELS = {
  queued: "Processing",
  processing: "Processing",
  failed: "Not optimized",
};

/**
 * Conversion status of a podcast's media. Shows nothing once it is ready (or for
 * older uploads). `overlay` = a dark chip on top of a thumbnail.
 */
const ProcessingBadge = ({ podcast, overlay = false }) => {
  const status = processingStatus(podcast);
  if (!LABELS[status]) return null;
  const failed = status === "failed";
  const tip = failed
    ? "Streaming conversion failed. The original file still plays. Open the podcast to retry."
    : "Converting to an adaptive stream. It plays from the original file until this finishes.";
  const tone = overlay
    ? failed
      ? "bg-black/75 text-amber-300"
      : "bg-black/75 text-white"
    : failed
      ? "bg-amber-50 text-amber-700"
      : "bg-sky-50 text-sky-700";
  return (
    <Tooltip title={tip}>
      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tone}`}>
        {failed ? <AlertTriangle size={11} /> : <LoaderCircle size={11} className="animate-spin" />}
        {LABELS[status]}
      </span>
    </Tooltip>
  );
};

ProcessingBadge.propTypes = { podcast: PropTypes.object, overlay: PropTypes.bool };

/** Detail views: the status plus a retry button when conversion failed. */
export const ProcessingNotice = ({ podcast }) => {
  const [reprocess, { isLoading }] = useReprocessPodcastMutation();
  const run = useAction();
  const status = processingStatus(podcast);
  if (status !== "failed" && status !== "queued" && status !== "processing") return null;
  const failed = status === "failed";
  return (
    <div
      className={`flex items-start gap-3 rounded-xl px-3.5 py-3 text-sm ${
        failed ? "bg-amber-50 text-amber-800" : "bg-sky-50 text-sky-800"
      }`}
    >
      {failed ? (
        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
      ) : (
        <LoaderCircle size={16} className="mt-0.5 shrink-0 animate-spin" />
      )}
      <div className="min-w-0 flex-1">
        <div className="font-medium">
          {failed ? "Streaming conversion failed" : "Converting for smooth streaming…"}
        </div>
        <div className="mt-0.5 text-xs opacity-80">
          {failed
            ? podcast.processing?.error || "The original file still plays everywhere."
            : "Listeners can already play it; it switches to the adaptive stream when ready."}
        </div>
      </div>
      {failed && (
        <Button
          size="small"
          icon={<RotateCw size={13} />}
          loading={isLoading}
          onClick={() => run(reprocess(podcast._id), { success: "Conversion restarted" })}
        >
          Retry
        </Button>
      )}
    </div>
  );
};

ProcessingNotice.propTypes = { podcast: PropTypes.object.isRequired };

export default ProcessingBadge;
