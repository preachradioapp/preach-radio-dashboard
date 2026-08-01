import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";
import { Input, message, Pagination, Popconfirm } from "antd";
import { EyeIcon } from "lucide-react";
import { Navigate } from "../../Navigate";
import {
  useDeletePodcastMutation,
  useGetAllPodcastQuery,
} from "../redux/api/metaDataApi";
import AddPodcast from "./AddPodcast";
import UpdatePodcast from "./UpdatePodcast";
import PodcastPreviewModal from "./PodcastPreview";

const Podcast = () => {
  const [searchTerm, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 8;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPodcast, setPreviewPodcast] = useState(null);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedPodcast, setSelectedPodcast] = useState(null);
  const handlePreview = (podcast) => {
    setPreviewPodcast(podcast);
    setPreviewOpen(true);
  };

  // 🔥 Server-side search & pagination
  const { data, isLoading } = useGetAllPodcastQuery({
    searchTerm,
    page,
    limit,
  });

  const [deletePodcast] = useDeletePodcastMutation();

  const podcasts = data?.data?.result || [];
  const meta = data?.data?.meta || {};

  const handleEdit = (record) => {
    setSelectedPodcast(record);
    setEditModal(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deletePodcast(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };

  return (
    <div className="bg-white p-3 h-[87vh]">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <Navigate title={"Podcast"} />

        <div className="flex gap-4">
          <Input
            placeholder="Search podcast..."
            prefix={<SearchOutlined />}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset page on search
            }}
            style={{ width: 350, height: 45 }}
          />

          <button
            onClick={() => setOpenAddModal(true)}
            className="bg-[#02111E] px-6 py-2 rounded text-white"
          >
            + Add Podcast
          </button>
        </div>
      </div>

      {/* Body */}
      {isLoading ? (
        <p className="text-center mt-10">Loading podcasts...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {podcasts.map((podcast) => (
            <div
              key={podcast._id}
              className="bg-white shadow-lg rounded overflow-hidden"
            >
              <img
                src={podcast.coverImage}
                alt={podcast.name}
                className="h-48 w-full object-cover"
              />

              <div className="p-3">
                <h3 className="font-bold text-lg">{podcast.name}</h3>

                <p className="text-sm text-gray-600 line-clamp-3">
                  {podcast.description}
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {podcast.tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handlePreview(podcast)}
                    className="flex-1 border rounded py-1 flex justify-center"
                  >
                    <EyeIcon />
                  </button>

                  <button
                    onClick={() => handleEdit(podcast)}
                    className="flex-1 border rounded py-1 flex justify-center"
                  >
                    <FaEdit />
                  </button>
                  <Popconfirm
                    title="Are you sure you want to delete this category?"
                    onConfirm={() => handleDelete(podcast._id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <button className="flex-1 border rounded py-1 flex justify-center">
                      <FaTrash className="text-red-500" />
                    </button>
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-end mt-6">
        <Pagination
          current={meta.page}
          pageSize={meta.limit}
          total={meta.total}
          onChange={(p) => setPage(p)}
        />
      </div>

      {/* Modals */}
      <AddPodcast
        openAddModal={openAddModal}
        setOpenAddModal={setOpenAddModal}
      />

      <UpdatePodcast
        editModal={editModal}
        setEditModal={setEditModal}
        selectedData={selectedPodcast}
      />
      <PodcastPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        podcast={previewPodcast}
      />
    </div>
  );
};

export default Podcast;
