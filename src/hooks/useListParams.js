import { useCallback, useMemo, useState } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

/**
 * Shared state for server-side paginated + searchable lists.
 * - search input is debounced so we don't fire a request per keystroke
 * - changing search or filters resets to page 1
 */
export const useListParams = ({ limit: initialLimit = 10, filters: initialFilters = {} } = {}) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);
  const [search, setSearchRaw] = useState("");
  const [filters, setFiltersRaw] = useState(initialFilters);
  const searchTerm = useDebouncedValue(search.trim(), 400);

  const setSearch = useCallback((value) => {
    setSearchRaw(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((key, value) => {
    setFiltersRaw((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const onPageChange = useCallback((nextPage, nextLimit) => {
    setPage(nextPage);
    if (nextLimit) setLimit(nextLimit);
  }, []);

  const queryArgs = useMemo(
    () => ({ page, limit, searchTerm, ...filters }),
    [page, limit, searchTerm, filters]
  );

  return { page, limit, search, setSearch, filters, setFilter, onPageChange, setPage, queryArgs };
};
