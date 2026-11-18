import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, List, Skeleton } from "antd";
import { Mic, Pencil, Play, X } from "lucide-react";
import { useGetAlbumQuery, useRemovePodcastFromAlbumMutation } from "../../api/catalogApi";
import IconAction from "../../components/ui/IconAction";
import PageHeader from "../../components/ui/PageHeader";
import { EmptyState, ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { formatDate, pluralize } from "../../lib/format";
import PodcastPreview from "../media/PodcastPreview";
import AlbumFormModal from "./AlbumFormModal";

const AlbumDetailPage = () => {
  const { id } = useParams();
  const { data: album, isLoading, error, refetch } = useGetAlbumQuery(id);
  const [removePodcast, removeState] = useRemovePodcastFromAlbumMutation();
  const [editing, setEditing] = useState(false);
  const [previewId, setPreviewId] = useState(null);
  const run = useAction();

  if (error) {
    return (
      <>
        <PageHeader title="Album" back />
        <Surface>
          <ErrorState error={error} onRetry={refetch} />
        </Surface>
      </>
    );
  }

  if (isLoading || !album) {
    return (
      <Surface>
        <Skeleton active avatar={{ shape: "square", size: 160 }} paragraph={{ rows: 4 }} />
      </Surface>
    );
  }

  const podcasts = album.podcasts ?? [];

  return (
    <>
      <PageHeader
        back
        title={album.name}
        subtitle={`${pluralize(podcasts.length, "podcast")} · Created ${formatDate(album.createdAt)}`}
        actions={
          <Button icon={<Pencil size={15} />} onClick={() => setEditing(true)}>
            Edit album
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Surface>
          <img src={album.cover_image} alt={album.name} className="aspect-square w-full rounded-xl object-cover" />
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-soft">{album.description}</p>
          {album.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {album.tags.map((t) => (
                <span key={t} className="rounded-md bg-canvas px-2 py-0.5 text-xs text-ink-soft">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </Surface>

        <Surface title="Tracks" bodyClassName="!py-1">
          {podcasts.length === 0 ? (
            <EmptyState icon={Mic} title="This album is empty" description="Edit the album to add podcasts." />
          ) : (
            <List
              dataSource={podcasts}
              renderItem={(p, i) => (
                <List.Item
                  className="!px-0"
                  actions={[
                    <IconAction key="play" icon={Play} label="Preview" tone="brand" onClick={() => setPreviewId(p._id)} />,
                    <IconAction
                      key="remove"
                      icon={X}
                      label="Remove from album"
                      tone="danger"
                      loading={removeState.isLoading && removeState.originalArgs?.podcastId === p._id}
                      onClick={() => run(removePodcast({ albumId: id, podcastId: p._id }), { success: "Removed from album" })}
                      confirm={{ title: `Remove “${p.title}” from this album?`, okText: "Remove" }}
                    />,
                  ]}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-6 text-right text-sm tabular-nums text-muted">{i + 1}</span>
                    <img src={p.coverImage} alt="" loading="lazy" className="h-11 w-11 rounded-lg bg-canvas object-cover" />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">{p.title}</div>
                      <div className="truncate text-xs text-muted">
                        {[p.category?.name, p.subCategory?.name, p.creator?.name].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                  </div>
                </List.Item>
              )}
            />
          )}
        </Surface>
      </div>

      <AlbumFormModal open={editing} albumId={id} onClose={() => setEditing(false)} />
      <PodcastPreview podcastId={previewId} onClose={() => setPreviewId(null)} />
    </>
  );
};

export default AlbumDetailPage;
