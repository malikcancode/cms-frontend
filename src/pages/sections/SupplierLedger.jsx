"use client";

import { useState, useEffect } from "react";
import { supplierApi } from "../../api/supplierApi";
import { reportApi } from "../../api/reportApi";
import Loader from "./Loader";

export default function SupplierLedger() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch all suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fetch ledger when supplier or date range changes
  useEffect(() => {
    if (selectedSupplierId) {
      fetchSupplierLedger(selectedSupplierId, startDate, endDate);
    }
  }, [selectedSupplierId, startDate, endDate]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await supplierApi.getAll();
      setSuppliers(response.data);

      // Set first supplier as default
      if (response.data.length > 0) {
        setSelectedSupplierId(response.data[0]._id);
      }
    } catch (err) {
      setError(
        "Failed to load suppliers: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierLedger = async (supplierId, start, end) => {
    try {
      setLoading(true);
      setError("");
      const response = await reportApi.getSupplierLedger(
        supplierId,
        start,
        end
      );
      setLedgerData(response.data);
    } catch (err) {
      setError(
        "Failed to load supplier ledger: " +
          (err.response?.data?.message || err.message)
      );
      setLedgerData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierId(supplierId);
  };

  if (loading && suppliers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (suppliers.length === 0) {
    return <div className="text-center py-8">No suppliers found</div>;
  }

  if (!ledgerData) {
    return <Loader />;
  }

  const { supplier, summary, transactions } = ledgerData;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        Supplier/Vendor Ledger Report
      </h1>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Supplier
            </label>
            <select
              value={selectedSupplierId}
              onChange={handleSupplierChange}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              {suppliers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && <Loader />}

      {!loading && ledgerData && (
        <>
          {/* Supplier Info */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Supplier Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Code</p>
                <p className="text-foreground font-semibold">{supplier.code}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Name</p>
                <p className="text-foreground font-semibold">{supplier.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Company
                </p>
                <p className="text-foreground font-semibold">
                  {supplier.company}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Category
                </p>
                <p className="text-foreground font-semibold">
                  {supplier.category}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Email</p>
                <p className="text-foreground font-semibold">
                  {supplier.email}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Phone</p>
                <p className="text-foreground font-semibold">
                  {supplier.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm font-medium text-muted-foreground">
                Total Purchases
              </p>
              <p className="text-2xl font-bold text-primary mt-2">
                Rs. {summary.totalPurchases.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.purchaseCount} transaction(s)
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm font-medium text-muted-foreground">
                Total Paid
              </p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                Rs. {summary.totalPayments.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.paymentCount} payment(s)
              </p>
            </div>
            <div className="bg-card border border-border rounded-lg p-6">
              <p className="text-sm font-medium text-muted-foreground">
                Balance Due
              </p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                Rs. {summary.balance.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.balance > 0 ? "Payable" : "Settled"}
              </p>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Transaction Ledger
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                      Description
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Debit
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-6 py-8 text-center text-muted-foreground"
                      >
                        No transactions found for this supplier
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction, index) => (
                      <tr key={index} className="hover:bg-muted/50 transition">
                        <td className="px-6 py-4 text-sm text-foreground">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === "Purchase"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {transaction.reference}
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {transaction.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-red-600">
                          {transaction.debit > 0
                            ? `Rs. ${transaction.debit.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                          {transaction.credit > 0
                            ? `Rs. ${transaction.credit.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-right font-bold text-foreground">
                          Rs. {transaction.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                  {transactions.length > 0 && (
                    <tr className="bg-muted font-bold">
                      <td
                        colSpan="4"
                        className="px-6 py-4 text-sm text-foreground"
                      >
                        Total
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">
                        Rs. {summary.totalPurchases.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">
                        Rs. {summary.totalPayments.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-foreground">
                        Rs. {summary.balance.toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
