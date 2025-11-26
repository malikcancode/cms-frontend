"use client";

import { useState } from "react";
import { FiPlus, FiPrinter, FiEdit2, FiTrash2 } from "react-icons/fi";
import Modal from "../../components/Modal";

export default function CashPayment() {
  const [payments, setPayments] = useState([
    {
      id: 1,
      date: "2024-01-18",
      project: "Downtown Complex",
      expenseType: "Material Expense",
      amount: 200000,
      description: "Cement purchase",
      paidTo: "Danish Supplier",
    },
    {
      id: 2,
      date: "2024-01-22",
      project: "Tariq Road Project",
      expenseType: "Labour Wages",
      amount: 50000,
      description: "Daily labour payment",
      paidTo: "Labour Contractor",
    },
    {
      id: 3,
      date: "2024-01-25",
      project: "Residential Area",
      expenseType: "Transportation",
      amount: 15000,
      description: "Material transportation charges",
      paidTo: "Transport Company",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    project: "",
    expenseType: "",
    amount: "",
    description: "",
    paidTo: "",
  });

  const handleAdd = (e) => {
    e.preventDefault();
    const newPayment = {
      id: payments.length + 1,
      ...formData,
      amount: Number.parseInt(formData.amount),
    };
    setPayments([...payments, newPayment]);
    setFormData({
      date: "",
      project: "",
      expenseType: "",
      amount: "",
      description: "",
      paidTo: "",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Cash Payments</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage cash payment transactions
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <FiPlus className="w-5 h-5" />
          Record Cash Payment
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Record Cash Payment"
        size="lg"
      >
        <form onSubmit={handleAdd} className="space-y-4">
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
                Paid To *
              </label>
              <input
                type="text"
                placeholder="Recipient name"
                value={formData.paidTo}
                onChange={(e) =>
                  setFormData({ ...formData, paidTo: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project *
              </label>
              <select
                value={formData.project}
                onChange={(e) =>
                  setFormData({ ...formData, project: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              >
                <option value="">Select Project</option>
                <option value="Tariq Road Project">Tariq Road Project</option>
                <option value="Downtown Complex">Downtown Complex</option>
                <option value="Residential Area">Residential Area</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expense Type *
              </label>
              <select
                value={formData.expenseType}
                onChange={(e) =>
                  setFormData({ ...formData, expenseType: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              >
                <option value="">Select Expense Type</option>
                <option value="Labour Wages">Labour Wages</option>
                <option value="Material Expense">Material Expense</option>
                <option value="Electrical Work">Electrical Work</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Transportation">Transportation</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Amount *
              </label>
              <input
                type="number"
                placeholder="Enter amount in PKR"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                placeholder="Payment details and notes"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition font-medium"
            >
              Record Payment
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-muted text-foreground py-2.5 rounded-lg hover:bg-muted/80 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Paid To
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Expense Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-muted/50 transition">
                  <td className="px-6 py-4 text-sm text-foreground">
                    {payment.date}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground font-medium">
                    {payment.paidTo}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {payment.project}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {payment.expenseType}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    Rs. {payment.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-muted rounded-lg transition text-foreground">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded-lg transition text-foreground">
                        <FiPrinter className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-100 rounded-lg transition text-red-600">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Cash Payments
          </h3>
          <p className="text-2xl font-bold text-foreground mt-2">
            Rs.{" "}
            {payments
              .reduce((sum, payment) => sum + payment.amount, 0)
              .toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Transactions
          </h3>
          <p className="text-2xl font-bold text-foreground mt-2">
            {payments.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-sm font-medium text-muted-foreground">
            This Month
          </h3>
          <p className="text-2xl font-bold text-foreground mt-2">
            Rs.{" "}
            {payments
              .filter((p) => p.date.startsWith("2024-01"))
              .reduce((sum, payment) => sum + payment.amount, 0)
              .toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
