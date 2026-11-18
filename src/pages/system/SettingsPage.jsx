import { Button, Form, Input, Skeleton, Tabs } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useChangePasswordMutation, useGetProfileQuery, useUpdateProfileMutation } from "../../api/authApi";
import ImageUpload from "../../components/ui/ImageUpload";
import PageHeader from "../../components/ui/PageHeader";
import { ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { buildFormData } from "../../lib/formData";
import { passwordRules, requiredText } from "../../lib/validation";
import { selectRole, setCredentials } from "../../store/authSlice";

const ProfileTab = () => {
  const { data: profile, isLoading, error, refetch } = useGetProfileQuery();
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation();
  const run = useAction();

  if (error) return <ErrorState error={error} onRetry={refetch} />;
  if (isLoading || !profile) return <Skeleton active avatar paragraph={{ rows: 4 }} />;

  const onFinish = ({ name, phone, avatar }) =>
    run(
      updateProfile(
        buildFormData({ name: name.trim(), phone: phone?.trim() ?? "" }, { profile_image: avatar instanceof File ? avatar : null })
      ),
      { success: "Profile updated" }
    );

  return (
    <Form
      key={profile.updatedAt}
      layout="vertical"
      requiredMark="optional"
      onFinish={onFinish}
      disabled={saving}
      initialValues={{ name: profile.name, email: profile.email, phone: profile.phone, avatar: profile.profile_image }}
      className="grid gap-x-8 md:grid-cols-[160px_1fr]"
    >
      <Form.Item name="avatar" label="Photo">
        <ImageUpload aspect="aspect-square" hint="Square image" />
      </Form.Item>
      <div>
        <Form.Item name="name" label="Full name" rules={requiredText("Name", { max: 80 })}>
          <Input autoComplete="name" />
        </Form.Item>
        <Form.Item name="email" label="Email" extra="Contact support to change the account email.">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone"
          rules={[{ pattern: /^$|^[+\d][\d\s()-]{5,20}$/, message: "Enter a valid phone number" }]}
        >
          <Input autoComplete="tel" inputMode="tel" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving} disabled={false}>
          Save profile
        </Button>
      </div>
    </Form>
  );
};

const PasswordTab = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const role = useSelector(selectRole);
  const run = useAction();

  const onFinish = async ({ oldPassword, newPassword, confirmNewPassword }) => {
    const res = await run(changePassword({ oldPassword, newPassword, confirmNewPassword }), { success: "Password changed" });
    if (res) {
      // Changing the password invalidates the old token; the backend returns a fresh one.
      if (res.data?.accessToken) dispatch(setCredentials({ accessToken: res.data.accessToken, role }));
      form.resetFields();
    }
  };

  return (
    <Form form={form} layout="vertical" requiredMark="optional" onFinish={onFinish} disabled={isLoading} className="max-w-md">
      <Form.Item name="oldPassword" label="Current password" rules={[{ required: true, message: "Enter your current password" }]}>
        <Input.Password autoComplete="current-password" />
      </Form.Item>
      <Form.Item
        name="newPassword"
        label="New password"
        dependencies={["oldPassword"]}
        rules={[
          ...passwordRules,
          ({ getFieldValue }) => ({
            validator: (_, v) =>
              v && v === getFieldValue("oldPassword")
                ? Promise.reject(new Error("New password must be different from the current one"))
                : Promise.resolve(),
          }),
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Form.Item
        name="confirmNewPassword"
        label="Confirm new password"
        dependencies={["newPassword"]}
        rules={[
          { required: true, message: "Confirm your new password" },
          ({ getFieldValue }) => ({
            validator: (_, v) =>
              !v || v === getFieldValue("newPassword") ? Promise.resolve() : Promise.reject(new Error("Passwords don't match")),
          }),
        ]}
      >
        <Input.Password autoComplete="new-password" />
      </Form.Item>
      <Button type="primary" htmlType="submit" loading={isLoading} disabled={false}>
        Update password
      </Button>
    </Form>
  );
};

const SettingsPage = () => (
  <>
    <PageHeader title="Settings" subtitle="Your administrator account." />
    <Surface className="max-w-4xl">
      <Tabs
        items={[
          { key: "profile", label: "Profile", children: <ProfileTab /> },
          { key: "password", label: "Password", children: <PasswordTab /> },
        ]}
      />
    </Surface>
  </>
);

export default SettingsPage;
