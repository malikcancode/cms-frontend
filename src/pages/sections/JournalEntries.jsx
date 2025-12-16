import { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiRefreshCw,
  FiEye,
  FiFilter,
  FiDownload,
} from "react-icons/fi";
import journalEntryApi from "../../api/journalEntryApi";
import chartOfAccountApi from "../../api/chartOfAccountApi";
import Modal from "../../components/Modal";
import Loader from "./Loader";

export default function JournalEntries() {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    transactionType: "",
    status: "",
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    transactionType: "Journal",
    description: "",
    lines: [
      {
        accountCode: "",
        accountName: "",
        accountType: "",
        debit: 0,
        credit: 0,
        description: "",
      },
      {
        accountCode: "",
        accountName: "",
        accountType: "",
        debit: 0,
        credit: 0,
        description: "",
      },
    ],
    notes: "",
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [entriesResponse, accountsResponse] = await Promise.all([
        journalEntryApi.getJournalEntries(filters),
        chartOfAccountApi.getChartOfAccounts(),
      ]);
      setEntries(entriesResponse.data || []);
      setAccounts(accountsResponse.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (index, accountCode) => {
    const account = accounts.find((acc) => acc.code === accountCode);
    if (account) {
      const newLines = [...formData.lines];
      newLines[index] = {
        ...newLines[index],
        accountCode: account.code,
        accountName: account.name,
        accountType: account.accountType || "Expense",
        account: account._id,
      };
      setFormData({ ...formData, lines: newLines });
    }
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] =
      field === "debit" || field === "credit" ? parseFloat(value) || 0 : value;
    setFormData({ ...formData, lines: newLines });
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [
        ...formData.lines,
        {
          accountCode: "",
          accountName: "",
          accountType: "",
          debit: 0,
          credit: 0,
          description: "",
        },
      ],
    });
  };

  const removeLine = (index) => {
    if (formData.lines.length > 2) {
      const newLines = formData.lines.filter((_, i) => i !== index);
      setFormData({ ...formData, lines: newLines });
    }
  };

  const calculateTotals = () => {
    const totalDebit = formData.lines.reduce(
      (sum, line) => sum + (parseFloat(line.debit) || 0),
      0
    );
    const totalCredit = formData.lines.reduce(
      (sum, line) => sum + (parseFloat(line.credit) || 0),
      0
    );
    return { totalDebit, totalCredit, difference: totalDebit - totalCredit };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { totalDebit, totalCredit, difference } = calculateTotals();

    if (Math.abs(difference) > 0.01) {
      setError(
        `Journal entry is not balanced. Debits (${totalDebit}) must equal Credits (${totalCredit})`
      );
      return;
    }

    try {
      setError("");
      if (selectedEntry) {
        await journalEntryApi.updateJournalEntry(selectedEntry._id, formData);
        setSuccess("Journal entry updated successfully");
      } else {
        await journalEntryApi.createJournalEntry(formData);
        setSuccess("Journal entry created successfully");
      }
      setShowModal(false);
      fetchData();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving journal entry");
    }
  };

  const handleView = (entry) => {
    setSelectedEntry(entry);
    setShowViewModal(true);
  };

  const handleEdit = (entry) => {
    setSelectedEntry(entry);
    setFormData({
      date: entry.date.split("T")[0],
      transactionType: entry.transactionType,
      description: entry.description,
      lines: entry.lines,
      notes: entry.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      try {
        await journalEntryApi.deleteJournalEntry(id);
        setSuccess("Journal entry deleted successfully");
        fetchData();
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting journal entry");
      }
    }
  };

  const handleReverse = async (id) => {
    const reason = prompt("Please enter reason for reversal:");
    if (reason) {
      try {
        await journalEntryApi.reverseJournalEntry(id, reason);
        setSuccess("Journal entry reversed successfully");
        fetchData();
      } catch (err) {
        setError(
          err.response?.data?.message || "Error reversing journal entry"
        );
      }
    }
  };

  const handleDownloadPDF = (entry) => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Journal Entry - ${entry.entryNumber}</title>
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
            .info-section {
              margin-bottom: 20px;
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
            }
            .info-item {
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              display: block;
              margin-bottom: 5px;
              font-size: 12px;
            }
            .info-value {
              color: #333;
              font-size: 14px;
            }
            .description {
              margin: 20px 0;
              padding: 15px;
              background: #f9f9f9;
              border-left: 4px solid #333;
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
            .total-row {
              font-weight: bold;
              background: #f5f5f5;
              font-size: 14px;
            }
            .status-badge {
              display: inline-block;
              padding: 5px 10px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: bold;
            }
            .status-posted {
              background: #d4edda;
              color: #155724;
            }
            .status-draft {
              background: #fff3cd;
              color: #856404;
            }
            .status-reversed {
              background: #f8d7da;
              color: #721c24;
            }
            .notes {
              margin-top: 20px;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 5px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 1px solid #ddd;
              padding-top: 20px;
            }
            .signatures {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 40px;
              margin-top: 60px;
              margin-bottom: 30px;
              padding: 0 20px;
            }
            .signature-box {
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #333;
              margin-top: 60px;
              padding-top: 8px;
              font-weight: bold;
              color: #333;
            }
            .signature-label {
              font-size: 11px;
              color: #666;
              margin-top: 5px;
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
            <h1>JOURNAL ENTRY</h1>
            <p>YM CONSTRUCTIONS</p>
          </div>

          <div class="info-section">
            <div class="info-item">
              <span class="info-label">Entry Number</span>
              <span class="info-value">${entry.entryNumber}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Date</span>
              <span class="info-value">${new Date(
                entry.date
              ).toLocaleDateString()}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Transaction Type</span>
              <span class="info-value">${entry.transactionType}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Status</span>
              <span class="status-badge status-${entry.status.toLowerCase()}">${
      entry.status
    }</span>
            </div>
          </div>

          <div class="description">
            <span class="info-label">Description</span>
            <p>${entry.description}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Account Code</th>
                <th>Account Name</th>
                <th>Description</th>
                <th class="text-right">Debit</th>
                <th class="text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              ${entry.lines
                .map(
                  (line) => `
                <tr>
                  <td>${line.accountCode}</td>
                  <td>${line.accountName}</td>
                  <td>${line.description || "-"}</td>
                  <td class="text-right">${
                    line.debit > 0 ? "Rs. " + line.debit.toLocaleString() : "-"
                  }</td>
                  <td class="text-right">${
                    line.credit > 0
                      ? "Rs. " + line.credit.toLocaleString()
                      : "-"
                  }</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total-row">
                <td colspan="3">TOTAL</td>
                <td class="text-right">Rs. ${entry.totalDebit.toLocaleString()}</td>
                <td class="text-right">Rs. ${entry.totalCredit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          ${
            entry.notes
              ? `
            <div class="notes">
              <span class="info-label">Notes</span>
              <p>${entry.notes}</p>
            </div>
          `
              : ""
          }

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">Prepared by</div>
              <div class="signature-label">Name & Signature</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Reviewed by</div>
              <div class="signature-label">Name & Signature</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Approved by</div>
              <div class="signature-label">Name & Signature</div>
            </div>
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

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      transactionType: "Journal",
      description: "",
      lines: [
        {
          accountCode: "",
          accountName: "",
          accountType: "",
          debit: 0,
          credit: 0,
          description: "",
        },
        {
          accountCode: "",
          accountName: "",
          accountType: "",
          debit: 0,
          credit: 0,
          description: "",
        },
      ],
      notes: "",
    });
    setSelectedEntry(null);
  };

  const { totalDebit, totalCredit, difference } = calculateTotals();

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
        <h1 className="text-3xl font-bold text-foreground">Journal Entries</h1>
        {/* <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
        >
          <FiPlus /> New Journal Entry
        </button> */}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters({ ...filters, startDate: e.target.value })
            }
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters({ ...filters, endDate: e.target.value })
            }
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
            placeholder="End Date"
          />
          <select
            value={filters.transactionType}
            onChange={(e) =>
              setFilters({ ...filters, transactionType: e.target.value })
            }
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="">All Types</option>
            <option value="Sale">Sale</option>
            <option value="Purchase">Purchase</option>
            <option value="Payment">Payment</option>
            <option value="Receipt">Receipt</option>
            <option value="Journal">Journal</option>
          </select>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground"
          >
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Posted">Posted</option>
            {/* <option value="Reversed">Reversed</option> */}
          </select>
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Entry No.
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Type
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
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  Status
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No journal entries found
                  </td>
                </tr>
              ) : (
                entries.map((entry) => (
                  <tr key={entry._id} className="hover:bg-muted/50">
                    <td className="px-4 py-3 text-sm">{entry.entryNumber}</td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {entry.transactionType}
                    </td>
                    <td className="px-4 py-3 text-sm">{entry.description}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      Rs. {entry.totalDebit?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      Rs. {entry.totalCredit?.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          entry.status === "Posted"
                            ? "bg-green-100 text-green-800"
                            : entry.status === "Draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDownloadPDF(entry)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Download PDF"
                        >
                          <FiDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleView(entry)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View"
                        >
                          <FiEye size={18} />
                        </button>
                        {entry.status === "Draft" && (
                          <>
                            <button
                              onClick={() => handleEdit(entry)}
                              className="text-green-600 hover:text-green-800"
                              title="Edit"
                            >
                              <FiEdit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(entry._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </>
                        )}
                        {/* {entry.status === "Posted" && (
                          <button
                            onClick={() => handleReverse(entry._id)}
                            className="text-orange-600 hover:text-orange-800"
                            title="Reverse"
                          >
                            <FiRefreshCw size={18} />
                          </button>
                        )} */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Journal Entry"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Transaction Type
              </label>
              <select
                value={formData.transactionType}
                onChange={(e) =>
                  setFormData({ ...formData, transactionType: e.target.value })
                }
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                required
              >
                <option value="Journal">Journal</option>
                <option value="Adjustment">Adjustment</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              rows="2"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Entry Lines</label>
              <button
                type="button"
                onClick={addLine}
                className="text-primary text-sm flex items-center gap-1"
              >
                <FiPlus /> Add Line
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {formData.lines.map((line, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-3 space-y-2"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select
                        value={line.accountCode}
                        onChange={(e) =>
                          handleAccountChange(index, e.target.value)
                        }
                        className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                        required
                      >
                        <option value="">Select Account</option>
                        {accounts.map((acc) => (
                          <option key={acc._id} value={acc.code}>
                            {acc.code} - {acc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Debit"
                        value={line.debit || ""}
                        onChange={(e) =>
                          handleLineChange(index, "debit", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                        step="0.01"
                      />
                      <input
                        type="number"
                        placeholder="Credit"
                        value={line.credit || ""}
                        onChange={(e) =>
                          handleLineChange(index, "credit", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                        step="0.01"
                      />
                      {formData.lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Line description"
                    value={line.description}
                    onChange={(e) =>
                      handleLineChange(index, "description", e.target.value)
                    }
                    className="w-full px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                  />
                </div>
              ))}
            </div>

            <div className="mt-3 p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Total Debit: Rs. {totalDebit.toFixed(2)}</span>
                <span>Total Credit: Rs. {totalCredit.toFixed(2)}</span>
                <span
                  className={
                    difference !== 0
                      ? "text-red-600 font-bold"
                      : "text-green-600 font-bold"
                  }
                >
                  Difference: Rs. {Math.abs(difference).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              rows="2"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              {selectedEntry ? "Update" : "Create"} Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="View Journal Entry"
      >
        {selectedEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Entry Number
                </label>
                <p className="text-sm font-semibold">
                  {selectedEntry.entryNumber}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Date
                </label>
                <p className="text-sm font-semibold">
                  {new Date(selectedEntry.date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Type
                </label>
                <p className="text-sm font-semibold">
                  {selectedEntry.transactionType}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedEntry.status === "Posted"
                      ? "bg-green-100 text-green-800"
                      : selectedEntry.status === "Draft"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {selectedEntry.status}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground">
                Description
              </label>
              <p className="text-sm">{selectedEntry.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Entry Lines
              </label>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Account</th>
                      <th className="px-3 py-2 text-left">Description</th>
                      <th className="px-3 py-2 text-right">Debit</th>
                      <th className="px-3 py-2 text-right">Credit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedEntry.lines.map((line, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2">
                          {line.accountCode} - {line.accountName}
                        </td>
                        <td className="px-3 py-2">{line.description}</td>
                        <td className="px-3 py-2 text-right">
                          {line.debit > 0
                            ? `Rs. ${line.debit.toLocaleString()}`
                            : "-"}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {line.credit > 0
                            ? `Rs. ${line.credit.toLocaleString()}`
                            : "-"}
                        </td>
                      </tr>
                    ))}
                    <tr className="font-bold bg-muted">
                      <td colSpan="2" className="px-3 py-2">
                        Total
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rs. {selectedEntry.totalDebit?.toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-right">
                        Rs. {selectedEntry.totalCredit?.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {selectedEntry.notes && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground">
                  Notes
                </label>
                <p className="text-sm">{selectedEntry.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
