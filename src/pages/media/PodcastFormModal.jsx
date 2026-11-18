import PropTypes from "prop-types";
import { Alert, Form, Input, Progress, Segmented, Select } from "antd";
import { AudioLines, Video } from "lucide-react";
import { useState } from "react";
import { useCreatePodcastMutation, useGetStationQuery, useUpdatePodcastMutation } from "../../api/mediaApi";
import FormModal from "../../components/ui/FormModal";
import ImageUpload from "../../components/ui/ImageUpload";
import LocationField from "../../components/LocationField";
import PodcastPicker from "../../components/PodcastPicker";
import { fromGeoPoint, locationRule, toGeoPoint } from "../../lib/geo";
import { CLIP_MAX_SECONDS, isVideoPodcast } from "../../lib/media";
import { useAction } from "../../hooks/useAction";
import { useCategoryOptions } from "../../hooks/useCategoryOptions";
import { readMediaDuration, useS3Upload } from "../../hooks/useS3Upload";
import { buildFormData } from "../../lib/formData";
import { formatDuration, toStoredDuration } from "../../lib/format";
import { requiredImage, requiredText } from "../../lib/validation";
import MediaFileInput from "./MediaFileInput";

const sameArray = (a = [], b = []) => a.length === b.length && a.every((v, i) => v === b[i]);
const idOf = (v) => (v && typeof v === "object" ? v._id : v) ?? null;
const hasLocation = (l) => Boolean(l?.address?.trim()) && Number.isFinite(l?.lat) && Number.isFinite(l?.lng);

/**
 * Create or edit a podcast episode or a Preach Clip.
 * The type comes from the page it's opened from (Podcasts → episode, Preach Clips → clip)
 * and can't be switched in the form.
 * podcast = undefined → create; otherwise edit that record.
 */
const PodcastFormModal = ({ open, podcast, onClose, type: pageType }) => {
  const isEdit = Boolean(podcast?._id);
  const { data: station } = useGetStationQuery(undefined, { skip: !open });
  const { options: categoryOptions, subOptionsFor, isLoading: categoriesLoading } = useCategoryOptions();
  const [createPodcast] = useCreatePodcastMutation();
  const [updatePodcast] = useUpdatePodcastMutation();
  const upload = useS3Upload();
  const run = useAction();
  const [progress, setProgress] = useState(null); // { label, percent }
  const [uploadError, setUploadError] = useState(null);

  // Records created before `type` existed have none: use the page's context.
  const initialType = podcast?.type ?? pageType;

  const initialValues = isEdit
    ? {
        type: initialType,
        kind: isVideoPodcast(podcast) ? "video" : "audio",
        media: { url: podcast.podcast_url, seconds: podcast.durationSeconds },
        cover: podcast.coverImage,
        title: podcast.title,
        description: podcast.description,
        category: podcast.category?._id,
        subCategory: podcast.subCategory?._id,
        tags: podcast.tags ?? [],
        sourcePodcast: idOf(podcast.sourcePodcast) ?? undefined,
        location: fromGeoPoint(podcast.address, podcast.location),
      }
    : {
        type: pageType,
        kind: pageType === "clip" ? "video" : "audio",
        tags: [],
        // station content defaults to the station's location
        location: station ? fromGeoPoint(station.address, station.location) : { address: "" },
      };

  const handleSubmit = async (values) => {
    setUploadError(null);
    const { type, kind, media, cover, title, description, category, subCategory, tags, location, sourcePodcast } = values;
    const isClip = type === "clip";
    const base = {
      title: title.trim(),
      description: description.trim(),
      category,
      subCategory,
      tags: (tags ?? []).map((t) => t.trim()).filter(Boolean),
      // Episodes always have a location; clips only if one was entered.
      ...(!isClip || hasLocation(location)
        ? { address: location.address.trim(), location: toGeoPoint(location) }
        : {}),
    };

    try {
      let mediaUrl;
      if (media?.file) {
        setProgress({ label: `Uploading ${kind}`, percent: 0 });
        mediaUrl = await upload(media.file, kind === "video" ? "podcast_video" : "podcast_audio", (percent) =>
          setProgress({ label: `Uploading ${kind}`, percent })
        );
      }

      if (!isEdit) {
        setProgress({ label: "Uploading cover", percent: 0 });
        const coverUrl = await upload(cover, "podcast_cover", (percent) => setProgress({ label: "Uploading cover", percent }));
        setProgress({ label: "Publishing", percent: 100 });
        const res = await run(
          createPodcast({
            ...base,
            type,
            ...(isClip && sourcePodcast ? { sourcePodcast } : {}),
            podcast_url: mediaUrl,
            mediaType: kind,
            coverImage: coverUrl,
            duration: toStoredDuration(media.seconds),
            durationSeconds: Math.round(media.seconds),
          }),
          { success: isClip ? "Clip published" : "Podcast published" }
        );
        if (res) onClose();
        return;
      }

      // Edit: send only what changed.
      const changes = {};
      Object.entries(base).forEach(([key, val]) => {
        const before = key === "location" ? toGeoPoint(fromGeoPoint(podcast.address, podcast.location)) : podcast[key];
        const prev = key === "category" || key === "subCategory" ? before?._id : before;
        const changed = Array.isArray(val)
          ? !sameArray(val, prev)
          : key === "location"
            ? !sameArray(val.coordinates, prev?.coordinates)
            : val !== prev;
        if (changed) changes[key] = val;
      });
      if (type !== initialType) changes.type = type;
      if (isClip && (sourcePodcast ?? null) !== idOf(podcast.sourcePodcast)) {
        changes.sourcePodcast = sourcePodcast ?? null;
      }
      if (mediaUrl) {
        changes.podcast_url = mediaUrl;
        changes.mediaType = kind;
        changes.duration = toStoredDuration(media.seconds);
        changes.durationSeconds = Math.round(media.seconds);
      }
      const newCover = cover instanceof File ? cover : null;

      if (!Object.keys(changes).length && !newCover) {
        onClose();
        return;
      }
      setProgress({ label: "Saving changes", percent: 100 });
      const res = await run(
        updatePodcast({ id: podcast._id, formData: buildFormData(changes, { podcast_cover: newCover }) }),
        { success: isClip ? "Clip updated" : "Podcast updated" }
      );
      if (res) onClose();
    } catch (err) {
      // upload() failures (presign / S3 PUT); API errors are already surfaced by `run`
      setUploadError(err?.data?.message || err?.message || "Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  };

  const noun = (type) => (type === "clip" ? "clip" : "podcast");

  return (
    <FormModal
      open={open}
      width={760}
      title={isEdit ? `Edit ${noun(initialType)}` : initialType === "clip" ? "New Preach Clip" : "New podcast"}
      subtitle={
        isEdit
          ? podcast.title
          : initialType === "clip"
            ? `A short clip for the reels feed — up to ${CLIP_MAX_SECONDS / 60} minutes.`
            : "Upload an episode to the Preach Radio station."
      }
      onCancel={onClose}
      onSubmit={handleSubmit}
      submitting={Boolean(progress)}
      submitText={isEdit ? "Save changes" : `Publish ${noun(initialType)}`}
      formKey={isEdit ? podcast._id : station ? "ready" : "loading"}
      initialValues={initialValues}
    >
      {(form) => (
        <>
          {uploadError && <Alert type="error" showIcon message={uploadError} className="mb-4" closable onClose={() => setUploadError(null)} />}

          {/* Fixed by the page this form was opened from; not user-editable. */}
          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>

          <div className="flex flex-wrap gap-x-8">
            <Form.Item name="kind" label="Format" required>
              <Segmented
                options={[
                  { value: "audio", label: "Audio", icon: <AudioLines size={15} className="-mt-0.5 inline" /> },
                  { value: "video", label: "Video", icon: <Video size={15} className="-mt-0.5 inline" /> },
                ]}
                onChange={() =>
                  form.setFieldValue("media", isEdit ? { url: podcast.podcast_url, seconds: podcast.durationSeconds } : undefined)
                }
              />
            </Form.Item>
          </div>

          <div className="grid gap-x-5 md:grid-cols-[minmax(0,1fr)_220px]">
            <Form.Item noStyle shouldUpdate={(a, b) => a.kind !== b.kind || a.media !== b.media || a.type !== b.type}>
              {({ getFieldValue }) => {
                const isClip = getFieldValue("type") === "clip";
                return (
                  <Form.Item
                    name="media"
                    label="Media file"
                    dependencies={["type"]}
                    extra={isClip ? `Clips can be up to ${formatDuration(CLIP_MAX_SECONDS)} long.` : undefined}
                    rules={[
                      {
                        required: true,
                        validator: (_, v) => {
                          if (!v?.file && !v?.url) return Promise.reject(new Error("Upload the media file"));
                          if (v.file && !v.seconds) {
                            return Promise.reject(new Error("Couldn't read this file's duration. Try another file."));
                          }
                          if (isClip && !v.seconds) {
                            return Promise.reject(new Error("Re-upload the file so its length can be checked for a clip."));
                          }
                          if (isClip && v.seconds > CLIP_MAX_SECONDS) {
                            return Promise.reject(
                              new Error(
                                `Clips can be at most ${formatDuration(CLIP_MAX_SECONDS)} — this file is ${formatDuration(v.seconds)}.`
                              )
                            );
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <MediaFileField kind={getFieldValue("kind")} />
                  </Form.Item>
                );
              }}
            </Form.Item>
            <Form.Item name="cover" label="Cover" rules={[requiredImage("A cover image")]}>
              <ImageUpload aspect="aspect-square" hint="Square, 1400px+" />
            </Form.Item>
          </div>

          <Form.Item name="title" label="Title" rules={requiredText("Title", { max: 120 })}>
            <Input placeholder="Title" showCount maxLength={120} />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={requiredText("Description", { max: 2000 })}>
            <Input.TextArea rows={3} showCount maxLength={2000} placeholder="What's this about?" />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(a, b) => a.type !== b.type}>
            {({ getFieldValue }) =>
              getFieldValue("type") === "clip" && (
                <Form.Item
                  name="sourcePodcast"
                  label="Cut from episode"
                  extra="Optional. Lets listeners jump to the full message."
                >
                  <PodcastPicker
                    multiple={false}
                    query={{ type: "episode" }}
                    knownPodcasts={podcast?.sourcePodcast?._id ? [podcast.sourcePodcast] : []}
                  />
                </Form.Item>
              )
            }
          </Form.Item>

          <div className="grid gap-x-5 sm:grid-cols-2">
            <Form.Item name="category" label="Category" rules={[{ required: true, message: "Choose a category" }]}>
              <Select
                showSearch
                optionFilterProp="label"
                loading={categoriesLoading}
                options={categoryOptions}
                placeholder="Choose a category"
                onChange={() => form.setFieldValue("subCategory", undefined)}
              />
            </Form.Item>
            <Form.Item noStyle shouldUpdate={(a, b) => a.category !== b.category}>
              {({ getFieldValue }) => {
                const subOptions = subOptionsFor(getFieldValue("category"));
                return (
                  <Form.Item name="subCategory" label="Subcategory" rules={[{ required: true, message: "Choose a subcategory" }]}>
                    <Select
                      showSearch
                      optionFilterProp="label"
                      options={subOptions}
                      disabled={!getFieldValue("category")}
                      placeholder={getFieldValue("category") && !subOptions.length ? "No subcategories in this category" : "Choose a subcategory"}
                    />
                  </Form.Item>
                );
              }}
            </Form.Item>
          </div>

          <Form.Item name="tags" label="Tags">
            <Select mode="tags" tokenSeparators={[","]} open={false} suffixIcon={null} placeholder="Type a tag and press Enter" />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(a, b) => a.type !== b.type}>
            {({ getFieldValue }) => {
              const isClip = getFieldValue("type") === "clip";
              return (
                <Form.Item
                  name="location"
                  label="Location"
                  dependencies={["type"]}
                  // Required for episodes; for clips only checked if partly filled in.
                  rules={isClip ? [] : [locationRule]}
                >
                  <LocationField />
                </Form.Item>
              );
            }}
          </Form.Item>

          {progress && (
            <div className="rounded-xl bg-canvas p-4">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-ink">{progress.label}…</span>
                <span className="tabular-nums text-muted">{progress.percent}%</span>
              </div>
              <Progress percent={progress.percent} showInfo={false} strokeColor="#E63946" status="active" />
              <p className="mt-1 text-xs text-muted">Keep this window open until the upload finishes.</p>
            </div>
          )}
        </>
      )}
    </FormModal>
  );
};

/** Bridges MediaFileInput into the form: reads duration when a file is picked. */
const MediaFileField = ({ kind, value, onChange }) => (
  <MediaFileInput
    kind={kind}
    value={value}
    onPick={async (file) => {
      onChange?.({ file, seconds: undefined });
      try {
        const seconds = await readMediaDuration(file);
        onChange?.({ file, seconds: Number.isFinite(seconds) ? seconds : undefined });
      } catch {
        onChange?.({ file, seconds: undefined });
      }
    }}
  />
);

MediaFileField.propTypes = { kind: PropTypes.string, value: PropTypes.object, onChange: PropTypes.func };

PodcastFormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  podcast: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  /** Episode (Podcasts page) or clip (Preach Clips page). */
  type: PropTypes.oneOf(["episode", "clip"]).isRequired,
};

export default PodcastFormModal;
