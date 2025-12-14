import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { PermissionRoute } from "./components/PermissionRoute";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";
import Loader from "./pages/sections/Loader";

const DashboardSection = lazy(() => import("./pages/sections/Dashboard"));
const Projects = lazy(() => import("./pages/sections/Projects"));
const ChartOfAccounts = lazy(() => import("./pages/sections/ChartOfAccounts"));
const ItemList = lazy(() => import("./pages/sections/ItemList"));
const Plots = lazy(() => import("./pages/sections/Plots"));
const Customers = lazy(() => import("./pages/sections/Customers"));
const Suppliers = lazy(() => import("./pages/sections/Suppliers"));
const Users = lazy(() => import("./pages/sections/Users"));
const MyRequests = lazy(() => import("./pages/sections/MyRequests"));
const AdminRequestApprovals = lazy(() =>
  import("./pages/sections/AdminRequestApprovals")
);
const Notifications = lazy(() => import("./pages/sections/Notifications"));
const CashPayment = lazy(() => import("./pages/sections/CashPayment"));
const BankPayment = lazy(() => import("./pages/sections/BankPayment"));
const PurchaseEntry = lazy(() => import("./pages/sections/PurchaseEntry"));
const SalesInvoice = lazy(() => import("./pages/sections/SalesInvoice"));
const ProjectLedger = lazy(() => import("./pages/sections/ProjectLedger"));
const CustomerLedger = lazy(() => import("./pages/sections/CustomerLedger"));
const SupplierLedger = lazy(() => import("./pages/sections/SupplierLedger"));
const IncomeStatement = lazy(() => import("./pages/sections/IncomeStatement"));
const InventoryReport = lazy(() => import("./pages/sections/InventoryReport"));
const PlotsReport = lazy(() => import("./pages/sections/PlotsReport"));
const JournalEntries = lazy(() => import("./pages/sections/JournalEntries"));
const GeneralLedger = lazy(() => import("./pages/sections/GeneralLedger"));
const TrialBalance = lazy(() => import("./pages/sections/TrialBalance"));
const BalanceSheetReport = lazy(() =>
  import("./pages/sections/BalanceSheetReport")
);
const ProfitLossStatement = lazy(() =>
  import("./pages/sections/ProfitLossStatement")
);

function App() {
  return (
    <div className="dark">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            {/* Protected Routes - All authenticated users */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />}>
                {/* Nested routes for dashboard sections */}
                <Route
                  index
                  element={
                    <PermissionRoute permission="dashboard">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <DashboardSection />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="overview"
                  element={
                    <PermissionRoute permission="dashboard">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <DashboardSection />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="projects"
                  element={
                    <PermissionRoute permission="projects">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <Projects />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="chart-of-accounts"
                  element={
                    <PermissionRoute permission="chartOfAccounts">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <ChartOfAccounts />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="items"
                  element={
                    <PermissionRoute permission="items">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <ItemList />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="plots"
                  element={
                    <PermissionRoute permission="plots">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <Plots />
                      </Suspense>
                    </PermissionRoute>
                  }
                />

                <Route
                  path="customers"
                  element={
                    <PermissionRoute permission="customers">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <Customers />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="vendor"
                  element={
                    <PermissionRoute permission="suppliers">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <Suppliers />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="users"
                  element={
                    <PermissionRoute permission="users">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <Users />
                      </Suspense>
                    </PermissionRoute>
                  }
                />

                {/* My Requests - Available to all authenticated users */}
                <Route
                  path="my-requests"
                  element={
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center min-h-[400px]">
                          <Loader />
                        </div>
                      }
                    >
                      <MyRequests />
                    </Suspense>
                  }
                />

                {/* Admin Request Approvals - Admin only */}
                <Route
                  path="request-approvals"
                  element={
                    <PermissionRoute permission="users">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <AdminRequestApprovals />
                      </Suspense>
                    </PermissionRoute>
                  }
                />

                {/* Notifications - All authenticated users */}
                <Route
                  path="notifications"
                  element={
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center min-h-[400px]">
                          <Loader />
                        </div>
                      }
                    >
                      <Notifications />
                    </Suspense>
                  }
                />

                <Route
                  path="cash-payment"
                  element={
                    <PermissionRoute permission="cashPayment">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <CashPayment />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="bank-payment"
                  element={
                    <PermissionRoute permission="bankPayment">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <BankPayment />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="purchase-entry"
                  element={
                    <PermissionRoute permission="purchaseEntry">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <PurchaseEntry />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="sales-invoice"
                  element={
                    <PermissionRoute permission="salesInvoice">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <SalesInvoice />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="project-ledger"
                  element={
                    <PermissionRoute permission="reports">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <ProjectLedger />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="customer-ledger"
                  element={
                    <PermissionRoute permission="reports">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <CustomerLedger />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="vendor-ledger"
                  element={
                    <PermissionRoute permission="reports">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <SupplierLedger />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="income-statement"
                  element={
                    <PermissionRoute permission="reports">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <IncomeStatement />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="inventory-report"
                  element={
                    <PermissionRoute permission="reports">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <InventoryReport />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="project-reports"
                  element={
                    <PermissionRoute permission="reports">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <PlotsReport />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="journal-entries"
                  element={
                    <PermissionRoute permission="accounting">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <JournalEntries />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="general-ledger"
                  element={
                    <PermissionRoute permission="accounting">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <GeneralLedger />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="trial-balance"
                  element={
                    <PermissionRoute permission="accounting">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <TrialBalance />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="balance-sheet"
                  element={
                    <PermissionRoute permission="accounting">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <BalanceSheetReport />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
                <Route
                  path="profit-loss"
                  element={
                    <PermissionRoute permission="accounting">
                      <Suspense
                        fallback={
                          <div className="flex items-center justify-center min-h-[400px]">
                            <Loader />
                          </div>
                        }
                      >
                        <ProfitLossStatement />
                      </Suspense>
                    </PermissionRoute>
                  }
                />
              </Route>
            </Route>
            {/* Redirects */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* 404 Page - Must be last */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
