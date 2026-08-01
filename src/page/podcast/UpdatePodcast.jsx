import React, { useEffect, useRef, useState } from "react";
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
  DeleteOutlined,
  PlayCircleOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  AudioOutlined,
  EnvironmentOutlined,
  TagsOutlined,
  ClockCircleOutlined,
  EditOutlined,
} from "@ant-design/icons";
import {
  useAddGeneratePresignedUrlMutation,
  useGetCategroyAllSelectQuery,
  useGetStationQuery,
} from "../redux/api/productManageApi";
import {
  useAddPodcastMutation,
  useUpdatePodcastMutation,
} from "../redux/api/metaDataApi";
import axios from "axios";

const { Option } = Select;
const { TextArea } = Input;
const libraries = ["places"];

const UpdatePodcast = ({ editModal, setEditModal, selectedData }) => {
  const [form] = Form.useForm();
  const autocompleteRef = useRef(null);
  const { data: allStation } = useGetStationQuery();
  const [generateUrl] = useAddGeneratePresignedUrlMutation();
  const [updatePodcast] = useUpdatePodcastMutation();
  const { data: categoryData } = useGetCategroyAllSelectQuery({
    page: 1,
    limit: 100,
  });
const convertDurationCustom = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600);
  const remaining = totalSeconds % 3600;

  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);

  const totalMinutes = hours * 60 + minutes;

  if (seconds === 0) {
    return totalMinutes.toString();
  }

  return `${totalMinutes}.${seconds.toString().padStart(2, "0")}`;
};
const getMediaDuration = (file, type) => {
  return new Promise((resolve, reject) => {
    const media =
      type === "audio" ? document.createElement("audio") : document.createElement("video");

    media.preload = "metadata";
    media.src = URL.createObjectURL(file);

    media.onloadedmetadata = () => {
      URL.revokeObjectURL(media.src);
      resolve(media.duration); // seconds
    };

    media.onerror = () => reject("Cannot load media");
  });
};

  const categories = categoryData?.data?.result || [];
  const [subCategories, setSubCategories] = useState([]);

  const [podcastType, setPodcastType] = useState("audio");
  const [podcastUrl, setPodcastUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [newPodcastFile, setNewPodcastFile] = useState(null);
  const [newCoverFile, setNewCoverFile] = useState(null);
  const [podcastFileList, setPodcastFileList] = useState([]);
  const [coverFileList, setCoverFileList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentUploading, setCurrentUploading] = useState("");
  const [shopAddress, setShopAddress] = useState("");

  // Track initial values to detect changes
  const [initialValues, setInitialValues] = useState({});

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
    setLoading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      const dataPayload = {};
      let hasChanges = false;

      // Only add changed fields to dataPayload
      if (values.category !== initialValues.category) {
        dataPayload.category = values.category;
        hasChanges = true;
      }

      if (values.subCategory !== initialValues.subCategory) {
        dataPayload.subCategory = values.subCategory;
        hasChanges = true;
      }

      if (values.title !== initialValues.title) {
        dataPayload.title = values.title;
        hasChanges = true;
      }

      if (values.description !== initialValues.description) {
        dataPayload.description = values.description;
        hasChanges = true;
      }

      if (values.duration !== initialValues.duration) {
        dataPayload.duration = values.duration;
        hasChanges = true;
      }

      // Compare tags arrays
      if (JSON.stringify(values.tags) !== JSON.stringify(initialValues.tags)) {
        dataPayload.tags = values.tags;
        hasChanges = true;
      }

      if (values.address !== initialValues.address) {
        dataPayload.address = values.address;
        dataPayload.location = {
          type: "Point",
          coordinates: [values.longitude, values.latitude],
        };
        hasChanges = true;
      }

      // Handle podcast file update (only if new file uploaded)
      if (newPodcastFile) {
        setCurrentUploading(
          `Uploading ${podcastType === "audio" ? "Audio" : "Video"} Podcast...`
        );
        const finalPodcastUrl = await uploadWithPresignedUrl(
          newPodcastFile,
          podcastType === "audio" ? "podcast_audio" : "podcast_video",
          setUploadProgress
        );
        dataPayload.podcast_url = finalPodcastUrl;
        hasChanges = true;
        setUploadProgress(0);
      }

      // Handle cover image update (as binary in FormData, no presigned URL)
      if (newCoverFile) {
        setCurrentUploading("Uploading Cover Image...");
        setUploadProgress(70);
        formData.append("podcast_cover", newCoverFile);
        hasChanges = true;
      }

      // Check if there are any changes
      if (!hasChanges && !newCoverFile) {
        message.info("No changes detected");
        setLoading(false);
        return;
      }

      setCurrentUploading("Updating Podcast...");
      setUploadProgress(90);

      // Add station if needed
      if (allStation?.data?._id) {
        dataPayload.station = allStation.data._id;
      }

      // Append data payload to FormData
      formData.append("data", JSON.stringify(dataPayload));

      await updatePodcast({
        id: selectedData._id,
        body: formData,
      }).unwrap();

      setUploadProgress(100);
      message.success("Podcast updated successfully!");

      setTimeout(() => {
        setEditModal(false);
        form.resetFields();
        resetStates();
      }, 500);
    } catch (err) {
      message.error(err?.data?.message || "Update failed");
    } finally {
      setLoading(false);
      setUploadProgress(0);
      setCurrentUploading("");
    }
  };

  const resetStates = () => {
    setPodcastUrl("");
    setCoverUrl("");
    setNewPodcastFile(null);
    setNewCoverFile(null);
    setPodcastFileList([]);
    setCoverFileList([]);
    setSubCategories([]);
    setShopAddress("");
    setInitialValues({});
  };

  const handleCancel = () => {
    setEditModal(false);
    resetStates();
  };

  useEffect(() => {
    if (selectedData) {
      // Detect podcast type from URL
      const isPodcastVideo =
        selectedData.podcast_url?.includes("podcast_videos");
      setPodcastType(isPodcastVideo ? "video" : "audio");

      const formValues = {
        category: selectedData.category?._id,
        subCategory: selectedData.subCategory?._id,
        title: selectedData.title,
        description: selectedData.description,
        duration: selectedData.duration,
        tags: selectedData.tags,
        address: selectedData.address,
        latitude: selectedData.location?.coordinates[1],
        longitude: selectedData.location?.coordinates[0],
      };

      form.setFieldsValue(formValues);

      // Store initial values for comparison
      setInitialValues(formValues);

      setPodcastUrl(selectedData.podcast_url);
      setCoverUrl(selectedData.coverImage);
      setShopAddress(selectedData.address);

      // Set subcategories if category exists
      if (selectedData.category?._id && categories.length > 0) {
        const cat = categories.find(
          (c) => c._id === selectedData.category._id
        );
        setSubCategories(cat?.subcategories || []);
      }
    }
  }, [selectedData, categories]);

  return (
    <Modal
      open={editModal}
      footer={null}
      width={900}
      onCancel={handleCancel}
      style={{ top: 20 }}
      className="podcast-modal"
    >
      <div className="mb-6">
        <h2 className="text-center font-bold text-3xl bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Update Podcast
        </h2>
        <p className="text-center text-gray-500 mt-2">
          Modify only the fields you want to update
        </p>
      </div>

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        {/* Podcast Type Section */}
        <Card className="mb-4 shadow-sm border-l-4 border-l-orange-500">
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
                setNewPodcastFile(null);
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
            <EditOutlined className="text-orange-500" />
            Update Files (Optional - Upload only if you want to replace)
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
                {/* Current Podcast Preview */}
                {podcastUrl && !newPodcastFile && (
                  <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <PlayCircleOutlined className="text-blue-500" />
                      Current {podcastType}
                    </p>
                    {podcastType === "video" ? (
                      <video
                        src={podcastUrl}
                        controls
                        className="w-full rounded-lg shadow-sm"
                        style={{ maxHeight: "200px" }}
                      />
                    ) : (
                      <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                        <audio src={podcastUrl} controls className="w-full" />
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      {podcastUrl.split("/").pop()}
                    </p>
                  </div>
                )}

                {/* Upload New */}
               <Upload.Dragger
  accept={podcastType === "audio" ? "audio/*" : "video/*"}
  beforeUpload={() => false}
  onChange={async ({ file, fileList }) => {
    if (file.status === "removed") {
      setNewPodcastFile(null);
      setPodcastFileList([]);
      form.setFieldsValue({ duration: undefined });
      return;
    }

    const realFile = file.originFileObj || file;
    setNewPodcastFile(realFile);
    setPodcastFileList(fileList);

    try {
      const seconds = await getMediaDuration(realFile, podcastType);
      const customDuration = convertDurationCustom(seconds);

      form.setFieldsValue({
        duration: customDuration,
      });

      message.success(`Duration detected: ${customDuration}`);
    } catch {
      message.warning("Could not detect duration");
    }
  }}
  fileList={podcastFileList}
  maxCount={1}
>

                  <p className="ant-upload-drag-icon">
                    {podcastType === "audio" ? (
                      <AudioOutlined className="text-4xl text-purple-500" />
                    ) : (
                      <VideoCameraOutlined className="text-4xl text-red-500" />
                    )}
                  </p>
                  <p className="ant-upload-text font-semibold">
                    {newPodcastFile ? "✓ New file selected" : "Upload new"} {podcastType}
                  </p>
                  <p className="ant-upload-hint text-gray-500">
                    {podcastType === "audio"
                      ? "MP3, WAV, AAC"
                      : "MP4, AVI, MOV"}
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
                {/* Current Cover Preview */}
                {coverUrl && !newCoverFile && (
                  <div className="mb-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <p className="text-xs font-semibold text-gray-600 mb-2 flex items-center gap-1">
                      <FileImageOutlined className="text-green-500" />
                      Current Cover
                    </p>
                    <img
                      src={coverUrl}
                      alt="Current Cover"
                      className="w-full rounded-lg shadow-sm object-cover"
                      style={{ maxHeight: "200px" }}
                    />
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      {coverUrl.split("/").pop()}
                    </p>
                  </div>
                )}

                {/* Upload New */}
                <Upload.Dragger
                  accept="image/*"
                  listType="picture-card"
                  beforeUpload={() => false}
                  onChange={({ file, fileList }) => {
                    if (file.status !== "removed") {
                      setNewCoverFile(file.originFileObj || file);
                      setCoverFileList(fileList);
                      message.success("New cover image selected");
                    } else {
                      setNewCoverFile(null);
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
                        {newCoverFile ? "✓ New cover selected" : "Upload new cover"}
                      </p>
                      <p className="ant-upload-hint text-gray-500">
                        PNG, JPG, WEBP
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
              rules={[
                { required: true, message: "Please select sub-category" },
              ]}
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

          <Form.Item
            name="title"
            label={<span className="font-semibold">Episode Title</span>}
            rules={[{ required: true, message: "Please enter title" }]}
          >
            <Input placeholder="Enter episode title" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span className="font-semibold">Description</span>}
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea
              rows={4}
              placeholder="Update podcast description..."
              className="resize-none"
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
  name="duration"
  label={
    <span className="font-semibold flex items-center gap-2">
      <ClockCircleOutlined className="text-orange-500" />
      Duration (custom format)
    </span>
  }
  rules={[{ required: true, message: "Duration required" }]}
>
  <Input
    readOnly
    size="large"
    placeholder="Auto detected (e.g. 1.20 / 0.40 / 80)"
  />
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
              <Select mode="tags" placeholder="Update tags" size="large" />
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
          <Card className="mb-4 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
            <div className="text-center">
              <Spin size="large" className="mb-3" />
              <p className="font-semibold text-lg text-orange-700 mb-3">
                {currentUploading}
              </p>
              <Progress
                percent={uploadProgress}
                status="active"
                strokeColor={{
                  "0%": "#f97316",
                  "50%": "#dc2626",
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
            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 border-none hover:from-orange-700 hover:to-red-700"
            icon={loading ? <Spin /> : <EditOutlined />}
          >
            {loading ? "Updating..." : "Update Podcast"}
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
          border-color: #f97316;
          background: #fff7ed;
        }
        .cover-upload-dragger .ant-upload-drag {
          border-radius: 8px;
        }
      `}</style>
    </Modal>
  );
};

export default UpdatePodcast;