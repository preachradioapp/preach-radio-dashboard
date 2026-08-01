import { Modal, Form, Input, Select, Button, Upload, message } from "antd";
import React, { useEffect, useState } from "react";
import {

  useGetAllPodcastQuery,
  useGetSingleAlbumQuery,
  useUpdateAlbumMutation,
} from "../redux/api/productManageApi";

const { TextArea } = Input;
const { Option } = Select;
const options = [];

for (let i = 10; i < 36; i++) {
  options.push({
    value: i.toString(36) + i,
    label: i.toString(36) + i,
  });
}

const handleChange = (value) => {
  console.log(`selected ${value}`);
};
const UpdateAlbum = ({ editModal, setEditModal, selectedCategory }) => {
  console.log(selectedCategory);

  const id = selectedCategory;

  const {
    data: singleData,
    isLoading,
    error,
  } = useGetSingleAlbumQuery({ id }, { refetchOnMountOrArgChange: true });

  console.log(singleData);
  const [updateAlbum] = useUpdateAlbumMutation()
 
  const { data: allPodcast } = useGetAllPodcastQuery();
  const formPodcast = allPodcast?.data?.result || [];
  console.log(formPodcast);
  const [fileList, setFileList] = useState([]);
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
  const [form] = Form.useForm();

  const handleCancel = () => {
    setEditModal(false);
    form.resetFields();
  };

  useEffect(() => {
  if (singleData) {
    const albumData = singleData?.data;

    form.setFieldsValue({
      name: albumData?.name,
      description: albumData?.description,
      podcasts: albumData?.podcasts?.map((item) => item._id), // default podcast IDs
      tags: albumData?.tags || [], // default tags
    });

    setFileList([
      {
        uid: "-1",
        name: "album-cover.png",
        status: "done",
        url: albumData?.cover_image,
      },
    ]);
  }
}, [singleData, form]);


  const handleSubmit = async (values) => {
    console.log(values);
const id = singleData?.data?._id;
console.log(id)
    try {
      const formData = new FormData();

      fileList.forEach((file) => {
        formData.append("album_cover", file.originFileObj);
      });

      const data = {
        name: values.name,
        podcasts: values.podcasts,
        description: values.description,
        tags: values.tags,
      };
      console.log(data);

      formData.append("data", JSON.stringify(data));

      const res = await updateAlbum({formData, id});

      message.success(res.data.message);
      setEditModal(false);
      form.resetFields();
      setFileList([]);
    } catch (error) {
      console.error(error);
      message.error(message?.data?.error);
    }
  };

  return (
    <Modal
      centered
      open={editModal}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <div>
        <h1 className="text-center font-bold mb-2">Add Subscription</h1>
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          initialValues={{
            interval: "month",
          }}
        >
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            label="Podcasts"
            name="podcasts"
            rules={[
              { required: true, message: "Please select at least one podcast" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select Podcasts"
              allowClear
              optionFilterProp="children"
              style={{ width: "100%" }}
            >
              {formPodcast.map((cat) => (
                <Select.Option key={cat._id} value={cat._id}>
                  {cat?.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Tags"
            name="tags"
            rules={[
              { required: true, message: "Please enter at least one tag" },
            ]}
          >
            <Select
              mode="tags"
              style={{ width: "100%" }}
              placeholder="Write and press enter to add tags"
              tokenSeparators={[","]}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the description" },
            ]}
          >
            <TextArea rows={4} placeholder="Write your description here..." />
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

export default UpdateAlbum;
