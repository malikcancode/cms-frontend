"use client";

import { useState, useEffect, useContext } from "react";
import { FiPlus, FiPrinter, FiTrash2, FiEdit2 } from "react-icons/fi";
import Modal from "../../components/Modal";
import Loader from "./Loader";
import {
  getBankPayments,
  getBankPaymentById,
  createBankPayment,
  updateBankPayment,
  deleteBankPayment,
  getBankEnum,
  getExpenseAccounts,
  generateSerialNumber,
} from "../../api/bankPaymentApi";
import { projectApi } from "../../api/projectApi";
import { userApi } from "../../api/userApi";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import { AuthContext } from "../../context/AuthContext";

export default function BankPayment() {
  const { user } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  // Dropdown data
  const [banks, setBanks] = useState([]);
  const [expenseAccounts, setExpenseAccounts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [formData, setFormData] = useState({
    serialNo: "",
    cancel: false,
    date: new Date().toISOString().split("T")[0],
    project: "",
    jobDescription: "",
    employeeRef: "",
    bankAccount: "",
    bankAccountNumber: "",
    chequeNo: "",
    chequeDate: "",
    paymentLines: [
      { accountCode: "", accountName: "", description: "", amount: "" },
    ],
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchPayments();
    fetchDropdownData();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await getBankPayments();
      setPayments(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(err.message || "Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [banksRes, accountsRes, projectsRes, usersRes] = await Promise.all([
        getBankEnum(),
        getExpenseAccounts(),
        projectApi.getAll(),
        userApi.getAll(),
      ]);

      setBanks(banksRes.data || []);
      setExpenseAccounts(accountsRes.data || []);
      setProjects(projectsRes.data || []);
      setEmployees(usersRes.data || []);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
    }
  };

  const handleOpenForm = async () => {
    try {
      const serialRes = await generateSerialNumber();
      setFormData({
        ...formData,
        serialNo: serialRes.data.serialNo,
        date: new Date().toISOString().split("T")[0],
      });
      setShowForm(true);
    } catch (err) {
      console.error("Error generating serial:", err);
      setShowForm(true);
    }
  };

  const handleTableChange = (index, field, value) => {
    const updated = [...formData.paymentLines];
    updated[index][field] = value;

    // If account code changes, auto-fill account name
    if (field === "accountCode") {
      const account = expenseAccounts.find((acc) => acc.accountCode === value);
      if (account) {
        updated[index].accountName = account.accountName;
      }
    }

    setFormData({ ...formData, paymentLines: updated });
  };

  const handleAddRow = () => {
    setFormData({
      ...formData,
      paymentLines: [
        ...formData.paymentLines,
        { accountCode: "", accountName: "", description: "", amount: "" },
      ],
    });
  };

  const handleRemoveRow = (index) => {
    const updated = formData.paymentLines.filter((_, i) => i !== index);
    setFormData({ ...formData, paymentLines: updated });
  };

  const handleProjectChange = (projectId) => {
    const project = projects.find((p) => p._id === projectId);
    setFormData({
      ...formData,
      project: projectId,
      jobDescription: project
        ? `${project.name} - ${project.description || ""}`
        : "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const paymentData = {
        serialNo: formData.serialNo,
        cancel: formData.cancel,
        date: formData.date,
        project: formData.project || undefined,
        jobDescription: formData.jobDescription,
        employeeRef: formData.employeeRef || undefined,
        bankAccount: formData.bankAccount,
        bankAccountNumber: formData.bankAccountNumber,
        chequeNo: formData.chequeNo,
        chequeDate: formData.chequeDate || undefined,
        paymentLines: formData.paymentLines.filter(
          (line) => line.accountCode && line.amount
        ),
      };

      // Check if user is admin - admins can create/edit directly
      if (user?.role === "admin") {
        if (editingPayment) {
          await updateBankPayment(editingPayment._id, paymentData);
        } else {
          await createBankPayment(paymentData);
        }
        await fetchPayments();
        handleCloseModal();
        setError(null);
      } else {
        // Non-admin users must submit a request
        const requestData = {
          requestType: editingPayment
            ? "edit_bank_payment"
            : "create_bank_payment",
          requestData: paymentData,
          entityId: editingPayment?._id || null,
        };

        const response = await requestApprovalApi.createRequest(requestData);
        if (response.success) {
          alert(
            "Your request has been submitted to the admin for approval. You can view the status in 'My Requests' section."
          );
          handleCloseModal();
          setError(null);
        }
      }
    } catch (err) {
      console.error("Error saving payment:", err);
      setError(err.message || "Failed to save payment");
      alert(err.message || "Failed to save payment");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      serialNo: payment.serialNo,
      cancel: payment.cancel,
      date: new Date(payment.date).toISOString().split("T")[0],
      project: payment.project?._id || "",
      jobDescription: payment.jobDescription || "",
      employeeRef: payment.employeeRef?._id || "",
      bankAccount: payment.bankAccount,
      bankAccountNumber: payment.bankAccountNumber || "",
      chequeNo: payment.chequeNo || "",
      chequeDate: payment.chequeDate
        ? new Date(payment.chequeDate).toISOString().split("T")[0]
        : "",
      paymentLines: payment.paymentLines || [
        { accountCode: "", accountName: "", description: "", amount: "" },
      ],
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this payment?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteBankPayment(id);
      await fetchPayments();
      setError(null);
    } catch (err) {
      console.error("Error deleting payment:", err);
      setError(err.message || "Failed to delete payment");
      alert(err.message || "Failed to delete payment");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowForm(false);
    setEditingPayment(null);
    setFormData({
      serialNo: "",
      cancel: false,
      date: new Date().toISOString().split("T")[0],
      project: "",
      jobDescription: "",
      employeeRef: "",
      bankAccount: "",
      bankAccountNumber: "",
      chequeNo: "",
      chequeDate: "",
      paymentLines: [
        { accountCode: "", accountName: "", description: "", amount: "" },
      ],
    });
    setError(null);
  };

  const handlePrint = async (paymentId) => {
    try {
      setLoading(true);
      const response = await getBankPaymentById(paymentId);
      const payment = response.data;

      // Create a new window for printing
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow pop-ups to print the payment voucher");
        return;
      }

      // Generate HTML content for print
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Bank Payment Voucher - ${payment.serialNo}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20mm;
              background: white;
              color: #000;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #000;
              padding-bottom: 15px;
            }
            .header h1 {
              font-size: 24px;
              margin-bottom: 5px;
            }
            .header h2 {
              font-size: 18px;
              color: #333;
            }
            .voucher-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 20px;
            }
            .info-group {
              margin-bottom: 10px;
            }
            .info-label {
              font-weight: bold;
              font-size: 12px;
              color: #555;
            }
            .info-value {
              font-size: 14px;
              margin-top: 3px;
            }
            .section-title {
              font-size: 16px;
              font-weight: bold;
              margin: 20px 0 10px 0;
              padding: 8px;
              background: #f0f0f0;
              border-left: 4px solid #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            th, td {
              border: 1px solid #333;
              padding: 10px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background: #f0f0f0;
              font-weight: bold;
            }
            .amount-cell {
              text-align: right;
              font-weight: bold;
            }
            .total-row {
              background: #f9f9f9;
              font-weight: bold;
            }
            .signatures {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 30px;
              margin-top: 60px;
            }
            .signature-box {
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 50px;
              padding-top: 8px;
              font-size: 12px;
            }
            .cancelled-watermark {
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 120px;
              color: rgba(255, 0, 0, 0.15);
              font-weight: bold;
              z-index: -1;
              pointer-events: none;
            }
            @media print {
              body {
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${
            payment.cancel
              ? '<div class="cancelled-watermark">CANCELLED</div>'
              : ""
          }
          
          <div class="header">
            <h1>CONSTRUCTION MANAGEMENT SYSTEM</h1>
            <h2>Bank Payment Voucher</h2>
          </div>

          <div class="voucher-info">
            <div>
              <div class="info-group">
                <div class="info-label">Voucher No:</div>
                <div class="info-value">${payment.serialNo}${
        payment.cancel ? " (CANCELLED)" : ""
      }</div>
              </div>
              <div class="info-group">
                <div class="info-label">Date:</div>
                <div class="info-value">${new Date(
                  payment.date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</div>
              </div>
              <div class="info-group">
                <div class="info-label">Project:</div>
                <div class="info-value">${payment.project?.name || "N/A"}</div>
              </div>
              ${
                payment.jobDescription
                  ? `
                <div class="info-group">
                  <div class="info-label">Job Description:</div>
                  <div class="info-value">${payment.jobDescription}</div>
                </div>
              `
                  : ""
              }
            </div>
            <div>
              <div class="info-group">
                <div class="info-label">Bank Account:</div>
                <div class="info-value">${payment.bankAccount}</div>
              </div>
              ${
                payment.bankAccountNumber
                  ? `
                <div class="info-group">
                  <div class="info-label">Account Number:</div>
                  <div class="info-value">${payment.bankAccountNumber}</div>
                </div>
              `
                  : ""
              }
              ${
                payment.chequeNo
                  ? `
                <div class="info-group">
                  <div class="info-label">Cheque No:</div>
                  <div class="info-value">${payment.chequeNo}</div>
                </div>
              `
                  : ""
              }
              ${
                payment.chequeDate
                  ? `
                <div class="info-group">
                  <div class="info-label">Cheque Date:</div>
                  <div class="info-value">${new Date(
                    payment.chequeDate
                  ).toLocaleDateString()}</div>
                </div>
              `
                  : ""
              }
              ${
                payment.employeeRef?.name
                  ? `
                <div class="info-group">
                  <div class="info-label">Employee Reference:</div>
                  <div class="info-value">${payment.employeeRef.name}</div>
                </div>
              `
                  : ""
              }
            </div>
          </div>

          <div class="section-title">Payment Details</div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 15%">Account Code</th>
                <th style="width: 25%">Account Name</th>
                <th style="width: 40%">Description</th>
                <th style="width: 20%">Amount (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              ${payment.paymentLines
                .map(
                  (line) => `
                <tr>
                  <td>${line.accountCode}</td>
                  <td>${line.accountName}</td>
                  <td>${line.description || "-"}</td>
                  <td class="amount-cell">${Number(line.amount).toLocaleString(
                    "en-PK",
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="total-row">
                <td colspan="3" style="text-align: right; padding-right: 15px;">TOTAL AMOUNT:</td>
                <td class="amount-cell">Rs. ${payment.totalAmount.toLocaleString(
                  "en-PK",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</td>
              </tr>
            </tbody>
          </table>

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">Prepared By</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Approved By</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Received By</div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (err) {
      console.error("Error printing payment:", err);
      alert("Failed to generate print view. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Bank Payments</h1>

        <button
          onClick={handleOpenForm}
          disabled={loading}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50"
        >
          <FiPlus className="w-5 h-5" />
          Record Bank Payment
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* MODAL FORM */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseModal}
        title={editingPayment ? "Edit Bank Payment" : "New Bank Payment"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SERIAL NO, CANCEL, DATE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Serial No"
              className="px-4 py-2 border rounded-lg bg-muted text-foreground"
              value={formData.serialNo}
              readOnly
            />

            {editingPayment && (
              <div className="flex items-center gap-2 border px-4 py-2 rounded-lg">
                <input
                  type="checkbox"
                  checked={formData.cancel}
                  onChange={(e) =>
                    setFormData({ ...formData, cancel: e.target.checked })
                  }
                />
                <span>Cancel</span>
              </div>
            )}

            <input
              type="date"
              className="px-4 py-2 border rounded-lg bg-background"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          {/* JOB & EMPLOYEE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="px-4 py-2 border rounded-lg bg-background text-foreground"
              value={formData.project}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name} - {project.description || ""}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border rounded-lg bg-background text-foreground"
              value={formData.employeeRef}
              onChange={(e) =>
                setFormData({ ...formData, employeeRef: e.target.value })
              }
            >
              <option value="">Employee Reference</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>

          {/* Job Description */}
          {formData.jobDescription && (
            <input
              type="text"
              placeholder="Job Description"
              className="px-4 py-2 border rounded-lg bg-muted text-foreground"
              value={formData.jobDescription}
              readOnly
            />
          )}

          {/* BANK SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              className="px-4 py-2 border rounded-lg bg-background text-foreground"
              value={formData.bankAccount}
              onChange={(e) =>
                setFormData({ ...formData, bankAccount: e.target.value })
              }
              required
            >
              <option value="">Select Bank Account</option>
              {banks.map((bank) => (
                <option key={bank.value} value={bank.value}>
                  {bank.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Bank Account Number"
              className="px-4 py-2 border rounded-lg bg-background text-foreground"
              value={formData.bankAccountNumber}
              onChange={(e) =>
                setFormData({ ...formData, bankAccountNumber: e.target.value })
              }
            />
          </div>

          {/* CHEQUE DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Cheque No."
              className="px-4 py-2 border rounded-lg bg-background"
              value={formData.chequeNo}
              onChange={(e) =>
                setFormData({ ...formData, chequeNo: e.target.value })
              }
            />

            <input
              type="date"
              className="px-4 py-2 border rounded-lg bg-background"
              value={formData.chequeDate}
              onChange={(e) =>
                setFormData({ ...formData, chequeDate: e.target.value })
              }
            />
          </div>

          {/* TABLE */}
          <div className="border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-2 text-foreground">Account Code</th>
                  <th className="px-4 py-2 text-foreground">Account Name</th>
                  <th className="px-4 py-2 text-foreground">Description</th>
                  <th className="px-4 py-2 text-foreground">Amount</th>
                  <th className="px-4 py-2 text-foreground">Action</th>
                </tr>
              </thead>

              <tbody>
                {formData.paymentLines.map((row, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-2 py-2">
                      <select
                        className="w-full px-2 py-1 border rounded-lg bg-background text-foreground"
                        value={row.accountCode}
                        onChange={(e) =>
                          handleTableChange(
                            index,
                            "accountCode",
                            e.target.value
                          )
                        }
                        required
                      >
                        <option value="">Select Account</option>
                        {expenseAccounts.map((acc) => (
                          <option key={acc.accountCode} value={acc.accountCode}>
                            {acc.accountCode}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-2 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-lg bg-muted text-foreground"
                        value={row.accountName}
                        readOnly
                      />
                    </td>

                    <td className="px-2 py-2">
                      <input
                        type="text"
                        className="w-full px-2 py-1 border rounded-lg bg-background text-foreground"
                        value={row.description}
                        onChange={(e) =>
                          handleTableChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder="Enter description"
                      />
                    </td>

                    <td className="px-2 py-2">
                      <input
                        type="number"
                        className="w-full px-2 py-1 border rounded-lg bg-background text-foreground"
                        value={row.amount}
                        onChange={(e) =>
                          handleTableChange(index, "amount", e.target.value)
                        }
                        placeholder="0.00"
                        required
                        min="0"
                        step="0.01"
                      />
                    </td>

                    <td className="px-2 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(index)}
                        className="p-1 hover:bg-red-100 rounded text-red-600"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              type="button"
              onClick={handleAddRow}
              className="w-full py-2 bg-muted hover:bg-muted/70 text-foreground transition"
            >
              + Add Row
            </button>
          </div>

          {/* SUBMIT */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? "Saving..."
                : editingPayment
                ? "Update Payment"
                : "Save Bank Payment"}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={loading}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      {/* PAYMENT LIST */}
      <div className="bg-card border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                  Serial
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                  Project
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                  Bank
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                  Cheque
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                  Total Amount
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No bank payments found. Click "Record Bank Payment" to
                    create one.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr
                    key={p._id}
                    className={`hover:bg-muted/30 transition ${
                      p.cancel ? "bg-red-50 opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-2 text-sm text-foreground">
                      {p.serialNo}
                      {p.cancel && (
                        <span className="ml-2 text-xs text-red-600 font-semibold">
                          (CANCELLED)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">
                      {new Date(p.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">
                      {p.project?.name || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">
                      {p.bankAccount}
                    </td>
                    <td className="px-4 py-2 text-sm text-muted-foreground">
                      {p.chequeNo || "-"}
                    </td>
                    <td className="px-4 py-2 text-sm font-semibold text-foreground">
                      Rs. {p.totalAmount?.toLocaleString() || "0"}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(p)}
                          disabled={loading}
                          className="p-2 hover:bg-muted rounded-lg transition text-foreground disabled:opacity-50"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p._id)}
                          disabled={loading}
                          className="p-2 hover:bg-red-100 rounded-lg transition text-red-600 disabled:opacity-50"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(p._id)}
                          disabled={loading}
                          className="p-2 hover:bg-muted rounded-lg transition text-foreground disabled:opacity-50"
                          title="Print Voucher"
                        >
                          <FiPrinter className="w-4 h-4" />
                        </button>
                      </div>
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
