import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDebouncedValue } from "./useDebouncedValue";
import { useListParams } from "./useListParams";

describe("useDebouncedValue", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("only updates after the delay", () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: "a" } });
    rerender({ v: "ab" });
    rerender({ v: "abc" });
    expect(result.current).toBe("a");
    act(() => vi.advanceTimersByTime(300));
    expect(result.current).toBe("abc");
  });
});

describe("useListParams", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("debounces and trims search, and resets to page 1", () => {
    const { result } = renderHook(() => useListParams({ limit: 12 }));
    act(() => result.current.onPageChange(4));
    expect(result.current.queryArgs.page).toBe(4);

    act(() => result.current.setSearch("  grace "));
    expect(result.current.page).toBe(1);
    expect(result.current.queryArgs.searchTerm).toBe(""); // not yet debounced
    act(() => vi.advanceTimersByTime(400));
    expect(result.current.queryArgs).toMatchObject({ page: 1, limit: 12, searchTerm: "grace" });
  });

  it("applies filters and resets the page", () => {
    const { result } = renderHook(() => useListParams({ filters: { isApproved: undefined } }));
    act(() => result.current.onPageChange(3, 20));
    expect(result.current.limit).toBe(20);
    act(() => result.current.setFilter("isApproved", false));
    expect(result.current.queryArgs).toMatchObject({ page: 1, limit: 20, isApproved: false });
  });

  it("keeps queryArgs referentially stable between unrelated renders", () => {
    const { result, rerender } = renderHook(() => useListParams());
    const first = result.current.queryArgs;
    rerender();
    expect(result.current.queryArgs).toBe(first);
  });
});
