import PropTypes from "prop-types";
import { Component } from "react";
import { Button } from "antd";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";
import { AlertOctagon } from "lucide-react";

const Fallback = ({ title, detail, onReset }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
    <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-danger">
      <AlertOctagon size={30} strokeWidth={1.6} />
    </div>
    <h1 className="text-xl font-semibold text-ink">{title}</h1>
    <p className="mt-2 max-w-md text-sm text-muted">{detail}</p>
    <div className="mt-6 flex gap-2">
      {onReset && <Button onClick={onReset}>Try again</Button>}
      <Link to="/">
        <Button type="primary">Back to dashboard</Button>
      </Link>
    </div>
  </div>
);

Fallback.propTypes = { title: PropTypes.node, detail: PropTypes.node, onReset: PropTypes.func };

/** Catches render errors inside a page so the shell (sidebar/topbar) keeps working. */
class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error(error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <Fallback
          title="This page ran into a problem"
          detail="An unexpected error occurred while rendering. You can retry, or go back to the dashboard."
          onReset={() => this.setState({ error: null })}
        />
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = { children: PropTypes.node };

export const NotFound = () => (
  <Fallback title="Page not found" detail="The page you're looking for doesn't exist or was moved." />
);

/** Router-level `errorElement` (route loader errors, 404s, chunk load failures after a deploy). */
export const RouteError = () => {
  const error = useRouteError();
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />;
  const isChunkError = /dynamically imported module|Loading chunk/i.test(error?.message ?? "");
  return (
    <Fallback
      title={isChunkError ? "A new version is available" : "Something went wrong"}
      detail={
        isChunkError
          ? "The dashboard was updated. Reload to get the latest version."
          : "An unexpected error occurred. Please try again."
      }
      onReset={() => window.location.reload()}
    />
  );
};

export default ErrorBoundary;
