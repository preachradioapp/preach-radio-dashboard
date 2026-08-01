import { useState } from "react";
import OtpInput from "react-otp-input";
import { useNavigate } from "react-router-dom";
import {
  useResentHitMutation,
  useVerifyOtpMutation,
} from "../page/redux/api/userApi";
import { message } from "antd";

const Verify = () => {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifyOtp] = useVerifyOtpMutation();
  const [resendVerifyOtp] = useResentHitMutation();
  const navigate = useNavigate();
  const handleVerify = () => {
    const data = {
      resetCode: Number(otp),
      email: localStorage.getItem("email"),
    };
    setLoading(true);
    verifyOtp(data)
      .unwrap()
      .then((response) => {
        setLoading(false);
        message.success(response?.message);
        navigate("/reset");
        localStorage.setItem("token", response?.passwordResetToken);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        message.error(error?.data?.message);
      });
  };

  const handleResend = () => {
    const data = {
      email: localStorage.getItem("email"),
      // type: "forgot_password",
    };

    resendVerifyOtp(data)
      .unwrap()
      .then((response) => {
        message.success(response.message);
      })
      .catch((error) => {
        console.error(error);
        message.error(error?.data?.message);
      });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <div className="bg-white p-20 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Verify Email
        </h2>
        <h3 className="text-[#333333] text-center mb-5">
          Please enter the OTP sent to your email.
        </h3>
        <div className="flex justify-center mb-5">
          <OtpInput
            value={otp}
            onChange={setOtp}
            numInputs={6}
            renderSeparator={<span className="mx-1"></span>}
            renderInput={(props) => (
              <input
                {...props}
                className="w-16 h-16 text-center text-lg border border-black rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                style={{ width: "40px", height: "50px" }}
              />
            )}
          />
        </div>
        <button
          onClick={handleVerify}
          className="w-full py-2 bg-[#02111E] text-white rounded-md"
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        <span className="flex justify-center ">
          You have not received the email?{" "}
          <span
            onClick={handleResend}
            className="text-blue-600 cursor-pointer pl-2"
          >
            Resend
          </span>
        </span>
      </div>
    </div>
  );
};

export default Verify;
