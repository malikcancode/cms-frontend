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

  const handleDownloadPDF = () => {
    if (!profitLoss) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Profit & Loss Statement</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { color: #333; margin-bottom: 10px; }
            .header p { color: #666; }
            .date-section { text-align: center; margin-bottom: 20px; font-size: 14px; color: #555; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
            .account-row { display: flex; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid #eee; }
            .account-name { font-size: 13px; }
            .account-code { font-size: 11px; color: #666; }
            .account-amount { font-size: 13px; font-weight: 600; text-align: right; }
            .total-row { display: flex; justify-content: space-between; padding: 12px 4px; font-weight: bold; border-top: 2px solid #333; margin-top: 16px; font-size: 16px; }
            .net-profit { margin-top: 30px; padding: 20px; border: 2px solid #333; border-radius: 8px; background: #f5f5f5; }
            .net-profit-row { display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; }
            .profit { color: #16a34a; }
            .loss { color: #dc2626; }
            .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 30px; }
            .summary-card { padding: 16px; border: 1px solid #ddd; border-radius: 8px; }
            .summary-label { font-size: 11px; color: #666; font-weight: 600; }
            .summary-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PROFIT & LOSS STATEMENT</h1>
            <p>YM CONSTRUCTIONS</p>
          </div>
          <div class="date-section">
            <strong>Period: ${new Date(
              filters.startDate
            ).toLocaleDateString()} to ${new Date(
      filters.endDate
    ).toLocaleDateString()}</strong>
          </div>
          <div class="section">
            <div class="section-title">
              <span>📈 REVENUE</span>
            </div>
            ${
              profitLoss.revenue?.accounts
                ?.map(
                  (account) => `
              <div class="account-row">
                <div>
                  <div class="account-name">${account.accountName}</div>
                  <div class="account-code">${account.accountCode}</div>
                </div>
                <div class="account-amount" style="color: #16a34a;">Rs. ${account.amount?.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</div>
              </div>
            `
                )
                .join("") ||
              '<p style="color: #999; padding: 16px 0;">No revenue accounts found</p>'
            }
            <div class="total-row">
              <span>Total Revenue</span>
              <span style="color: #16a34a;">Rs. ${profitLoss.revenue?.total?.toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}</span>
            </div>
          </div>
          <div class="section">
            <div class="section-title">
              <span>📉 EXPENSES</span>
            </div>
            ${
              profitLoss.expenses?.accounts
                ?.map(
                  (account) => `
              <div class="account-row">
                <div>
                  <div class="account-name">${account.accountName}</div>
                  <div class="account-code">${account.accountCode}</div>
                </div>
                <div class="account-amount" style="color: #dc2626;">Rs. ${account.amount?.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</div>
              </div>
            `
                )
                .join("") ||
              '<p style="color: #999; padding: 16px 0;">No expense accounts found</p>'
            }
            <div class="total-row">
              <span>Total Expenses</span>
              <span style="color: #dc2626;">Rs. ${profitLoss.expenses?.total?.toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}</span>
            </div>
          </div>
          <div class="net-profit">
            <div class="net-profit-row">
              <span>Net Profit / (Loss)</span>
              <span class="${profitLoss.netProfit >= 0 ? "profit" : "loss"}">
                ${profitLoss.netProfit >= 0 ? "+" : "-"} Rs. ${Math.abs(
      profitLoss.netProfit
    )?.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}
              </span>
            </div>
            <div style="margin-top: 12px; display: flex; justify-content: space-between; font-size: 13px;">
              <span style="color: #666;">Net Profit Margin:</span>
              <span style="font-weight: 600;">${profitLoss.netProfitMargin?.toFixed(
                2
              )}%</span>
            </div>
          </div>
          <div class="summary-cards">
            <div class="summary-card" style="background: #dcfce7; border-color: #86efac;">
              <div class="summary-label" style="color: #166534;">Total Revenue</div>
              <div class="summary-value" style="color: #15803d;">Rs. ${profitLoss.revenue?.total?.toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}</div>
            </div>
            <div class="summary-card" style="background: #fee2e2; border-color: #fca5a5;">
              <div class="summary-label" style="color: #991b1b;">Total Expenses</div>
              <div class="summary-value" style="color: #dc2626;">Rs. ${profitLoss.expenses?.total?.toLocaleString(
                undefined,
                { minimumFractionDigits: 2, maximumFractionDigits: 2 }
              )}</div>
            </div>
            <div class="summary-card" style="background: ${
              profitLoss.netProfit >= 0 ? "#dbeafe" : "#fed7aa"
            }; border-color: ${
      profitLoss.netProfit >= 0 ? "#93c5fd" : "#fdba74"
    };">
              <div class="summary-label" style="color: ${
                profitLoss.netProfit >= 0 ? "#1e40af" : "#c2410c"
              };">Net ${profitLoss.netProfit >= 0 ? "Profit" : "Loss"}</div>
              <div class="summary-value" style="color: ${
                profitLoss.netProfit >= 0 ? "#1e3a8a" : "#ea580c"
              };">Rs. ${Math.abs(profitLoss.netProfit)?.toLocaleString(
      undefined,
      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
    )}</div>
            </div>
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>YM CONSTRUCTIONS</p>
          </div>
          <script>
            window.onload = function() { window.print(); };
          </script>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
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
        <button
          onClick={handleDownloadPDF}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
        >
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
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
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
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
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
