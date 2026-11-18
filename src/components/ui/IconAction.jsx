import PropTypes from "prop-types";
import { Button, Popconfirm, Tooltip } from "antd";

const tones = {
  neutral: "!text-ink-soft hover:!bg-canvas hover:!text-ink",
  brand: "!text-ink-soft hover:!bg-brand-50 hover:!text-brand",
  danger: "!text-ink-soft hover:!bg-red-50 hover:!text-danger",
  success: "!text-ink-soft hover:!bg-green-50 hover:!text-success",
};

/**
 * Compact icon button for table rows / cards, with tooltip and optional confirmation.
 * Pass `confirm` to wrap the click in a Popconfirm.
 */
const IconAction = ({ icon: Icon, label, onClick, tone = "neutral", confirm, loading, disabled }) => {
  const button = (
    <Button
      type="text"
      aria-label={label}
      loading={loading}
      disabled={disabled}
      onClick={confirm ? undefined : onClick}
      icon={<Icon size={17} strokeWidth={1.8} />}
      className={`!h-9 !w-9 !rounded-lg ${tones[tone]}`}
    />
  );

  const withConfirm = confirm ? (
    <Popconfirm
      title={confirm.title}
      description={confirm.description}
      okText={confirm.okText || "Confirm"}
      okButtonProps={{ danger: tone === "danger" }}
      onConfirm={onClick}
      placement="topRight"
    >
      {button}
    </Popconfirm>
  ) : (
    button
  );

  return <Tooltip title={label}>{withConfirm}</Tooltip>;
};

IconAction.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  tone: PropTypes.oneOf(["neutral", "brand", "danger", "success"]),
  confirm: PropTypes.shape({
    title: PropTypes.node.isRequired,
    description: PropTypes.node,
    okText: PropTypes.string,
  }),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
};

export default IconAction;
