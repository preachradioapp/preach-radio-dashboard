import React, { useState } from "react";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import AddAlbum from "./AddAlbum";
import { useGetAllAlbumQuery } from "../redux/api/productManageApi";
import UpdateAlbum from "./UpdateAlbum";
import { SearchOutlined } from "@ant-design/icons";
import { Input, Pagination } from "antd";
import { Navigate } from "../../Navigate";
import { EyeIcon } from "lucide-react";
const albums = [
  {
    _id: "68738b24f544e6f330c93066",
    name: "Mindful Livingg",
    description:
      "A collection of podcasts focused on mindfulness, mental health, and wellness practices.",
    tags: ["mindfulness", "wellness", "mental health"],
    cover_image:
      "https://d2dacdhzndo9w4.cloudfront.net/uploads/images/album_cover/1752402721679-shared_image.jpg",
    podcasts: ["68734d681029b00d39a23d42"],
    createdAt: "2025-07-13T10:32:04.340Z",
    podcasts: [
      "68734d681029b00d39a23d42",
      "68734d681029b00d39a23d42",
      "68734d681029b00d39a23d42",
    ],
  },
  {
    _id: "68738b24f544e6f330c93066",
    name: "Mindful Livingg",
    description:
      "A collection of podcasts focused on mindfulness, mental health, and wellness practices.",
    tags: ["mindfulness", "wellness", "mental health"],
    cover_image:
      "https://d2dacdhzndo9w4.cloudfront.net/uploads/images/album_cover/1752402721679-shared_image.jpg",
    podcasts: ["68734d681029b00d39a23d42"],
    createdAt: "2025-07-13T10:32:04.340Z",
    podcasts: ["68734d681029b00d39a23d42", "68734d681029b00d39a23d42"],
  },
];

const Album = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data, isLoading } = useGetAllAlbumQuery({
    searchTerm,
    page: currentPage,
    limit: pageSize,
  });
  const albumList = data?.data?.result || [];
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();
  const [openAddModal, setOpenAddModal] = useState(false);

  const [editModal, setEditModal] = useState(false);
  const handleEdit = (record) => {
    setSelectedCategory(record);
    console.log(record);
    setEditModal(true);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div className="bg-white p-3 h-[87vh]">
      <div className="flex justify-between ">
        <Navigate title={"Album"}></Navigate>
        <div className="flex gap-4">
          <Input
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            prefix={<SearchOutlined />}
            // value={searchQuery}
            //   onChange={handleSearch}
            style={{ maxWidth: "400px", height: "45px" }}
          />
          <button
            onClick={() => setOpenAddModal(true)}
            className="bg-[#02111E] w-[250px] py-2 px-3 rounded text-white"
          >
            + Add Album
          </button>
        </div>
      </div>

      <div className="p-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {albumList.map((album) => (
          <div
            key={album._id}
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-2xl transition"
          >
           
              <img
                src={album.cover_image}
                alt={album.name}
                className="w-full h-48 object-cover"
              />
     
          
       
                <h1 className="bg-gray-100 inline-block px-2 mb-2">
                  Podcast : {album?.podcasts?.length}
                </h1>
                  <div className="px-3 pb-4">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {album.name}
                </h2>
                <p className="text-gray-600 text-sm h-16 overflow-hidden">
                  {album.description}
                </p>
            
              <div className="flex flex-wrap gap-2 mt-2">
                {album.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <div className="flex justify-between items-center pt-3">
                <div className="flex w-full gap-2">
                  <Link className="w-full" to={`/dashboard/albumDetails/${album?._id}`}>
                    <div className="border flex justify-center cursor-pointer items-center rounded w-full py-1">
                      <EyeIcon></EyeIcon>
                    </div>
                  </Link>
                  <div onClick={() => handleEdit(album?._id)} className="border flex justify-center cursor-pointer items-center rounded w-full py-1">
                    <FaEdit  />
                  </div>
                  <div className="border flex justify-center cursor-pointer items-center rounded w-full py-1">
                    <FaTrash className="text-red-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={data?.data?.meta?.total || 0}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>
      <AddAlbum
        setOpenAddModal={setOpenAddModal}
        openAddModal={openAddModal}
      ></AddAlbum>
      <UpdateAlbum
        editModal={editModal}
        setEditModal={setEditModal}
        selectedCategory={selectedCategory}
      ></UpdateAlbum>
    </div>
  );
};

export default Album;
