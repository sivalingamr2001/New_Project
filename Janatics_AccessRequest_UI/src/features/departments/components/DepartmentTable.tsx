import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import type { DepartmentDto } from "@/features/departments/api/departmentsApi";

interface DepartmentTableProps {
  departments: DepartmentDto[];
}

export function DepartmentTable({ departments }: DepartmentTableProps) {
  return (
    <Table className="rounded-xl border border-border bg-card">
      <TableHeader>
        <TableRow>
          <TableHead>Department</TableHead>
          <TableHead>HOD</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Updated</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map((department) => (
          <TableRow key={department.departmentId}>
            <TableCell>{department.departmentName}</TableCell>
            <TableCell>{department.hod ? `${department.hod.firstName} ${department.hod.lastName}` : "Unassigned"}</TableCell>
            <TableCell>{new Date(department.createdOn).toLocaleDateString()}</TableCell>
            <TableCell>{new Date(department.updatedOn).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
