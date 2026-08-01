import { Form, Input, message, Modal, Select, Spin, Upload } from "antd";
import React, { useState } from "react";
import {
  useAddSubCategoryMutation,
  useGetCategroyQuery,
} from "../redux/api/productManageApi";

const AddSubCategories = ({ open, setOpen, categoryName }) => {
  console.log(categoryName);
  const [addSubCategory] = useAddSubCategoryMutation();
  const { data: category } = useGetCategroyQuery({limit:'90000000'});
  console.log(category);
  const formCategory = category?.data?.result || [];
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const onPreview = async (file) => {
    let src = file.url;
    if (!src) {
      src = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file.originFileObj);
        reader.onload = () => resolve(reader.result);
      });
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setOpen(false);
  };

  const handleSubmit = async (values) => {
    console.log(values);
    setLoading(true);
    try {
      const formData = new FormData();

      fileList.forEach((file) => {
        formData.append("sub_category_image", file.originFileObj);
      });

      const data = {
        name: values.name,
        category: values.category,
      };
      console.log(data);

      formData.append("data", JSON.stringify(data));

      const res = await addSubCategory(formData);

      
        message.success(res.data.message);
        setOpen(false);
        form.resetFields();
        setFileList([]);
        setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      message.error(message?.data?.error);
    }
  };
  return (
    <Modal
      centered
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <div className="mb-11 mt-4">
        <div className="font-bold text-center mb-11">+ Add Category</div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="px-2"
        >
          <Form.Item
            name="category"
            label="Category Name"
            rules={[{ required: true, message: "Please select Role" }]}
          >
            <Select placeholder="Select">
              {formCategory.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat?.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Sub Category Name"
            name="name"
            rules={[{ required: true, message: "Please input Title" }]}
          >
            <Input
              placeholder="Enter Title"
              style={{ borderRadius: "0px", padding: "6px 8px" }}
            />
          </Form.Item>

          <Form.Item label="Photos">
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={onChange}
              onPreview={onPreview}
              multiple={true}
            >
              {fileList.length < 1 && "+ Upload"}
            </Upload>
          </Form.Item>

          <Form.Item>
            {/* Save Button */}
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

export default AddSubCategories;
