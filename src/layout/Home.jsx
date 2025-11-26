"use client";

import { useState, lazy, Suspense } from "react";
import Loader from "../pages/sections/Loader";

const LoginPage = lazy(() => import("./../pages/LoginPage"));
const Dashboard = lazy(() => import("./../pages/Dashboard"));

const getInitialUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export default function Home() {
  const [currentUser, setCurrentUser] = useState(getInitialUser);
  const [isLoggedIn, setIsLoggedIn] = useState(!!getInitialUser());

  const handleLogin = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("currentUser");
  };

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-background">
          <Loader />
        </div>
      }
    >
      {isLoggedIn ? (
        <Dashboard user={currentUser} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </Suspense>
  );
}
