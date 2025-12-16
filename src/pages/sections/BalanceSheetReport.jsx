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

  const handleDownloadPDF = () => {
    if (!balanceSheet) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Balance Sheet - ${new Date(
            asOfDate
          ).toLocaleDateString()}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 40px; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .header h1 { color: #333; margin-bottom: 10px; }
            .header p { color: #666; }
            .date-section { text-align: center; margin-bottom: 20px; font-size: 14px; color: #555; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 30px; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #333; border-bottom: 2px solid #333; padding-bottom: 8px; margin-bottom: 16px; }
            .account-row { display: flex; justify-content: space-between; padding: 8px 4px; border-bottom: 1px solid #eee; }
            .account-name { font-size: 13px; }
            .account-code { font-size: 11px; color: #666; }
            .account-amount { font-size: 13px; font-weight: 600; text-align: right; }
            .total-row { display: flex; justify-content: space-between; padding: 12px 4px; font-weight: bold; border-top: 2px solid #333; margin-top: 16px; font-size: 16px; }
            .subtotal-row { display: flex; justify-content: space-between; padding: 10px 4px; font-weight: 600; border-top: 1px solid #333; margin-top: 8px; }
            .balance-status { margin-top: 30px; padding: 20px; border: 2px solid #ddd; border-radius: 8px; text-align: center; }
            .balanced { background: #d4edda; color: #155724; border-color: #c3e6cb; }
            .not-balanced { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }
            .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>BALANCE SHEET</h1>
            <p>YM CONSTRUCTIONS</p>
          </div>
          <div class="date-section">
            <strong>As of: ${new Date(asOfDate).toLocaleDateString()}</strong>
          </div>
          <div class="grid">
            <div>
              <div class="section">
                <div class="section-title">ASSETS</div>
                ${
                  balanceSheet.assets?.accounts
                    ?.map(
                      (account) => `
                  <div class="account-row">
                    <div>
                      <div class="account-name">${account.accountName}</div>
                      <div class="account-code">${account.accountCode}</div>
                    </div>
                    <div class="account-amount">Rs. ${account.balance?.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}</div>
                  </div>
                `
                    )
                    .join("") ||
                  '<p style="color: #999; padding: 16px 0;">No assets found</p>'
                }
                <div class="total-row">
                  <span>Total Assets</span>
                  <span>Rs. ${balanceSheet.assets?.total?.toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}</span>
                </div>
              </div>
            </div>
            <div>
              <div class="section">
                <div class="section-title">LIABILITIES</div>
                ${
                  balanceSheet.liabilities?.accounts
                    ?.map(
                      (account) => `
                  <div class="account-row">
                    <div>
                      <div class="account-name">${account.accountName}</div>
                      <div class="account-code">${account.accountCode}</div>
                    </div>
                    <div class="account-amount">Rs. ${account.balance?.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}</div>
                  </div>
                `
                    )
                    .join("") ||
                  '<p style="color: #999; padding: 16px 0;">No liabilities found</p>'
                }
                <div class="subtotal-row">
                  <span>Total Liabilities</span>
                  <span>Rs. ${balanceSheet.liabilities?.total?.toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}</span>
                </div>
              </div>
              <div class="section" style="margin-top: 30px;">
                <div class="section-title">EQUITY</div>
                ${
                  balanceSheet.equity?.accounts
                    ?.map(
                      (account) => `
                  <div class="account-row">
                    <div>
                      <div class="account-name">${account.accountName}</div>
                      <div class="account-code">${account.accountCode}</div>
                    </div>
                    <div class="account-amount">Rs. ${account.balance?.toLocaleString(
                      undefined,
                      { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                    )}</div>
                  </div>
                `
                    )
                    .join("") ||
                  '<p style="color: #999; padding: 16px 0;">No equity found</p>'
                }
                <div class="subtotal-row">
                  <span>Total Equity</span>
                  <span>Rs. ${balanceSheet.equity?.total?.toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}</span>
                </div>
                <div class="total-row">
                  <span>Total Liabilities & Equity</span>
                  <span>Rs. ${balanceSheet.totalLiabilitiesAndEquity?.toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="balance-status ${
            balanceSheet.isBalanced ? "balanced" : "not-balanced"
          }">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
              ${balanceSheet.isBalanced ? "✓ BALANCED" : "✗ NOT BALANCED"}
            </div>
            ${
              !balanceSheet.isBalanced
                ? `<div style="font-size: 14px;">Difference: Rs. ${Math.abs(
                    balanceSheet.assets?.total -
                      balanceSheet.totalLiabilitiesAndEquity
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</div>`
                : ""
            }
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
        <h1 className="text-3xl font-bold text-foreground">Balance Sheet</h1>
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
