import PropTypes from "prop-types";
import { useRef, useState } from "react";
import { Button, Pagination } from "antd";
import { AudioLines, Clapperboard, Eye, EyeOff, Pause, Play, Plus } from "lucide-react";
import { useGetPodcastsQuery } from "../../api/mediaApi";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import StatusFilter from "../../components/StatusFilter";
import { EmptyState, ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useListParams } from "../../hooks/useListParams";
import { formatNumber, podcastDurationLabel } from "../../lib/format";
import { CLIP_MAX_SECONDS, isVideoPodcast } from "../../lib/media";
import PodcastActions from "./PodcastActions";
import PodcastFormModal from "./PodcastFormModal";

/** A clip only fetches its media when the admin hovers or taps it. */
const ClipCard = ({ clip, onEdit }) => {
  const ref = useRef(null);
  const [playing, setPlaying] = useState(false);
  const isVideo = isVideoPodcast(clip);
  const hidden = clip.status === "hidden";

  const play = () => {
    const el = ref.current;
    if (!el) return;
    el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };
  const pause = () => {
    ref.current?.pause();
    setPlaying(false);
  };

  return (
    <article className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-card ${hidden ? "outline-dashed outline-1 outline-zinc-300" : ""}`}>
      <div className="group relative aspect-[9/16] overflow-hidden bg-black" onMouseEnter={isVideo ? play : undefined} onMouseLeave={pause}>
        {isVideo ? (
          <video ref={ref} src={clip.podcast_url} poster={clip.coverImage} preload="none" muted loop playsInline className="h-full w-full object-cover" />
        ) : (
          <>
            <img src={clip.coverImage} alt="" loading="lazy" className="h-full w-full object-cover" />
            <audio ref={ref} src={clip.podcast_url} preload="none" onEnded={() => setPlaying(false)} />
          </>
        )}
        <button
          type="button"
          onClick={() => (playing ? pause() : play())}
          aria-label={playing ? `Pause ${clip.title}` : `Play ${clip.title}`}
          className="absolute inset-0 border-0 bg-transparent bg-gradient-to-t from-black/80 via-transparent to-black/30 p-0"
        >
          {!playing && (
            <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink">
              <Play size={20} className="ml-0.5" fill="currentColor" />
            </span>
          )}
          {playing && (
            <span className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100">
              <Pause size={18} />
            </span>
          )}
        </button>
        <div className="pointer-events-none absolute inset-x-2.5 top-2.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
            {!isVideo && <AudioLines size={11} />}
            {podcastDurationLabel(clip)}
          </span>
          {hidden && (
            <span className="inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white">
              <EyeOff size={11} /> Hidden
            </span>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-3 bottom-3">
          <p className="line-clamp-2 text-sm font-semibold text-white">{clip.title}</p>
          <p className="mt-1 flex items-center gap-2 text-xs text-white/75">
            <span className="truncate">{clip.creator?.name || clip.station?.name || "Station"}</span>
            <span className="inline-flex shrink-0 items-center gap-1 tabular-nums">
              <Eye size={12} /> {formatNumber(clip.totalView)}
            </span>
          </p>
        </div>
      </div>
      <div className="flex min-h-[48px] items-center justify-end px-2 py-1.5">
        <PodcastActions podcast={clip} onEdit={onEdit} />
      </div>
    </article>
  );
};

ClipCard.propTypes = { clip: PropTypes.object.isRequired, onEdit: PropTypes.func.isRequired };

const ReelsPage = () => {
  const list = useListParams({ limit: 12, filters: { type: "clip", includeHidden: true, status: undefined } });
  const { data, isLoading, isFetching, error, refetch } = useGetPodcastsQuery(list.queryArgs);
  const [form, setForm] = useState({ open: false, podcast: undefined });
  const clips = data?.result ?? [];
  const openCreate = () => setForm({ open: true, podcast: undefined });

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
          {clips.map((c) => (
            <ClipCard key={c._id} clip={c} onEdit={(podcast) => setForm({ open: true, podcast })} />
          ))}
        </div>
      )}
      {data?.meta?.total > list.limit && (
        <div className="mt-8 flex justify-center">
          <Pagination current={list.page} pageSize={list.limit} total={data.meta.total} onChange={list.onPageChange} showSizeChanger={false} />
        </div>
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
