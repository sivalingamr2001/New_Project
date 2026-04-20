import { useEffect, useMemo, useState } from "react";
import type { ColDef } from "ag-grid-community";
import { DataGrid } from "@/features/DynamicGrid/components/DataGrid/DataGrid";
import { Spinner } from "@/shared/components/ui/spinner";
import { employeeApi, type EmployeeDto, type PagedResult } from "@/features/employees/api/employeesApi";

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await employeeApi.getEmployees(1, 100);
      setEmployees(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load employees.");
    } finally {
      setLoading(false);
    }
  };

  const columnDefs = useMemo<ColDef<EmployeeDto>[]>(
    () => [
      { field: "id", headerName: "ID", width: 100 },
      { field: "firstName", headerName: "First Name", width: 150 },
      { field: "lastName", headerName: "Last Name", width: 150 },
      { field: "email", headerName: "Email", width: 200 },
      { field: "phone", headerName: "Phone", width: 130 },
      { field: "departmentName", headerName: "Department", width: 150 },
      { field: "role", headerName: "Role", width: 120 },
      { field: "location", headerName: "Location", width: 150 },
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
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-sm text-muted-foreground">
              Manage and view all employees in the system.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="mr-2" /> Loading employees…
          </div>
        ) : (
          <DataGrid<EmployeeDto>
            rowData={employees}
            columnDefs={columnDefs}
            title="Employees"
            gridId="employees-grid"
            loading={loading}
            pageSize={25}
            pageSizeOptions={[10, 25, 50, 100]}
            noRowsMessage="No employees found"
            loadingMessage="Loading employees..."
            showSearch={true}
            showRefreshButton={true}
            showExportCsvButton={true}
          />
        )}
      </div>
    </div>
  );
}
