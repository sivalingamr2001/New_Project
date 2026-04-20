import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/features/DynamicGrid/components/DataGrid/DataGrid";
import { Spinner } from "@/shared/components/ui/spinner";
import {
  notificationApi,
  type NotificationDto,
} from "@/features/notifications/api/notificationsApi";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await notificationApi.getNotifications(1, 100);
      setNotifications(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = useMemo<ColDef<NotificationDto>[]>(
    () => [
      { field: "id", headerName: "ID", width: 100 },
      { field: "title", headerName: "Title", width: 200 },
      { field: "message", headerName: "Message", width: 300 },
      {
        field: "type",
        headerName: "Type",
        width: 100,
        cellStyle: (params) => {
          const typeColors: Record<string, string> = {
            Info: "#3b82f6",
            Warning: "#f59e0b",
            Error: "#ef4444",
            Success: "#10b981",
          };
          return {
            backgroundColor: typeColors[params.value] || "#6b7280",
            color: "white",
            borderRadius: "4px",
            padding: "4px 8px",
          };
        },
      },
      {
        field: "isRead",
        headerName: "Status",
        width: 100,
        valueFormatter: (params) => (params.value ? "Read" : "Unread"),
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
            <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
            <p className="text-sm text-muted-foreground">
              View all system notifications and alerts.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="mr-2" /> Loading notifications…
          </div>
        ) : (
          <DataGrid<NotificationDto>
            rowData={notifications}
            columnDefs={columnDefs}
            title="Notifications"
            gridId="notifications-grid"
            loading={loading}
            pageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            noRowsMessage="No notifications found"
            loadingMessage="Loading notifications..."
            showSearch={true}
            showRefreshButton={true}
            showExportCsvButton={true}
          />
        )}
      </div>
    </div>
  );
}
