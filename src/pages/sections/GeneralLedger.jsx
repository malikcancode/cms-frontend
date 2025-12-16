import { useState, useEffect } from "react";
import { FiFilter, FiDownload } from "react-icons/fi";
import generalLedgerApi from "../../api/generalLedgerApi";
import chartOfAccountApi from "../../api/chartOfAccountApi";
import Loader from "./Loader";

export default function GeneralLedger() {
  const [ledger, setLedger] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    accountCode: "",
    startDate: "",
    endDate: "",
    accountType: "",
  });

  useEffect(() => {
    fetchAccounts();
    fetchLedger(); // Fetch all ledger entries on initial load
  }, []);

  useEffect(() => {
    fetchLedger();
  }, [filters]);

  const fetchAccounts = async () => {
    try {
      const response = await chartOfAccountApi.getChartOfAccounts();
      setAccounts(response.data || []);
      setLoading(false);
    } catch (err) {
      setError("Error fetching accounts");
      setLoading(false);
    }
  };

  const fetchLedger = async () => {
    try {
      setLoading(true);
      setError("");

      if (filters.accountCode) {
        const response = await generalLedgerApi.getAccountLedger(
          filters.accountCode,
          {
            startDate: filters.startDate,
            endDate: filters.endDate,
          }
        );
        setLedger(response.data?.entries || []);
      } else {
        const response = await generalLedgerApi.getGeneralLedger(filters);
        setLedger(response.data || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching ledger");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (ledger.length === 0) {
      alert("No data to export");
      return;
    }

    // Calculate totals
    const totalDebit = ledger.reduce(
      (sum, entry) => sum + (entry.debit || 0),
      0
    );
    const totalCredit = ledger.reduce(
      (sum, entry) => sum + (entry.credit || 0),
      0
    );

    // Build filter description
    let filterDesc = "";
    if (filters.accountCode) {
      const account = accounts.find((acc) => acc.code === filters.accountCode);
      filterDesc += `Account: ${
        account ? `${account.code} - ${account.name}` : filters.accountCode
      }`;
    } else {
      filterDesc += "All Accounts";
    }
    if (filters.startDate)
      filterDesc += ` | From: ${new Date(
        filters.startDate
      ).toLocaleDateString()}`;
    if (filters.endDate)
      filterDesc += ` | To: ${new Date(filters.endDate).toLocaleDateString()}`;
    if (filters.accountType) filterDesc += ` | Type: ${filters.accountType}`;

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>General Ledger Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header h2 { font-size: 18px; margin-bottom: 10px; color: #333; }
            .header .filters { font-size: 12px; color: #666; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .text-right { text-align: right; }
            .totals { background-color: #f9f9f9; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
            .signature-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 30px; }
            .signature-box { text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; font-size: 12px; }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YM CONSTRUCTIONS</h1>
            <h2>General Ledger Report</h2>
            <div class="filters">${filterDesc}</div>
            <div class="filters">Generated on: ${new Date().toLocaleString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Entry No.</th>
                <th>Account</th>
                <th>Description</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
                <th class="text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              ${ledger
                .map(
                  (entry) => `
                <tr>
                  <td>${new Date(entry.date).toLocaleDateString()}</td>
                  <td>${entry.entryNumber || "-"}</td>
                  <td>${entry.accountCode} - ${entry.accountName}</td>
                  <td>${entry.description || "-"}</td>
                  <td class="text-right">${
                    entry.debit > 0
                      ? `Rs. ${entry.debit.toLocaleString()}`
                      : "-"
                  }</td>
                  <td class="text-right">${
                    entry.credit > 0
                      ? `Rs. ${entry.credit.toLocaleString()}`
                      : "-"
                  }</td>
                  <td class="text-right">Rs. ${(
                    entry.runningBalance ||
                    entry.balance ||
                    0
                  ).toLocaleString()}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="totals">
                <td colspan="4" class="text-right">Total:</td>
                <td class="text-right">Rs. ${totalDebit.toLocaleString()}</td>
                <td class="text-right">Rs. ${totalCredit.toLocaleString()}</td>
                <td class="text-right">-</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line">Prepared by</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">Reviewed by</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">Approved by</div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (loading && !ledger.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">General Ledger</h1>
        <button
          onClick={handleExportPDF}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
        >
          <FiDownload /> Export
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Account</label>
            <select
              value={filters.accountCode}
              onChange={(e) =>
                setFilters({ ...filters, accountCode: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-black"
            >
              <option value="" className="text-black">
                All Accounts
              </option>
              {accounts.map((acc) => (
                <option key={acc._id} value={acc.code} className="text-black">
                  {acc.code} - {acc.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Account Type
            </label>
            <select
              value={filters.accountType}
              onChange={(e) =>
                setFilters({ ...filters, accountType: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-white text-black"
            >
              <option value="" className="text-black">
                All Types
              </option>
              <option value="Asset" className="text-black">
                Asset
              </option>
              <option value="Liability" className="text-black">
                Liability
              </option>
              <option value="Equity" className="text-black">
                Equity
              </option>
              <option value="Revenue" className="text-black">
                Revenue
              </option>
              <option value="Expense" className="text-black">
                Expense
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Entry No.
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Account
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Debit
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Credit
                </th>
                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Balance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ledger.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No ledger entries found for selected filters
                  </td>
                </tr>
              ) : (
                ledger.map((entry, index) => (
                  <tr key={index} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">{entry.entryNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {entry.accountCode} - {entry.accountName}
                    </td>
                    <td className="px-4 py-3 text-sm">{entry.description}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {entry.debit > 0
                        ? `Rs. ${entry.debit.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      {entry.credit > 0
                        ? `Rs. ${entry.credit.toLocaleString()}`
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      Rs.{" "}
                      {(
                        entry.runningBalance ||
                        entry.balance ||
                        0
                      ).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
