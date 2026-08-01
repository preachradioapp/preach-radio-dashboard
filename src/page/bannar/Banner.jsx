import React, { useState } from "react";
import {
  useDeleteBannerMutation,
  useGetBannerQuery,
} from "../redux/api/metaDataApi";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import { format } from "date-fns";
import {
  message,
  Table,
  Button,
  Space,
  Image,
  Pagination,
  Input,
  Popconfirm,
} from "antd";
import AddBanner from "./AddBanner";
import { useNavigate } from "react-router-dom";
import UpdateBanner from "./UpdateBanner";
import { SearchOutlined } from "@ant-design/icons";
import { Navigate } from "../../Navigate";
const Banner = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const {
    data: bannerData,
    isLoading,
    isError,
    refetch,
  } = useGetBannerQuery({ searchTerm, page: currentPage, limit: pageSize });
  const [editModal, setEditModal] = useState(false);
  const [deleteBanner] = useDeleteBannerMutation();
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [openAddModal, setOpenAddModal] = useState(false);

  if (isLoading) {
    return <p className="text-center py-10">Loading banners...</p>;
  }

  if (isError) {
    return (
      <p className="text-center text-red-500 py-10">Failed to load banners</p>
    );
  }
  const handleEdit = (record) => {
    setSelectedCategory(record);
    setEditModal(true);
  };

  const banners = bannerData?.data?.result || [];

  const handleDelete = async (id) => {
    try {
      setLoadingId(id);
      const res = await deleteBanner(id).unwrap();
      message.success(res?.message);
      refetch();
    } catch (err) {
      message.error(err?.data?.message);
    } finally {
      setLoadingId(null);
    }
  };

  const columns = [
    {
      title: "Banner",
      dataIndex: "banner_url",
      key: "banner_url",
      render: (url, record) => (
        <Image
          className="object-cover"
          src={url}
          alt="banner"
          width={80}
          height={60}
        />
      ),
    },
    {
      title: "Redirect URL",
      dataIndex: "redirect_url",
      key: "redirect_url",
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      render: (date) =>
        date ? format(new Date(date), "dd MMM yyyy") : "Not set",
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      render: (date) =>
        date ? format(new Date(date), "dd MMM yyyy") : "Not set",
    },
    {
      title: "Actions",
      key: "actions",
      align: "end",
      render: (_, record) => (
        <Space>
          <div className="bg-green-700 w-[30px] h-[30px] flex justify-center items-center text-white  text-lg rounded">
            <FaEdit onClick={() => handleEdit(record)} />
          </div>
        <div className="bg-red-700 w-[30px] h-[30px] flex justify-center items-center text-white  text-lg rounded">  <Popconfirm
            title="Are you sure you want to delete this Banner?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
             <FaTrash  />
          </Popconfirm></div>
        </Space>
      ),
    },
  ];
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div className="bg-white p-3 h-[87vh]">
      {/* Header */}
      <div className="flex justify-between ">
        <Navigate title={"Banner"}></Navigate>
             <div className="flex gap-3">
        <Input
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name..."
          prefix={<SearchOutlined />}
          // value={searchQuery}
          //   onChange={handleSearch}
style={{ maxWidth: "400px", height: "40px" }}
        />
       <div>
         <button
          className="bg-[#050505] px-5 py-2 w-[170px]  text-white rounded"
          onClick={() => setOpenAddModal(true)}
        >
          + Add Banner
        </button>
       </div>
      </div>
      </div>

 

      {/* Table */}
      <Table
        rowKey="_id"
        columns={columns}
        dataSource={banners}
        bordered
        pagination={false}
      />

      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={bannerData?.data?.meta?.total || 0}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>

      {/* Add Banner Modal */}
      <AddBanner
        setOpenAddModal={setOpenAddModal}
        openAddModal={openAddModal}
      />
      <UpdateBanner
        editModal={editModal}
        setEditModal={setEditModal}
        selectedCategory={selectedCategory}
      ></UpdateBanner>
    </div>
  );
};

export default Banner;
