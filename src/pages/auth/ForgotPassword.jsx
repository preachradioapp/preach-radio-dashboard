import { Alert, Button, Form, Input } from "antd";
import { Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForgotPasswordMutation } from "../../api/authApi";
import { getErrorMessage } from "../../lib/errors";
import AuthLayout from "./AuthLayout";
import { resetFlow } from "./resetFlow";

const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const onFinish = async ({ email }) => {
    setError(null);
    const normalized = email.trim().toLowerCase();
    try {
      await forgotPassword({ email: normalized }).unwrap();
      resetFlow.setEmail(normalized);
      navigate("/verify-code");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      backTo="/login"
      title="Reset your password"
      subtitle="Enter the email linked to your admin account and we'll send you a 6-digit verification code."
    >
      {error && <Alert type="error" showIcon message={error} className="mb-5" />}
      <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large" initialValues={{ email: resetFlow.getEmail() }}>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Enter your email" },
            { type: "email", message: "Enter a valid email address" },
          ]}
        >
          <Input prefix={<Mail size={16} className="text-muted" />} placeholder="you@preachradio.com" autoComplete="email" autoFocus />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={isLoading}>
          Send code
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default ForgotPassword;
