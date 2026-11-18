import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/** Consistent page title row: optional back button, title, subtitle and right-side actions. */
const PageHeader = ({ title, subtitle, actions, back = false }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {back && (
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white text-ink-soft transition hover:border-brand/40 hover:text-brand"
          >
            <ArrowLeft size={18} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-[22px] font-semibold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  actions: PropTypes.node,
  back: PropTypes.bool,
};

export default PageHeader;
