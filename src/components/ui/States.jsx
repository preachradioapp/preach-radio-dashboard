import PropTypes from "prop-types";
import { useId } from "react";
import { Button, Skeleton } from "antd";
import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
import logo from "../../assets/header/logo.png";
import { getErrorMessage } from "../../lib/errors";

export const EmptyState = ({ title = "Nothing here yet", description, action, icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-canvas text-muted">
      <Icon size={26} strokeWidth={1.6} />
    </div>
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
    {action && <div className="mt-5">{action}</div>}
  </div>
);

EmptyState.propTypes = {
  title: PropTypes.node,
  description: PropTypes.node,
  action: PropTypes.node,
  icon: PropTypes.elementType,
};

export const ErrorState = ({ error, onRetry, title = "We couldn't load this" }) => (
  <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
    <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-danger">
      <AlertTriangle size={26} strokeWidth={1.6} />
    </div>
    <h3 className="text-base font-semibold text-ink">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-muted">{getErrorMessage(error)}</p>
    {onRetry && (
      <Button className="mt-5" icon={<RotateCw size={15} />} onClick={onRetry}>
        Try again
      </Button>
    )}
  </div>
);

ErrorState.propTypes = {
  error: PropTypes.any,
  onRetry: PropTypes.func,
  title: PropTypes.node,
};

/**
 * Brand loader: the logo on a dark tile inside a spinning ring, with a radio wave below.
 * Styles live in index.html so the identical loader also shows before the app's JS loads.
 * It fades in after a short delay, so fast loads don't flash it.
 */
export const PageLoader = ({ fullScreen = false }) => {
  const gradientId = useId();
  return (
    <div className={`pr-loader ${fullScreen ? "pr-loader--full" : "pr-loader--inline"}`} role="status" aria-label="Loading">
      <div className="pr-loader__stage">
        <div className="pr-loader__glow" />
        <svg className="pr-loader__ring" viewBox="0 0 132 132" aria-hidden="true">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#e63946" stopOpacity="0" />
              <stop offset="1" stopColor="#e63946" />
            </linearGradient>
          </defs>
          <circle cx="66" cy="66" r="62" fill="none" stroke="rgba(230,57,70,0.1)" strokeWidth="3" />
          <circle cx="66" cy="66" r="62" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" strokeDasharray="120 270" />
        </svg>
        <div className="pr-loader__tile">
          <img src={logo} alt="Preach Radio" />
        </div>
      </div>
      <div className="pr-loader__wave" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
    </div>
  );
};

PageLoader.propTypes = { fullScreen: PropTypes.bool };

export const CardGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="overflow-hidden rounded-2xl border border-line bg-white">
        <Skeleton.Image active className="!h-44 !w-full" />
        <div className="p-4">
          <Skeleton active paragraph={{ rows: 2 }} />
        </div>
      </div>
    ))}
  </div>
);

CardGridSkeleton.propTypes = { count: PropTypes.number };
