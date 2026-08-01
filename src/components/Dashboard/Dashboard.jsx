import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { HiOutlineUserGroup } from "react-icons/hi2";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { LuUserPlus } from "react-icons/lu";
import { Table } from "antd";

const Dashboard = () => {
  // Dummy Data
  const topPodcast = [
    {
      title: "Fitness Podcast",
      cover: "https://via.placeholder.com/50",
      category: { title: "Health" },
    },
    {
      title: "Tech Talks",
      cover: "https://via.placeholder.com/50",
      category: { title: "Technology" },
    },
  ];

  const totalSubscriber = 150;
  const totalUsers = 80;
  const totalCreators = 25;

  const incomeData = [
    { name: "Jan", value: 300 },
    { name: "Feb", value: 450 },
    { name: "Mar", value: 500 },
    { name: "Apr", value: 700 },
    { name: "May", value: 650 },
  ];

  const subscriberData = [
    { name: "Jan", value: 10 },
    { name: "Feb", value: 20 },
    { name: "Mar", value: 30 },
    { name: "Apr", value: 50 },
    { name: "May", value: 45 },
  ];

  // Ant Design table data
  const podcastTableData = topPodcast.map((item, index) => ({
    key: index,
    no: index + 1,
    title: item.title,
    cover: item.cover,
    category: item.category.title,
  }));

  const podcastColumns = [
    {
      title: "SL No.",
      dataIndex: "no",
      key: "no",
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: "Event Name",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <img
            src={record.cover}
            alt="cover"
            className="w-[50px] h-[50px] rounded"
          />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
  ];

  return (
    <div className="min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Total Subscriber */}
        <div className="flex gap-4 items-center bg-white p-9 rounded shadow">
          <div className="bg-yellow-100 w-[55px] rounded-full h-[55px] flex justify-center items-center text-3xl">
            <HiOutlineUserGroup className="text-yellow-500" />
          </div>
          <div>
            <h1 className="font-semibold text-3xl">{totalSubscriber}</h1>
            <h1 className="text-zinc-500"> Total Subscriber</h1>
          </div>
        </div>

        {/* Total Users */}
        <div className="flex gap-4 items-center bg-white p-9 rounded shadow">
          <div className="bg-green-100 w-[55px] rounded-full h-[55px] flex justify-center items-center text-3xl">
            <AiOutlineUsergroupAdd className="text-green-500" />
          </div>
          <div>
            <h1 className="font-semibold text-3xl">{totalUsers}</h1>
            <h1 className="text-zinc-500"> Total Users</h1>
          </div>
        </div>

        {/* Total Creator */}
        <div className="flex gap-4 items-center bg-white p-9 rounded shadow">
          <div className="bg-red-100 w-[55px] rounded-full h-[55px] flex justify-center items-center text-3xl">
            <LuUserPlus className="text-red-500" />
          </div>
          <div>
            <h1 className="font-semibold text-3xl">{totalCreators}</h1>
            <h1 className="text-zinc-500"> Total Creator</h1>
          </div>
        </div>
      </div>

      {/* Income & Subscription Overview */}
      <div className="lg:grid grid-cols-2 gap-4 mb-4">
        {/* Income Overview */}
        <div className="rounded shadow">
          <h3 className="text-gray-700 font-bold pt-3 pl-7 mb-4">
            Income Overview
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={incomeData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ce9192" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#E63946" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#edc4c500" />

              <XAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 12, fontWeight: 500 }}
              />

              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 12, fontWeight: 500 }}
              />

              <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }} />

              <Area
                type="monotone"
                dataKey="value"
                stroke="white"
                fillOpacity={1}
                fill="url(#incomeColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Subscription Overview */}
        <div className="shadow rounded">
          <h3 className="text-gray-700 font-bold pt-3 pl-7 mb-4">
            Subscription Overview
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={subscriberData}
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              barSize={20}
            >
              <defs>
                <linearGradient id="barColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ce9192" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#E63946" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#edc4c500" />

              <XAxis
                dataKey="name"
                stroke="#6b7280"
                tick={{ fontSize: 12, fontWeight: 500 }}
                padding={{ left: 10, right: 10 }}
                scale="point"
              />

              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 12, fontWeight: 500 }}
              />

              <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: 8 }} />

              <Bar dataKey="value" stroke="white" fill="url(#barColor)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Podcast Table */}
      <div className="p-4 rounded shadow mb-6 bg-white">
        <h3 className="text-gray-700 font-bold mb-4">Top Podcast</h3>

        <Table
          dataSource={podcastTableData}
          columns={podcastColumns}
          pagination={false}
           scroll={{ x: "max-content"}}
        className="custom-table "
        />
      </div>
    </div>
  );
};

export default Dashboard;
