import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { AppErrorBoundary } from "@/components/common/ErrorBoundary";

export default function App() {
  return (
    <AppErrorBoundary>
      <RouterProvider router={router} />
    </AppErrorBoundary>
  );
}
