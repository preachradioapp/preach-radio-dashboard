import { Table, Input, Space, Modal, Button, Pagination } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Delete } from "lucide-react";
import { LuEye } from "react-icons/lu";
import { useGetReportsQuery } from "../redux/api/metaDataApi";
import { Navigate } from "../../Navigate";

const Reports = () => {
    const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const { data: reportData } = useGetReportsQuery({searchTerm, page: currentPage,
    limit: pageSize});

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const navigate = useNavigate();

  // reports data mapping
  const reports =
    reportData?.data?.result?.map((item, index) => ({
      key: item._id,
      sl: index + 1,
      reportFrom: item.reportFrom,
      reportTo: item.reportTo,
      reportFromModel: item.reportFromModel,
      reportToModel: item.reportToModel,
      incidentType: item.incidentType,
      additionalNote: item.additionalNote,
      createdAt: item.createdAt,
    })) || [];

  const handleView = (record) => {
    setSelectedReport(record);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedReport(null);
  };

  const columns = [
    {
      title: "SL no.",
      dataIndex: "sl",
      width: 70,
      align: "center",
    },
    {
      title: "Report From",
      dataIndex: "reportFrom",
      render: (reportFrom) => (
        <Space>
          <img
            src={reportFrom?.profile_image}
            alt="avatar"
            style={{ borderRadius: "50%", width: 32, height: 32 }}
          />
          {reportFrom?.name}
        </Space>
      ),
    },
    {
      title: "Report To",
      dataIndex: "reportTo",
      render: (reportTo) => (
        <Space>
          <img
            src={reportTo?.profile_image}
            alt="avatar"
            style={{ borderRadius: "50%", width: 32, height: 32 }}
          />
          {reportTo?.name}
        </Space>
      ),
    },
    {
      title: "From Model",
      dataIndex: "reportFromModel",
      align: "center",
    },
    {
      title: "To Model",
      dataIndex: "reportToModel",
      align: "center",
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, record) => (
        <Space size="middle">
          <button
            className="text-xl text-blue-500"
            onClick={() => handleView(record)}
          >
            <LuEye />
          </button>
          <button className="text-xl text-red-500">
            <Delete />
          </button>
        </Space>
      ),
    },
  ];
   const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white p-3 h-[87vh]">
      <div className="flex justify-between">
           <Navigate title={"Reports"}></Navigate>
        <Input
          placeholder="Search here..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
         style={{ maxWidth: "300px", height: "40px" }}
        />
      </div>

      <Table columns={columns} dataSource={reports} pagination={false} />

      <div className="mt-4 flex justify-center">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={reportData?.data?.meta?.total || 0}
          onChange={handlePageChange}
          showSizeChanger={false}
        />
      </div>

      {/* Modal */}
      <Modal
        title="Report Details"
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>
            Close
          </Button>,
        ]}
      >
        {selectedReport && (
          <div className="space-y-3">
            <p>
              <strong>Incident Type:</strong> {selectedReport.incidentType}
            </p>
            <p>
              <strong>Additional Note:</strong> {selectedReport.additionalNote}
            </p>
            <p>
              <strong>From:</strong> {selectedReport.reportFrom?.name} (
              {selectedReport.reportFromModel})
            </p>
            <p>
              <strong>To:</strong> {selectedReport.reportTo?.name} (
              {selectedReport.reportToModel})
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedReport.createdAt).toLocaleString()}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
