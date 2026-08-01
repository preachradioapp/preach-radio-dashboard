import { Input, message, Modal, Pagination, Popconfirm, Table, Tag } from "antd";
import { useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdBlock } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { SearchOutlined } from "@ant-design/icons";

import AddCreator from "./AddCreator";
import { Navigate } from "../../Navigate";

const CreateCreator = () => {
  const [searchTerm, setSearch] = useState("");
  const [openAddModal, setOpenAddModal] = useState(false);

  const navigate = useNavigate();

  // ============================
  // ⭐ Dummy Data (You Can Replace API Later)
  // ============================
  const dataSource = [
    {
      _id: "1",
      image: "https://i.pravatar.cc/150?img=10",
      name: "John Doe",
      email: "john@example.com",
      status: "Active",
    },
    {
      _id: "2",
      image: "https://i.pravatar.cc/150?img=20",
      name: "Sarah Khan",
      email: "sarah@example.com",
      status: "Blocked",
    },
  ];

  // Delete Handler
  const handleDelete = (id) => {
    message.success("Deleted Successfully!");
  };

  const handleBlock = (id) => {
    message.warning("User Blocked!");
  };

  // =============================
  // ⭐ Columns Updated
  // =============================
  const columns = [
    {
      title: "SL",
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
          src={record.image}
          alt={record.name}
          className="w-14 h-14 object-cover rounded-full mx-auto"
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      align: "left",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      align: "left",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      align: "center",
      render: (_, record) =>
        record.status === "Active" ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="red">Blocked</Tag>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (_, record) => (
        <div className="flex gap-2 justify-end">
          {/* Block Button */}
          <Popconfirm
            title="Block this user?"
            onConfirm={() => handleBlock(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <div className="w-[36px] h-[36px] bg-orange-500 text-white flex justify-center items-center rounded cursor-pointer">
              <MdBlock size={18} />
            </div>
          </Popconfirm>

          {/* Delete Button */}
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <div className="w-[36px] h-[36px] bg-[#FF5454] text-white flex justify-center items-center rounded cursor-pointer">
              <RiDeleteBin6Line size={18} />
            </div>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="mb-7 mt-4">
     

      <div className="flex justify-between mt-9">
        <Navigate title={'Creator'}></Navigate>
        <button
          onClick={() => setOpenAddModal(true)}
          className="bg-[#050505] px-5 text-white rounded-full"
        >
          + Add
        </button>
      </div>

      <div className="flex justify-end mt-4">
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          prefix={<SearchOutlined />}
          style={{ marginBottom: "16px", maxWidth: "300px" }}
        />
      </div>

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="_id"
        pagination={false}
      />

      <AddCreator
        openAddModal={openAddModal}
        setOpenAddModal={setOpenAddModal}
      />
    </div>
  );
};

export default CreateCreator;
