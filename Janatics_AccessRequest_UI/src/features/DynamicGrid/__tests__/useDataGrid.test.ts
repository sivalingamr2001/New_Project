/**
 * Tests for useDataGrid hook — uses React Testing Library + renderHook.
 * Run with: npx vitest  OR  npx jest --env jsdom
 */

import { renderHook, act } from "@testing-library/react";
import { useDataGrid } from "../hooks/useDataGrid";
import type { DataGridProps } from "../types/DataGrid.types";

// ─── Mock AG Grid API ─────────────────────────────────────────────────────────

const createMockApi = (overrides: Record<string, jest.Mock> = {}) => ({
  setGridOption: jest.fn(),
  setFilterModel: jest.fn(),
  getFilterModel: jest.fn(() => ({})),
  getSelectedRows: jest.fn(() => []),
  getDisplayedRowCount: jest.fn(() => 3),
  exportDataAsCsv: jest.fn(),
  refreshCells: jest.fn(),
  paginationGetCurrentPage: jest.fn(() => 0),
  paginationGetTotalPages: jest.fn(() => 1),
  sizeColumnsToFit: jest.fn(),
  ...overrides,
});

// ─── Test data ────────────────────────────────────────────────────────────────

const mockRows = [
  { id: 1, name: "Alice", dept: "Eng" },
  { id: 2, name: "Bob", dept: "HR" },
  { id: 3, name: "Carol", dept: "Eng" },
];

const defaultProps: DataGridProps<typeof mockRows[0]> = {
  rowData: mockRows,
  columnDefs: [
    { field: "id" },
    { field: "name" },
    { field: "dept" },
  ],
  title: "Test Grid",
  onRefresh: jest.fn(),
  onSelectionChanged: jest.fn(),
  onExport: jest.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("useDataGrid", () => {
  it("initialises with correct row count from rowData", () => {
    const { result } = renderHook(() => useDataGrid(defaultProps));
    expect(result.current.state.totalRows).toBe(3);
  });

  it("onQuickFilterChange updates quickFilter state", () => {
    const { result } = renderHook(() => useDataGrid(defaultProps));

    act(() => {
      result.current.handlers.onQuickFilterChange("Alice");
    });

    expect(result.current.state.quickFilter).toBe("Alice");
  });

  it("onClearFilters resets quickFilter", () => {
    const { result } = renderHook(() => useDataGrid(defaultProps));

    act(() => {
      result.current.handlers.onQuickFilterChange("test");
    });
    expect(result.current.state.quickFilter).toBe("test");

    // Attach mock API before clearing
    const mockApi = createMockApi();
    (result.current.gridApiRef as React.MutableRefObject<unknown>).current = mockApi;

    act(() => {
      result.current.handlers.onClearFilters();
    });

    expect(result.current.state.quickFilter).toBe("");
    expect(mockApi.setFilterModel).toHaveBeenCalledWith(null);
  });

  it("onRefresh sets isRefreshing to true then false", async () => {
    jest.useFakeTimers();
    const onRefresh = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useDataGrid({ ...defaultProps, onRefresh })
    );

    const mockApi = createMockApi();
    (result.current.gridApiRef as React.MutableRefObject<unknown>).current = mockApi;

    await act(async () => {
      result.current.handlers.onRefresh();
    });

    expect(result.current.state.isRefreshing).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(400);
    });

    expect(result.current.state.isRefreshing).toBe(false);
    jest.useRealTimers();
  });

  it("onExportCsv calls API exportDataAsCsv", () => {
    const { result } = renderHook(() => useDataGrid(defaultProps));
    const mockApi = createMockApi();
    (result.current.gridApiRef as React.MutableRefObject<unknown>).current = mockApi;

    act(() => {
      result.current.handlers.onExportCsv();
    });

    expect(mockApi.exportDataAsCsv).toHaveBeenCalledWith(
      expect.objectContaining({ fileName: expect.stringMatching(/test_grid/) })
    );
  });

  it("onSelectionChanged updates selectedCount and calls prop callback", () => {
    const onSelectionChanged = jest.fn();
    const { result } = renderHook(() =>
      useDataGrid({ ...defaultProps, onSelectionChanged })
    );

    const selected = [mockRows[0], mockRows[1]];
    const mockApi = createMockApi({ getSelectedRows: jest.fn(() => selected) });

    act(() => {
      result.current.handlers.onSelectionChanged({
        api: mockApi,
      } as unknown as import("ag-grid-community").SelectionChangedEvent);
    });

    expect(result.current.state.selectedCount).toBe(2);
    expect(onSelectionChanged).toHaveBeenCalledWith(selected);
  });

  it("returns stable handler references across re-renders", () => {
    const { result, rerender } = renderHook(() => useDataGrid(defaultProps));

    const handlers1 = result.current.handlers;
    rerender();
    const handlers2 = result.current.handlers;

    // Same object reference (memoised)
    expect(handlers1).toBe(handlers2);
  });
});
