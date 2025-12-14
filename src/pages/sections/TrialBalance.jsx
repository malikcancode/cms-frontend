import { useState, useEffect } from "react";
import { FiDownload } from "react-icons/fi";
import generalLedgerApi from "../../api/generalLedgerApi";
import Loader from "./Loader";

export default function TrialBalance() {
  const [trialBalance, setTrialBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [asOfDate, setAsOfDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchTrialBalance();
  }, [asOfDate]);

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await generalLedgerApi.getTrialBalance(asOfDate);
      setTrialBalance(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching trial balance");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!trialBalance) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Trial Balance - ${new Date(
            asOfDate
          ).toLocaleDateString()}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #333;
              margin-bottom: 10px;
            }
            .header p {
              color: #666;
            }
            .date-section {
              text-align: center;
              margin-bottom: 20px;
              font-size: 14px;
              color: #555;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th {
              background: #333;
              color: white;
              padding: 12px;
              text-align: left;
              font-size: 13px;
            }
            td {
              padding: 10px;
              border-bottom: 1px solid #ddd;
              font-size: 12px;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .total-row {
              font-weight: bold;
              background: #f5f5f5;
              font-size: 14px;
              border-top: 2px solid #333;
            }
            .account-type {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              background: #dbeafe;
              color: #1e40af;
            }
            .balance-status {
              margin-top: 30px;
              padding: 20px;
              border: 2px solid #ddd;
              border-radius: 8px;
              text-align: center;
            }
            .balanced {
              background: #d4edda;
              color: #155724;
              border-color: #c3e6cb;
            }
            .not-balanced {
              background: #f8d7da;
              color: #721c24;
              border-color: #f5c6cb;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>TRIAL BALANCE</h1>
            <p>YM CONSTRUCTIONS</p>
          </div>

          <div class="date-section">
            <strong>As of: ${new Date(asOfDate).toLocaleDateString()}</strong>
          </div>

          <table>
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th class="text-center">Type</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              ${trialBalance.accounts
                ?.map(
                  (account) => `
                <tr>
                  <td>${account.accountCode}</td>
                  <td>${account.accountName}</td>
                  <td class="text-center">
                    <span class="account-type">${account.accountType}</span>
                  </td>
                  <td class="text-right">${
                    account.debit > 0
                      ? "Rs. " +
                        account.debit.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "-"
                  }</td>
                  <td class="text-right">${
                    account.credit > 0
                      ? "Rs. " +
                        account.credit.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : "-"
                  }</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total-row">
                <td colspan="3">TOTAL</td>
                <td class="text-right">Rs. ${trialBalance.totalDebit?.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</td>
                <td class="text-right">Rs. ${trialBalance.totalCredit?.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</td>
              </tr>
            </tbody>
          </table>

          <div class="balance-status ${
            trialBalance.isBalanced ? "balanced" : "not-balanced"
          }">
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 10px;">
              ${trialBalance.isBalanced ? "✓ BALANCED" : "✗ NOT BALANCED"}
            </div>
            ${
              !trialBalance.isBalanced
                ? `<div style="font-size: 14px;">
                Difference: Rs. ${Math.abs(
                  trialBalance.totalDebit - trialBalance.totalCredit
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>`
                : ""
            }
          </div>

          <div class="footer">
            <p>Generated on ${new Date().toLocaleString()}</p>
            <p>YM CONSTRUCTIONS</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
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
        <h1 className="text-3xl font-bold text-foreground">Trial Balance</h1>
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
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          />
        </div>
      </div>

      {/* Trial Balance Report */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">Trial Balance</h2>
          <p className="text-sm text-muted-foreground">
            As of {new Date(asOfDate).toLocaleDateString()}
          </p>
        </div>

        {trialBalance && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Account Code
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Account Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Debit
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">
                      Credit
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {trialBalance.accounts?.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-4 py-8 text-center text-muted-foreground"
                      >
                        No account balances found
                      </td>
                    </tr>
                  ) : (
                    <>
                      {trialBalance.accounts?.map((account, index) => (
                        <tr key={index} className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm">
                            {account.accountCode}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {account.accountName}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {account.accountType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {account.debit > 0
                              ? `Rs. ${account.debit.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {account.credit > 0
                              ? `Rs. ${account.credit.toLocaleString(
                                  undefined,
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  }
                                )}`
                              : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr className="font-bold bg-muted border-t-2 border-foreground">
                        <td colSpan="3" className="px-4 py-3 text-sm">
                          TOTAL
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          Rs.{" "}
                          {trialBalance.totalDebit?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          Rs.{" "}
                          {trialBalance.totalCredit?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Balance Status */}
            <div className="mt-6 p-4 rounded-lg border-2 border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Balance Status:</span>
                <span
                  className={`px-4 py-2 rounded-full font-bold ${
                    trialBalance.isBalanced
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {trialBalance.isBalanced ? "✓ BALANCED" : "✗ NOT BALANCED"}
                </span>
              </div>
              {!trialBalance.isBalanced && (
                <p className="mt-2 text-sm text-red-600">
                  Difference: Rs.{" "}
                  {Math.abs(
                    trialBalance.totalDebit - trialBalance.totalCredit
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
