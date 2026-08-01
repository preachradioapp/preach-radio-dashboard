import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useGetSingleAlbumQuery } from "../redux/api/productManageApi";
import { FaArrowLeft } from "react-icons/fa";
import { Navigate } from "../../Navigate";

const AlbumDetails = () => {
  const { id } = useParams();
  const {
    data: singleData,
    isLoading,
    error,
  } = useGetSingleAlbumQuery({ id }, { refetchOnMountOrArgChange: true });
  const navigate = useNavigate();
  const album = singleData?.data;

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Something went wrong</p>;

  return (
    <div className="bg-white p-3 h-[87vh]">
     <Navigate title={`Podcasts in Album: ${album?.name}`}></Navigate>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-11">
        {album?.podcasts?.map((podcast) => (
          <Link to={`/dashboard/detailsMedia/${podcast._id}`} key={podcast._id}>
            <div className="bg-white grid grid-cols-3 gap-4 rounded-lg shadow-md hover:shadow-xl transition duration-300">
              <div className="col-span-1">
                <img
                  src={podcast.coverImage}
                  alt={podcast.title}
                  className="w-[250px] h-[130px] object-cover rounded-l-lg"
                />
              </div>
              <div className="col-span-2 flex flex-col justify-center p-2">
                <h2 className="text-lg font-semibold text-[#222]">
                  {podcast.title}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{podcast.address}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AlbumDetails;
