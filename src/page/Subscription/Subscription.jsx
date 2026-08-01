import { Table, Space, Modal } from "antd";
import { MdOutlineModeEdit } from "react-icons/md";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddSubscription from "./AddSubscription";
import EditSubscription from "./EditSubscription";
import { Navigate } from "../../Navigate";



const Subscription = () => {
   const [openAddModal, setOpenAddModal] = useState(false);
     const [editModal, setEditModal] = useState(false);
  const [modal2Open, setModal2Open] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
 const handleEdit = (record) => {
    console.log(record)
    // setSelectedProduct(record);
    setEditModal(true);
    
  };
  const [editForm, setEditForm] = useState({
    name: '',
    interval: 'month',
    unitAmount: '',
    description: ''
  });

  const [addForm, setAddForm] = useState({
    name: '',
    interval: 'month',
    unitAmount: '',
    description: ''
  });

  const dummySubscriptions = [
    {
      _id: '1',
      name: 'Basic Plan',
      interval: 'Monthly',
      unitAmount: 10,
      description: 'Access to basic features.',
    },
    {
      _id: '2',
      name: 'Pro Plan',
      interval: 'Yearly',
      unitAmount: 100,
      description: 'Full access with extra tools.',
    },
  ];

  const dataSource = dummySubscriptions.map((plan, index) => ({
    key: plan._id,
    sl: index + 1,
    name: plan.name,
    interval: plan.interval,
    price: `${plan.unitAmount}`,
    description: plan.description || "-",
  }));

  const openModal = (record) => {
    setSelectedRecord(record);
    setEditForm({
      name: record.name,
      interval: record.interval.toLowerCase(),
      unitAmount: record.price,
      description: record.description === '-' ? '' : record.description
    });
    setModal2Open(true);
  };

  const closeModal = () => {
    setModal2Open(false);
    setSelectedRecord(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddFormChange = (e) => {
    const { name, value } = e.target;
    setAddForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const columns = (openModal) => [
  {
    title: "SL no.",
    dataIndex: "sl",
    width: 70,
    align: "center",
  },
  {
    title: "Name",
    dataIndex: "name",
  },
  {
    title: "Interval",
    dataIndex: "interval",
  },
  {
    title: "Price",
    dataIndex: "price",
  },
  {
    title: "Description",
    dataIndex: "description",
  },
  {
    title: "Action",
    dataIndex: "action",
    align: "center",
    render: (_, record) => (
      <Space size="middle">
        <button onClick={() => handleEdit(record)}>
          <span className="bg-[#004466] text-white w-[30px] h-[30px] flex justify-center text-xl items-center rounded-md">
            <MdOutlineModeEdit />
          </span>
        </button>
      </Space>
    ),
  },
];
  return (
    <div className="bg-white p-3 h-[87vh]">
      <div className="flex justify-between ">
            <Navigate title={"Subscription"}></Navigate>
        <button
          onClick={() => setOpenAddModal(true)}
          className="bg-[#02111E] py-2 px-3 rounded text-white"
        >
          + Add Subscription
        </button>
      </div>

      <Table
        columns={columns(openModal)}
        dataSource={dataSource}
        pagination={{
          position: ["bottomCenter"],
          hideOnSinglePage: false,
        }}
      />

      {/* Edit Modal */}
      <Modal
        centered
        open={modal2Open}
        onCancel={closeModal}
        footer={null}
        width={500}
      >
        <div>
          <h1 className="text-center font-bold mb-2">Edit Subscription</h1>
          <form>
            <div>
              <p className="mb-1">Name</p>
              <input
                className="border w-full border-neutral-400 rounded p-2 px-4 bg-[#00000000]"
                type="text"
                name="name"
                value={editForm.name}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="my-3">
              <p className="mb-1">Time Duration</p>
              <select
                className="border w-full border-neutral-400 rounded p-2 px-4 bg-[#00000000]"
                name="interval"
                value={editForm.interval}
                onChange={handleEditFormChange}
                required
              >
                <option value="month">Monthly</option>
                <option value="year">Yearly</option>
              </select>
            </div>
            <div>
              <p className="mb-1">Price</p>
              <input
                className="border w-full border-neutral-400 rounded p-2 px-4 bg-[#00000000]"
                type="number"
                name="unitAmount"
                value={editForm.unitAmount}
                onChange={handleEditFormChange}
                required
              />
            </div>
            <div className="mt-3">
              <p className="mb-1">Description</p>
              <textarea
                className="border w-full border-neutral-400 rounded p-2 px-4 bg-[#00000000] text-lg"
                rows="5"
                name="description"
                value={editForm.description}
                onChange={handleEditFormChange}
                placeholder="Write your description here..."
                required
              />
            </div>
            <div className="w-full flex gap-3 mt-11">
              <button
                type="submit"
                className="bg-[#02111E] w-full rounded py-2 px-4 text-white"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-[#D9000A] w-full py-2 px-4 rounded text-white"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Add Modal */}
      <AddSubscription setOpenAddModal={setOpenAddModal}
        openAddModal={openAddModal}></AddSubscription>
        <EditSubscription editModal={editModal} setEditModal={setEditModal} ></EditSubscription>
    </div>
  );
};

export default Subscription;
