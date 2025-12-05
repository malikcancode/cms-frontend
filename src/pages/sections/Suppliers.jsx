"use client";

import { useState, useEffect, useContext } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Modal from "../../components/Modal";
import { supplierApi } from "../../api/supplierApi";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import { AuthContext } from "../../context/AuthContext";
import Loader from "./Loader";

export default function Suppliers() {
  const { user } = useContext(AuthContext);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSupplierId, setCurrentSupplierId] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    category: "",
    address: "",
    city: "",
    country: "Pakistan",
    status: "active",
  });

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Clear messages after 3 seconds
  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError("");
        setSuccessMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // Fetch all suppliers
  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await supplierApi.getAll();
      if (response.success) {
        setSuppliers(response.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      setError(error.message || "Failed to fetch suppliers");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      email: "",
      phone: "",
      company: "",
      category: "",
      address: "",
      city: "",
      country: "Pakistan",
      status: "active",
    });
    setEditMode(false);
    setCurrentSupplierId(null);
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      // Check if user is admin - admins can create/edit directly
      if (user?.role === "admin") {
        if (editMode) {
          // Update existing supplier
          const response = await supplierApi.update(
            currentSupplierId,
            formData
          );
          if (response.success) {
            setSuccessMessage("Supplier updated successfully!");
            await fetchSuppliers();
            resetForm();
            setShowForm(false);
          }
        } else {
          // Create new supplier
          const response = await supplierApi.create(formData);
          if (response.success) {
            setSuccessMessage("Supplier created successfully!");
            await fetchSuppliers();
            resetForm();
            setShowForm(false);
          }
        }
      } else {
        // Non-admin users must submit a request
        const requestData = {
          requestType: editMode ? "edit_supplier" : "create_supplier",
          requestData: formData,
          entityId: currentSupplierId || null,
        };

        const response = await requestApprovalApi.createRequest(requestData);
        if (response.success) {
          setSuccessMessage(
            "Your request has been submitted to the admin for approval. You can view the status in 'My Requests' section."
          );
          resetForm();
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      setError(error.message || "Failed to save supplier");
    }
  };

  // Handle edit
  const handleEdit = (supplier) => {
    setFormData({
      code: supplier.code,
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      company: supplier.company,
      category: supplier.category,
      address: supplier.address || "",
      city: supplier.city || "",
      country: supplier.country || "Pakistan",
      status: supplier.status || "active",
    });
    setCurrentSupplierId(supplier._id);
    setEditMode(true);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    try {
      const response = await supplierApi.delete(id);
      if (response.success) {
        setSuccessMessage("Supplier deleted successfully!");
        await fetchSuppliers();
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      setError(error.message || "Failed to delete supplier");
    }
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowForm(false);
    resetForm();
    setError("");
  };

  // Show loader while fetching data
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Vendors</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <FiPlus className="w-5 h-5" />
          Add Vendor
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCloseModal}
        title={editMode ? "Edit Vendor" : "Add New Vendor"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Supplier Code *"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <input
              type="text"
              placeholder="Supplier Name *"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <input
              type="tel"
              placeholder="Phone *"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <input
              type="text"
              placeholder="Company Name *"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              required
            />
            <input
              type="text"
              placeholder="Category *"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
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
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <input
              type="text"
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <input
              type="text"
              placeholder="Country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            />
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium"
            >
              {editMode ? "Update Supplier" : "Save Supplier"}
            </button>
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 transition font-medium"
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
                  Company
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Category
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
              {suppliers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No suppliers found. Click "Add Vendor" to create your first
                    entry.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr
                    key={supplier._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {supplier.code}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {supplier.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {supplier.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {supplier.phone}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {supplier.company}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {supplier.category}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          supplier.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button
                        onClick={() => handleEdit(supplier)}
                        className="p-2 hover:bg-muted rounded-lg transition text-foreground"
                        title="Edit Supplier"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supplier._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                        title="Delete Supplier"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
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
