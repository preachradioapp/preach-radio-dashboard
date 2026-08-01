import { Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useState } from "react";
import { useResetPasswordMutation } from "../page/redux/api/userApi";

const ResetPass = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [resetPassword] = useResetPasswordMutation();

  const onFinish = (values) => {
    const data = {
      email: localStorage.getItem("email"),
      password: values?.password,
      confirmPassword: values?.confirmPassword,
      // token: localStorage.getItem("token"),
    };
    setLoading(true);
    resetPassword(data)
      .unwrap()
      .then((result) => {
        message.success(result?.message);
        navigate("/login");
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        message.error(error?.data?.message);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white p-20 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Reset Password
        </h2>
        <h3 className="text-[#333333] text-center mb-5">
          Your password must be 6-10 characters long.
        </h3>

        <Form
          name="reset-password"
          onFinish={onFinish}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Please set your password!" },
              {
                min: 6,
                max: 10,
                message: "Password must be 6-10 characters long!",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-[#02111E] rounded-md"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("The two passwords do not match!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="Re-enter your password"
              className="w-full px-4 py-2 border border-[#02111E] rounded-md"
            />
          </Form.Item>

          <Form.Item>
            <button
              type="submit"
              className="w-full py-2 bg-[#02111E] text-white rounded-md"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ResetPass;
