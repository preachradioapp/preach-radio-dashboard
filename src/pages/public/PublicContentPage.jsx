import PropTypes from "prop-types";
import DOMPurify from "dompurify";
import { useMemo } from "react";
import { Skeleton } from "antd";
import { CONTENT_PAGES, useGetContentPageQuery } from "../../api/adminApi";
import { ErrorState } from "../../components/ui/States";
import { formatDate } from "../../lib/format";
import logo from "../../assets/header/logo.png";

/** Public (unauthenticated) Terms / Privacy pages linked from the app stores and mobile apps. */
const PublicContentPage = ({ pageKey }) => {
  const { data, isLoading, error, refetch } = useGetContentPageQuery(pageKey);
  const html = useMemo(() => DOMPurify.sanitize(data?.description ?? ""), [data?.description]);
  const title = CONTENT_PAGES[pageKey].label;

  return (
    <div className="min-h-screen bg-canvas">
      <header className="bg-sidebar">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <img src={logo} alt="Preach Radio" className="h-10 w-auto" />
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
        {data?.updatedAt && <p className="mt-2 text-sm text-muted">Last updated {formatDate(data.updatedAt)}</p>}
        <article className="mt-8 rounded-2xl border border-line bg-white p-6 shadow-card sm:p-10">
          {error ? (
            <ErrorState error={error} onRetry={refetch} />
          ) : isLoading ? (
            <Skeleton active paragraph={{ rows: 12 }} />
          ) : html ? (
            <div className="prose-content" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <p className="text-muted">This page hasn&apos;t been published yet.</p>
          )}
        </article>
      </main>
    </div>
  );
};

PublicContentPage.propTypes = { pageKey: PropTypes.oneOf(["terms", "privacy", "about"]).isRequired };

export default PublicContentPage;
