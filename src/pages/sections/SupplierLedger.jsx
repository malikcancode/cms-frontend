"use client";

import { useState, useEffect } from "react";
import { supplierApi } from "../../api/supplierApi";
import purchaseApi from "../../api/purchaseApi";
import Loader from "./Loader";

export default function SupplierLedger() {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Fetch purchases when supplier is selected
  useEffect(() => {
    if (selectedSupplier) {
      fetchSupplierPurchases(selectedSupplier.name);
    }
  }, [selectedSupplier]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await supplierApi.getAll();
      setSuppliers(response.data);

      // Set first supplier as default
      if (response.data.length > 0) {
        setSelectedSupplierId(response.data[0]._id);
        setSelectedSupplier(response.data[0]);
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

  const fetchSupplierPurchases = async (vendorName) => {
    try {
      setLoading(true);
      setError("");
      const response = await purchaseApi.getByVendor(vendorName);
      setPurchases(response.data);
    } catch (err) {
      setError(
        "Failed to load purchases: " +
          (err.response?.data?.message || err.message)
      );
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = (e) => {
    const supplierId = e.target.value;
    setSelectedSupplierId(supplierId);
    const supplier = suppliers.find((s) => s._id === supplierId);
    setSelectedSupplier(supplier);
  };

  if (loading && suppliers.length === 0) {
    return <Loader />;
  }

  if (!selectedSupplier) {
    return <div className="text-center py-8">No suppliers found</div>;
  }

  const totalAmount = purchases.reduce((sum, p) => sum + (p.netAmount || 0), 0);
  const totalPaid = 0; // Purchase model doesn't have paid field, would need to track separately
  const totalBalance = totalAmount - totalPaid;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">
        Supplier/Vendor Ledger Report
      </h1>

      <div className="bg-card border border-border rounded-lg p-6">
        <label className="block text-sm font-medium text-foreground mb-3">
          Select Supplier
        </label>
        <select
          value={selectedSupplierId}
          onChange={handleSupplierChange}
          className="w-full md:w-64 px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          {suppliers.map((s) => (
            <option key={s._id} value={s._id}>
              {s.code} - {s.name}
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

      {/* Supplier Info */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Supplier Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase">Code</p>
            <p className="text-foreground font-semibold">
              {selectedSupplier.code}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Name</p>
            <p className="text-foreground font-semibold">
              {selectedSupplier.name}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Company</p>
            <p className="text-foreground font-semibold">
              {selectedSupplier.company}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Category</p>
            <p className="text-foreground font-semibold">
              {selectedSupplier.category}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Email</p>
            <p className="text-foreground font-semibold">
              {selectedSupplier.email}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase">Phone</p>
            <p className="text-foreground font-semibold">
              {selectedSupplier.phone}
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Payable
          </p>
          <p className="text-2xl font-bold text-primary mt-2">
            Rs. {totalAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            Rs. {totalPaid.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Pending Balance
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
                  Item
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Qty × Rate
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Paid
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No purchases found for this supplier
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
                      {purchase.itemName || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {purchase.quantity} × Rs. {purchase.rate}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      Rs. {(purchase.netAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                      Rs. 0
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600 font-semibold">
                      Rs. {(purchase.netAmount || 0).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
              <tr className="bg-muted font-bold">
                <td colSpan="3" className="px-6 py-4 text-sm text-foreground">
                  Total
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  Rs. {totalAmount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  Rs. {totalPaid.toLocaleString()}
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
