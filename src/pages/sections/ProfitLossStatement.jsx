import { useState, useEffect } from "react";
import { FiDownload, FiTrendingUp, FiTrendingDown } from "react-icons/fi";
import generalLedgerApi from "../../api/generalLedgerApi";
import Loader from "./Loader";

export default function ProfitLoss() {
  const [profitLoss, setProfitLoss] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchProfitLoss();
  }, [filters]);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await generalLedgerApi.getProfitAndLoss(
        filters.startDate,
        filters.endDate
      );
      setProfitLoss(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching profit & loss");
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">
          Profit & Loss Statement
        </h1>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90">
          <FiDownload /> Export PDF
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Date Filter */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Start Date:
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date:</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* P&L Report */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Profit & Loss Statement
          </h2>
          <p className="text-sm text-muted-foreground">
            Period: {new Date(filters.startDate).toLocaleDateString()} to{" "}
            {new Date(filters.endDate).toLocaleDateString()}
          </p>
        </div>

        {profitLoss && (
          <div className="space-y-6">
            {/* Revenue Section */}
            <div>
              <h3 className="text-lg font-bold text-foreground border-b-2 pb-2 mb-4 flex items-center gap-2">
                <FiTrendingUp className="text-green-600" />
                REVENUE
              </h3>
              <div className="space-y-2">
                {profitLoss.revenue?.accounts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No revenue accounts found
                  </p>
                ) : (
                  profitLoss.revenue?.accounts?.map((account, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 hover:bg-muted/50 rounded px-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {account.accountName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.accountCode}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        Rs.{" "}
                        {account.amount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))
                )}
                <div className="flex justify-between items-center py-3 font-bold border-t-2 border-border">
                  <span>Total Revenue</span>
                  <span className="text-lg text-green-600">
                    Rs.{" "}
                    {profitLoss.revenue?.total?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses Section */}
            <div>
              <h3 className="text-lg font-bold text-foreground border-b-2 pb-2 mb-4 flex items-center gap-2">
                <FiTrendingDown className="text-red-600" />
                EXPENSES
              </h3>
              <div className="space-y-2">
                {profitLoss.expenses?.accounts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No expense accounts found
                  </p>
                ) : (
                  profitLoss.expenses?.accounts?.map((account, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-2 hover:bg-muted/50 rounded px-2"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {account.accountName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account.accountCode}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">
                        Rs.{" "}
                        {account.amount?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))
                )}
                <div className="flex justify-between items-center py-3 font-bold border-t-2 border-border">
                  <span>Total Expenses</span>
                  <span className="text-lg text-red-600">
                    Rs.{" "}
                    {profitLoss.expenses?.total?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Net Profit/Loss */}
            <div className="mt-6 p-6 rounded-lg border-2 border-border bg-muted">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Net Profit / (Loss)</span>
                <span
                  className={`text-2xl font-bold ${
                    profitLoss.netProfit >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {profitLoss.netProfit >= 0 ? "+" : "-"} Rs.{" "}
                  {Math.abs(profitLoss.netProfit)?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="mt-4 flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Net Profit Margin:
                </span>
                <span className="font-semibold">
                  {profitLoss.netProfitMargin?.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-xs text-green-700 font-medium">
                  Total Revenue
                </p>
                <p className="text-lg font-bold text-green-800 mt-1">
                  Rs.{" "}
                  {profitLoss.revenue?.total?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-xs text-red-700 font-medium">
                  Total Expenses
                </p>
                <p className="text-lg font-bold text-red-800 mt-1">
                  Rs.{" "}
                  {profitLoss.expenses?.total?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div
                className={`${
                  profitLoss.netProfit >= 0
                    ? "bg-blue-50 border-blue-200"
                    : "bg-orange-50 border-orange-200"
                } border rounded-lg p-4`}
              >
                <p
                  className={`text-xs font-medium ${
                    profitLoss.netProfit >= 0
                      ? "text-blue-700"
                      : "text-orange-700"
                  }`}
                >
                  Net {profitLoss.netProfit >= 0 ? "Profit" : "Loss"}
                </p>
                <p
                  className={`text-lg font-bold mt-1 ${
                    profitLoss.netProfit >= 0
                      ? "text-blue-800"
                      : "text-orange-800"
                  }`}
                >
                  Rs.{" "}
                  {Math.abs(profitLoss.netProfit)?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
