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

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Trial Balance</h1>
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
            className="px-3 py-2 border border-border rounded-lg"
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
