import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/features/DynamicGrid/components/DataGrid/DataGrid";
import { Spinner } from "@/shared/components/ui/spinner";
import { departmentApi, type DepartmentDto } from "@/features/departments/api/departmentsApi";

export default function DepartmentListPage() {
  const [departments, setDepartments] = useState<DepartmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadDepartments();
  }, []);

  const loadDepartments = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await departmentApi.getDepartments(1, 100);
      setDepartments(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = useMemo<ColDef<DepartmentDto>[]>(
    () => [
      { field: "id", headerName: "ID", width: 100 },
      { field: "name", headerName: "Department Name", width: 200 },
      { field: "description", headerName: "Description", width: 300 },
      { field: "head", headerName: "Head of Department", width: 180 },
      { field: "email", headerName: "Email", width: 200 },
      { field: "phone", headerName: "Phone", width: 130 },
      { field: "status", headerName: "Status", width: 100 },
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
            <h1 className="text-2xl font-bold text-foreground">Departments</h1>
            <p className="text-sm text-muted-foreground">
              Manage and view all departments in the organization.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="mr-2" /> Loading departments…
          </div>
        ) : (
          <DataGrid<DepartmentDto>
            rowData={departments}
            columnDefs={columnDefs}
            title="Departments"
            gridId="departments-grid"
            loading={loading}
            pageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            noRowsMessage="No departments found"
            loadingMessage="Loading departments..."
            showSearch={true}
            showRefreshButton={true}
            showExportCsvButton={true}
          />
        )}
      </div>
    </div>
  );
}
