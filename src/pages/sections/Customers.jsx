"use client";

import { useState, useEffect, useContext } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Modal from "../../components/Modal";
import { customerApi } from "../../api/customerApi";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import { AuthContext } from "../../context/AuthContext";
import Loader from "./Loader";

export default function Customers() {
  const { user } = useContext(AuthContext);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // Fetch all customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAll();
      if (response.success) {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(error.message || "Failed to fetch customers");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      // Check if user is admin - admins can create/edit directly
      if (user?.role === "admin") {
        const response = editingCustomer
          ? await customerApi.update(editingCustomer._id, formData)
          : await customerApi.create(formData);

        if (response.success) {
          await fetchCustomers();
          setFormData({
            code: "",
            name: "",
            email: "",
            phone: "",
            address: "",
          });
          setShowForm(false);
          setEditingCustomer(null);
        }
      } else {
        // Non-admin users must submit a request
        const requestData = {
          requestType: editingCustomer ? "edit_customer" : "create_customer",
          requestData: formData,
          entityId: editingCustomer?._id || null,
        };

        const response = await requestApprovalApi.createRequest(requestData);
        if (response.success) {
          alert(
            "Your request has been submitted to the admin for approval. You can view the status in 'My Requests' section."
          );
          setFormData({
            code: "",
            name: "",
            email: "",
            phone: "",
            address: "",
          });
          setShowForm(false);
          setEditingCustomer(null);
        }
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      setError(error.message || "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      code: customer.code,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const response = await customerApi.delete(id);
      if (response.success) {
        await fetchCustomers();
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      setError(error.message || "Failed to delete customer");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCustomer(null);
    setFormData({ code: "", name: "", email: "", phone: "", address: "" });
    setError("");
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Customers</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
          disabled={loading}
        >
          <FiPlus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Modal
        isOpen={showForm}
        onClose={handleCloseForm}
        title={editingCustomer ? "Edit Customer" : "Add New Customer"}
        size="lg"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Customer Code (e.g., CUST001)"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
              disabled={editingCustomer !== null}
            />
            <input
              type="text"
              placeholder="Customer Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <input
              type="tel"
              placeholder="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <input
              type="text"
              placeholder="Address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground md:col-span-2"
              required
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium"
              disabled={loading}
            >
              {loading
                ? "Saving..."
                : editingCustomer
                ? "Update Customer"
                : "Save Customer"}
            </button>
            <button
              type="button"
              onClick={handleCloseForm}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 transition font-medium"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading && !showForm ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">Loading customers...</div>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-muted-foreground">
              No customers found. Add your first customer!
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Total Purchase
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      {customer.code}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {customer.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {customer.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {customer.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      Rs. {customer.totalPurchase?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      Rs. {customer.balance?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="p-2 hover:bg-muted rounded-lg transition text-foreground"
                        disabled={loading}
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(customer._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                        disabled={loading}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
