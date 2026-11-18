import PropTypes from "prop-types";
import { Input } from "antd";
import { Search } from "lucide-react";

const SearchInput = ({ value, onChange, placeholder = "Search…", className = "" }) => (
  <Input
    allowClear
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    prefix={<Search size={16} className="text-muted" />}
    className={`w-full sm:w-72 ${className}`}
    aria-label={placeholder}
  />
);

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  className: PropTypes.string,
};

export default SearchInput;
