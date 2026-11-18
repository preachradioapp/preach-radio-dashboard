import PropTypes from "prop-types";
import { useEffect } from "react";
import { Modal, Tag, Tooltip } from "antd";
import { Bookmark, CalendarDays, ChevronLeft, ChevronRight, Eye, Heart, MessageCircle, X } from "lucide-react";
import { useGetPodcastQuery } from "../../api/mediaApi";
import UserCell from "../../components/ui/UserCell";
import { formatDate, formatNumber, podcastDurationLabel } from "../../lib/format";
import { isVideoPodcast } from "../../lib/media";
import PodcastActions from "./PodcastActions";
import CoverImage from "../../components/ui/CoverImage";

const Stat = ({ icon: Icon, label, value, loading }) => (
  <div className="rounded-xl border border-line-soft bg-canvas px-3 py-2.5">
    <div className="flex items-center gap-1.5 text-xs text-muted">
      <Icon size={13} /> {label}
    </div>
    <div className={`mt-0.5 text-lg font-semibold tabular-nums text-ink ${loading ? "animate-pulse text-muted" : ""}`}>
      {value === undefined ? "—" : formatNumber(value)}
    </div>
  </div>
);

Stat.propTypes = { icon: PropTypes.elementType.isRequired, label: PropTypes.string.isRequired, value: PropTypes.number, loading: PropTypes.bool };

const NavButton = ({ dir, disabled, onClick }) => (
  <Tooltip title={dir === "prev" ? "Previous clip (←)" : "Next clip (→)"}>
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={dir === "prev" ? "Previous clip" : "Next clip"}
      className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-line bg-white text-ink-soft transition hover:border-brand/40 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-ink-soft"
    >
      {dir === "prev" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  </Tooltip>
);

NavButton.propTypes = { dir: PropTypes.oneOf(["prev", "next"]).isRequired, disabled: PropTypes.bool, onClick: PropTypes.func };

/**
 * Plays a clip with sound and controls, next to its engagement stats.
 * Shows the list item instantly, then refreshes it from the detail endpoint (fresh counts).
 */
const ClipPlayerModal = ({ clips, index, onIndexChange, onClose, onEdit }) => {
  const listClip = index === null ? null : clips[index];
  const { data: detail, isFetching } = useGetPodcastQuery(listClip?._id, { skip: !listClip });
  const clip = detail && listClip && detail._id === listClip._id ? { ...listClip, ...detail } : listClip;

  const hasPrev = index > 0;
  const hasNext = index !== null && index < clips.length - 1;

  // The clip may disappear from the list (deleted, or filtered out after hiding).
  useEffect(() => {
    if (index !== null && !listClip) onClose();
  }, [index, listClip, onClose]);

  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (e) => {
      if (e.target.closest?.("input, textarea, [contenteditable=true]")) return;
      if (e.key === "ArrowLeft" && hasPrev) onIndexChange(index - 1);
      if (e.key === "ArrowRight" && hasNext) onIndexChange(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, hasPrev, hasNext, onIndexChange]);

  if (!clip) return null;
  const isVideo = isVideoPodcast(clip);
  const owner = clip.creator || clip.station;
  const counting = isFetching && !detail;

  return (
    <Modal
      open
      onCancel={onClose}
      footer={null}
      closable={false}
      centered
      width={920}
      destroyOnClose
      styles={{ content: { padding: 0, overflow: "hidden" } }}
    >
      <div className="flex flex-col md:h-[min(82vh,760px)] md:flex-row">
        {/* Player */}
        <div className="flex shrink-0 items-center justify-center bg-black md:w-[min(46vh,428px)]">
          {isVideo ? (
            <video
              key={clip._id}
              src={clip.podcast_url}
              poster={clip.coverImage || undefined}
              controls
              autoPlay
              playsInline
              className="max-h-[60vh] w-full object-contain md:h-full md:max-h-none"
            />
          ) : (
            <div key={clip._id} className="flex w-full flex-col items-center gap-5 p-6">
              <CoverImage src={clip.coverImage} iconSize={48} className="aspect-square w-full max-w-[300px] rounded-xl object-cover" />
              <audio src={clip.podcast_url} controls autoPlay className="w-full" />
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line-soft px-5 py-3">
            <div className="flex items-center gap-2">
              <NavButton dir="prev" disabled={!hasPrev} onClick={() => onIndexChange(index - 1)} />
              <NavButton dir="next" disabled={!hasNext} onClick={() => onIndexChange(index + 1)} />
              <span className="ml-1 text-xs tabular-nums text-muted">
                {index + 1} / {clips.length}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border-0 text-muted transition hover:bg-canvas hover:text-ink"
            >
              <X size={18} />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                {clip.status === "hidden" ? <Tag color="default">Hidden</Tag> : <Tag color="success">Published</Tag>}
                <Tag>{isVideo ? "Video" : "Audio"} · {podcastDurationLabel(clip)}</Tag>
              </div>
              <h2 className="text-lg font-semibold leading-snug text-ink">{clip.title}</h2>
              {owner && (
                <div className="mt-3">
                  <UserCell name={owner.name} image={owner.profile_image} subtitle={clip.creator ? "Creator" : "Station"} size={34} />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <Stat icon={Eye} label="Views" value={clip.totalView ?? 0} />
              <Stat icon={Heart} label="Likes" value={clip.totalLikes ?? 0} />
              <Stat icon={MessageCircle} label="Comments" value={clip.totalComments} loading={counting} />
              <Stat icon={Bookmark} label="Saves" value={clip.totalBookmarks} loading={counting} />
            </div>

            {clip.description && <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{clip.description}</p>}

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Category</dt>
              <dd className="m-0 text-ink">{[clip.category?.name, clip.subCategory?.name].filter(Boolean).join(" / ") || "—"}</dd>
              {clip.sourcePodcast && (
                <>
                  <dt className="text-muted">Cut from</dt>
                  <dd className="m-0 truncate text-ink">{clip.sourcePodcast.title || "—"}</dd>
                </>
              )}
              <dt className="text-muted">Published</dt>
              <dd className="m-0 inline-flex items-center gap-1.5 text-ink">
                <CalendarDays size={13} className="text-muted" /> {formatDate(clip.createdAt)}
              </dd>
            </dl>

            {clip.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {clip.tags.map((t) => (
                  <span key={t} className="rounded-md bg-canvas px-2 py-0.5 text-xs text-ink-soft">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end border-t border-line-soft px-4 py-2.5">
            <PodcastActions podcast={clip} onEdit={onEdit} />
          </div>
        </div>
      </div>
    </Modal>
  );
};

ClipPlayerModal.propTypes = {
  clips: PropTypes.array.isRequired,
  index: PropTypes.number,
  onIndexChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default ClipPlayerModal;
