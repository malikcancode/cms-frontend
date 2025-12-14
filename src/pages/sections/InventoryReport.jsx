"use client";

import { useState, useEffect } from "react";
import { reportApi } from "../../api/reportApi";
import Loader from "./Loader";

export default function InventoryReport() {
  const [inventoryData, setInventoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInventoryReport();
  }, []);

  const fetchInventoryReport = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await reportApi.getInventoryReport();
      setInventoryData(response.data);
    } catch (err) {
      setError(
        "Failed to load inventory report: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Inventory Report</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!inventoryData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No inventory data available
      </div>
    );
  }

  const { summary, inventory } = inventoryData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Inventory Report</h1>
        <button
          onClick={fetchInventoryReport}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Items
          </p>
          <p className="text-2xl font-bold text-primary mt-2">
            {summary.totalItems}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">In Stock</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            {summary.inStockItems}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
          <p className="text-2xl font-bold text-yellow-600 mt-2">
            {summary.lowStockItems}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Out of Stock
          </p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {summary.outOfStockItems}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Value
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            Rs. {summary.totalInventoryValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Item Code
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Unit
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Purchased
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Sold
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Current Stock
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Rate
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                  Stock Value
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventory.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No inventory items found
                  </td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr
                    key={item.itemId}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {item.itemCode}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {item.itemName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {item.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-foreground">
                      {item.purchased.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-foreground">
                      {item.sold.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-foreground">
                      {item.currentStock.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-muted-foreground">
                      Rs. {item.rate.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-foreground">
                      Rs. {item.stockValue.toLocaleString()}
                    </td>
                    <td className="px-2 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-[10px] font-medium whitespace-nowrap ${
                          item.status === "In Stock"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Low Stock"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
              {inventory.length > 0 && (
                <tr className="bg-muted font-bold">
                  <td colSpan="8" className="px-6 py-4 text-sm text-foreground">
                    Total Inventory Value
                  </td>
                  <td className="px-6 py-4 text-sm text-right text-foreground">
                    Rs. {summary.totalInventoryValue.toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
