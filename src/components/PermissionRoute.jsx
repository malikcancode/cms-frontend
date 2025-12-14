import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Loader from "../pages/sections/Loader";

// Component to protect routes based on permissions
export const PermissionRoute = ({ permission, children }) => {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required permission
  const hasAccess = hasPermission(permission);

  if (permission && !hasAccess) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children || <Outlet />;
};
