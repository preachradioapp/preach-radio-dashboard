import React, { useEffect, useRef, useState } from "react";
import {
  Form,
  Input,
  Upload,
  message,
  Button,
  Spin,
} from "antd";
import {
  CameraOutlined,
} from "@ant-design/icons";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import {
  useGetStationQuery,
  useUpdateStationMutation,
} from "../redux/api/productManageApi";
import MyPodcast from "./MyPodcast";

const { TextArea } = Input;
const libraries = ["places"];

const Station = () => {
  const [addressValue, setAddressValue] = useState("");

  const [form] = Form.useForm();
  const autocompleteRef = useRef(null);

  const { data: stationRes, isLoading } = useGetStationQuery();
  const [updateStation, { isLoading: updating }] =
    useUpdateStationMutation();

  const station = stationRes?.data;

  const [profileFile, setProfileFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [profilePreview, setProfilePreview] = useState("");
  const [coverPreview, setCoverPreview] = useState("");

  /* ================= DEFAULT DATA ================= */
  useEffect(() => {
  if (station) {
    form.setFieldsValue({
      name: station.name,
      description: station.description,
      donationUrl: station.donationUrl,
      latitude: station.location?.coordinates?.[1],
      longitude: station.location?.coordinates?.[0],
      address: station.address,
    });

    setAddressValue(station.address || "");
    setProfilePreview(station.profile_image || "");
    setCoverPreview(station.cover_image || "");
  }
}, [station, form]);

  /* ================= GOOGLE ADDRESS ================= */
  const onPlaceChanged = () => {
  const place = autocompleteRef.current?.getPlace();
  if (!place?.geometry) return;

  const lat = place.geometry.location.lat();
  const lng = place.geometry.location.lng();
  const formattedAddress = place.formatted_address;

  // 🔥 update both
  setAddressValue(formattedAddress);

  form.setFieldsValue({
    address: formattedAddress,
    latitude: lat,
    longitude: lng,
  });
};

  /* ================= SUBMIT ================= */
  const onFinish = async (values) => {
    try {
      const formData = new FormData();

      const payload = {
        name: values.name,
        description: values.description,
        address: values.address,
        donationUrl: values.donationUrl,
        location: {
          type: "Point",
          coordinates: [values.longitude, values.latitude],
        },
      };

      formData.append("data", JSON.stringify(payload));
      if (profileFile) formData.append("profile_image", profileFile);
      if (coverFile) formData.append("cover_image", coverFile);

      await updateStation(formData).unwrap();
      message.success("Station updated successfully");
    } catch (err) {
      message.error(err?.data?.message || "Update failed");
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl">
      {/* ================= COVER + PROFILE ================= */}
      <div className="relative mb-20">
        {/* Cover */}
        <div className="h-80 w-full rounded-xl overflow-hidden bg-gray-200 relative">
          {coverPreview ? (
            <img
              src={coverPreview}
              className="w-full h-full object-cover"
              alt="cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Cover Image
            </div>
          )}

          <Upload
            showUploadList={false}
            beforeUpload={(file) => {
              setCoverFile(file);
              setCoverPreview(URL.createObjectURL(file));
              return false;
            }}
          >
            <button className="absolute bottom-3 right-3 bg-black/70 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <CameraOutlined /> Change Cover
            </button>
          </Upload>
        </div>

        {/* Profile */}
        <div className="absolute -bottom-14 left-6">
          <div className="relative w-28 h-28 rounded-full border-4 border-white overflow-hidden bg-gray-300">
            {profilePreview ? (
              <img
                src={profilePreview}
                className="w-full h-full object-cover"
                alt="profile"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm">
                No Image
              </div>
            )}

            <Upload
              showUploadList={false}
              beforeUpload={(file) => {
                setProfileFile(file);
                setProfilePreview(URL.createObjectURL(file));
                return false;
              }}
            >
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition cursor-pointer">
                <CameraOutlined className="text-white text-xl" />
              </div>
            </Upload>
          </div>
        </div>
      </div>

      {/* ================= FORM ================= */}
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item label="Station Name" name="name" required>
            <Input />
          </Form.Item>

          <Form.Item label="Donation URL" name="donationUrl">
            <Input />
          </Form.Item>

          {/* Google Address */}
          <Form.Item
  name="address"
  label="Address"
  className="md:col-span-2"
  required
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
        placeholder="Search station location"
        value={addressValue}
        onChange={(e) => setAddressValue(e.target.value)}
      />
    </Autocomplete>
  </LoadScript>
</Form.Item>


          <Form.Item label="Latitude" name="latitude" required>
            <Input readOnly />
          </Form.Item>

          <Form.Item label="Longitude" name="longitude" required>
            <Input readOnly />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            className="md:col-span-2"
          >
            <TextArea rows={3} />
          </Form.Item>
        </div>

        <Button
          htmlType="submit"
          loading={updating}
          className="mt-4 bg-black text-white"
        >
          Update Station
        </Button>
      </Form>

      {/* ================= PODCAST ================= */}
      <div className="mt-8">
        <MyPodcast />
      </div>
    </div>
  );
};

export default Station;
