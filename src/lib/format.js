import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export const formatDate = (value, pattern = "DD MMM YYYY") =>
  value && dayjs(value).isValid() ? dayjs(value).format(pattern) : "—";

export const formatDateTime = (value) => formatDate(value, "DD MMM YYYY, h:mm A");

export const fromNow = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).fromNow() : "—";

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const plain = new Intl.NumberFormat("en");

export const formatNumber = (value, { compactAbove = 10000 } = {}) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "0";
  return Math.abs(n) >= compactAbove ? compact.format(n) : plain.format(n);
};

export const formatCurrency = (value, currency = "USD") =>
  new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(
    Number(value) || 0
  );

/** Seconds → "1:02:05" / "4:07". */
export const formatDuration = (totalSeconds) => {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

/**
 * Podcast `duration` keeps the format this dashboard has always written so existing data and the
 * mobile apps are unaffected: minutes with seconds as the two decimals (4m 07s → 4.07).
 */
export const toStoredDuration = (totalSeconds) => {
  const s = Math.max(0, Math.round(Number(totalSeconds) || 0));
  return Number(`${Math.floor(s / 60)}.${String(s % 60).padStart(2, "0")}`);
};

export const storedDurationLabel = (value) => {
  if (value === undefined || value === null || value === "") return "—";
  const [m, sec = "0"] = String(value).split(".");
  const seconds = Number(sec.padEnd(2, "0").slice(0, 2));
  return formatDuration(Number(m) * 60 + seconds);
};

export const initials =(name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "?";

/** Prefers the unambiguous `durationSeconds`; falls back to the legacy `duration` format. */
export const podcastDurationLabel = (podcast) =>
  Number.isFinite(podcast?.durationSeconds)
    ? formatDuration(podcast.durationSeconds)
    : storedDurationLabel(podcast?.duration);

export const pluralize =(count, singular, plural = `${singular}s`) =>
  `${formatNumber(count)} ${count === 1 ? singular : plural}`;

/** Row number that survives pagination. */
export const rowNumber = (index, page, limit) => (page - 1) * limit + index + 1;
