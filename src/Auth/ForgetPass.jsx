import { Form, Input, message } from "antd";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";  
import { useState } from "react";
import { useForgotPasswordMutation } from "../page/redux/api/userApi";
//fdgdfg
const ForgetPass = () => {
  const [loading, setLoading] = useState(false);
   const navigate = useNavigate();
  const [forgotPassword] = useForgotPasswordMutation();

  const onFinish = async (values) => {
    console.log(values);
setLoading(true);
    forgotPassword(values)
      .unwrap()
      .then((payload) => {
        message.success(payload?.message);
        navigate("/verify");
        setLoading(false);
        localStorage.setItem("email", values?.email);
      })
      .catch((error) => message.error(error?.data?.message));
      setLoading(false);
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white p-20 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold flex justify-center mb-6 text-gray-800">
          <span className="text-[#004466] text-4xl mr-2">
            <IoIosArrowRoundBack />
          </span>
          Forget Password
        </h2>
        <h3 className="text-center text-[#333333] mb-5">
          Please enter your email address to reset your password.
        </h3>
        <Form
          name="basic"
          onFinish={onFinish}
          
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please input your email!" },
              { type: "email", message: "Please enter a valid email address!" },
            ]}
          >
            <Input
              placeholder="Email"
              className="w-full px-4 py-2 border border-[#02111E] rounded-md"
            />
          </Form.Item>
          <Form.Item>
            <button
              type="submit"
              className="w-full py-2 bg-[#02111E] text-white rounded-md"
              disabled={loading}  
            >
              {loading ? "Sending OTP..." : "Send OTP"}  
             
            </button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default ForgetPass;
