import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore, type AppRole } from "@/store/authStore";

interface ProtectedRouteProps {
  allowedRoles?: AppRole[] | string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser, token } = useAuthStore();
  const location = useLocation();

  if (!currentUser || !token) {
    // Not logged in, redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const rawRole = String(currentUser.role ?? currentUser.loaiNhanVien ?? "").toLowerCase();
    
    // Check if the user has any of the allowed roles
    const hasRole = allowedRoles.some((role) => {
      const compactAllowed = role.toLowerCase().replace(/[^a-z0-9]+/g, "");
      return rawRole.includes(compactAllowed);
    });

    if (!hasRole) {
      // Logged in but doesn't have required role
      // Redirect to a common page or show 403
      // For now we redirect to login to be safe, or could redirect to a 403 page
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
