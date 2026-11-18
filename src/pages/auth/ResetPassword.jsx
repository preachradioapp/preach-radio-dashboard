import { Alert, App, Button, Form, Input } from "antd";
import { Lock } from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useResetPasswordMutation } from "../../api/authApi";
import { getErrorMessage } from "../../lib/errors";
import { passwordRules } from "../../lib/validation";
import AuthLayout from "./AuthLayout";
import { resetFlow } from "./resetFlow";

const ResetPassword = () => {
  const email = resetFlow.getEmail();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  if (!email) return <Navigate to="/forgot-password" replace />;

  const onFinish = async ({ password, confirmPassword }) => {
    setError(null);
    try {
      await resetPassword({ email, password, confirmPassword }).unwrap();
      resetFlow.clear();
      message.success("Password updated. Sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout title="Choose a new password" subtitle="Use at least 8 characters with a mix of letters and numbers.">
      {error && <Alert type="error" showIcon message={error} className="mb-5" />}
      <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
        <Form.Item name="password" label="New password" rules={passwordRules} hasFeedback>
          <Input.Password prefix={<Lock size={16} className="text-muted" />} autoComplete="new-password" autoFocus />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Confirm password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Confirm your password" },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue("password") === value
                  ? Promise.resolve()
                  : Promise.reject(new Error("Passwords don't match")),
            }),
          ]}
        >
          <Input.Password prefix={<Lock size={16} className="text-muted" />} autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={isLoading}>
          Update password
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default ResetPassword;
