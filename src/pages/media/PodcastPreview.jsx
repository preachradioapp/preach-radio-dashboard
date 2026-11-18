import PropTypes from "prop-types";
import { Descriptions, Modal, Skeleton } from "antd";
import { useGetPodcastQuery } from "../../api/mediaApi";
import { ErrorState } from "../../components/ui/States";
import UserCell from "../../components/ui/UserCell";
import { formatDate, formatNumber, podcastDurationLabel } from "../../lib/format";
import { isVideoPodcast } from "../../lib/media";
import CoverImage from "../../components/ui/CoverImage";

/** Plays a podcast and shows its metadata. Fetches by id so it always shows fresh data. */
const PodcastPreview = ({ podcastId, onClose }) => {
  const { data: p, isFetching, error, refetch } = useGetPodcastQuery(podcastId, { skip: !podcastId });

  return (
    <Modal open={Boolean(podcastId)} onCancel={onClose} footer={null} width={720} centered destroyOnClose title={p?.title || "Podcast"}>
      {error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : isFetching || !p ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="space-y-5">
          {isVideoPodcast(p) ? (
            <video src={p.podcast_url} poster={p.coverImage || undefined} controls autoPlay className="aspect-video w-full rounded-xl bg-black" />
          ) : (
            <div className="flex items-center gap-4 rounded-xl bg-canvas p-4">
              <CoverImage src={p.coverImage} iconSize={28} className="h-24 w-24 shrink-0 rounded-lg object-cover" />
              <audio src={p.podcast_url} controls autoPlay className="min-w-0 flex-1" />
            </div>
          )}
          {(p.creator || p.station) && (
            <UserCell
              name={p.creator?.name || p.station?.name}
              image={p.creator?.profile_image || p.station?.profile_image}
              subtitle={p.creator ? "Creator" : "Station"}
            />
          )}
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">{p.description}</p>
          <Descriptions
            size="small"
            column={{ xs: 1, sm: 2 }}
            colon={false}
            labelStyle={{ color: "#6B6B76" }}
            items={[
              { key: "cat", label: "Category", children: [p.category?.name, p.subCategory?.name].filter(Boolean).join(" / ") || "—" },
              ...(p.type === "clip"
                ? [{ key: "source", label: "Cut from", children: p.sourcePodcast?.title || "—", span: 2 }]
                : []),
              { key: "dur", label: "Duration", children: podcastDurationLabel(p) },
              { key: "views", label: "Views", children: formatNumber(p.totalView ?? 0) },
              { key: "likes", label: "Likes", children: formatNumber(p.totalLikes ?? 0) },
              { key: "comments", label: "Comments", children: formatNumber(p.totalComments ?? 0) },
              { key: "saves", label: "Saves", children: formatNumber(p.totalBookmarks ?? 0) },
              { key: "date", label: "Published", children: formatDate(p.createdAt) },
              { key: "addr", label: "Location", children: p.address || "—", span: 2 },
            ]}
          />
          {p.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {p.tags.map((t) => (
                <span key={t} className="rounded-md bg-canvas px-2 py-0.5 text-xs text-ink-soft">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};

PodcastPreview.propTypes = { podcastId: PropTypes.string, onClose: PropTypes.func.isRequired };

export default PodcastPreview;
