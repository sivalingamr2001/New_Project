import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/features/DynamicGrid/components/DataGrid/DataGrid";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  accessRequestApi,
  type AccessRequestDto,
} from "@/features/access-requests/api/accessRequestsApi";

export default function AccessRequestListPage() {
  const [requests, setRequests] = useState<AccessRequestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await accessRequestApi.getRequests(1, 100);
      setRequests(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load access requests.");
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = useMemo<ColDef<AccessRequestDto>[]>(
    () => [
      { field: "id", headerName: "Request ID", width: 120 },
      { field: "employeeName", headerName: "Employee", width: 150 },
      { field: "employeeDepartment", headerName: "Department", width: 150 },
      { field: "requestType", headerName: "Type", width: 120 },
      { field: "resourceType", headerName: "Resource Type", width: 130 },
      { field: "resourceName", headerName: "Resource Name", width: 180 },
      {
        field: "status",
        headerName: "Status",
        width: 130,
        cellStyle: (params) => {
          const statusColors: Record<string, string> = {
            Pending: "#f59e0b",
            ApprovedByHod: "#3b82f6",
            ApprovedByIt: "#10b981",
            Rejected: "#ef4444",
            Revoked: "#8b5cf6",
          };
          return {
            backgroundColor: statusColors[params.value] || "#6b7280",
            color: "white",
            borderRadius: "4px",
            padding: "4px 8px",
          };
        },
      },
      { field: "createdAt", headerName: "Created", width: 150, sort: "desc" },
    ],
    []
  );

  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Access Requests</h1>
            <p className="text-sm text-muted-foreground">
              View and manage all access requests in the system.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="mr-2" /> Loading access requests…
          </div>
        ) : (
          <DataGrid<AccessRequestDto>
            rowData={requests}
            columnDefs={columnDefs}
            title="Access Requests"
            gridId="access-requests-grid"
            loading={loading}
            pageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            noRowsMessage="No access requests found"
            loadingMessage="Loading access requests..."
            showSearch={true}
            showRefreshButton={true}
            showExportCsvButton={true}
          />
        )}
      </div>
    </div>
  );
}
