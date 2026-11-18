import PropTypes from "prop-types";
import { Segmented } from "antd";

/** All / Published / Hidden filter for moderated content lists. `undefined` = all. */
const StatusFilter = ({ value, onChange }) => (
  <Segmented
    value={value ?? "all"}
    onChange={(v) => onChange(v === "all" ? undefined : v)}
    options={[
      { value: "all", label: "All" },
      { value: "published", label: "Published" },
      { value: "hidden", label: "Hidden" },
    ]}
  />
);

StatusFilter.propTypes = { value: PropTypes.string, onChange: PropTypes.func.isRequired };

export default StatusFilter;
