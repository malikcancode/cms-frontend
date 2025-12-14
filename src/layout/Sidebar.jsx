"use client";

import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import {
  FiHome,
  FiSettings,
  FiDollarSign,
  FiBox,
  FiBarChart2,
  FiShoppingCart,
  FiUsers,
  FiX,
  FiCheckCircle,
  FiFileText,
} from "react-icons/fi";

const getMenuItems = (userRole) => [
  {
    label: "Dashboard",
    value: "dashboard",
    icon: FiHome,
  },
  {
    label: "Maintain",
    value: "maintain",
    icon: FiSettings,
    submenu: [
      { label: "Projects", value: "projects" },
      // { label: "Plots", value: "plots" },
      { label: "Chart of Accounts", value: "chart-of-accounts" },
      { label: "Chart of Inventory", value: "items" },
    ],
  },
  {
    label: "Purchase",
    value: "purchase",
    icon: FiShoppingCart,
    submenu: [{ label: "Purchase Entry", value: "purchase-entry" }],
  },
  {
    label: "Expenses",
    value: "expenses",
    icon: FiDollarSign,
    submenu: [
      { label: "Cash Payment", value: "cash-payment" },
      { label: "Bank Payment", value: "bank-payment" },
    ],
  },
  {
    label: "Sales",
    value: "sales",
    icon: FiBox,
    submenu: [{ label: "Sales Invoice", value: "sales-invoice" }],
  },
  {
    label: "Users",
    value: "users-section",
    icon: FiUsers,
    submenu: [
      { label: "Customers", value: "customers" },
      { label: "Vendor", value: "vendor" },
      { label: "Users Management", value: "users", adminOnly: true },
    ].filter((item) => {
      // Filter out admin-only items for non-admins
      if (item.adminOnly && userRole !== "admin") return false;
      return true;
    }),
  },
  ...(userRole !== "admin"
    ? [
        {
          label: "My Requests",
          value: "my-requests",
          icon: FiFileText,
        },
      ]
    : []),
  ...(userRole === "admin"
    ? [
        {
          label: "Request Approvals",
          value: "request-approvals",
          icon: FiCheckCircle,
        },
      ]
    : []),
  {
    label: "Accounting",
    value: "accounting",
    icon: FiBarChart2,
    submenu: [
      { label: "Journal Entries", value: "journal-entries" },
      { label: "General Ledger", value: "general-ledger" },
      { label: "Trial Balance", value: "trial-balance" },
      { label: "Balance Sheet", value: "balance-sheet" },
      { label: "Profit & Loss", value: "profit-loss" },
    ],
  },
  {
    label: "Reports",
    value: "reports",
    icon: FiBarChart2,
    submenu: [
      { label: "Project Ledger", value: "project-ledger" },
      { label: "Customer Ledger", value: "customer-ledger" },
      { label: "Vendor Ledger", value: "vendor-ledger" },
      { label: "Inventory Report", value: "inventory-report" },
      { label: "Project Reports", value: "project-reports" },
    ],
  },
];

export default function Sidebar({ currentPage, onNavigate, isOpen }) {
  const { user } = useContext(AuthContext);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Get menu items based on user role
  const menuItems = getMenuItems(user?.role);

  const toggleSubmenu = (menuValue) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuValue]: !prev[menuValue],
    }));
  };

  const handleNavigate = (value) => {
    onNavigate(value);
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 sm:hidden z-30"
          onClick={() => handleNavigate(currentPage)}
        />
      )}

      <aside
        className={`fixed sm:relative top-0 left-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform duration-300 sm:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } z-40`}
      >
        <div className="p-6 border-b border-sidebar-border shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold">
                YC
              </div>
              <div>
                <h1 className="font-bold text-sidebar-foreground">
                  YM CONSTRUCTIONS
                </h1>
                {/* <p className="text-xs text-sidebar-foreground/60">Management</p> */}
              </div>
            </div>
            <button
              onClick={() => handleNavigate(currentPage)}
              className="sm:hidden p-2 hover:bg-sidebar-accent rounded-lg transition text-sidebar-foreground"
              aria-label="Close sidebar"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav
          className="p-4 space-y-2 overflow-y-auto flex-1"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#c5630c #2a2a2a",
          }}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isExpanded = expandedMenus[item.value];
            const isActive =
              currentPage === item.value ||
              item.submenu?.some((sub) => sub.value === currentPage);

            return (
              <div key={item.value}>
                <button
                  onClick={() => {
                    if (item.submenu) {
                      toggleSubmenu(item.value);
                    } else {
                      onNavigate(item.value);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
                  {item.submenu && (
                    <span
                      className={`text-xs transform transition ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    >
                      ▼
                    </span>
                  )}
                </button>

                {item.submenu && isExpanded && (
                  <div className="ml-2 mt-1 space-y-1 border-l border-sidebar-border pl-3">
                    {item.submenu.map((subitem) => (
                      <button
                        key={subitem.value}
                        onClick={() => handleNavigate(subitem.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          currentPage === subitem.value
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground hover:text-sidebar-accent-foreground"
                        }`}
                      >
                        {subitem.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
