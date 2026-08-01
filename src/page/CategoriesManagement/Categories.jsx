import { Input, message, Modal, Pagination, Popconfirm, Table } from "antd";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import AddCategories from "./AddCategories";
import EditCategories from "./EditCategories";
import { SearchOutlined } from "@ant-design/icons";
import {
  useDeleteCategoryMutation,
  useGetCategroyAllQuery,
} from "../redux/api/productManageApi";
import { Navigate } from "../../Navigate";

const Categories = () => {
  const [searchTerm, setSearch] = useState("");
  console.log(searchTerm);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [deleteCategory] = useDeleteCategoryMutation();
  const [openAddModal, setOpenAddModal] = useState(false);
  const { data: categorys, isLoading } = useGetCategroyAllQuery({
    searchTerm,
    page: currentPage,
    limit: pageSize,
  });
  console.log(categorys);
  const [editModal, setEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const handleDeleteFaq = async (id) => {
    try {
      const res = await deleteCategory(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };
  const products = categorys?.data?.result || [];

  const dataSource = products.map((item, index) => ({
    key: item._id,
    no: index + 1,
    name: item.name,
    category_image: item?.category_image,
  }));

  const navigate = useNavigate();

  const handleEdit = (record) => {
    setSelectedCategory(record);
    setEditModal(true);
  };

  const handleDelete = (id) => {
    // Dummy delete confirmation
    alert(`Deleted category with ID: ${id}`);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const columns = [
    {
      title: "SL No.",
      dataIndex: "sl",
      key: "sl",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (_, record) => (
        <img
          src={record.category_image}
          alt={record.name}
          className="w-16 h-16 object-cover rounded mx-auto"
        />
      ),
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      align: "name",
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="flex gap-2 justify-end">
          <div
            onClick={() => handleEdit(record)}
            className="w-[36px] h-[36px] text-lg bg-[#007BFF] flex justify-center items-center text-white rounded cursor-pointer"
          >
            <MdOutlineModeEdit />
          </div>
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDeleteFaq(record?.key)}
            okText="Yes"
            cancelText="No"
          >
            <div className="w-[36px] h-[36px] text-lg bg-[#FF5454] flex justify-center items-center text-white rounded cursor-pointer">
              <RiDeleteBin6Line />
            </div>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-3 h-[87vh] overflow-auto">
      <div className="flex justify-between ">
        <Navigate title={"Category"}></Navigate>
        <div className="flex gap-4">
          <Input
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            prefix={<SearchOutlined />}
            // value={searchQuery}
            //   onChange={handleSearch}
           style={{ maxWidth: "400px", height: "45px" }}
          />
       
            <button
              onClick={() => setOpenAddModal(true)}
              className="bg-[#050505] px-5 w-[150px]  text-white rounded"
            >
              + Add
            </button>
      
        </div>
      </div>

      <div className="">
        <Table
          dataSource={dataSource}
          columns={columns}
          loading={isLoading}
          rowKey="_id"
          pagination={false}
        />
      </div>
      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={categorys?.data?.meta?.total || 0}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>

      <AddCategories
        openAddModal={openAddModal}
        setOpenAddModal={setOpenAddModal}
      />
      <EditCategories
        editModal={editModal}
        setEditModal={setEditModal}
        selectedCategory={selectedCategory}
      />
    </div>
  );
};

export default Categories;
