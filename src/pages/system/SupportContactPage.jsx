import { Button, Form, Input, Skeleton } from "antd";
import { Mail, Phone } from "lucide-react";
import { useGetContactInfoQuery, useSaveContactInfoMutation } from "../../api/adminApi";
import PageHeader from "../../components/ui/PageHeader";
import { ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";

const SupportContactPage = () => {
  const { data, isLoading, error, refetch } = useGetContactInfoQuery();
  const [save, { isLoading: saving }] = useSaveContactInfoMutation();
  const run = useAction();

  const onFinish = ({ email, phone_number }) =>
    run(save({ id: data?._id, email: email.trim(), phone_number: phone_number.trim() }), { success: "Support contact saved" });

  return (
    <>
      <PageHeader title="Support contact" subtitle="How listeners and creators can reach the Preach Radio team." />
      <Surface className="max-w-2xl">
        {error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : isLoading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : (
          <Form
            key={data?._id || "new"}
            layout="vertical"
            requiredMark="optional"
            onFinish={onFinish}
            disabled={saving}
            initialValues={{ email: data?.email, phone_number: data?.phone_number }}
          >
            <Form.Item
              name="email"
              label="Support email"
              rules={[
                { required: true, message: "Enter an email" },
                { type: "email", message: "Enter a valid email" },
              ]}
            >
              <Input prefix={<Mail size={15} className="text-muted" />} placeholder="support@preachradio.com" />
            </Form.Item>
            <Form.Item
              name="phone_number"
              label="Support phone"
              rules={[
                { required: true, whitespace: true, message: "Enter a phone number" },
                { pattern: /^[+\d][\d\s()-]{5,20}$/, message: "Enter a valid phone number" },
              ]}
            >
              <Input prefix={<Phone size={15} className="text-muted" />} placeholder="+1 555 000 0000" inputMode="tel" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={saving} disabled={false}>
              Save contact details
            </Button>
          </Form>
        )}
      </Surface>
    </>
  );
};

export default SupportContactPage;
