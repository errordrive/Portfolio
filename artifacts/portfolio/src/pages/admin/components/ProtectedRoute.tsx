import { Redirect } from "wouter";
import { isLoggedIn } from "@/lib/api";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) {
    return <Redirect to="/admin/login" />;
  }
  return <>{children}</>;
}
