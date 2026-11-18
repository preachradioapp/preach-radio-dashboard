import PropTypes from "prop-types";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { useDeletePodcastMutation, useSetPodcastStatusMutation } from "../../api/mediaApi";
import IconAction from "../../components/ui/IconAction";
import { useAction } from "../../hooks/useAction";

/**
 * Row/card actions shared by the Podcasts and Reels pages.
 * - Hide/publish works for every podcast (moderation, including creator uploads).
 * - Edit/delete only for station content: creator uploads are managed by their creator.
 */
const PodcastActions = ({ podcast, onEdit, tone = "light" }) => {
  const [setStatus, statusState] = useSetPodcastStatusMutation();
  const [deletePodcast, deleteState] = useDeletePodcastMutation();
  const run = useAction();

  const hidden = podcast.status === "hidden";
  const noun = podcast.type === "clip" ? "clip" : "podcast";
  const manageable = !podcast.creator;
  // Icon buttons on top of video thumbnails need light icons.
  const darkCls = tone === "dark" ? "[&_.ant-btn]:!text-white/90 [&_.ant-btn:hover]:!bg-white/15" : "";

  return (
    <div className={`flex items-center gap-1 ${darkCls}`}>
      <IconAction
        icon={hidden ? Eye : EyeOff}
        label={hidden ? "Publish" : "Hide from app"}
        tone={hidden ? "success" : "neutral"}
        loading={statusState.isLoading}
        onClick={() => run(setStatus({ id: podcast._id, status: hidden ? "published" : "hidden" }))}
        confirm={
          hidden
            ? undefined
            : {
                title: `Hide this ${noun}?`,
                description: "Listeners won't see it anywhere in the app until you publish it again.",
                okText: "Hide",
              }
        }
      />
      {manageable ? (
        <>
          <IconAction icon={Pencil} label="Edit" tone="brand" onClick={() => onEdit(podcast)} />
          <IconAction
            icon={Trash2}
            label="Delete"
            tone="danger"
            loading={deleteState.isLoading}
            onClick={() => run(deletePodcast(podcast._id), { success: `${noun === "clip" ? "Clip" : "Podcast"} deleted` })}
            confirm={{
              title: `Delete this ${noun}?`,
              description: "The file is removed and it disappears from albums. This can't be undone.",
              okText: "Delete",
            }}
          />
        </>
      ) : (
        <span className={`pl-1 text-xs ${tone === "dark" ? "text-white/70" : "text-muted"}`}>Creator-managed</span>
      )}
    </div>
  );
};

PodcastActions.propTypes = {
  podcast: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  tone: PropTypes.oneOf(["light", "dark"]),
};

export default PodcastActions;
