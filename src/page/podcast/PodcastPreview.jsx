import { Modal, Tag } from "antd";

const PodcastPreviewModal = ({ open, onClose, podcast }) => {
  if (!podcast) return null;
  console.log(podcast)

  const isVideo = podcast.podcast_url?.endsWith(".mp4");

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={800}
      title={podcast.title}
    >
      {/* Media */}
      <div className="mb-4">
        {isVideo ? (
          <video
            src={podcast.podcast_url}
            controls
            className="w-full rounded"
          />
        ) : (
          <audio
            src={podcast.podcast_url}
            controls
            className="w-full"
          />
        )}
      </div>

      {/* Info */}
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {podcast.name}
        </p>

        <p>
          <strong>Description:</strong> {podcast.description}
        </p>

        <p>
          <strong>Duration:</strong> {podcast.duration} min
        </p>

        <p>
          <strong>Address:</strong> {podcast.address}
        </p>

        <div className="flex flex-wrap gap-2">
          {podcast.tags?.map((tag, i) => (
            <Tag key={i}>#{tag}</Tag>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default PodcastPreviewModal;
