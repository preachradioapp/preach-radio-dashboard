import { Table, Input, Space, Modal } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { MdBlockFlipped } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import { useState } from "react";
import Profile from "../../assets/header/profileLogo.png";

const columns = (openModal, setBlocked, blocked) => [
  {
    title: "SL no.",
    dataIndex: "sl",
    width: 70,
    align: "center",
  },
  {
    title: "User's Name",
    dataIndex: "userName",
    width: 150,
    render: (text) => (
      <Space>
        <img
          src="https://via.placeholder.com/32"
          alt="avatar"
          style={{ borderRadius: "50%", width: 32, height: 32 }}
        />
        {text}
      </Space>
    ),
  },
  {
    title: "Address",
    dataIndex: "address",
  },
  {
    title: "Date of birth",
    dataIndex: "dateOfBirth",
  },
  {
    title: "Contact Number",
    dataIndex: "contactNumber",
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Approval",
    dataIndex: "approve",
    align: "center",
    render: () => (
      <button className="bg-green-600 text-white w-[80px] h-[30px] text-sm rounded-md">
        Approved
      </button>
    ),
  },
  {
    title: "Action",
    dataIndex: "action",
    align: "center",
    render: (_, record) => (
      <Space size="middle">
        {!blocked[record.key] ? (
          <button className="mt-2" onClick={() => openModal(record)}>
            <span className="text-xl">
              <LuEye />
            </span>
          </button>
        ) : (
          <button className="bg-green-600 text-white w-[80px] h-[30px] text-sm rounded-md">
            Unblock
          </button>
        )}
        {!blocked[record.key] ? (
          <button
            onClick={() =>
              setBlocked((prev) => ({ ...prev, [record.key]: true }))
            }
            className="bg-red-600 text-white w-[30px] h-[30px] text-xl flex justify-center items-center rounded-md"
          >
            <MdBlockFlipped />
          </button>
        ) : null}
      </Space>
    ),
  },
];

const Contactss = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [blocked, setBlocked] = useState({});

  const openModal = (record) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  // ✅ Dummy user data
  const userData = [
    {
      key: "1",
      sl: 1,
      userName: "John Doe",
      address: "123 Main St, New York",
      dateOfBirth: "1990-01-01",
      contactNumber: "0123456789",
      email: "john@example.com",
    },
    
  ];

  return (
    <div>
      <div className="flex justify-between mb-7 mt-4">
        <div></div>
        <Input
          placeholder="Search here..."
          prefix={<SearchOutlined />}
          style={{ marginBottom: "16px", maxWidth: "300px" }}
        />
      </div>

      <Table
        columns={columns(openModal, setBlocked, blocked)}
        dataSource={userData}
        pagination={{ position: ["bottomCenter"], hideOnSinglePage: false }}
      />

      <Modal
        centered
        open={modalOpen}
        onCancel={closeModal}
        footer={null}
        closable={true}
        width={400}
        bodyStyle={{ borderRadius: 0 }}
        className="no-border-radius-modal"
      >
        <div className="flex justify-center py-8">
          <img
            className="w-[70px] h-[70px] rounded-full"
            src={Profile}
            alt="profile"
          />
        </div>
        <div>
          <div className="grid grid-cols-2">
            <div className="text-lg gap-4">
              <h4>Name:</h4>
              <h4>Date of birth:</h4>
              <h4>Contact Number:</h4>
              <h4>Email:</h4>
              <h4>Address:</h4>
            </div>
            <div className="gap-4 text-lg text-neutral-500">
              <h3>{selectedRecord?.userName || ""}</h3>
              <h3>{selectedRecord?.dateOfBirth || ""}</h3>
              <h3>{selectedRecord?.contactNumber || ""}</h3>
              <h3>{selectedRecord?.email || ""}</h3>
              <div className="bg-[#D9D9D9] p-3 rounded">
                {selectedRecord?.address || ""}
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Contactss;
