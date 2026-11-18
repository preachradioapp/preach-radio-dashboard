import { Alert, App, Button, Input } from "antd";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useResendResetCodeMutation, useVerifyResetOtpMutation } from "../../api/authApi";
import { getErrorMessage } from "../../lib/errors";
import AuthLayout from "./AuthLayout";
import { resetFlow } from "./resetFlow";

const RESEND_COOLDOWN = 60;

const VerifyCode = () => {
  const email = resetFlow.getEmail();
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [verify, { isLoading }] = useVerifyResetOtpMutation();
  const [resend, { isLoading: resending }] = useResendResetCodeMutation();

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  if (!email) return <Navigate to="/forgot-password" replace />;

  const submit = async () => {
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setError(null);
    try {
      await verify({ email, resetCode: code }).unwrap();
      navigate("/reset-password");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleResend = async () => {
    try {
      await resend({ email }).unwrap();
      message.success("A new code is on its way.");
      setCooldown(RESEND_COOLDOWN);
      setCode("");
    } catch (err) {
      message.error(getErrorMessage(err));
    }
  };

  return (
    <AuthLayout
      backTo="/forgot-password"
      title="Check your email"
      subtitle={
        <>
          We sent a 6-digit code to <span className="font-medium text-ink">{email}</span>. It expires in 5 minutes.
        </>
      }
    >
      {error && <Alert type="error" showIcon message={error} className="mb-5" />}
      <Input.OTP
        length={6}
        size="large"
        value={code}
        onChange={setCode}
        formatter={(v) => v.replace(/\D/g, "")}
        autoFocus
      />
      <Button type="primary" size="large" block className="mt-6" loading={isLoading} onClick={submit}>
        Verify code
      </Button>
      <p className="mt-6 text-center text-sm text-muted">
        Didn&apos;t get it?{" "}
        <Button type="link" className="!p-0" disabled={cooldown > 0} loading={resending} onClick={handleResend}>
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </Button>
      </p>
    </AuthLayout>
  );
};

export default VerifyCode;
