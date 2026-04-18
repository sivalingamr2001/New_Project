import { ReusableAgGrid } from "@/shared/components/DynamicGrid/components/DyanmicGrid"
import type { ColDef } from "ag-grid-community"

interface UserData {
  id: number
  name: string
  email: string
  role: string
  status: "Active" | "Inactive"
}

const UserManagementTable = () => {
  // 2. Define Columns
  const columns: ColDef<UserData>[] = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "name", headerName: "Full Name", flex: 1 },
    { field: "email", headerName: "Email Address", flex: 1 },
    {
      field: "role",
      headerName: "Role",
      cellStyle: { fontWeight: "600" },
    },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params: any) => (
        <span
          style={{ color: params.value === "Active" ? "#2f9e44" : "#c92a2a" }}
        >
          ● {params.value}
        </span>
      ),
    },
  ]

  // 3. Mock Data
  const data: UserData[] = [
    {
      id: 1,
      name: "Alice Johnson",
      email: "alice@company.com",
      role: "Admin",
      status: "Active",
    },
    {
      id: 2,
      name: "Bob Smith",
      email: "bob@company.com",
      role: "Editor",
      status: "Inactive",
    },
    {
      id: 3,
      name: "Charlie Brown",
      email: "charlie@company.com",
      role: "Viewer",
      status: "Active",
    },
  ]

  return (
    <div style={{ padding: "24px", background: "#f8f9fa", minHeight: "100vh" }}>
      <ReusableAgGrid<UserData>
        title="User Directory"
        rowData={data}
        columnDefs={columns}
        showSearch={true}
        showExportCsv={true}
        pageSizeOptions={[10, 20, 50]}
        gridHeight="500px"
        toolbarButtons={[
          {
            key: "add-user",
            label: "Add User",
            variant: "default",
            icon: <span>+</span>,
            onClick: (api) => alert("Open Add User Modal"),
          },
        ]}
      />
    </div>
  )
}

export default UserManagementTable
