import PropTypes from "prop-types";
import { Skeleton } from "antd";
import { Link } from "react-router-dom";
import { formatNumber } from "../../lib/format";

/** KPI tile. Number in ink; the icon chip carries the accent, never the value. */
const StatCard = ({ label, value, icon: Icon, hint, to, loading }) => {
  const body = (
    <div className="group h-full rounded-2xl border border-line bg-white p-5 shadow-card transition hover:border-zinc-300 hover:shadow-lift">
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-sm font-medium text-muted">{label}</span>
        {Icon && (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand">
            <Icon size={18} strokeWidth={1.8} />
          </span>
        )}
      </div>
      {/* value sits at the same height in every tile, with or without a hint */}
      <div className="mt-3 h-8">
        {loading ? (
          <Skeleton.Input active size="small" className="!h-8 !w-24" />
        ) : (
          <div className="text-[28px] font-semibold leading-8 tracking-tight text-ink tabular-nums">{formatNumber(value)}</div>
        )}
      </div>
      <div className="mt-2 min-h-[18px] truncate text-xs text-muted">{hint}</div>
    </div>
  );
  return to ? (
    <Link to={to} className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50">
      {body}
    </Link>
  ) : (
    body
  );
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  icon: PropTypes.elementType,
  hint: PropTypes.node,
  to: PropTypes.string,
  loading: PropTypes.bool,
};

export default StatCard;
