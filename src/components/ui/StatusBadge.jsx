import PropTypes from "prop-types";

const tones = {
  success: "bg-green-50 text-green-700 ring-green-600/15",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/15",
  danger: "bg-red-50 text-red-700 ring-red-600/15",
  neutral: "bg-zinc-100 text-zinc-600 ring-zinc-500/15",
  brand: "bg-brand-50 text-brand ring-brand/15",
};

const StatusBadge = ({ tone = "neutral", children, dot = true }) => (
  <span
    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}
  >
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {children}
  </span>
);

StatusBadge.propTypes = {
  tone: PropTypes.oneOf(Object.keys(tones)),
  children: PropTypes.node,
  dot: PropTypes.bool,
};

export default StatusBadge;
