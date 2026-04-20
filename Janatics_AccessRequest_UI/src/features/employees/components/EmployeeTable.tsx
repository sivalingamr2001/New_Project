import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import type { EmployeeDto } from "@/features/employees/api/employeesApi";

interface EmployeeTableProps {
  employees: EmployeeDto[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  return (
    <Table className="rounded-xl border border-border bg-card">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Department</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Location</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((employee) => (
          <TableRow key={employee.employeeId}>
            <TableCell>{`${employee.firstName} ${employee.lastName}`}</TableCell>
            <TableCell>{employee.username}</TableCell>
            <TableCell>{employee.department?.departmentName ?? "—"}</TableCell>
            <TableCell>{employee.role}</TableCell>
            <TableCell>{employee.isActive ? "Active" : "Inactive"}</TableCell>
            <TableCell>{employee.location}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
