import { Modal, Form, Input, Select, Button } from 'antd';
import React from 'react';

const { TextArea } = Input;
const { Option } = Select;

const AddSubscription = ({ openAddModal, setOpenAddModal }) => {
  const [form] = Form.useForm();

  const handleCancel = () => {
    setOpenAddModal(false);
    form.resetFields();
  };

  const handleFinish = (values) => {
    console.log('Submitted values:', values);
   
    setOpenAddModal(false);
    form.resetFields();
  };

  return (
    <Modal
      centered
      open={openAddModal}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <div>
        <h1 className="text-center font-bold mb-2">Add Subscription</h1>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleFinish}
          initialValues={{
            interval: 'month',
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>

          <Form.Item
            label="Time Duration"
            name="interval"
            rules={[{ required: true, message: 'Please select a time duration' }]}
          >
            <Select>
              <Option value="month">Monthly</Option>
              <Option value="year">Yearly</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Price"
            name="unitAmount"
            rules={[
              { required: true, message: 'Please enter the price' },
              { pattern: /^[0-9]+$/, message: 'Only numbers allowed' },
            ]}
          >
            <Input type="number" placeholder="Enter price" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter the description' }]}
          >
            <TextArea rows={4} placeholder="Write your description here..." />
          </Form.Item>

          <div className="w-full flex gap-3 mt-6">
            <Button
              type="primary"
              htmlType="submit"
              className="bg-[#02111E] w-full"
            >
              Save
            </Button>
            <Button
              danger
              type="default"
              className="w-full"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </Form>
      </div>
    </Modal>
  );
};

export default AddSubscription;
