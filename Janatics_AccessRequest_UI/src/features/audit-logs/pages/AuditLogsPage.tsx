import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/features/DynamicGrid/components/DataGrid/DataGrid";
import { Spinner } from "@/shared/components/ui/spinner";
import { auditLogApi, type AuditLogDto } from "@/features/audit-logs/api/auditLogsApi";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await auditLogApi.getLogs(1, 100);
      setLogs(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = useMemo<ColDef<AuditLogDto>[]>(
    () => [
      { field: "id", headerName: "Log ID", width: 120 },
      { field: "action", headerName: "Action", width: 130 },
      { field: "performer", headerName: "Performer", width: 150 },
      { field: "performerRole", headerName: "Role", width: 130 },
      { field: "resourceType", headerName: "Resource Type", width: 130 },
      { field: "resourceId", headerName: "Resource ID", width: 130 },
      { field: "description", headerName: "Description", width: 250 },
      { field: "timestamp", headerName: "Timestamp", width: 180, sort: "desc" },
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
            <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-sm text-muted-foreground">
              View system activity and changes across all modules.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="mr-2" /> Loading audit logs…
          </div>
        ) : (
          <DataGrid<AuditLogDto>
            rowData={logs}
            columnDefs={columnDefs}
            title="Audit Logs"
            gridId="audit-logs-grid"
            loading={loading}
            pageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            noRowsMessage="No audit logs found"
            loadingMessage="Loading audit logs..."
            showSearch={true}
            showRefreshButton={true}
            showExportCsvButton={true}
          />
        )}
      </div>
    </div>
  );
}
