import PropTypes from "prop-types";
import { useCallback, useRef, useState } from "react";
import { Button, Pagination } from "antd";
import { AudioLines, Clapperboard, Eye, EyeOff, Heart, MessageCircle, Play, Plus, VolumeX } from "lucide-react";
import { useGetPodcastsQuery } from "../../api/mediaApi";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusFilter from "../../components/StatusFilter";
import { EmptyState, ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useListParams } from "../../hooks/useListParams";
import { formatNumber, podcastDurationLabel } from "../../lib/format";
import { CLIP_MAX_SECONDS, CONVERTING_POLL_MS, isConverting, isVideoPodcast } from "../../lib/media";
import ProcessingBadge from "../../components/ProcessingBadge";
import ClipPlayerModal from "./ClipPlayerModal";
import PodcastActions from "./PodcastActions";
import PodcastFormModal from "./PodcastFormModal";
import CoverImage from "../../components/ui/CoverImage";

const CardStat = ({ icon: Icon, value, label }) => (
  <span className="inline-flex items-center gap-1 tabular-nums" title={`${formatNumber(value ?? 0)} ${label}`}>
    <Icon size={12} /> {formatNumber(value ?? 0)}
  </span>
);

CardStat.propTypes = { icon: PropTypes.elementType.isRequired, value: PropTypes.number, label: PropTypes.string.isRequired };

/**
 * Hovering a video clip plays a silent preview (browsers only allow sound after a click).
 * Clicking opens the player with sound, controls and stats. Media loads only on hover/click.
 */
const ClipCard = ({ clip, onOpen, onEdit }) => {
  const ref = useRef(null);
  const [previewing, setPreviewing] = useState(false);
  const isVideo = isVideoPodcast(clip);
  const hidden = clip.status === "hidden";

  const startPreview = () => {
    const el = ref.current;
    if (!el) return;
    el.play().then(() => setPreviewing(true)).catch(() => setPreviewing(false));
  };
  const stopPreview = () => {
    const el = ref.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPreviewing(false);
  };

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-lift ${hidden ? "outline-dashed outline-1 outline-zinc-300" : ""}`}>
      <div className="group relative aspect-[9/16] overflow-hidden bg-black" onMouseEnter={isVideo ? startPreview : undefined} onMouseLeave={isVideo ? stopPreview : undefined}>
        {isVideo ? (
          <video
            ref={ref}
            // No cover: load just the metadata so the first frame works as the thumbnail.
            src={clip.coverImage ? clip.podcast_url : `${clip.podcast_url}#t=0.1`}
            poster={clip.coverImage || undefined}
            preload={clip.coverImage ? "none" : "metadata"}
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <CoverImage src={clip.coverImage} iconSize={40} className="h-full w-full object-cover" />
        )}
        <button
          type="button"
          onClick={() => {
            stopPreview();
            onOpen();
          }}
          aria-label={`Play ${clip.title}`}
          className="absolute inset-0 cursor-pointer border-0 bg-transparent bg-gradient-to-t from-black/85 via-transparent to-black/30 p-0"
        >
          <span
            className={`absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink shadow-lg transition group-hover:scale-110 ${previewing ? "opacity-0 group-hover:opacity-100" : ""}`}
          >
            <Play size={20} className="ml-0.5" fill="currentColor" />
          </span>
        </button>
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
            {!isVideo && <AudioLines size={11} />}
            {podcastDurationLabel(clip)}
          </span>
          {previewing ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
              <VolumeX size={11} /> Preview · click for sound
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <ProcessingBadge podcast={clip} overlay />
              {hidden && (
                <span className="inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white">
                  <EyeOff size={11} /> Hidden
                </span>
              )}
            </span>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-3 bottom-3">
          <p className="line-clamp-2 text-sm font-semibold text-white">{clip.title}</p>
          <p className="mt-0.5 truncate text-xs text-white/75">{clip.creator?.name || clip.station?.name || "Station"}</p>
          <p className="mt-1.5 flex items-center gap-3 text-xs text-white/90">
            <CardStat icon={Eye} value={clip.totalView} label="views" />
            <CardStat icon={Heart} value={clip.totalLikes} label="likes" />
            <CardStat icon={MessageCircle} value={clip.totalComments} label="comments" />
          </p>
        </div>
      </div>
      <div className="flex min-h-[48px] items-center justify-end px-2 py-1.5">
        <PodcastActions podcast={clip} onEdit={onEdit} />
      </div>
    </article>
  );
};

ClipCard.propTypes = { clip: PropTypes.object.isRequired, onOpen: PropTypes.func.isRequired, onEdit: PropTypes.func.isRequired };

const ReelsPage = () => {
  const list = useListParams({ limit: 12, filters: { type: "clip", includeHidden: true, status: undefined } });
  const [converting, setConverting] = useState(false);
  const { data, isLoading, isFetching, error, refetch } = useGetPodcastsQuery(list.queryArgs, {
    pollingInterval: converting ? CONVERTING_POLL_MS : 0,
  });
  const [form, setForm] = useState({ open: false, podcast: undefined });
  const [playing, setPlaying] = useState(null); // index of the clip open in the player
  const clips = data?.result ?? [];
  const anyConverting = clips.some(isConverting);
  if (anyConverting !== converting) setConverting(anyConverting);
  const openCreate = () => setForm({ open: true, podcast: undefined });
  const openEdit = (podcast) => {
    setPlaying(null);
    setForm({ open: true, podcast });
  };
  const closePlayer = useCallback(() => setPlaying(null), []);

  return (
    <>
      <PageHeader
        title="Preach Clips"
        subtitle={`Short audio and video clips (up to ${CLIP_MAX_SECONDS / 60} minutes) for the app's reels feed.`}
        actions={
          <>
            <StatusFilter value={list.filters.status} onChange={(v) => list.setFilter("status", v)} />
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search clips" />
            <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
              New clip
            </Button>
          </>
        }
      />
      {error ? (
        <Surface>
          <ErrorState error={error} onRetry={refetch} />
        </Surface>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[9/16] animate-pulse rounded-2xl bg-zinc-200" />
          ))}
        </div>
      ) : clips.length === 0 ? (
        <Surface>
          <EmptyState
            icon={Clapperboard}
            title={list.search || list.filters.status ? "No clips match these filters" : "No clips yet"}
            description="Short highlights from sermons and worship work great here."
            action={
              !list.search &&
              !list.filters.status && (
                <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
                  Publish the first clip
                </Button>
              )
            }
          />
        </Surface>
      ) : (
        <div className={`grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6 ${isFetching ? "opacity-70" : ""}`}>
          {clips.map((c, i) => (
            <ClipCard key={c._id} clip={c} onOpen={() => setPlaying(i)} onEdit={openEdit} />
          ))}
        </div>
      )}
      {data?.meta?.total > list.limit && (
        <div className="mt-8 flex justify-center">
          <Pagination current={list.page} pageSize={list.limit} total={data.meta.total} onChange={list.onPageChange} showSizeChanger={false} />
        </div>
      )}

      {playing !== null && (
        <ClipPlayerModal clips={clips} index={playing} onIndexChange={setPlaying} onClose={closePlayer} onEdit={openEdit} />
      )}

      <PodcastFormModal
        open={form.open}
        podcast={form.podcast}
        type="clip"
        onClose={() => setForm({ open: false, podcast: undefined })}
      />
    </>
  );
};

export default ReelsPage;
