import { Switch, Route, Redirect } from "wouter";
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

const queryClient = new QueryClient();

function AdminRoutes() {
  return (
    <Switch>
      <Route path="/admin/login" component={Login} />
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/content">
        <ProtectedRoute>
          <AdminLayout>
            <ContentManager />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/blog/new">
        <ProtectedRoute>
          <AdminLayout>
            <BlogEditor />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/blog/:id/edit">
        <ProtectedRoute>
          <AdminLayout>
            <BlogEditor />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/blog">
        <ProtectedRoute>
          <AdminLayout>
            <BlogList />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/messages">
        <ProtectedRoute>
          <AdminLayout>
            <Messages />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute>
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/password">
        <ProtectedRoute>
          <AdminLayout>
            <ChangePassword />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        {isLoggedIn() ? <Redirect to="/admin/dashboard" /> : <Redirect to="/admin/login" />}
      </Route>
    </Switch>
  );
}

export default function AdminApp() {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminRoutes />
    </QueryClientProvider>
  );
}
