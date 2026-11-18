import PropTypes from "prop-types";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Button, Skeleton } from "antd";
import { ExternalLink, Save } from "lucide-react";
import { CONTENT_PAGES, useGetContentPageQuery, useSaveContentPageMutation } from "../../api/adminApi";
import PageHeader from "../../components/ui/PageHeader";
import { ErrorState } from "../../components/ui/States";
import Surface from "../../components/ui/Surface";
import { useAction } from "../../hooks/useAction";
import { useUnsavedChangesPrompt } from "../../hooks/useUnsavedChangesPrompt";
import { formatDateTime } from "../../lib/format";
import { isBlankHtml, normalizeHtml } from "../../lib/html";

const JoditEditor = lazy(() => import("jodit-react"));

const PUBLIC_LINKS = { terms: "/terms-and-conditions", privacy: "/privacy-policy" };
const TOPBAR_HEIGHT = 64;

const EditorBody = ({ pageKey, initialHtml, updatedAt }) => {
  const label = CONTENT_PAGES[pageKey].label;
  const [saveContent, { isLoading }] = useSaveContentPageMutation();
  const run = useAction();

  // Jodit owns the document while editing. Its `value` is fixed at mount: changing it
  // later (e.g. after the post-save refetch) would reset the content and the cursor.
  const [editorValue] = useState(initialHtml);
  const [savedHtml, setSavedHtml] = useState(() => normalizeHtml(initialHtml));
  const [html, setHtml] = useState(() => normalizeHtml(initialHtml));
  const latest = useRef(html);

  const isEmpty = isBlankHtml(html);
  const dirty = html !== savedHtml;
  const isNew = !updatedAt && isBlankHtml(savedHtml);
  useUnsavedChangesPrompt(dirty);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: `Start writing the ${label}…`,
      // Grow with the content. The minimum height lives on the writing area (see
      // `.cms-editor` in index.css): Jodit's own minHeight pads the outer box instead,
      // leaving dead space under the status bar.
      height: "auto",
      minHeight: 0,
      toolbarAdaptive: false,
      // Keep the toolbar reachable while scrolling long legal documents.
      toolbarSticky: true,
      toolbarStickyOffset: TOPBAR_HEIGHT,
      showXPathInStatusbar: false,
      // Paste from Word / Google Docs as clean HTML instead of asking or keeping their styling.
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",
      buttons: [
        "paragraph",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "ul",
        "ol",
        "|",
        "link",
        "hr",
        "|",
        "align",
        "|",
        "undo",
        "redo",
        "|",
        "eraser",
        "fullsize",
      ],
    }),
    [label]
  );

  const save = useCallback(async () => {
    const content = normalizeHtml(latest.current);
    if (isBlankHtml(content)) return;
    const res = await run(saveContent({ key: pageKey, description: content }), { success: `${label} published` });
    if (res) setSavedHtml(content);
  }, [label, pageKey, run, saveContent]);

  // Ctrl/Cmd + S publishes.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !isEmpty && !isLoading) save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, isEmpty, isLoading, save]);

  const status = dirty ? (
    <span className="text-sm font-normal text-warning">Unsaved changes</span>
  ) : isNew ? (
    <span className="text-sm font-normal text-muted">Not published yet</span>
  ) : (
    <span className="text-sm font-normal text-muted">
      Published{updatedAt ? ` · last updated ${formatDateTime(updatedAt)}` : ""}
    </span>
  );

  return (
    <Surface
      title={status}
      extra={
        <Button
          type="primary"
          icon={<Save size={16} />}
          loading={isLoading}
          disabled={!dirty || isEmpty}
          onClick={save}
          title="Ctrl + S"
        >
          {isNew ? "Publish" : "Publish changes"}
        </Button>
      }
    >
      {isNew && (
        <Alert
          className="mb-4"
          type="info"
          showIcon
          message={`This page is empty. Write the ${label} below, then click Publish to make it visible in the apps.`}
        />
      )}
      <div className="cms-editor">
        <Suspense fallback={<Skeleton active paragraph={{ rows: 12 }} />}>
          <JoditEditor
            value={editorValue}
            config={config}
            onChange={(value) => {
              latest.current = value;
              setHtml(normalizeHtml(value));
            }}
          />
        </Suspense>
      </div>
      {dirty && isEmpty && <p className="mt-3 text-sm text-danger">The page can&apos;t be empty. Add some content before publishing.</p>}
    </Surface>
  );
};

EditorBody.propTypes = { pageKey: PropTypes.string.isRequired, initialHtml: PropTypes.string, updatedAt: PropTypes.string };

const ContentEditorPage = ({ pageKey }) => {
  const { data, isLoading, error, refetch } = useGetContentPageQuery(pageKey, { refetchOnMountOrArgChange: true });
  const meta = CONTENT_PAGES[pageKey];

  return (
    <>
      <PageHeader
        title={meta.label}
        subtitle="Shown to listeners and creators in the mobile apps."
        actions={
          PUBLIC_LINKS[pageKey] && (
            <a href={PUBLIC_LINKS[pageKey]} target="_blank" rel="noopener noreferrer">
              <Button icon={<ExternalLink size={15} />}>View public page</Button>
            </a>
          )
        }
      />
      {error ? (
        <Surface>
          <ErrorState error={error} onRetry={refetch} />
        </Surface>
      ) : isLoading ? (
        <Surface>
          <Skeleton active paragraph={{ rows: 12 }} />
        </Surface>
      ) : (
        <EditorBody key={pageKey} pageKey={pageKey} initialHtml={data?.description ?? ""} updatedAt={data?.updatedAt} />
      )}
    </>
  );
};

ContentEditorPage.propTypes = { pageKey: PropTypes.oneOf(Object.keys(CONTENT_PAGES)).isRequired };

export default ContentEditorPage;
