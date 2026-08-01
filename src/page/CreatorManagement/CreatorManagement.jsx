import {
  Table,
  Input,
  Space,
  Modal,
  message,
  Select,
  Pagination,
  Popconfirm,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { MdBlockFlipped } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import Profile from "../../assets/header/profileLogo.png";
import { useState } from "react";
import {
  useApproveCreatorMutation,
  useBlockUserMutation,
  useGetAllCreatorQuery,
} from "../redux/api/productManageApi";
import { Navigate } from "../../Navigate";
import AddCreator from "../createCreator/AddCreator";

const CreatorManagement = () => {
   const [openAddModal, setOpenAddModal] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [modal2Open, setModal2Open] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  // Set queryParam to undefined for "all" to avoid sending isApproved
  const queryParam = {
    isApproved:
      filterType === "approval"
        ? true
        : filterType === "creator"
        ? false
        : undefined,
    searchTerm: searchTerm || undefined,
    page: currentPage,
    limit: pageSize,
  };
  const {
    data: creatorData,
    isLoading,
    refetch,
  } = useGetAllCreatorQuery(queryParam);
  console.log(creatorData);
  const [approveCreator] = useApproveCreatorMutation();
  const [blockUser] = useBlockUserMutation();

  const dataSource =
    creatorData?.data?.result?.map((userss, index) => ({
      key: userss._id,
      no: index + 1,
      name: userss.name,
      address: userss.address,
      email: userss.email,
      phone: userss.phone,
      block: userss?.user?._id,
      blockId: userss?.user?.isBlocked,
      isApproved: userss.isApproved,
      dateOfBirth: new Date(userss.dateOfBirth).toLocaleDateString(),
      image:
        userss.profile_image ||
        `https://avatar.iran.liara.run/public/${index + 1}`,
      createdAt: new Date(userss.createdAt).toLocaleDateString(),
    })) || [];

  const openModal = (record) => {
    setSelectedRecord(record);
    setModal2Open(true);
  };

  const closeModal = () => {
    setModal2Open(false);
    setSelectedRecord(null);
  };

  const handleApprovalToggle = async (record) => {
    try {
      const isApproved = record.action === "approve" ? true : false;

      await approveCreator({
        id: record.key,
        data: { isApproved },
      }).unwrap();

      message.success(
        record.action === "approve"
          ? "User approved successfully"
          : "User rejected successfully"
      );

      refetch();
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleBlockUnblock = async (id) => {
    try {
      const res = await blockUser(id).unwrap();
      message.success(res?.message);
      refetch();
    } catch (err) {
      message.error(err?.data?.message || "Something went wrong");
    }
  };

  const columns = [
    { title: "No", dataIndex: "no", key: "no" },
    {
      title: "Name",
      dataIndex: "name",
      width: 150,
      render: (text, record) => (
        <Space>
          <img
            src={record?.image || "https://via.placeholder.com/32"}
            alt="avatar"
            style={{ borderRadius: "50%", width: 32, height: 32 }}
          />
          {text}
        </Space>
      ),
    },
    { title: "Address", dataIndex: "address" },
    { title: "Date of birth", dataIndex: "dateOfBirth" },
    { title: "Contact Number", dataIndex: "phone" },
    { title: "Email", dataIndex: "email" },
    {
      title: "Approval",
      dataIndex: "approval",
      align: "center",
      render: (_, record) => {
        // Already approved
        if (record.isApproved === true) {
          return <span className="text-green-600 font-semibold">Approved</span>;
        }

        // Already rejected
        if (record.isApproved === "rejected") {
          return <span className="text-red-600 font-semibold">Rejected</span>;
        }

        // Pending – show two buttons
        return (
          <div className="flex gap-2 justify-center">
            <Popconfirm
              title="Are you sure you want to Approve this User?"
              onConfirm={() =>
                handleApprovalToggle({ ...record, action: "approve" })
              }
              okText="Yes"
              cancelText="No"
            >
              <button className="bg-green-600 text-white px-3 py-1 rounded text-sm">
                Approve
              </button>
            </Popconfirm>

            <Popconfirm
              title="Are you sure you want to Reject this User?"
              onConfirm={() =>
                handleApprovalToggle({ ...record, action: "reject" })
              }
              okText="Yes"
              cancelText="No"
            >
              <button className="bg-red-600 text-white px-3 py-1 rounded text-sm">
                Reject
              </button>
            </Popconfirm>
          </div>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <button className="mt-2" onClick={() => openModal(record)}>
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
                record.blockId ? "bg-green-600" : "bg-red-600"
              } text-white`}
            >
              <MdBlockFlipped />
            </button>{" "}
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white p-3 h-[87vh] overflow-auto">
      <div className=" flex justify-between">
        <Navigate title={"User Management"} />
        <div className="flex gap-4">
          <div>
            <Select
              value={filterType}
              onChange={(value) => setFilterType(value)}
              style={{ width: 150, height: "45px" }}
              options={[
                { value: "all", label: "All" },
                { value: "creator", label: "Creator" },
                { value: "approval", label: "Approval" },
              ]}
            />
          </div>
          <div>
            <Input
              placeholder="Search here..."
              prefix={<SearchOutlined />}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ maxWidth: "400px", height: "45px" }}
            />
          </div>
             <button
          onClick={() => setOpenAddModal(true)}
          className="bg-[#050505] px-5 text-white rounded"
        >
          + Add
        </button>
        </div>
      </div>

      <div className="pt-4">
        <Table
          dataSource={dataSource}
          columns={columns}
          pagination={false}
          scroll={{ x: "max-content" }}
          loading={isLoading}
        />
      </div>

      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={creatorData?.data?.meta?.total || 0}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>

      <Modal
        centered
        open={modal2Open}
        onCancel={closeModal}
        footer={null}
        closable={true}
        width={400}
        bodyStyle={{ borderRadius: 0 }}
      >
        <div className="flex justify-center py-8">
          <img
            className="w-[70px] h-[70px] rounded-full"
            src={selectedRecord?.image || Profile}
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
              <h3>{selectedRecord?.name || "N/A"}</h3>
              <h3>{selectedRecord?.dateOfBirth || "N/A"}</h3>
              <h3>{selectedRecord?.phone || "N/A"}</h3>
              <h3>{selectedRecord?.email || "N/A"}</h3>
              <div className="bg-[#D9D9D9] p-3 rounded">
                {selectedRecord?.address || "N/A"}
              </div>
            </div>
          </div>
        </div>
      </Modal>
        <AddCreator
        openAddModal={openAddModal}
        setOpenAddModal={setOpenAddModal}
      />
    </div>
  );
};

export default CreatorManagement;
