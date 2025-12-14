"use client";

import { lazy, Suspense } from "react";
import Loader from "../pages/sections/Loader";

const Dashboard = lazy(() => import("../pages/sections/Dashboard"));
const Projects = lazy(() => import("../pages/sections/Projects"));
const ChartOfAccounts = lazy(() => import("../pages/sections/ChartOfAccounts"));
const ItemList = lazy(() => import("../pages/sections/ItemList"));
const Plots = lazy(() => import("../pages/sections/Plots"));
const Customers = lazy(() => import("../pages/sections/Customers"));
const Suppliers = lazy(() => import("../pages/sections/Suppliers"));
const Users = lazy(() => import("../pages/sections/Users"));
const CashBankPayment = lazy(() => import("../pages/sections/CashBankPayment"));
const CashPayment = lazy(() => import("../pages/sections/CashPayment"));
const BankPayment = lazy(() => import("../pages/sections/BankPayment"));
const PurchaseEntry = lazy(() => import("../pages/sections/PurchaseEntry"));
const SalesInvoice = lazy(() => import("../pages/sections/SalesInvoice"));
const ProjectLedger = lazy(() => import("../pages/sections/ProjectLedger"));
const CustomerLedger = lazy(() => import("../pages/sections/CustomerLedger"));
const SupplierLedger = lazy(() => import("../pages/sections/SupplierLedger"));
const InventoryReport = lazy(() => import("../pages/sections/InventoryReport"));
const PlotsReport = lazy(() => import("../pages/sections/PlotsReport"));
const JournalEntries = lazy(() => import("../pages/sections/JournalEntries"));
const GeneralLedger = lazy(() => import("../pages/sections/GeneralLedger"));
const TrialBalance = lazy(() => import("../pages/sections/TrialBalance"));
const BalanceSheetReport = lazy(() =>
  import("../pages/sections/BalanceSheetReport")
);
const ProfitLossStatement = lazy(() =>
  import("../pages/sections/ProfitLossStatement")
);

export default function MainContent({ currentPage }) {
  return (
    <main className="flex-1 overflow-auto">
      <div className="p-6">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader />
            </div>
          }
        >
          {currentPage === "dashboard" && <Dashboard />}
          {currentPage === "projects" && <Projects />}
          {currentPage === "chart-of-accounts" && <ChartOfAccounts />}
          {currentPage === "items" && <ItemList />}
          {currentPage === "plots" && <Plots />}
          {currentPage === "customers" && <Customers />}
          {currentPage === "vendor" && <Suppliers />}
          {currentPage === "suppliers" && <Suppliers />}
          {currentPage === "users" && <Users />}
          {currentPage === "cash-bank-payment" && <CashBankPayment />}
          {currentPage === "cash-payment" && <CashPayment />}
          {currentPage === "bank-payment" && <BankPayment />}
          {currentPage === "purchase-entry" && <PurchaseEntry />}
          {currentPage === "sales-invoice" && <SalesInvoice />}
          {currentPage === "project-ledger" && <ProjectLedger />}
          {currentPage === "customer-ledger" && <CustomerLedger />}
          {currentPage === "supplier-ledger" && <SupplierLedger />}
          {currentPage === "inventory-report" && <InventoryReport />}
          {currentPage === "project-reports" && <PlotsReport />}
          {currentPage === "journal-entries" && <JournalEntries />}
          {currentPage === "general-ledger" && <GeneralLedger />}
          {currentPage === "trial-balance" && <TrialBalance />}
          {currentPage === "balance-sheet" && <BalanceSheetReport />}
          {currentPage === "profit-loss" && <ProfitLossStatement />}
        </Suspense>
      </div>
    </main>
  );
}
