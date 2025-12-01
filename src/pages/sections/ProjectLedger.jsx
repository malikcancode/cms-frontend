"use client";

import { useState, useEffect } from "react";
import { projectApi } from "../../api/projectApi";
import Loader from "./Loader";

export default function ProjectLedger() {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // Fetch ledger data when project is selected
  useEffect(() => {
    if (selectedProjectId) {
      fetchProjectLedger(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectApi.getAll();
      if (response.success && response.data.length > 0) {
        setProjects(response.data);
        setSelectedProjectId(response.data[0]._id);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setError(error.message || "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectLedger = async (projectId) => {
    try {
      setLoading(true);
      setError("");
      const response = await projectApi.getLedger(projectId);
      if (response.success) {
        setLedgerData(response.data);
      }
    } catch (error) {
      console.error("Error fetching project ledger:", error);
      setError(error.message || "Failed to fetch project ledger");
      setLedgerData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !ledgerData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!ledgerData || !ledgerData.project) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          Project Ledger Report
        </h1>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground">
            {error || "No project data available. Please select a project."}
          </p>
        </div>
      </div>
    );
  }

  const {
    project,
    summary,
    purchases,
    bankPayments,
    cashPayments,
    salesInvoices,
    purchasesByVendor,
    paymentsByAccount,
  } = ledgerData;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        Project Ledger Report
      </h1>

      {/* Project Selection */}
      <div className="bg-card border border-border rounded-lg p-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Select Project
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => setSelectedProjectId(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} - {p.code} ({p.client})
            </option>
          ))}
        </select>
      </div>

      {/* Project Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Project Details
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-semibold text-foreground">{project.client}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Job Incharge</p>
            <p className="font-semibold text-foreground">
              {project.jobIncharge}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                project.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : project.status === "Completed"
                  ? "bg-blue-100 text-blue-800"
                  : project.status === "On Hold"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {project.status}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Estimated Cost
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            Rs. {(summary.estimatedCost || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            Rs. {(summary.totalExpenses || 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Bank: Rs. {(summary.totalBankPayments || 0).toLocaleString()} |
            Cash: Rs. {(summary.totalCashPayments || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Actual Revenue (Sales)
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            Rs. {(summary.actualRevenue || 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Estimated: Rs. {(summary.estimatedRevenue || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Profit/Loss
          </p>
          <p
            className={`text-2xl font-bold mt-2 ${
              (summary.profitLoss || 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            Rs. {(summary.profitLoss || 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Margin: {summary.profitMargin || "0%"}
          </p>
        </div>
      </div>

      {/* Budget Status */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          Budget Status
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Budget Utilization
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full ${
                  ((summary.totalExpenses || 0) /
                    (summary.estimatedCost || 1)) *
                    100 >
                  100
                    ? "bg-red-600"
                    : ((summary.totalExpenses || 0) /
                        (summary.estimatedCost || 1)) *
                        100 >
                      80
                    ? "bg-yellow-500"
                    : "bg-green-600"
                }`}
                style={{
                  width: `${Math.min(
                    ((summary.totalExpenses || 0) /
                      (summary.estimatedCost || 1)) *
                      100,
                    100
                  )}%`,
                }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {(
                ((summary.totalExpenses || 0) / (summary.estimatedCost || 1)) *
                100
              ).toFixed(2)}
              % used
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Remaining Budget</p>
            <p
              className={`text-xl font-bold mt-2 ${
                (summary.remainingBudget || 0) >= 0
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              Rs. {(summary.remainingBudget || 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Purchase/Material Expenses */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Material Purchases & Expenses
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Serial No
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Vendor
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Amount (Debit)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No purchases recorded for this project
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr
                    key={purchase._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(purchase.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {purchase.serialNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div>{purchase.vendorName}</div>
                      <div className="text-xs text-muted-foreground">
                        {purchase.vendorCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div className="font-medium">{purchase.itemName}</div>
                      <div className="text-xs text-muted-foreground">
                        {purchase.itemCode}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {purchase.quantity || 0} {purchase.unit || ""}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      Rs. {(purchase.rate || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      Rs. {(purchase.netAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
              {purchases.length > 0 && (
                <tr className="bg-muted font-bold">
                  <td colSpan="6" className="px-6 py-4 text-sm text-foreground">
                    Total Material Purchases
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    Rs. {(summary.totalPurchases || 0).toLocaleString()}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor-wise Summary */}
      {purchasesByVendor.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Vendor-wise Expense Summary
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Vendor Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Total Purchases
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {purchasesByVendor.map((vendor, idx) => (
                  <tr key={idx} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {vendor.vendorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {vendor.vendorCode || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {(vendor.purchases || []).length} purchase(s)
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      Rs. {(vendor.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cash Payments */}
      {cashPayments && cashPayments.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Cash Payments (Labour & Other Expenses)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Serial No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Job Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Employee Ref
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Remarks
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Amount (Debit)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {cashPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.serialNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.jobDescription || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.employeeRef?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.remarks || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      Rs. {(payment.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted font-bold">
                  <td colSpan="5" className="px-6 py-4 text-sm text-foreground">
                    Total Cash Payments
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    Rs. {(summary.totalCashPayments || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Cash Payment Lines Details */}
          <div className="mt-6">
            <h3 className="text-md font-semibold text-foreground mb-3">
              Cash Payment Lines Breakdown
            </h3>
            <div className="space-y-4">
              {cashPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="border border-border rounded-lg p-4 bg-muted/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.serialNo} -{" "}
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.jobDescription || "Cash Payment"}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      Total: Rs. {(payment.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">
                            Account Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">
                            Account Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-foreground">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(payment.paymentLines || []).map((line, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-muted-foreground">
                              {line.accountCode}
                            </td>
                            <td className="px-4 py-2 text-foreground">
                              {line.accountName}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {line.description || "-"}
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-foreground">
                              Rs. {(line.amount || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bank Payments (Labour/Other Expenses) */}
      {bankPayments && bankPayments.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Bank Payments (Labour & Other Expenses)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Serial No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Bank Account
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Cheque No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Job Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Employee Ref
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Amount (Debit)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {bankPayments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.serialNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div>{payment.bankAccount}</div>
                      {payment.bankAccountNumber && (
                        <div className="text-xs text-muted-foreground">
                          {payment.bankAccountNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.chequeNo || "N/A"}
                      {payment.chequeDate && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(payment.chequeDate).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.jobDescription || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.employeeRef?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      Rs. {(payment.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr className="bg-muted font-bold">
                  <td colSpan="6" className="px-6 py-4 text-sm text-foreground">
                    Total Bank Payments
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    Rs. {(summary.totalBankPayments || 0).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Payment Lines Details */}
          <div className="mt-6">
            <h3 className="text-md font-semibold text-foreground mb-3">
              Payment Lines Breakdown
            </h3>
            <div className="space-y-4">
              {bankPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="border border-border rounded-lg p-4 bg-muted/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.serialNo} -{" "}
                        {new Date(payment.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payment.bankAccount}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground">
                      Total: Rs. {(payment.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">
                            Account Code
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">
                            Account Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-semibold text-foreground">
                            Description
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-semibold text-foreground">
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {(payment.paymentLines || []).map((line, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2 text-muted-foreground">
                              {line.accountCode}
                            </td>
                            <td className="px-4 py-2 text-foreground">
                              {line.accountName}
                            </td>
                            <td className="px-4 py-2 text-muted-foreground">
                              {line.description || "-"}
                            </td>
                            <td className="px-4 py-2 text-right font-medium text-foreground">
                              Rs. {(line.amount || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account-wise Payment Summary */}
      {paymentsByAccount && paymentsByAccount.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Account-wise Payment Summary (Bank & Cash)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Account Code
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Account Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Payment Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    No. of Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {paymentsByAccount.map((account, idx) => (
                  <tr key={idx} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {account.accountCode}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {account.accountName}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          account.type === "Bank"
                            ? "bg-blue-100 text-blue-800"
                            : account.type === "Cash"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {account.type || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {account.count} transaction(s)
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      Rs. {(account.totalAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sales Invoices / Revenue */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Sales Invoices & Revenue
        </h2>

        {/* Revenue Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-800">
              Total Sales (Invoiced)
            </p>
            <p className="text-2xl font-bold text-green-600 mt-2">
              Rs. {(summary.totalSalesInvoices || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-800">Amount Received</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">
              Rs. {(summary.totalSalesReceived || 0).toLocaleString()}
            </p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-800">
              Outstanding Balance
            </p>
            <p className="text-2xl font-bold text-orange-600 mt-2">
              Rs. {(summary.totalOutstandingBalance || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {salesInvoices && salesInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Serial No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Items Count
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Net Total
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Received
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {salesInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {invoice.serialNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      <div>
                        <p className="font-medium">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.customerCode}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {invoice.items?.length || 0} item(s)
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      Rs. {(invoice.netTotal || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      Rs. {(invoice.amountReceived || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                      Rs. {(invoice.balance || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-muted border-t-2 border-border">
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-sm font-bold text-foreground text-right"
                  >
                    Total:
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-green-600">
                    Rs. {(summary.totalSalesInvoices || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">
                    Rs. {(summary.totalSalesReceived || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-orange-600">
                    Rs.{" "}
                    {(summary.totalOutstandingBalance || 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            No sales invoices recorded for this project yet.
          </p>
        )}
      </div>

      {/* Final Summary */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Financial Summary
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody className="divide-y divide-border">
              <tr className="hover:bg-muted/50">
                <td className="px-6 py-3 text-sm font-medium text-foreground">
                  Actual Revenue (Sales Invoices)
                </td>
                <td className="px-6 py-3 text-sm text-right font-semibold text-green-600">
                  Rs. {(summary.actualRevenue || 0).toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="px-6 py-3 text-sm text-muted-foreground pl-12">
                  Less: Material Purchases
                </td>
                <td className="px-6 py-3 text-sm text-right text-red-600">
                  Rs. {(summary.totalPurchases || 0).toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="px-6 py-3 text-sm text-muted-foreground pl-12">
                  Less: Bank Payments (Labour & Other)
                </td>
                <td className="px-6 py-3 text-sm text-right text-red-600">
                  Rs. {(summary.totalBankPayments || 0).toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="px-6 py-3 text-sm text-muted-foreground pl-12">
                  Less: Cash Payments (Labour & Other)
                </td>
                <td className="px-6 py-3 text-sm text-right text-red-600">
                  Rs. {(summary.totalCashPayments || 0).toLocaleString()}
                </td>
              </tr>
              <tr className="bg-muted font-bold border-t-2 border-border">
                <td className="px-6 py-4 text-base text-foreground">
                  Net Profit/Loss
                </td>
                <td
                  className={`px-6 py-4 text-base text-right font-bold ${
                    (summary.profitLoss || 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  Rs. {(summary.profitLoss || 0).toLocaleString()}
                </td>
              </tr>
              <tr className="hover:bg-muted/50">
                <td className="px-6 py-3 text-sm text-muted-foreground">
                  Outstanding Balance (Not Yet Received)
                </td>
                <td className="px-6 py-3 text-sm text-right text-orange-600">
                  Rs. {(summary.totalOutstandingBalance || 0).toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
