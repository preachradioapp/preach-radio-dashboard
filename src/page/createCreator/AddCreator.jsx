import { Form, Input, message, Modal, Spin } from "antd";
import React, { useState } from "react";

const AddCreator = ({ openAddModal, setOpenAddModal }) => {
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(false);

  const handleCancel = () => {
    form.resetFields();
    setOpenAddModal(false);
  };

  const handleSubmit = async (values) => {
    console.log("Submitted Data:", values);
    message.success("Creator Added Successfully!");
  };

  return (
    <Modal
      centered
      open={openAddModal}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <div className="mb-10 mt-4">
        <div className="font-bold text-center mb-8 text-lg">
          + Add Creator
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="px-2"
        >
          {/* Name */}
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please input name!" }]}
          >
            <Input
              placeholder="Enter name"
              style={{ borderRadius: "0px", padding: "6px 8px" }}
            />
          </Form.Item>

          {/* Email */}
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input email!" },
              { type: "email", message: "Please enter a valid email!" },
            ]}
          >
            <Input
              placeholder="Enter email"
              style={{ borderRadius: "0px", padding: "6px 8px" }}
            />
          </Form.Item>

          {/* Password */}
          <Form.Item
            label="Password"
            name="password"
            rules={[
              { required: true, message: "Please input password!" },
              { min: 6, message: "Password must be at least 6 characters!" },
            ]}
          >
            <Input.Password
              placeholder="Enter password"
              style={{ borderRadius: "0px", padding: "6px 8px" }}
            />
          </Form.Item>

          {/* Confirm Password */}
          <Form.Item
            label="Confirm Password"
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Confirm password"
              style={{ borderRadius: "0px", padding: "6px 8px" }}
            />
          </Form.Item>

          {/* Submit */}
          <Form.Item>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-2 bg-[#495F48] text-white rounded-md"
            >
              {loading ? <Spin size="small" /> : "Add"}
            </button>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default AddCreator;
