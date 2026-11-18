import PropTypes from "prop-types";
import { Form, Input, Select, Skeleton } from "antd";
import { useCreateAlbumMutation, useGetAlbumQuery, useUpdateAlbumMutation } from "../../api/catalogApi";
import FormModal from "../../components/ui/FormModal";
import ImageUpload from "../../components/ui/ImageUpload";
import PodcastPicker from "../../components/PodcastPicker";
import { useAction } from "../../hooks/useAction";
import { buildFormData } from "../../lib/formData";
import { requiredImage, requiredText } from "../../lib/validation";

/** `albumId` undefined = create. For edit, loads the populated album so selected podcasts have labels. */
const AlbumFormModal = ({ open, albumId, onClose }) => {
  const isEdit = Boolean(albumId);
  const { data: album, isFetching } = useGetAlbumQuery(albumId, { skip: !open || !isEdit });
  const [createAlbum, createState] = useCreateAlbumMutation();
  const [updateAlbum, updateState] = useUpdateAlbumMutation();
  const run = useAction();

  const onSubmit = async ({ name, description, tags = [], podcasts = [], cover }) => {
    const data = {
      name: name.trim(),
      description: description.trim(),
      tags: tags.map((t) => t.trim()).filter(Boolean),
      podcasts,
    };
    const formData = buildFormData(data, { album_cover: cover instanceof File ? cover : null });
    const res = await run(isEdit ? updateAlbum({ id: albumId, formData }) : createAlbum(formData), {
      success: isEdit ? "Album updated" : "Album created",
    });
    if (res) onClose();
  };

  const loadingRecord = isEdit && (isFetching || !album);

  return (
    <FormModal
      open={open}
      width={640}
      title={isEdit ? "Edit album" : "New album"}
      subtitle="Group podcasts into a collection listeners can play through."
      onCancel={onClose}
      onSubmit={onSubmit}
      submitting={createState.isLoading || updateState.isLoading}
      submitText={isEdit ? "Save changes" : "Create album"}
      // re-seed the form once the record arrives so initial values apply
      formKey={loadingRecord ? "loading" : albumId || "new"}
      initialValues={
        isEdit && album
          ? {
              name: album.name,
              description: album.description,
              tags: album.tags,
              podcasts: (album.podcasts ?? []).map((p) => p._id),
              cover: album.cover_image,
            }
          : { tags: [], podcasts: [] }
      }
    >
      {loadingRecord ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="grid gap-x-5 sm:grid-cols-[220px_1fr]">
          <Form.Item name="cover" label="Cover" rules={[requiredImage("A cover image")]}>
            <ImageUpload aspect="aspect-square" hint="Square works best" />
          </Form.Item>
          <div>
            <Form.Item name="name" label="Album name" rules={requiredText("Album name", { max: 80 })}>
              <Input placeholder="e.g. Advent Series 2026" />
            </Form.Item>
            <Form.Item name="tags" label="Tags">
              <Select mode="tags" tokenSeparators={[","]} placeholder="Type and press Enter" open={false} suffixIcon={null} />
            </Form.Item>
          </div>
          <Form.Item
            name="description"
            label="Description"
            className="sm:col-span-2"
            rules={requiredText("Description", { max: 1000 })}
          >
            <Input.TextArea rows={3} showCount maxLength={1000} placeholder="What is this album about?" />
          </Form.Item>
          <Form.Item
            name="podcasts"
            label="Podcasts"
            className="sm:col-span-2"
            rules={[{ required: true, type: "array", min: 1, message: "Add at least one podcast" }]}
          >
            <PodcastPicker knownPodcasts={album?.podcasts} query={{ type: "episode" }} />
          </Form.Item>
        </div>
      )}
    </FormModal>
  );
};

AlbumFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  albumId: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default AlbumFormModal;
