import UserManagementTable from "./features/products/components/ProductCard"
import Layout from "./layout/AppLayout"

export function App() {
  return (
    <div className="flex min-h-svh p-0">
      <Layout>
        <UserManagementTable />
      </Layout>
    </div>
  )
}

export default App
