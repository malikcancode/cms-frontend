import { createContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

const getInitialUser = () => {
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  }
  return null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getInitialUser);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await authApi.getMe();
          if (response.success) {
            setUser(response.data);
            localStorage.setItem("user", JSON.stringify(response.data));
          }
        } catch (error) {
          console.error("Failed to verify user:", error);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = () => {
    setUser(null);
    authApi.logout();
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  // Check if user has permission for a specific module
  const hasPermission = (permission) => {
    if (!user) {
      console.log("hasPermission: No user");
      return false;
    }

    // Admin has all permissions
    if (user.role === "admin") {
      console.log(`hasPermission(${permission}): TRUE - Admin role`);
      return true;
    }

    // Operator has all permissions except user management
    if (user.role === "operator") {
      const result = permission !== "users";
      console.log(`hasPermission(${permission}): ${result} - Operator role`);
      return result;
    }

    // Custom role - check customPermissions
    if (user.role === "custom" && user.customPermissions) {
      const result = user.customPermissions[permission] === true;
      console.log(`hasPermission(${permission}):`, {
        result,
        permissionValue: user.customPermissions[permission],
        allPermissions: user.customPermissions,
      });
      return result;
    }

    console.log(
      `hasPermission(${permission}): FALSE - No matching role/permission`
    );
    return false;
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    hasRole,
    hasPermission,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
