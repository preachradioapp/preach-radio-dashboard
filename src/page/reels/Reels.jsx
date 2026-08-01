import React, { useRef } from "react";
import { EyeOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useGetAllPodcastQuery } from "../redux/api/metaDataApi";

const Reels = () => {
  const videoRefs = useRef([]);

  const page = 1;
  const limit = 10;

  const { data, isLoading } = useGetAllPodcastQuery({
    page,
    limit,
  });

  const podcasts = data?.data?.result || [];

  const togglePlay = (index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (video.paused) video.play();
    else video.pause();
  };

  if (isLoading) {
    return <p className="text-center mt-10">Loading reels...</p>;
  }

  return (
    <div className="w-full grid grid-cols-3 gap-3 h-[87vh] overflow-y-scroll snap-y snap-mandatory">
      {podcasts.map((podcast, index) => (
        <div
          key={podcast._id}
          className="relative w-full h-[75vh] bg-black rounded overflow-hidden snap-start"
        >
          {/* VIDEO */}
          <video
            ref={(el) => (videoRefs.current[index] = el)}
            src={podcast.podcast_url}
            className="h-full w-full object-cover"
            loop
            muted
            playsInline
            onClick={() => togglePlay(index)}
          />

          {/* TOP INFO (Duration) */}
          <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <ClockCircleOutlined />
            <span>{podcast.duration}s</span>
          </div>

          {/* RIGHT ACTIONS (Views) */}
          <div className="absolute right-3 bg-black/60 p-1 rounded bottom-24 flex flex-col items-center text-white">
            <EyeOutlined className="text-xl" />
            <span className="text-xs mt-1">
              {podcast.totalView || 0}
            </span>
          </div>

          {/* BOTTOM INFO (Title) */}
          <div className="absolute bottom-4 left-3 right-3 text-white">
            <p className="text-sm font-semibold line-clamp-2">
              {podcast.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Reels;
