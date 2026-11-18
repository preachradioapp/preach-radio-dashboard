import { useState } from "react";
import { Button, Pagination } from "antd";
import { Clock, Eye, EyeOff, Mic, Play, Plus, Video } from "lucide-react";
import { useGetPodcastsQuery } from "../../api/mediaApi";
import PageHeader from "../../components/ui/PageHeader";
import StatusFilter from "../../components/StatusFilter";
import SearchInput from "../../components/ui/SearchInput";
import { CardGridSkeleton, EmptyState, ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useListParams } from "../../hooks/useListParams";
import { formatNumber, fromNow, podcastDurationLabel } from "../../lib/format";
import { isVideoPodcast } from "../../lib/media";
import PodcastActions from "./PodcastActions";
import PodcastFormModal from "./PodcastFormModal";
import PodcastPreview from "./PodcastPreview";

const PodcastsPage = () => {
  // Full episodes only (clips live on the Reels page). Admins also see hidden ones.
  const list = useListParams({ limit: 12, filters: { type: "episode", includeHidden: true, status: undefined } });
  const { data, isLoading, isFetching, error, refetch } = useGetPodcastsQuery(list.queryArgs);
  const [form, setForm] = useState({ open: false, podcast: undefined });
  const [previewId, setPreviewId] = useState(null);
  const podcasts = data?.result ?? [];

  const openCreate = () => setForm({ open: true, podcast: undefined });

  return (
    <>
      <PageHeader
        title="Podcasts"
        subtitle="Full episodes on Preach Radio — from the station and from creators."
        actions={
          <>
            <StatusFilter value={list.filters.status} onChange={(v) => list.setFilter("status", v)} />
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search title, creator…" />
            <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
              New podcast
            </Button>
          </>
        }
      />

      {error ? (
        <Surface>
          <ErrorState error={error} onRetry={refetch} />
        </Surface>
      ) : isLoading ? (
        <CardGridSkeleton />
      ) : podcasts.length === 0 ? (
        <Surface>
          <EmptyState
            icon={Mic}
            title={list.search || list.filters.status ? "No podcasts match these filters" : "No podcasts yet"}
            action={
              !list.search &&
              !list.filters.status && (
                <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
                  Publish the first episode
                </Button>
              )
            }
          />
        </Surface>
      ) : (
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${isFetching ? "opacity-70" : ""}`}>
          {podcasts.map((p) => {
            const hidden = p.status === "hidden";
            return (
              <article
                key={p._id}
                className={`group flex flex-col overflow-hidden rounded-2xl border bg-white shadow-card transition hover:shadow-lift ${
                  hidden ? "border-dashed border-zinc-300" : "border-line"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setPreviewId(p._id)}
                  className="relative block aspect-video w-full overflow-hidden border-0 bg-canvas p-0"
                  aria-label={`Play ${p.title}`}
                >
                  <img
                    src={p.coverImage}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/30">
                    <span className="grid h-12 w-12 scale-90 place-items-center rounded-full bg-white/95 text-ink opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100">
                      <Play size={20} className="ml-0.5" fill="currentColor" />
                    </span>
                  </span>
                  {hidden && (
                    <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-md bg-black/75 px-2 py-0.5 text-[11px] font-medium text-white">
                      <EyeOff size={11} /> Hidden
                    </span>
                  )}
                  <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-white">
                    {isVideoPodcast(p) ? <Video size={11} /> : <Clock size={11} />}
                    {podcastDurationLabel(p)}
                  </span>
                </button>
                <div className="flex flex-1 flex-col p-4">
                  <div className="text-xs font-medium text-brand">{p.category?.name}</div>
                  <h3 className="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-ink">{p.title}</h3>
                  <div className="mt-1 truncate text-xs text-muted">
                    {p.creator?.name || p.station?.name || "Station"} · {fromNow(p.createdAt)}
                  </div>
                  <div className="mt-auto flex min-h-[48px] items-center justify-between pt-3">
                    <span className="inline-flex items-center gap-1 text-xs tabular-nums text-muted">
                      <Eye size={14} /> {formatNumber(p.totalView)}
                    </span>
                    <PodcastActions podcast={p} onEdit={(podcast) => setForm({ open: true, podcast })} />
                  </div>
                </div>
              </article>
            );
          })}
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
        type="episode"
        onClose={() => setForm({ open: false, podcast: undefined })}
      />
      <PodcastPreview podcastId={previewId} onClose={() => setPreviewId(null)} />
    </>
  );
};

export default PodcastsPage;
