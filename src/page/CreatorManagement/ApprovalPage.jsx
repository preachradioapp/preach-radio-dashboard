import { Table, Input, Space, Modal, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { MdBlockFlipped } from "react-icons/md";
import { LuEye } from "react-icons/lu";
import Profile from "../../assets/header/profileLogo.png";
import { useState } from "react";

import { useApproveCreatorMutation, useBlockUserMutation, useGetAllCreatorQuery } from "../redux/api/productManageApi";


const ApprovalPage = () => {
  const {data: creatorData, isLoading} = useGetAllCreatorQuery();
  const [approveCreator] = useApproveCreatorMutation();
  const [blockUser] = useBlockUserMutation();
  console.log(creatorData)
  const [modal2Open, setModal2Open] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("list");
const dataSource =
  creatorData?.data?.result
    ?.filter((userss) => userss.isApproved === true)
    ?.map((userss, index) => {
      console.log("User ID:", userss?.user?._id);

      return {
        key: userss._id,
        no: index + 1,
        name: userss.name,
        address: userss.address,
        email: userss.email,
        phone: userss.phone,
        block: userss?.user?._id,
        blockId: userss?.user?.isBlocked,
        dateOfBirth: new Date(userss.dateOfBirth).toLocaleDateString(),
        image:
          userss.profile_image ||
          `https://avatar.iran.liara.run/public/${index + 1}`,
        createdAt: new Date(userss.createdAt).toLocaleDateString(),
        isBlocked: false,
      };
    }) || [];


  const dummyUsers = [
    {
      key: "1",
      sl: 1,
      userName: "John Doe",
      address: "123 Main St",
      dateOfBirth: "1995-01-01",
      contactNumber: "01234567890",
      email: "john@example.com",
      isBlocked: false,
    },
    {
      key: "2",
      sl: 2,
      userName: "Jane Smith",
      address: "456 Elm St",
      dateOfBirth: "1990-02-10",
      contactNumber: "01987654321",
      email: "jane@example.com",
      isBlocked: true,
    },
  ];

  const filteredData = dummyUsers.filter((user) =>
    user.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (record) => {
    setSelectedRecord(record);
    setModal2Open(true);
  };

  const closeModal = () => {
    setModal2Open(false);
    setSelectedRecord(null);
  };

   const approve = async (id) => {
    console.log(id)
    const data = { isApproved: true };
    try {
      const res = await approveCreator({data, id}).unwrap();
      message.success(res?.message );
    } catch (err) {
      message.error(err?.data?.message );
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleBlockUnblock =async (id) => {
  console.log(id)
    try {
      const res = await blockUser(id).unwrap();
      message.success(res?.message );
    } catch (err) {
      message.error(err?.data?.message );
    }
  };

  const columns =  [
   { title: "No", dataIndex: "no", key: "no" },
  {
    title: "Name",
    dataIndex: "name",
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
    dataIndex: "phone",
  },
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Approval",
    dataIndex: "approval",
    align: "center",
    render: (_, record) => (
      <button className="bg-[green] text-white w-[80px] h-[30px] flex justify-center text-sm items-center rounded-md">
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
        <button className="mt-2" onClick={() => openModal(record)}>
          <LuEye />
        </button>
        <button
          onClick={() => handleBlockUnblock(record?.block)}
          className={`w-[30px] h-[30px] flex justify-center items-center text-xl rounded-md ${
            record.blockId == true ? "bg-green-600" : "bg-red-600"
          } text-white`}
        >
          <MdBlockFlipped />
        </button>
      </Space>
    ),
  },
];


  return (
    <div>


      {activeTab === "list" && (
        <>
          <div className="flex justify-between mb-7 mt-4">
            <div></div>
            <Input
              placeholder="Search here..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={handleSearch}
              style={{ marginBottom: "16px", maxWidth: "300px" }}
            />
          </div>

          <Table
           dataSource={dataSource}
        columns={columns}
        pagination={false}
        scroll={{ x: "max-content" }}
            
          />
        </>
      )}

      {activeTab === "calendar" && (
        <div className="text-center text-gray-500 ">
          <ApprovalPage></ApprovalPage>
        </div>
      )}
<Modal
  centered
  open={modal2Open}
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

    </div>
  );
};

export default ApprovalPage;
