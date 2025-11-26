"use client";

import { useState, useEffect } from "react";
import { reportApi } from "../../api/reportApi";
import Loader from "./Loader";

export default function IncomeStatement() {
  const [statementData, setStatementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchIncomeStatement();
  }, []);

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await reportApi.getIncomeStatement(startDate, endDate);
      setStatementData(response.data);
    } catch (err) {
      setError(
        "Failed to load income statement: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchIncomeStatement();
  };

  if (loading && !statementData) {
    return <Loader />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Income Statement</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!statementData) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No data available
      </div>
    );
  }

  const {
    revenue,
    expenses,
    totalOperatingExpenses,
    grossProfit,
    otherIncome,
    netIncome,
    period,
  } = statementData;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Income Statement</h1>

      {/* Date Filter */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="flex items-end">
            <button
              onClick={handleFilter}
              disabled={loading}
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {loading ? "Loading..." : "Apply Filter"}
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            Rs. {revenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            Rs. {totalOperatingExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Gross Profit
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            Rs. {grossProfit.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Net Income
          </p>
          <p
            className={`text-2xl font-bold mt-2 ${
              netIncome >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            Rs. {netIncome.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Income Statement Details */}
      <div className="bg-card border border-border rounded-lg p-8">
        <div className="text-center mb-8 pb-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            Construction Management System
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Income Statement</p>
          <p className="text-xs text-muted-foreground">
            Period: {period.startDate} to {period.endDate}
          </p>
        </div>

        <div className="space-y-4">
          {/* Revenue Section */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-foreground">
                Revenue from Sales
              </span>
              <span className="font-semibold text-foreground">
                Rs. {revenue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-semibold text-foreground mb-3">
              Less: Operating Expenses
            </p>
            <div className="space-y-2 ml-4">
              {Object.entries(expenses).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {key
                      .replace(/([A-Z])/g, " $1")
                      .trim()
                      .replace(/^./, (str) => str.toUpperCase())}
                  </span>
                  <span className="text-foreground">
                    Rs. {value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-border">
              <span className="font-semibold text-foreground">
                Total Operating Expenses
              </span>
              <span className="font-semibold text-foreground">
                Rs. {totalOperatingExpenses.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-foreground">Gross Profit</span>
              <span
                className={grossProfit >= 0 ? "text-green-600" : "text-red-600"}
              >
                Rs. {grossProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {otherIncome > 0 && (
            <div className="border-t border-border pt-4">
              <p className="font-semibold text-foreground mb-3">Other Income</p>
              <div className="space-y-2 ml-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Miscellaneous Income
                  </span>
                  <span className="text-green-600">
                    Rs. {otherIncome.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="border-t-2 border-b-2 border-foreground pt-4 pb-4">
            <div className="flex justify-between font-bold text-xl">
              <span className="text-foreground">Net Income</span>
              <span
                className={netIncome >= 0 ? "text-blue-600" : "text-red-600"}
              >
                Rs. {netIncome.toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-right">
              {netIncome >= 0 ? "Profit" : "Loss"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
