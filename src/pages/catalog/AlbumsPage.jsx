import { useState } from "react";
import { Button, Pagination } from "antd";
import { Disc3, Pencil, Plus, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useDeleteAlbumMutation, useGetAlbumsQuery } from "../../api/catalogApi";
import IconAction from "../../components/ui/IconAction";
import PageHeader from "../../components/ui/PageHeader";
import SearchInput from "../../components/ui/SearchInput";
import { CardGridSkeleton, EmptyState, ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { useListParams } from "../../hooks/useListParams";
import AlbumFormModal from "./AlbumFormModal";
import { pluralize } from "../../lib/format";

const AlbumsPage = () => {
  const list = useListParams({ limit: 12 });
  const { data, isLoading, isFetching, error, refetch } = useGetAlbumsQuery(list.queryArgs);
  const [deleteAlbum, deleteState] = useDeleteAlbumMutation();
  const [modal, setModal] = useState({ open: false, id: undefined });
  const run = useAction();
  const albums = data?.result ?? [];

  const openCreate = () => setModal({ open: true, id: undefined });

  return (
    <>
      <PageHeader
        title="Albums"
        subtitle="Curated collections of podcasts."
        actions={
          <>
            <SearchInput value={list.search} onChange={list.setSearch} placeholder="Search albums" />
            <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
              New album
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
      ) : albums.length === 0 ? (
        <Surface>
          <EmptyState
            icon={Disc3}
            title={list.search ? "No matching albums" : "No albums yet"}
            action={
              !list.search && (
                <Button type="primary" icon={<Plus size={16} />} onClick={openCreate}>
                  Create an album
                </Button>
              )
            }
          />
        </Surface>
      ) : (
        <div className={`grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 ${isFetching ? "opacity-70" : ""}`}>
          {albums.map((album) => (
            <article
              key={album._id}
              className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-card transition hover:shadow-lift"
            >
              <Link to={`/albums/${album._id}`} className="relative block aspect-square overflow-hidden bg-canvas">
                <img
                  src={album.cover_image}
                  alt={album.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  {pluralize(album.podcasts?.length ?? 0, "podcast")}
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link to={`/albums/${album._id}`} className="truncate text-[15px] font-semibold text-ink hover:text-brand">
                  {album.name}
                </Link>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{album.description}</p>
                {album.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {album.tags.slice(0, 3).map((t) => (
                      <span key={t} className="rounded-md bg-canvas px-2 py-0.5 text-xs text-ink-soft">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-auto flex justify-end gap-1 pt-3">
                  <IconAction icon={Pencil} label="Edit" tone="brand" onClick={() => setModal({ open: true, id: album._id })} />
                  <IconAction
                    icon={Trash2}
                    label="Delete"
                    tone="danger"
                    loading={deleteState.isLoading && deleteState.originalArgs === album._id}
                    onClick={() => run(deleteAlbum(album._id), { success: "Album deleted" })}
                    confirm={{
                      title: `Delete “${album.name}”?`,
                      description: "The podcasts inside are kept.",
                      okText: "Delete",
                    }}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {data?.meta?.total > list.limit && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={list.page}
            pageSize={list.limit}
            total={data.meta.total}
            onChange={list.onPageChange}
            showSizeChanger={false}
          />
        </div>
      )}

      <AlbumFormModal open={modal.open} albumId={modal.id} onClose={() => setModal({ open: false, id: undefined })} />
    </>
  );
};

export default AlbumsPage;
