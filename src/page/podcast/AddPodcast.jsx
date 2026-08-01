import React, { useRef, useState } from "react";
import {
  Form,
  Input,
  message,
  Modal,
  Spin,
  Upload,
  Select,
  InputNumber,
  Radio,
  Progress,
  Button,
  Divider,
  Card,
} from "antd";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import {
  UploadOutlined,
  CloudUploadOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {
  useAddGeneratePresignedUrlMutation,
  useGetCategroyAllSelectQuery,
  useGetStationQuery,
} from "../redux/api/productManageApi";
import { useAddPodcastMutation } from "../redux/api/metaDataApi";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;
const libraries = ["places"];

const AddPodcast = ({ openAddModal, setOpenAddModal }) => {
  const [form] = Form.useForm();
  const autocompleteRef = useRef(null);
  const { data: allStation } = useGetStationQuery();
  const [generateUrl] = useAddGeneratePresignedUrlMutation();
  const [addPodcast] = useAddPodcastMutation();

  const { data: categoryData } = useGetCategroyAllSelectQuery({
    page: 1,
    limit: 100,
  });
  const convertDurationCustom = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const remainingAfterHours = totalSeconds % 3600;

  const minutes = Math.floor(remainingAfterHours / 60);
  const seconds = Math.floor(remainingAfterHours % 60);

  const totalMinutes = hours * 60 + minutes;

  if (seconds === 0) {
    return totalMinutes.toString();
  }

  return `${totalMinutes}.${seconds.toString().padStart(2, "0")}`;
};

const getMediaDuration = (file, type = "audio") => {
  return new Promise((resolve, reject) => {
    const media = document.createElement(type);
    media.preload = "metadata";

    media.onloadedmetadata = () => {
      window.URL.revokeObjectURL(media.src);
      resolve(media.duration); // seconds
    };

    media.onerror = () => reject("Failed to load media");

    media.src = URL.createObjectURL(file);
  });
};

  const categories = categoryData?.data?.result || [];
  const [subCategories, setSubCategories] = useState([]);

  const [podcastType, setPodcastType] = useState("audio");
  const [podcastFile, setPodcastFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [podcastFileList, setPodcastFileList] = useState([]);
  const [coverFileList, setCoverFileList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploading, setCurrentUploading] = useState("");
  const [shopAddress, setShopAddress] = useState("");

  // ---------------- Utils ----------------
  const uploadWithPresignedUrl = async (file, fileCategory, onProgress) => {
    try {
      const presignedRes = await generateUrl({
        fileType: file.type,
        fileCategory,
      }).unwrap();

      const uploadURL = presignedRes.uploadURL;

      await axios.put(uploadURL, file, {
        headers: { "Content-Type": file.type },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percent);
        },
      });

      return uploadURL.split("?")[0];
    } catch (err) {
      throw err;
    }
  };

  // ---------------- Handlers ----------------
  const handleCategoryChange = (id) => {
    const cat = categories.find((c) => c._id === id);
    setSubCategories(cat?.subcategories || []);
    form.setFieldsValue({ subCategory: undefined });
  };

  const onPlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place?.geometry) return;

    form.setFieldsValue({
      address: place.formatted_address,
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
    });

    setShopAddress(place.formatted_address);
  };

  const handleSubmit = async (values) => {
    if (!podcastFile) {
      message.error("Please upload podcast file");
      return;
    }

    if (!coverFile) {
      message.error("Please upload cover image");
      return;
    }

    setLoading(true);
    setUploadProgress(0);
    
    try {
      const payload = {
        station: allStation?.data?._id,
        category: values.category,
        subCategory: values.subCategory,
       
        title: values.title,
        description: values.description,
        address: values.address,
        duration: values.duration,
        tags: values.tags,
        location: {
          type: "Point",
          coordinates: [values.longitude, values.latitude],
        },
      };

      // Upload podcast
      setCurrentUploading(
        `Uploading ${podcastType === "audio" ? "Audio" : "Video"} Podcast...`
      );
      const podcastUrl = await uploadWithPresignedUrl(
        podcastFile,
        podcastType === "audio" ? "podcast_audio" : "podcast_video",
        setUploadProgress
      );
      payload.podcast_url = podcastUrl;
      setUploadProgress(0);

      // Upload cover
      setCurrentUploading("Uploading Cover Image...");
      const coverUrl = await uploadWithPresignedUrl(
        coverFile,
        "podcast_cover",
        setUploadProgress
      );
      payload.coverImage = coverUrl;
      setUploadProgress(0);

      // Add podcast
      setCurrentUploading("Creating Podcast...");
      setUploadProgress(90);
      await addPodcast(payload).unwrap();
      
      setUploadProgress(100);
      message.success("Podcast added successfully!");
      
      setTimeout(() => {
        setOpenAddModal(false);
        resetForm();
      }, 500);
    } catch (err) {
      message.error(err?.data?.message || "Failed to add podcast");
    } finally {
      setLoading(false);
      setCurrentUploading("");
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    form.resetFields();
    setPodcastFile(null);
    setCoverFile(null);
    setPodcastFileList([]);
    setCoverFileList([]);
    setSubCategories([]);
    setShopAddress("");
  };

  const handleCancel = () => {
    setOpenAddModal(false);
    resetForm();
  };

  return (
    <Modal
      open={openAddModal}
      footer={null}
      width={900}
      onCancel={handleCancel}
      style={{ top: 20 }}
      className="podcast-modal"
    >
      <div className="mb-6">
        <h2 className="text-center font-bold text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Create New Podcast
        </h2>
        <p className="text-center text-gray-500 mt-2">
          Fill in the details below to add a new podcast
        </p>
      </div>

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* Podcast Type Section */}
        <Card className="mb-4 shadow-sm border-l-4 border-l-blue-500">
          <Form.Item
            label={
              <span className="font-semibold text-base flex items-center gap-2">
                <PlayCircleOutlined /> Podcast Type
              </span>
            }
          >
            <Radio.Group
              value={podcastType}
              onChange={(e) => {
                setPodcastType(e.target.value);
                setPodcastFile(null);
                setPodcastFileList([]);
              }}
              buttonStyle="solid"
              size="large"
            >
              <Radio.Button value="audio" className="w-48">
                <AudioOutlined className="mr-2" />
                Audio Podcast
              </Radio.Button>
              <Radio.Button value="video" className="w-48">
                <VideoCameraOutlined className="mr-2" />
                Video Podcast
              </Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Card>

        {/* File Upload Section */}
        <Card className="mb-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <CloudUploadOutlined className="text-blue-500" />
            Upload Files
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Podcast File Upload */}
            <div>
              <Form.Item
                label={
                  <span className="font-semibold flex items-center gap-2">
                    {podcastType === "audio" ? (
                      <AudioOutlined className="text-purple-500" />
                    ) : (
                      <VideoCameraOutlined className="text-red-500" />
                    )}
                    {podcastType === "audio" ? "Audio File" : "Video File"}
                  </span>
                }
              >
                <Upload.Dragger
                  accept={podcastType === "audio" ? "audio/*" : "video/*"}
                  beforeUpload={() => false}
                  onChange={async ({ file, fileList }) => {
  if (file.status === "removed") {
    setPodcastFile(null);
    setPodcastFileList([]);
    form.setFieldsValue({ duration: undefined });
    return;
  }

  const realFile = file.originFileObj || file;
  setPodcastFile(realFile);
  setPodcastFileList(fileList);

  try {
    const durationInSeconds = await getMediaDuration(
      realFile,
      podcastType === "audio" ? "audio" : "video"
    );

    const customDuration = convertDurationCustom(durationInSeconds);

    form.setFieldsValue({
      duration: customDuration,
    });

    message.success(`Duration detected: ${customDuration}`);
  } catch (err) {
    message.warning("Could not detect duration");
  }
}}

                  fileList={podcastFileList}
                  maxCount={1}
                  className="podcast-upload-dragger"
                >
                  <p className="ant-upload-drag-icon">
                    {podcastType === "audio" ? (
                      <AudioOutlined className="text-4xl text-purple-500" />
                    ) : (
                      <VideoCameraOutlined className="text-4xl text-red-500" />
                    )}
                  </p>
                  <p className="ant-upload-text font-semibold">
                    Click or drag {podcastType} file here
                  </p>
                  <p className="ant-upload-hint text-gray-500">
                    Support for {podcastType === "audio" ? "MP3, WAV, AAC" : "MP4, AVI, MOV"}
                  </p>
                </Upload.Dragger>
              </Form.Item>
            </div>

            {/* Cover Image Upload */}
            <div>
              <Form.Item
                label={
                  <span className="font-semibold flex items-center gap-2">
                    <FileImageOutlined className="text-green-500" />
                    Cover Image
                  </span>
                }
              >
                <Upload.Dragger
                  accept="image/*"
                  listType="picture-card"
                  beforeUpload={() => false}
                  onChange={({ file, fileList }) => {
                    if (file.status !== "removed") {
                      setCoverFile(file.originFileObj || file);
                      setCoverFileList(fileList);
                    } else {
                      setCoverFile(null);
                      setCoverFileList([]);
                    }
                  }}
                  fileList={coverFileList}
                  maxCount={1}
                  className="cover-upload-dragger"
                  showUploadList={{ showPreviewIcon: true }}
                >
                  {coverFileList.length === 0 && (
                    <>
                      <p className="ant-upload-drag-icon">
                        <FileImageOutlined className="text-4xl text-green-500" />
                      </p>
                      <p className="ant-upload-text font-semibold">
                        Upload Cover Image
                      </p>
                      <p className="ant-upload-hint text-gray-500">
                        PNG, JPG, WEBP (Max 5MB)
                      </p>
                    </>
                  )}
                </Upload.Dragger>
              </Form.Item>
            </div>
          </div>
        </Card>

        <Divider />

        {/* Category Section */}
        <Card className="mb-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Category Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="category"
              label={<span className="font-semibold">Category</span>}
              rules={[{ required: true, message: "Please select category" }]}
            >
              <Select
                placeholder="Select category"
                size="large"
                onChange={handleCategoryChange}
              >
                {categories.map((c) => (
                  <Option key={c._id} value={c._id}>
                    {c.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="subCategory"
              label={<span className="font-semibold">Sub Category</span>}
              rules={[{ required: true, message: "Please select sub-category" }]}
            >
              <Select placeholder="Select sub-category" size="large">
                {subCategories.map((s) => (
                  <Option key={s._id} value={s._id}>
                    {s.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>
        </Card>

        {/* Podcast Details Section */}
        <Card className="mb-4 shadow-sm">
          <h3 className="font-semibold text-lg mb-4">Podcast Details</h3>

          <div className="">
            

            <Form.Item
              name="title"
              label={<span className="font-semibold">Episode Title</span>}
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="Enter episode title" size="large" />
            </Form.Item>
          </div>

          <Form.Item
            name="description"
            label={<span className="font-semibold">Description</span>}
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea
              rows={4}
              placeholder="Write a compelling description for your podcast..."
              className="resize-none"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <Form.Item
  name="duration"
  label="Duration (custom format)"
  rules={[{ required: true }]}
>
  <Input readOnly size="large" />
</Form.Item>



            <Form.Item
              name="tags"
              label={
                <span className="font-semibold flex items-center gap-2">
                  <TagsOutlined className="text-blue-500" />
                  Tags
                </span>
              }
              rules={[{ required: true, message: "Please add tags" }]}
            >
              <Select
                mode="tags"
                placeholder="Add tags (press Enter to add)"
                size="large"
              />
            </Form.Item>
          </div>
        </Card>

        {/* Location Section */}
        <Card className="mb-4 shadow-sm border-l-4 border-l-green-500">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <EnvironmentOutlined className="text-green-500" />
            Location Information
          </h3>

          <Form.Item
            name="address"
            label={<span className="font-semibold">Address</span>}
            rules={[{ required: true, message: "Please enter address" }]}
          >
            <LoadScript
              googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
              libraries={libraries}
            >
              <Autocomplete
                onLoad={(ref) => (autocompleteRef.current = ref)}
                onPlaceChanged={onPlaceChanged}
              >
                <Input
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  placeholder="Search for a location..."
                  size="large"
                  prefix={<EnvironmentOutlined className="text-gray-400" />}
                />
              </Autocomplete>
            </LoadScript>
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="latitude"
              label={<span className="font-semibold">Latitude</span>}
              rules={[{ required: true, message: "Required" }]}
            >
              <Input readOnly disabled size="large" />
            </Form.Item>
            <Form.Item
              name="longitude"
              label={<span className="font-semibold">Longitude</span>}
              rules={[{ required: true, message: "Required" }]}
            >
              <Input readOnly disabled size="large" />
            </Form.Item>
          </div>
        </Card>

        {/* Progress Section */}
        {loading && (
          <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <Spin size="large" className="mb-3" />
              <p className="font-semibold text-lg text-blue-700 mb-3">
                {currentUploading}
              </p>
              <Progress
                percent={uploadProgress}
                status="active"
                strokeColor={{
                  "0%": "#1890ff",
                  "50%": "#722ed1",
                  "100%": "#52c41a",
                }}
                className="mb-2"
              />
              <p className="text-sm text-gray-600">
                Please don't close this window...
              </p>
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <Button
            type="default"
            size="large"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 border-none hover:from-blue-700 hover:to-purple-700"
            icon={loading ? <Spin /> : <CloudUploadOutlined />}
          >
            {loading ? "Adding Podcast..." : "Add Podcast"}
          </Button>
        </div>
      </Form>

      <style jsx>{`
        .podcast-upload-dragger .ant-upload-drag {
          border: 2px dashed #d9d9d9;
          border-radius: 8px;
          transition: all 0.3s;
        }
        .podcast-upload-dragger .ant-upload-drag:hover {
          border-color: #1890ff;
          background: #f0f7ff;
        }
        .cover-upload-dragger .ant-upload-drag {
          border-radius: 8px;
        }
      `}</style>
    </Modal>
  );
};

export default AddPodcast;