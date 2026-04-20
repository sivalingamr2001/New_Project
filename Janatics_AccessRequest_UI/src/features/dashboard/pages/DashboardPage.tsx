import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { departmentApi } from "@/features/departments/api/departmentsApi";
import { employeeApi } from "@/features/employees/api/employeesApi";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [departmentCount, setDepartmentCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSummary();
  }, []);

  const loadSummary = async () => {
    setLoading(true);
    setError(null);

    try {
      const employees = await employeeApi.getEmployees(1, 1);
      const departments = await departmentApi.getDepartments(1, 1);
      setEmployeeCount(employees.totalCount);
      setDepartmentCount(departments.totalCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard summary.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome to the Janatics starter portal. The UI now integrates auth and backend data.
            </p>
          </div>
          <Button variant="outline" onClick={loadSummary} disabled={loading}>
            {loading ? <Spinner className="mr-2" /> : null}
            Refresh summary
          </Button>
        </div>

        {error ? (
          <div className="mt-6 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Employees</p>
            <p className="mt-3 text-4xl font-semibold text-foreground">{employeeCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Total records loaded from the backend.</p>
            <Link to="/it/employees" className="mt-4 inline-flex text-sm font-medium text-primary hover:text-primary/80">
              View employee list →
            </Link>
          </div>
          <div className="rounded-3xl border border-border bg-background p-6 shadow-sm">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Departments</p>
            <p className="mt-3 text-4xl font-semibold text-foreground">{departmentCount}</p>
            <p className="mt-2 text-sm text-muted-foreground">Loaded from the department API.</p>
            <Link to="/it/departments" className="mt-4 inline-flex text-sm font-medium text-primary hover:text-primary/80">
              View departments →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
