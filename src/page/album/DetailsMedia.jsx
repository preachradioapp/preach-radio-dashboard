import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetSinglePodcastQuery } from "../redux/api/productManageApi";
import { FaArrowLeft } from "react-icons/fa";
import { Navigate } from "../../Navigate";


const DetailsMedia = () => {
  const { id } = useParams();
console.log(id)
const navigate = useNavigate()
  const {
    data: singleData,
    isLoading,
    error,
  } = useGetSinglePodcastQuery({ id }, { refetchOnMountOrArgChange: true });

  if (isLoading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center text-red-600">Error loading data</div>;

  const podcast = singleData?.data;

  if (!podcast) return <div className="text-center">No podcast data found.</div>;

  const isVideo = Boolean(podcast?.video_url);
  const isAudio = Boolean(podcast?.audio_url);

  return (
    <div className="bg-white p-3 h-[87vh]">
      <Navigate title={`Album / Details / ${podcast?.title}`}></Navigate>

      
{/* 
<div className="mb-4 flex items-center gap-4">
        <button className="text-[#EF4849]" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/">Dashboard</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/album">Album</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to={`/dashboard/albumDetails/${id}`}>Details</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{podcast.title}</Breadcrumb.Item>
        </Breadcrumb>
      </div> */}



      {/* Media */}
      {isVideo ? (
        <video
          controls
          className="w-full rounded-lg my-4 h-[450px]"
          poster={podcast?.coverImage}
        >
          <source src={podcast?.video_url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : isAudio ? (
        <div className="my-4">
          <img
            src={podcast?.coverImage}
            alt="Podcast Cover"
            className="w-full h-[450px] object-cover rounded-lg mb-2"
          />
          <audio controls className="w-full">
            <source src={podcast?.audio_url} type="audio/mpeg" />
            Your browser does not support the audio tag.
          </audio>
        </div>
      ) : (
        <div>No media available</div>
      )}

      {/* Title & Description */}
      <h1 className="text-2xl font-bold mb-2">{podcast?.title}</h1>
      <p className="text-gray-600 mb-2">{podcast?.description}</p>

      {/* Address */}
      {podcast?.address && (
        <div className="mb-2">
          <strong>Address:</strong>{" "}
          <span className="text-gray-700">{podcast?.address}</span>
        </div>
      )}

      {/* Creator */}
      {podcast?.creator && (
        <div className="flex items-center gap-3 mt-4">
          {podcast?.creator?.profile_image && (
            <img
              src={podcast?.creator?.profile_image}
              alt="Creator"
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div>
            <p className="text-sm font-semibold">{podcast?.creator?.name}</p>
            <p className="text-xs text-gray-500">Creator</p>
          </div>
        </div>
      )}

      {/* Category & Subcategory */}
      <div className="mt-4 mb-4">
        <p className="text-sm text-gray-800">
          <strong>Category:</strong> {podcast?.category?.name}
        </p>
        <p className="text-sm text-gray-800">
          <strong>Subcategory:</strong> {podcast?.subCategory?.name}
        </p>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-2">
        {podcast?.tags?.map((tag, idx) => (
          <span
            key={idx}
            className="bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DetailsMedia;
