"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiPrinter, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import Modal from "../../components/Modal";
import Loader from "./Loader";
import {
  getCashPayments,
  createCashPayment,
  updateCashPayment,
  deleteCashPayment,
  getExpenseAccounts,
} from "../../api/cashPaymentApi";
import { projectApi } from "../../api/projectApi";

export default function CashPayment() {
  const [payments, setPayments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    project: "",
    jobDescription: "",
    employeeRef: "",
    remarks: "",
  });

  const [paymentLines, setPaymentLines] = useState([
    {
      accountCode: "",
      accountName: "",
      description: "",
      amount: 0,
    },
  ]);

  // Fetch initial data
  useEffect(() => {
    fetchPayments();
    fetchProjects();
    fetchExpenseAccounts();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getCashPayments();
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch cash payments:", error);
      alert(error.message || "Failed to fetch cash payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectApi.getAll();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    }
  };

  const fetchExpenseAccounts = async () => {
    try {
      const response = await getExpenseAccounts();
      if (response.success) {
        console.log("Expense accounts fetched:", response.data);
        setExpenseAccounts(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch expense accounts:", error);
    }
  };

  const handleAddLine = () => {
    setPaymentLines([
      ...paymentLines,
      {
        accountCode: "",
        accountName: "",
        description: "",
        amount: 0,
      },
    ]);
  };

  const handleRemoveLine = (index) => {
    if (paymentLines.length > 1) {
      const newLines = paymentLines.filter((_, i) => i !== index);
      setPaymentLines(newLines);
    }
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...paymentLines];
    newLines[index][field] = value;

    // If account is selected, auto-fill account name
    if (field === "accountCode") {
      const selectedAccount = expenseAccounts.find(
        (acc) => (acc.code || acc.mainTypeCode) === value
      );
      if (selectedAccount) {
        newLines[index].accountName =
          selectedAccount.name || selectedAccount.mainAccountTypeText || "";
      }
    }

    setPaymentLines(newLines);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
      project: "",
      jobDescription: "",
      employeeRef: "",
      remarks: "",
    });
    setPaymentLines([
      {
        accountCode: "",
        accountName: "",
        description: "",
        amount: 0,
      },
    ]);
    setEditingPayment(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (paymentLines.length === 0) {
      alert("Please add at least one payment line");
      return;
    }

    const invalidLines = paymentLines.filter(
      (line) => !line.accountCode || !line.accountName || line.amount <= 0
    );

    if (invalidLines.length > 0) {
      alert("Please ensure all payment lines have account and valid amount");
      return;
    }

    try {
      setLoading(true);

      const paymentData = {
        ...formData,
        paymentLines: paymentLines.map((line) => ({
          ...line,
          amount: parseFloat(line.amount),
        })),
      };

      let response;
      if (editingPayment) {
        response = await updateCashPayment(editingPayment._id, paymentData);
        alert("Cash payment updated successfully");
      } else {
        response = await createCashPayment(paymentData);
        alert(
          "Cash payment recorded successfully! Journal entry created automatically."
        );
      }

      if (response.success) {
        fetchPayments();
        setShowForm(false);
        resetForm();
      }
    } catch (error) {
      console.error("Failed to save cash payment:", error);
      alert(error.message || "Failed to save cash payment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      date: new Date(payment.date).toISOString().split("T")[0],
      project: payment.project?._id || "",
      jobDescription: payment.jobDescription || "",
      employeeRef: payment.employeeRef?._id || "",
      remarks: payment.remarks || "",
    });
    setPaymentLines(payment.paymentLines || []);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteCashPayment(id);
      alert("Cash payment deleted successfully");
      fetchPayments();
    } catch (error) {
      console.error("Failed to delete cash payment:", error);
      alert(error.message || "Failed to delete cash payment");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = (payment) => {
    // TODO: Implement print functionality
    alert("Print functionality coming soon!");
  };

  const totalAmount = paymentLines.reduce(
    (sum, line) => sum + parseFloat(line.amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cash Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage cash payment transactions with automatic journal entries
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
          disabled={loading}
        >
          <FiPlus className="w-5 h-5" />
          Record Cash Payment
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        title={editingPayment ? "Edit Cash Payment" : "Record Cash Payment"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project
              </label>
              <select
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              >
                <option value="">Select Project (Optional)</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name} ({project.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Job Description
              </label>
              <input
                type="text"
                placeholder="e.g., Monthly labor wages for 50 workers"
                value={formData.jobDescription}
                onChange={(e) =>
                  setFormData({ ...formData, jobDescription: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </div>
          </div>

          {/* Payment Lines Section */}
          <div className="border-t border-border pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Payment Lines
              </h3>
              <button
                type="button"
                onClick={handleAddLine}
                className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-lg hover:opacity-90 transition text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Line
              </button>
            </div>

            <div className="space-y-3">
              {paymentLines.map((line, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-3 items-start p-3 border border-border rounded-lg bg-muted/30"
                >
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Account Code *
                    </label>
                    <select
                      value={line.accountCode}
                      onChange={(e) =>
                        handleLineChange(index, "accountCode", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                      required
                    >
                      <option value="">Select Account</option>
                      {expenseAccounts.map((account) => {
                        const accountCode =
                          account.code || account.mainTypeCode;
                        const accountName =
                          account.name || account.mainAccountTypeText;
                        return (
                          <option key={account._id} value={accountCode}>
                            {accountCode} - {accountName}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Account Name
                    </label>
                    <input
                      type="text"
                      value={line.accountName}
                      onChange={(e) =>
                        handleLineChange(index, "accountName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                      readOnly
                    />
                  </div>

                  <div className="col-span-12 md:col-span-4">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="Line description"
                      value={line.description}
                      onChange={(e) =>
                        handleLineChange(index, "description", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                    />
                  </div>

                  <div className="col-span-10 md:col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Amount *
                    </label>
                    <input
                      type="number"
                      placeholder="0"
                      value={line.amount}
                      onChange={(e) =>
                        handleLineChange(index, "amount", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="col-span-2 md:col-span-12 md:col-start-1 flex items-end">
                    {paymentLines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Remove line"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount Display */}
            <div className="mt-4 flex justify-end">
              <div className="bg-primary/10 px-6 py-3 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground">
                    Total Amount:
                  </span>
                  <span className="text-2xl font-bold text-primary">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Remarks
            </label>
            <textarea
              placeholder="Additional notes or remarks"
              value={formData.remarks}
              onChange={(e) =>
                setFormData({ ...formData, remarks: e.target.value })
              }
              className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              rows={2}
            />
          </div>

          {/* Accounting Entry Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              📊 Automatic Journal Entry
            </h4>
            <p className="text-xs text-blue-700 mb-2">
              Upon saving, the following double-entry bookkeeping will be
              created automatically:
            </p>
            <div className="space-y-1 text-xs text-blue-800">
              {paymentLines.map((line, index) =>
                line.accountCode && line.amount > 0 ? (
                  <div key={index}>
                    • Debit: {line.accountName || line.accountCode} - Rs.{" "}
                    {parseFloat(line.amount || 0).toLocaleString()}
                  </div>
                ) : null
              )}
              {totalAmount > 0 && (
                <div>
                  • Credit: Cash Account (1000) - Rs.{" "}
                  {totalAmount.toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50"
            >
              {loading
                ? "Processing..."
                : editingPayment
                ? "Update Payment"
                : "Record Payment"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              disabled={loading}
              className="flex-1 bg-muted text-foreground py-2.5 rounded-lg hover:bg-muted/80 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading && !showForm ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No cash payments recorded yet
            </p>
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              className="mt-4 text-primary hover:underline"
            >
              Record your first cash payment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Serial No
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Job Description
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Lines
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr
                    key={payment._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {payment.serialNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(payment.date).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.project?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground max-w-xs truncate">
                      {payment.jobDescription || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {payment.paymentLines?.length || 0} line(s)
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                      Rs. {payment.totalAmount?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {payment.cancel ? (
                        <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                          Cancelled
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(payment)}
                          className="p-2 hover:bg-muted rounded-lg transition text-foreground"
                          title="Edit"
                          disabled={payment.cancel}
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(payment)}
                          className="p-2 hover:bg-muted rounded-lg transition text-foreground"
                          title="Print"
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(payment._id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                          title="Delete"
                          disabled={payment.cancel}
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Cash Payments
          </h3>
          <p className="text-2xl font-bold text-foreground mt-2">
            Rs.{" "}
            {payments
              .filter((p) => !p.cancel)
              .reduce((sum, payment) => sum + (payment.totalAmount || 0), 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Transactions
          </h3>
          <p className="text-2xl font-bold text-foreground mt-2">
            {payments.filter((p) => !p.cancel).length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            This Month
          </h3>
          <p className="text-2xl font-bold text-foreground mt-2">
            Rs.{" "}
            {payments
              .filter((p) => {
                const paymentDate = new Date(p.date);
                const now = new Date();
                return (
                  !p.cancel &&
                  paymentDate.getMonth() === now.getMonth() &&
                  paymentDate.getFullYear() === now.getFullYear()
                );
              })
              .reduce((sum, payment) => sum + (payment.totalAmount || 0), 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Cancelled
          </h3>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {payments.filter((p) => p.cancel).length}
          </p>
        </div>
      </div>
    </div>
  );
}
