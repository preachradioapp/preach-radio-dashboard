import PropTypes from "prop-types";
import { Button, Skeleton, Spin } from "antd";
import { AlertTriangle, Inbox, RotateCw } from "lucide-react";
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

export const PageLoader = ({ fullScreen = false }) => (
  <div className={`grid place-items-center ${fullScreen ? "h-screen" : "min-h-[50vh]"}`}>
    <Spin size="large" />
  </div>
);

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
