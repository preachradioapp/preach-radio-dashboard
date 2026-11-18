import { useMemo } from "react";
import { useGetCategoriesQuery } from "../api/catalogApi";

/**
 * All categories (with their subcategories) for select inputs.
 * One shared, cached request — every form/filter that needs categories reuses it.
 */
export const useCategoryOptions = () => {
  const { data, isLoading } = useGetCategoriesQuery({ page: 1, limit: 200 });
  const categories = useMemo(() => data?.result ?? [], [data]);

  const options = useMemo(() => categories.map((c) => ({ value: c._id, label: c.name })), [categories]);

  const subOptionsFor = useMemo(() => {
    const map = new Map(categories.map((c) => [c._id, (c.subcategories ?? []).map((s) => ({ value: s._id, label: s.name }))]));
    return (categoryId) => map.get(categoryId) ?? [];
  }, [categories]);

  return { categories, options, subOptionsFor, isLoading };
};
