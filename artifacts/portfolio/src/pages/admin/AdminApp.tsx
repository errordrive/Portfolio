import { Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isLoggedIn } from "@/lib/api";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ContentManager from "./ContentManager";
import BlogList from "./BlogList";
import BlogEditor from "./BlogEditor";
import Messages from "./Messages";
import Settings from "./Settings";
import ChangePassword from "./ChangePassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

function AdminRoot() {
  return <Navigate to={isLoggedIn() ? "/admin/dashboard" : "/admin/login"} replace />;
}

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="content"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ContentManager />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="blog/new"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <BlogEditor />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="blog/:id/edit"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <BlogEditor />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="blog"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <BlogList />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Messages />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="settings"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="password"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <ChangePassword />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<AdminRoot />} />
      </Routes>
    </QueryClientProvider>
  );
}
