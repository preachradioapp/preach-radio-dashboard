import {
  Table,
  Select,
  Button,
  message,
  Pagination,
  Input,
  Popconfirm,
} from "antd";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { MdOutlineModeEdit } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import AddSubCategories from "./AddSubCategories";
import EditSubCategories from "./EditSubCategories";
import { SearchOutlined } from "@ant-design/icons";
import {
  useDeleteSubCategoryMutation,
  useGetSubCategoryQuery,
} from "../redux/api/productManageApi";
import { Navigate } from "../../Navigate";

const Subcategory = () => {
  const [searchTerm, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [deletSubCategory] = useDeleteSubCategoryMutation();
  const {
    data: subCategory,
    isLoading,
    isError,
  } = useGetSubCategoryQuery({
    searchTerm,
    page: currentPage,
    limit: pageSize,
  });
  const [open, setOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const navigate = useNavigate();
  const handleDeleteFaq = async (id) => {
    try {
      const res = await deletSubCategory(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };
  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Something went wrong!</p>;

  // Extract category options dynamically
  const selectCategoryOptions = [
    ...new Map(
      subCategory?.data?.result?.map((item) => [
        item.category._id,
        { _id: item.category._id, title: item.category.name },
      ]),
    ).values(),
  ];

  // Filter subcategories based on selected category
  const filteredSubCategories =
    subCategory?.data?.result?.filter((item) =>
      selectedCategoryId ? item.category._id === selectedCategoryId : true,
    ) || [];

  // Table data
  const dataSource = filteredSubCategories.map((item, index) => ({
    key: item._id,
    sl: index + 1,
    image: item.category.image || "https://via.placeholder.com/70",
    name: item.name,
    category: item.category.name,
    subImage: item.image,
    rawCategory: item.category,
    rawSub: item,
  }));

  const handleSelectChange = (value) => {
    setSelectedCategoryId(value);
  };

  const handleEdit = (record) => {
    setSelectedCategory(record);
    setEditModal(true);
  };
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  const handleDeleted = (subId) => {
    alert(`Deleted subcategory with ID: ${subId}`);
  };

  const columns = [
    {
      title: "SL no.",
      dataIndex: "sl",
      key: "sl",
    },

    {
      title: "Subcategory",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Sub Image",
      dataIndex: "subImage",
      key: "subImage",
      render: (text) => <img src={text} alt="sub" className="w-[70px]" />,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2 justify-end">
          <button
            className="w-[36px] h-[36px] text-lg bg-[#007BFF] flex justify-center items-center text-white rounded"
            onClick={() => handleEdit(record)}
          >
            <MdOutlineModeEdit />
          </button>
          <Popconfirm
            title="Are you sure you want to delete this Sub category?"
            onConfirm={() => handleDeleteFaq(record.rawSub._id)}
            okText="Yes"
            cancelText="No"
          >
            <button className="w-[36px] h-[36px] text-lg bg-[#FF5454] flex justify-center items-center text-white rounded">
              <RiDeleteBin6Line />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white p-3 h-[87vh]">
      <div className="flex justify-between items-center">
        <Navigate title={"Sub Category"}></Navigate>

        <div className="flex gap-4">
          <Select
          style={{ maxWidth: "400px", height: "45px" }}
            value={selectedCategoryId || undefined}
            onChange={handleSelectChange}
            placeholder="Select a category"
          >
            {selectCategoryOptions.map((cat) => (
              <Select.Option key={cat._id} value={cat._id}>
                {cat.title}
              </Select.Option>
            ))}
          </Select>
          <div className="">
            <Input
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name..."
              prefix={<SearchOutlined />}
              //   value={searchQuery}
              //   onChange={handleSearch}
             style={{ maxWidth: "400px", height: "45px" }}
            />
          </div>
          <button
            onClick={() => setOpen(true)}
            className="bg-[#050505] px-5 w-[150px]  text-white rounded"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="mt-3">
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      </div>
      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={subCategory?.data?.meta?.total || 0}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>

      <AddSubCategories
        open={open}
        setOpen={setOpen}
        categoryName={selectCategoryOptions}
      />
      <EditSubCategories
        editModal={editModal}
        setEditModal={setEditModal}
        selectedCategory={selectedCategory}
        category={selectCategoryOptions}
      />
    </div>
  );
};

export default Subcategory;
