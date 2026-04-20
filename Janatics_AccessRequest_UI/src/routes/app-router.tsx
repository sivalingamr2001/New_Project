import { Navigate, createBrowserRouter } from "react-router-dom";
import { NAVIGATION_SECTIONS } from "@/config/navigation";
import { PrivateLayout } from "@/layout/PrivateLayout";
import { RequireAuth } from "@/features/auth/components/RequireAuth";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import EmployeeListPage from "@/features/employees/pages/EmployeeListPage";
import DepartmentListPage from "@/features/departments/pages/DepartmentListPage";
import AccessRequestListPage from "@/features/access-requests/pages/AccessRequestListPage";
import NotificationsPage from "@/features/notifications/pages/NotificationsPage";
import AuditLogsPage from "@/features/audit-logs/pages/AuditLogsPage";
import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";
import { useAuth } from "@/providers/auth-provider";

function HomeRedirect() {
  const { user } = useAuth();
  const path = NAVIGATION_SECTIONS.flatMap((section) => section.items)
    .find((item) => user?.role && item.roles.includes(user.role))?.to;

  return <Navigate to={path ?? "/dashboard"} replace />;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <section className="rounded-md border border-border bg-card p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-foreground mb-2">{title}</h2>
      <div className="text-sm text-muted-foreground">This page is ready for your content.</div>
    </section>
  );
}

const routeItems = NAVIGATION_SECTIONS.flatMap((section) => section.items);

export const appRouter = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <PrivateLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <HomeRedirect />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "it/employees",
        element: <EmployeeListPage />,
      },
      {
        path: "it/departments",
        element: <DepartmentListPage />,
      },
      {
        path: "it/all-requests",
        element: <AccessRequestListPage />,
      },
      {
        path: "hod/all-requests",
        element: <AccessRequestListPage />,
      },
      {
        path: "user/my-requests",
        element: <AccessRequestListPage />,
      },
      {
        path: "notifications",
        element: <NotificationsPage />,
      },
      {
        path: "audit-logs",
        element: <AuditLogsPage />,
      },
      ...routeItems
        .filter(
          (item) => ![
            "/dashboard",
            "/it/employees",
            "/it/departments",
            "/it/all-requests",
            "/hod/all-requests",
            "/hod/pending-approvals",
            "/hod/pending-approvals",
            "/it/approval-queue",
            "/it/active-access",
            "/user/my-requests",
            "/notifications",
            "/audit-logs",
          ].includes(item.to)
        )
        .map((item) => ({
          path: item.to.replace(/^\//, ""),
          element: <PlaceholderPage title={item.label} />,
        })),
    ],
  },
  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);
