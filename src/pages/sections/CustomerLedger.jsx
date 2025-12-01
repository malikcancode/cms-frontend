"use client";

import { useState, useEffect } from "react";
import customerApi from "../../api/customerApi";
import salesInvoiceApi from "../../api/salesInvoiceApi";
import Loader from "./Loader";

export default function CustomerLedger() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [salesInvoices, setSalesInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch sales invoices when customer is selected
  useEffect(() => {
    if (selectedCustomerId) {
      fetchCustomerInvoices(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await customerApi.getAll();
      setCustomers(response.data);

      // Set first customer as default
      if (response.data.length > 0) {
        setSelectedCustomerId(response.data[0]._id);
        setSelectedCustomer(response.data[0]);
      }
    } catch (err) {
      setError(
        "Failed to load customers: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerInvoices = async (customerId) => {
    try {
      setLoading(true);
      setError("");
      const response = await salesInvoiceApi.getByCustomer(customerId);
      setSalesInvoices(response.data);
    } catch (err) {
      setError(
        "Failed to load invoices: " +
          (err.response?.data?.message || err.message)
      );
      setSalesInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setSelectedCustomerId(customerId);
    const customer = customers.find((c) => c._id === customerId);
    setSelectedCustomer(customer);
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!selectedCustomer) {
    return <div className="text-center py-8">No customers found</div>;
  }

  const totalAmount = salesInvoices.reduce(
    (sum, inv) => sum + (inv.netTotal || 0),
    0
  );
  const totalReceived = salesInvoices.reduce(
    (sum, inv) => sum + (inv.amountReceived || 0),
    0
  );
  const totalBalance = salesInvoices.reduce(
    (sum, inv) => sum + (inv.balance || 0),
    0
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        Customer Ledger Report
      </h1>

      <div className="bg-card border border-border rounded-lg p-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Select Customer
        </label>
        <select
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          className="w-full md:w-64 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          {customers.map((c) => (
            <option key={c._id} value={c._id}>
              {c.code} - {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Customer Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Customer Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Code</p>
            <p className="text-foreground font-semibold">
              {selectedCustomer.code}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Name</p>
            <p className="text-foreground font-semibold">
              {selectedCustomer.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Email</p>
            <p className="text-foreground font-semibold">
              {selectedCustomer.email}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Phone</p>
            <p className="text-foreground font-semibold">
              {selectedCustomer.phone}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Address</p>
            <p className="text-foreground font-semibold">
              {selectedCustomer.address || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Amount
          </p>
          <p className="text-2xl font-bold text-primary mt-2">
            Rs. {totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">Received</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            Rs. {totalReceived.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Balance Due
          </p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            Rs. {totalBalance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Purchase History
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Description / Project
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Received
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {salesInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No sales invoices found for this customer
                  </td>
                </tr>
              ) : (
                salesInvoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {invoice.jobDescription || invoice.project?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      Rs. {(invoice.netTotal || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                      Rs. {(invoice.amountReceived || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                      Rs. {(invoice.balance || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
              <tr className="bg-muted font-bold">
                <td colSpan="2" className="px-6 py-4 text-sm text-foreground">
                  Total
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  Rs. {totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  Rs. {totalReceived.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  Rs. {totalBalance.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
