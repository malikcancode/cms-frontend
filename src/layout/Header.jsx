"use client";

import { FiMenu, FiLogOut } from "react-icons/fi";
import NotificationBell from "../components/NotificationBell";

export default function Header({ user, onLogout, onMenuClick }) {
  return (
    <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
      <button
        onClick={onMenuClick}
        className="p-2 hover:bg-muted rounded-lg transition text-foreground sm:hidden"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      <div className="flex items-center justify-end w-full gap-4">
        <NotificationBell />

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">
              {user?.name}
            </p>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-2 hover:bg-muted rounded-lg transition text-foreground"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
