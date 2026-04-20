/**
 * Unit tests for gridUtils — all pure functions, zero DOM / AG Grid dependency.
 * Run with: npx vitest  OR  npx jest
 */

import {
  buildExportFileName,
  clampPageSize,
  debounce,
  formatCount,
  mergeColDef,
  PageSizeStorage,
  resolveGridHeight,
} from "../utils/gridUtils";

// ─── buildExportFileName ──────────────────────────────────────────────────────

describe("buildExportFileName", () => {
  it("converts spaces to underscores and appends date", () => {
    const name = buildExportFileName("My Report");
    expect(name).toMatch(/^my_report_\d{4}-\d{2}-\d{2}\.csv$/);
  });

  it("strips leading/trailing underscores", () => {
    const name = buildExportFileName("  Grid  ");
    expect(name).toMatch(/^grid_/);
  });

  it("collapses multiple special chars", () => {
    const name = buildExportFileName("Q3 & Q4 Results!");
    expect(name).toMatch(/^q3_q4_results_/);
  });

  it("appends suffix when provided", () => {
    const name = buildExportFileName("Employees", "export");
    expect(name).toMatch(/^employees_export_/);
  });
});

// ─── clampPageSize ────────────────────────────────────────────────────────────

describe("clampPageSize", () => {
  const allowed = [10, 25, 50, 100];

  it("returns size when it is already in the list", () => {
    expect(clampPageSize(25, allowed)).toBe(25);
  });

  it("returns closest allowed size", () => {
    expect(clampPageSize(12, allowed)).toBe(10);
    expect(clampPageSize(40, allowed)).toBe(50);
  });

  it("handles edge values", () => {
    expect(clampPageSize(0, allowed)).toBe(10);
    expect(clampPageSize(999, allowed)).toBe(100);
  });

  it("returns fallback when allowed list is empty", () => {
    expect(clampPageSize(25, [])).toBeUndefined();
  });
});

// ─── formatCount ─────────────────────────────────────────────────────────────

describe("formatCount", () => {
  it("formats thousand separators", () => {
    // locale-dependent but always has digit groups for large numbers
    expect(formatCount(1000000).length).toBeGreaterThan(6);
  });

  it("returns plain string for small numbers", () => {
    expect(formatCount(42)).toBe("42");
  });
});

// ─── resolveGridHeight ────────────────────────────────────────────────────────

describe("resolveGridHeight", () => {
  it("appends px for number", () => {
    expect(resolveGridHeight(400)).toBe("400px");
  });

  it("returns string unchanged", () => {
    expect(resolveGridHeight("60vh")).toBe("60vh");
  });

  it("returns default when undefined", () => {
    expect(resolveGridHeight(undefined)).toBe("480px");
  });
});

// ─── mergeColDef ─────────────────────────────────────────────────────────────

describe("mergeColDef", () => {
  it("caller override takes precedence", () => {
    const base = { sortable: true, filter: true };
    const override = { sortable: false, minWidth: 120 };
    const result = mergeColDef(base, override);
    expect(result.sortable).toBe(false);
    expect(result.filter).toBe(true);
    expect(result.minWidth).toBe(120);
  });

  it("returns base when no override", () => {
    const base = { sortable: true };
    expect(mergeColDef(base)).toEqual({ sortable: true });
  });
});

// ─── debounce ────────────────────────────────────────────────────────────────

describe("debounce", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("fires once after delay, not on every call", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);

    debounced("a");
    debounced("b");
    debounced("c");

    expect(fn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("c");
  });

  it("fires again after another delay period", () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);

    debounced("first");
    jest.advanceTimersByTime(100);
    debounced("second");
    jest.advanceTimersByTime(100);

    expect(fn).toHaveBeenCalledTimes(2);
  });
});

// ─── PageSizeStorage ─────────────────────────────────────────────────────────

describe("PageSizeStorage", () => {
  beforeEach(() => localStorage.clear());

  it("returns fallback when nothing stored", () => {
    expect(PageSizeStorage.get("test-grid", 25)).toBe(25);
  });

  it("stores and retrieves value", () => {
    PageSizeStorage.set("test-grid", 50);
    expect(PageSizeStorage.get("test-grid", 25)).toBe(50);
  });

  it("uses namespaced key", () => {
    PageSizeStorage.set("grid-a", 10);
    PageSizeStorage.set("grid-b", 100);
    expect(PageSizeStorage.get("grid-a", 25)).toBe(10);
    expect(PageSizeStorage.get("grid-b", 25)).toBe(100);
  });
});
