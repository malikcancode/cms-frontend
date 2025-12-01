import { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import generalLedgerApi from "../../api/generalLedgerApi";
import Loader from "./Loader";

export default function BalanceSheet() {
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchBalanceSheet();
  }, [asOfDate]);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await generalLedgerApi.getBalanceSheet(asOfDate);
      setBalanceSheet(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching balance sheet");
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
        <h1 className="text-3xl font-bold text-foreground">Balance Sheet</h1>
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
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">As of Date:</label>
          <input
            type="date"
            value={asOfDate}
            onChange={(e) => setAsOfDate(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-white text-black"
          />
        </div>
      </div>

      {/* Balance Sheet Report */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Balance Sheet</h2>
          <p className="text-sm text-muted-foreground">
            As of {new Date(asOfDate).toLocaleDateString()}
          </p>
        </div>

        {balanceSheet && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Assets */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-foreground border-b-2 pb-2">
                ASSETS
              </h3>
              <div className="space-y-2">
                {balanceSheet.assets?.accounts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4">
                    No assets found
                  </p>
                ) : (
                  balanceSheet.assets?.accounts?.map((account, index) => (
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
                      <span className="text-sm font-semibold">
                        Rs.{" "}
                        {account.balance?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  ))
                )}
                <div className="flex justify-between items-center py-3 font-bold border-t-2 border-foreground mt-4">
                  <span>Total Assets</span>
                  <span className="text-lg">
                    Rs.{" "}
                    {balanceSheet.assets?.total?.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Liabilities & Equity */}
            <div className="space-y-4">
              {/* Liabilities */}
              <div>
                <h3 className="text-xl font-bold text-foreground border-b-2 pb-2">
                  LIABILITIES
                </h3>
                <div className="space-y-2 mt-4">
                  {balanceSheet.liabilities?.accounts?.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No liabilities found
                    </p>
                  ) : (
                    balanceSheet.liabilities?.accounts?.map(
                      (account, index) => (
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
                          <span className="text-sm font-semibold">
                            Rs.{" "}
                            {account.balance?.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )
                    )
                  )}
                  <div className="flex justify-between items-center py-2 font-semibold border-t border-border">
                    <span>Total Liabilities</span>
                    <span>
                      Rs.{" "}
                      {balanceSheet.liabilities?.total?.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Equity */}
              <div className="mt-6">
                <h3 className="text-xl font-bold text-foreground border-b-2 pb-2">
                  EQUITY
                </h3>
                <div className="space-y-2 mt-4">
                  {balanceSheet.equity?.accounts?.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">
                      No equity found
                    </p>
                  ) : (
                    balanceSheet.equity?.accounts?.map((account, index) => (
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
                        <span className="text-sm font-semibold">
                          Rs.{" "}
                          {account.balance?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>
                    ))
                  )}
                  <div className="flex justify-between items-center py-2 font-semibold border-t border-border">
                    <span>Total Equity</span>
                    <span>
                      Rs.{" "}
                      {balanceSheet.equity?.total?.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Liabilities & Equity */}
              <div className="flex justify-between items-center py-3 font-bold border-t-2 border-foreground mt-4">
                <span>Total Liabilities & Equity</span>
                <span className="text-lg">
                  Rs.{" "}
                  {balanceSheet.totalLiabilitiesAndEquity?.toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Balance Status */}
        {balanceSheet && (
          <div className="mt-6 p-4 rounded-lg border-2 border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Balance Sheet Status:</span>
              <span
                className={`px-4 py-2 rounded-full font-bold ${
                  balanceSheet.isBalanced
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {balanceSheet.isBalanced ? "✓ BALANCED" : "✗ NOT BALANCED"}
              </span>
            </div>
            {!balanceSheet.isBalanced && (
              <p className="mt-2 text-sm text-red-600">
                Assets do not equal Liabilities + Equity. Difference: Rs.{" "}
                {Math.abs(
                  balanceSheet.assets?.total -
                    balanceSheet.totalLiabilitiesAndEquity
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">
              Assets = Liabilities + Equity (Accounting Equation)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
