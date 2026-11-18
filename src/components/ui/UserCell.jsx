import PropTypes from "prop-types";
import { Avatar } from "antd";
import { initials } from "../../lib/format";

/** Avatar + name + secondary line. Falls back to initials (no third-party avatar services). */
const UserCell = ({ name, subtitle, image, size = 38 }) => (
  <div className="flex min-w-0 items-center gap-3">
    <Avatar
      src={image || undefined}
      size={size}
      className="shrink-0 !bg-brand-50 !font-semibold !text-brand"
    >
      {initials(name)}
    </Avatar>
    <div className="min-w-0">
      <div className="truncate font-medium text-ink">{name || "Unnamed"}</div>
      {subtitle && <div className="truncate text-xs text-muted">{subtitle}</div>}
    </div>
  </div>
);

UserCell.propTypes = {
  name: PropTypes.string,
  subtitle: PropTypes.node,
  image: PropTypes.string,
  size: PropTypes.number,
};

export default UserCell;
