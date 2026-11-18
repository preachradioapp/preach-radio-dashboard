/**
 * Builds the multipart payload the backend expects:
 *   - JSON fields serialised under the `data` key (parsed server side)
 *   - files appended under their own field names
 *
 * `files` is a map of fieldName -> File | File[] | null. Null/undefined entries are skipped,
 * so callers can pass "only if changed" files without branching.
 */
export const buildFormData = (data = {}, files = {}) => {
  const formData = new FormData();
  formData.append("data", JSON.stringify(stripUndefined(data)));

  Object.entries(files).forEach(([field, value]) => {
    const list = Array.isArray(value) ? value : [value];
    list.filter((file) => file instanceof Blob).forEach((file) => formData.append(field, file));
  });

  return formData;
};

export const stripUndefined = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));

/** Builds a query string, dropping empty values (avoids `searchTerm=undefined`). */
export const toQueryString = (params = {}) => {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    qs.append(key, String(value));
  });
  const str = qs.toString();
  return str ? `?${str}` : "";
};
