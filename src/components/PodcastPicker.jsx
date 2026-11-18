import PropTypes from "prop-types";
import { Select, Spin } from "antd";
import { useMemo, useState } from "react";
import { useGetPodcastsQuery } from "../api/mediaApi";
import { useDebouncedValue } from "../hooks/useDebouncedValue";

/**
 * Podcast select with server-side search (single or multiple).
 * `query` adds list filters (e.g. `{ type: "episode" }`).
 * `knownPodcasts` supplies labels for already-selected ids that aren't in the current search page.
 */
const PodcastPicker = ({ value, onChange, knownPodcasts = [], multiple = true, query }) => {
  const [search, setSearch] = useState("");
  const searchTerm = useDebouncedValue(search, 350);
  const { data, isFetching } = useGetPodcastsQuery({ page: 1, limit: 20, searchTerm, ...query });

  const options = useMemo(() => {
    const byId = new Map();
    [...knownPodcasts, ...(data?.result ?? [])].forEach((p) => {
      if (p?._id) byId.set(p._id, { value: p._id, label: p.title || "Untitled" });
    });
    return [...byId.values()];
  }, [data, knownPodcasts]);

  return (
    <Select
      mode={multiple ? "multiple" : undefined}
      allowClear
      value={value}
      onChange={(v) => onChange?.(v ?? (multiple ? [] : null))}
      options={options}
      filterOption={false}
      showSearch
      onSearch={setSearch}
      onBlur={() => setSearch("")}
      placeholder={multiple ? "Search and select podcasts" : "Search for an episode"}
      notFoundContent={isFetching ? <Spin size="small" /> : "No podcasts found"}
      maxTagCount="responsive"
    />
  );
};

PodcastPicker.propTypes = {
  value: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
  onChange: PropTypes.func,
  knownPodcasts: PropTypes.array,
  multiple: PropTypes.bool,
  query: PropTypes.object,
};

export default PodcastPicker;
