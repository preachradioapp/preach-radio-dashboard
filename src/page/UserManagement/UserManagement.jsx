import React, { useState } from "react";
import { Input, message, Modal, Pagination, Popconfirm, Table } from "antd";
import { MdBlockFlipped } from "react-icons/md";
import { FaArrowLeft, FaRegEye } from "react-icons/fa";
import { AiOutlinePhone, AiOutlineMail } from "react-icons/ai";
import { GoLocation } from "react-icons/go";
import { SearchOutlined } from "@ant-design/icons";
import {
  useDeleteUserMutation,
  useGetUserAllQuery,
} from "../redux/api/userApi";
import { LuEye } from "react-icons/lu";
import { useBlockUserMutation } from "../redux/api/productManageApi";
import { DeleteIcon } from "lucide-react";
import { Navigate } from "../../Navigate";

// import { Navigate } from "../Navigate";

const UserManagement = () => {
  const [deleteUser] = useDeleteUserMutation();
  const [searchTerm, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { data: userData } = useGetUserAllQuery({
    searchTerm,
    page: currentPage,
    limit: pageSize,
  });

  console.log(userData);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [blockUser] = useBlockUserMutation();
  const showModal2 = (record) => {
    setSelectedUser(record);
    setIsModalOpen2(true);
  };
  //dd
  const handleCancel2 = () => {
    setIsModalOpen2(false);
    setSelectedUser(null);
  };
  const handleBlockUnblock = async (id) => {
    console.log(id);
    try {
      const res = await blockUser(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };
  const dataSource =
    userData?.data?.result?.map((user, index) => ({
      key: user._id,
      no: index + 1,
      name: user.name,
      email: user.email,
      phone: user.phone,
      block: user?.user?._id,
      blockId: user?.user?.isBlocked,
      image:
        user.profile_image ||
        `https://avatar.iran.liara.run/public/${index + 1}`,
      createdAt: new Date(user.createdAt).toLocaleDateString(),
    })) || [];

  const handleDeleteUser = async (id) => {
    try {
      const res = await deleteUser(id).unwrap();
      message.success(res?.message);
    } catch (err) {
      message.error(err?.data?.message);
    }
  };

  const columns = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Name",
      key: "name",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <img
            src={record.image}
            className="w-10 h-10 object-cover rounded-full"
            alt="User Avatar"
          />
          <span>{record.name}</span>
        </div>
      ),
    },
    { title: "Phone Number", dataIndex: "phone", key: "phone" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <div className="flex gap-2 items-center">
          <Popconfirm
            title="Are you sure you want to delete this User?"
            onConfirm={() => handleDeleteUser(record?.block)}
            okText="Yes"
            cancelText="No"
          >
            <button className="text-2xl">
              <DeleteIcon />
            </button>
          </Popconfirm>
          <button className="text-2xl" onClick={() => showModal2(record)}>
            <LuEye />
          </button>
          <Popconfirm
            title={
              record.blockId === true
                ? "Are you sure you want to Unblock this User?"
                : "Are you sure you want to Block this User?"
            }
            onConfirm={() => handleBlockUnblock(record?.block)}
            okText="Yes"
            cancelText="No"
          >
            <button
              className={`w-[30px] h-[30px] flex justify-center items-center text-xl rounded-md ${
                record.blockId === true ? "bg-green-600" : "bg-red-600"
              } text-white`}
            >
              <MdBlockFlipped />
            </button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  return (
    <div className="bg-white p-3 h-[87vh] overflow-auto ">
      <div className="flex justify-between mb-4">
        <Navigate title={'User Management'}></Navigate>
        <Input
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          prefix={<SearchOutlined />}
          //   value={searchQuery}
          //   onChange={handleSearch}
         style={{ maxWidth: "300px", height: "45px" }}
        />
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content"}}
        className="custom-table "
      />

      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={userData?.data?.meta?.total || 0}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>

      {/* Modal */}
      <Modal
        open={isModalOpen2}
        centered
        onCancel={handleCancel2}
        footer={null}
      >
        {selectedUser && (
          <div className="w-full max-w-md p-5 mx-auto">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 mb-3 overflow-hidden">
                <img
                  src={selectedUser.image}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold">{selectedUser.name}</h2>

              <div className="flex items-center text-gray-500 mt-1">
                <AiOutlinePhone size={16} className="text-gray-400" />
                <span className="ml-1 text-sm">{selectedUser.phone}</span>
              </div>

              <div className="flex items-center text-gray-500 mt-1">
                <GoLocation size={16} className="text-gray-400" />
                <span className="ml-1 text-sm">Location unavailable</span>
              </div>

              <div className="flex items-center text-gray-500 mt-1">
                <AiOutlineMail size={16} className="text-gray-400" />
                <span className="ml-1 text-sm">{selectedUser.email}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
