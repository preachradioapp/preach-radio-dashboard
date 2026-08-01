import { Form, Input, message, Modal, Spin, Upload } from "antd";
import React, { useEffect, useState } from "react";
import { useUpdateCategoryMutation } from "../redux/api/productManageApi";

const EditCategories = ({ editModal, setEditModal, selectedCategory }) => {
  console.log(selectedCategory);

  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updateCategory] = useUpdateCategoryMutation();
  const onChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  useEffect(() => {
    if (selectedCategory) {
      form.setFieldsValue({
        name: selectedCategory?.name,
      });

      setFileList([
        {
          uid: "-1",
          name: "category-image.png",
          status: "done",
          url: `${selectedCategory?.category_image}`,
        },
      ]);
    }
  }, [selectedCategory, form]);

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
    setEditModal(false);
  };

  const handleSubmit = async (values) => {
    const id = selectedCategory?.key;
    console.log(id);
    setLoading(true);
    try {
      const formData = new FormData();

      fileList.forEach((file) => {
        formData.append("category_image", file.originFileObj);
      });
      const data = {
        name: values.name,
      };
      console.log(data);
      formData.append("data", JSON.stringify(data));
      const res = await updateCategory({ formData, id });
      console.log(res);
      message.success(res.data.message);
      setLoading(false);
      setEditModal(false);
    } catch (error) {
      setLoading(false);
      console.error(error);
      message.error(message?.data?.error);
      setEditModal(false);
    } finally {
      setLoading(false);
      setEditModal(false);
    }
  };

  return (
    <Modal
      centered
      open={editModal}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <div className="mb-20 mt-4">
        <div className="font-bold text-center mb-11">Edit Category</div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="px-2"
        >
          <Form.Item
            label="Category Name"
            name="name"
            rules={[{ required: true, message: "Please input title" }]}
          >
            <Input
              placeholder="Enter title"
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

          {/* Save Button */}
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

        {/* <div className="mx-20">
            <p className="mb-2">Category</p>
            <input
              className="border w-full border-neutral-400 rounded p-2 px-4 bg-[#00000000]"
              type="text"
              placeholder="Edit category name"
              value={
                editedCategory ||
                category.find((item) => item._id === editModal.id)?.title ||
                ""
              }
              onChange={(e) => setEditedCategory(e.target.value)}
            />

            <div className="mt-4">
              <p className="mb-2 font-medium">Image</p>
              <div
                className="border border-dashed border-neutral-400 rounded-md p-4 w-full h-28 flex flex-col items-center justify-center gap-2 bg-gray-50 relative cursor-pointer"
                onClick={() => document.getElementById("editFileInput").click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <>
                    <div className="flex flex-col items-center justify-center gap-2 text-center text-neutral-500">
                      <div className="text-sm">
                        Drag and drop an image, or click to upload
                      </div>
                    </div>
                  </>
                )}
                <input
                  id="editFileInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <div className="w-full flex gap-3 mt-11">
              <button
                onClick={() => {
                  setEditModal({ isOpen: false, id: null });
                  setEditedCategory("");
                  setPreviewImage(null);
                  setSelectedImage(null);
                }}
                className="bg-[#D9000A] w-full rounded py-2 px-4 text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCategory}
                className="bg-[#004466] w-full py-2 px-4 rounded text-white"
              >
                Save
              </button>
            </div>
          </div> */}
      </div>
    </Modal>
  );
};

export default EditCategories;
