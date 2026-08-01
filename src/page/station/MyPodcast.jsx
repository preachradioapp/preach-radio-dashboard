import React, { useState } from "react";
import { Form, Input, DatePicker, Select, Upload, Modal } from "antd";
import { UploadOutlined, EyeOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const podcasts = [
  {
    id: 1,
    title: "The Future of AI in 2026",
    description: "A discussion on AI trends and future impact.",
    thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    tags: ["Technology", "AI", "Future"],
  },
];
const MyPodcast = () => {
      const [open, setOpen] = useState(false);
      const[active, setActive] = useState()
      
  return (
    <div>
        <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-6">My Podcasts</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map((p) => (
            <div
              key={p.id}
              className="border rounded-xl overflow-hidden hover:shadow-lg transition"
            >
              <img
                src={p.thumbnail}
                alt=""
                className="w-full h-48 object-cover"
              />

              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1">{p.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{p.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {p.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-100 px-2 py-1 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setActive(p);
                    setOpen(true);
                  }}
                  className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700"
                >
                  <EyeOutlined />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL ================= */}
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        width={900}
      >
        {active && (
          <div>
            <video src={active.video} controls className="w-full rounded-lg" />
            <h2 className="text-2xl font-semibold mb-2">{active.title}</h2>
            <p className="text-gray-600 mb-4">{active.description}</p>
            {active.tags.map((tag) => (
              <span key={tag} className="text-xs bg-gray-100 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default MyPodcast