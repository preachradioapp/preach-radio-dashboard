import PropTypes from "prop-types";
import { Button, Form, Modal } from "antd";

/**
 * The form lives in a child that mounts with the modal content (destroyOnClose), so every open
 * gets a brand-new form instance seeded from `initialValues` — no stale values between create/edit.
 * `children` may be a function receiving the form instance, for fields that need imperative updates.
 */
const FormBody = ({ initialValues, onSubmit, onCancel, submitting, submitText, children }) => {
  const [form] = Form.useForm();
  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      initialValues={initialValues}
      onFinish={onSubmit}
      disabled={submitting}
      scrollToFirstError
      className="pt-2"
    >
      {typeof children === "function" ? children(form) : children}
      <div className="-mx-6 -mb-5 mt-2 flex justify-end gap-2 border-t border-line-soft px-6 pb-5 pt-4">
        <Button onClick={onCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button type="primary" htmlType="submit" loading={submitting} disabled={false}>
          {submitText}
        </Button>
      </div>
    </Form>
  );
};

FormBody.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  submitting: PropTypes.bool,
  submitText: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

const FormModal = ({ open, title, subtitle, onCancel, width = 560, submitText = "Save", formKey, ...bodyProps }) => (
  <Modal
    open={open}
    onCancel={bodyProps.submitting ? undefined : onCancel}
    maskClosable={!bodyProps.submitting}
    closable={!bodyProps.submitting}
    keyboard={!bodyProps.submitting}
    width={width}
    destroyOnClose
    centered
    footer={null}
    title={
      <div>
        <div className="text-lg font-semibold text-ink">{title}</div>
        {subtitle && <div className="mt-0.5 text-sm font-normal text-muted">{subtitle}</div>}
      </div>
    }
  >
    <FormBody key={formKey} onCancel={onCancel} submitText={submitText} {...bodyProps} />
  </Modal>
);

FormModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  initialValues: PropTypes.object,
  submitting: PropTypes.bool,
  submitText: PropTypes.string,
  width: PropTypes.number,
  /** Change to re-seed the form (e.g. after the edited record finishes loading). */
  formKey: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default FormModal;
