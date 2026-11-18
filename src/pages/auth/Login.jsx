import { Alert, Button, Form, Input } from "antd";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../api/authApi";
import { getErrorMessage } from "../../lib/errors";
import { ADMIN_ROLES, setCredentials } from "../../store/authSlice";
import AuthLayout from "./AuthLayout";

const Login = () => {
  const [login, { isLoading }] = useLoginMutation();
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const onFinish = async ({ email, password }) => {
    setError(null);
    try {
      const res = await login({ email: email.trim(), password }).unwrap();
      const { accessToken, role } = res?.data ?? {};
      if (!accessToken) throw new Error("Unexpected response from server.");
      if (!ADMIN_ROLES.includes(role)) {
        setError("This account doesn't have access to the admin dashboard.");
        return;
      }
      dispatch(setCredentials({ accessToken, role }));
      const from = location.state?.from?.pathname;
      navigate(from && from !== "/login" ? from : "/", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, "Unable to sign in."));
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to the Preach Radio admin console.">
      {error && <Alert type="error" showIcon message={error} className="mb-5" />}
      <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large" disabled={isLoading}>
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
        <Form.Item
          name="password"
          label="Password"
          rules={[{ required: true, message: "Enter your password" }]}
          className="!mb-2"
        >
          <Input.Password prefix={<Lock size={16} className="text-muted" />} placeholder="••••••••" autoComplete="current-password" />
        </Form.Item>
        <div className="mb-6 flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-brand hover:text-brand-600">
            Forgot password?
          </Link>
        </div>
        <Button type="primary" htmlType="submit" block loading={isLoading}>
          Sign in
        </Button>
      </Form>
    </AuthLayout>
  );
};

export default Login;
