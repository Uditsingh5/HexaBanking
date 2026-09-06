import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import { lazy, Suspense, type ReactNode } from "react";
import { AppProviders } from "@/app/providers";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute, PublicOnlyRoute, AdminRoute } from "@/components/layout/RouteGuards";
import { Skeleton } from "@/components/ui/Skeleton";

const LoginPage = lazy(() =>
  import("@/pages/auth/LoginPage").then((module) => ({ default: module.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/auth/RegisterPage").then((module) => ({ default: module.RegisterPage })),
);
const DashboardPage = lazy(() =>
  import("@/pages/dashboard/DashboardPage").then((module) => ({ default: module.DashboardPage })),
);
const AccountsPage = lazy(() =>
  import("@/pages/accounts/AccountsPage").then((module) => ({ default: module.AccountsPage })),
);
const AccountDetailPage = lazy(() =>
  import("@/pages/accounts/AccountDetailPage").then((module) => ({
    default: module.AccountDetailPage,
  })),
);
const TransferPage = lazy(() =>
  import("@/pages/transfer/TransferPage").then((module) => ({ default: module.TransferPage })),
);
const TransactionsPage = lazy(() =>
  import("@/pages/transactions/TransactionsPage").then((module) => ({
    default: module.TransactionsPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/pages/profile/ProfilePage").then((module) => ({ default: module.ProfilePage })),
);
const AddMoneyPage = lazy(() =>
  import("@/pages/admin/AddMoneyPage").then((module) => ({ default: module.AddMoneyPage })),
);

function PageFallback() {
  return (
    <div className="page">
      <Skeleton style={{ height: 28, width: 240, marginBottom: 16 }} />
      <Skeleton style={{ height: 180 }} />
    </div>
  );
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{element}</Suspense>;
}

function RootLayout() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <PublicOnlyRoute />,
        children: [
          { path: "/login", element: withSuspense(<LoginPage />) },
          { path: "/register", element: withSuspense(<RegisterPage />) },
        ],
      },
      {
        path: "/app",
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: withSuspense(<DashboardPage />) },
              { path: "accounts", element: withSuspense(<AccountsPage />) },
              { path: "accounts/:accountId", element: withSuspense(<AccountDetailPage />) },
              { path: "transfer", element: withSuspense(<TransferPage />) },
              { path: "transactions", element: withSuspense(<TransactionsPage />) },
              { path: "profile", element: withSuspense(<ProfilePage />) },
              // Admin-only — AdminRoute guard wraps just the admin pages
              {
                element: <AdminRoute />,
                children: [
                  { path: "admin/add-money", element: withSuspense(<AddMoneyPage />) },
                ],
              },
            ],
          },

        ],
      },
      { path: "/", element: <Navigate to="/app/dashboard" replace /> },
      { path: "*", element: <Navigate to="/app/dashboard" replace /> },
    ],
  },
]);
