/**
 * An empty block the editor leaves behind: <p><br></p>, <p>&nbsp;</p>, <p></p>, <div><br></div>…
 * `\1` must refer to the tag name, so the tag is the first (and only) capturing group.
 */
const EMPTY_BLOCK = String.raw`<(p|div|h[1-6])(?:\s[^>]*)?>(?:\s|&nbsp;|<br\s*\/?>)*<\/\1>`;
const LEADING_EMPTY = new RegExp(`^${EMPTY_BLOCK}`, "i");
const TRAILING_EMPTY = new RegExp(`${EMPTY_BLOCK}$`, "i");

/**
 * Normalises editor HTML before saving or comparing:
 * trims empty paragraphs at the start and end (keeps intentional spacing in between).
 */
export const normalizeHtml = (html = "") => {
  let out = String(html ?? "").trim();
  let prev;
  do {
    prev = out;
    out = out.replace(LEADING_EMPTY, "").trim();
    out = out.replace(TRAILING_EMPTY, "").trim();
  } while (out !== prev);
  return out;
};

/** True when the HTML has no visible text and no media (images/embeds/rules count as content). */
export const isBlankHtml = (html = "") => {
  const s = String(html ?? "");
  if (/<(img|iframe|video|audio|hr|table)\b/i.test(s)) return false;
  const text = s
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .trim();
  return text.length === 0;
};
