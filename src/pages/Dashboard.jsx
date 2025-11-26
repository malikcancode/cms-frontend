"use client";

import { useState, lazy, Suspense } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import Loader from "./sections/Loader";

const Sidebar = lazy(() => import("./../layout/Sidebar"));
const Header = lazy(() => import("./../layout/Header"));

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract current page from URL path
  const getCurrentPage = () => {
    const path = location.pathname
      .replace("/dashboard/", "")
      .replace("/dashboard", "dashboard");
    return path || "dashboard";
  };

  const handleNavigate = (page) => {
    // Navigate to the route
    if (page === "dashboard") {
      navigate("/dashboard");
    } else {
      navigate(`/dashboard/${page}`);
    }
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen w-full">
            <Loader />
          </div>
        }
      >
        <Sidebar
          currentPage={getCurrentPage()}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            user={user}
            onLogout={handleLogout}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          />
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </Suspense>
    </div>
  );
}
