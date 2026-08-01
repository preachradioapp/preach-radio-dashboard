import { Checkbox, Form, Input, message, Button } from "antd";
import { Link, redirect, useNavigate } from "react-router-dom";
import { useState } from "react";
import Swal from "sweetalert2";
import { useLoginAdminMutation } from "../page/redux/api/userApi";
import { useDispatch } from "react-redux";
import { setToken } from "../page/redux/features/auth/authSlice";

const Login = () => {
    const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loginAdmin] = useLoginAdminMutation();
  const onFinish = async (values) => {
    console.log(values);
     setLoading(true);
    loginAdmin(values)
      .unwrap()
      .then((payload) => {
        if (payload) {
          console.log(payload)
          dispatch(setToken(payload?.data?.accessToken));
          message.success(payload?.message);
          navigate("/");
        }
         setLoading(false);
      })
      .catch((error) => {
        console.error("Login error:", error);
        message.error(error?.data?.message);
         setLoading(false);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white p-20 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Sign In</h2>
        <Form
          name="basic"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          // onFinishFailed={onFinishFailed}
          autoComplete="off"
          layout="vertical"
        >
          
          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Please input your Email!",
              },
              {
                type: "email",
                message: "The input is not valid E-mail!",
              },
            ]}
          >
            <Input
              placeholder="Enter your Email"
              className="w-full px-4 py-2 border border-[#02111E] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Form.Item>

        
          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Please input your password!",
              },
            ]}
          >
            <Input.Password
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-[#02111E] rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </Form.Item>

          
          <div className="flex items-center justify-between mb-4">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-700">Remember me</Checkbox>
            </Form.Item>
            <Link
              to={"/forgetpassword"}
              className="text-sm text-black hover:underline focus:outline-none"
            >
              Forget password?
            </Link>
          </div>

        
          <Form.Item>
            <button
              type="submit"
              
              className="w-full py-2 bg-[#02111E] text-white rounded-md hover:bg-gray-800 focus:ring-2 focus:ring-gray-500"
              disabled={loading} 
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;
