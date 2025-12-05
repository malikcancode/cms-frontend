"use client";

import { useState, useEffect, useContext } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiUser, FiUserX } from "react-icons/fi";
import Modal from "../../components/Modal";
import { userApi } from "../../api/userApi";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import { AuthContext } from "../../context/AuthContext";
import Loader from "./Loader";

export default function Users() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "operator",
    customPermissions: {
      dashboard: false,
      projects: false,
      plots: false,
      customers: false,
      suppliers: false,
      items: false,
      chartOfAccounts: false,
      salesInvoice: false,
      purchaseEntry: false,
      cashPayment: false,
      bankPayment: false,
      reports: false,
    },
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await userApi.getAll();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: "admin", label: "Admin", description: "Full system access" },
    {
      value: "operator",
      label: "Operator",
      description: "Data entry and operations",
    },
    {
      value: "custom",
      label: "Custom User",
      description: "Limited rights (configurable)",
    },
  ];

  const availablePermissions = [
    { key: "dashboard", label: "Dashboard" },
    { key: "projects", label: "Projects" },
    { key: "plots", label: "Plots/Properties" },
    { key: "customers", label: "Customers" },
    { key: "suppliers", label: "Suppliers" },
    { key: "items", label: "Item List" },
    { key: "chartOfAccounts", label: "Chart of Accounts" },
    { key: "salesInvoice", label: "Sales Invoice" },
    { key: "purchaseEntry", label: "Purchase Entry" },
    { key: "cashPayment", label: "Cash Payment" },
    { key: "bankPayment", label: "Bank Payment" },
    { key: "reports", label: "Reports" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        customPermissions:
          formData.role === "custom" ? formData.customPermissions : null,
      };

      // Only include password if it's provided (for new users or when updating)
      if (formData.password) {
        userData.password = formData.password;
      }

      // Check if user is admin - admins can create/edit directly
      if (user?.role === "admin") {
        if (editingUser) {
          // Update existing user
          const response = await userApi.update(editingUser._id, userData);
          if (response.success) {
            await fetchUsers(); // Refresh the list
            resetForm();
          }
        } else {
          // Create new user - password is required
          if (!formData.password) {
            setError("Password is required for new users");
            setSubmitting(false);
            return;
          }
          const response = await userApi.create(userData);
          if (response.success) {
            await fetchUsers(); // Refresh the list
            resetForm();
          }
        }
      } else {
        // Non-admin users must submit a request
        // For new users, password is still required
        if (!editingUser && !formData.password) {
          setError("Password is required for new users");
          setSubmitting(false);
          return;
        }

        const requestData = {
          requestType: editingUser ? "edit_user" : "create_user",
          requestData: userData,
          entityId: editingUser?._id || null,
        };

        const response = await requestApprovalApi.createRequest(requestData);
        if (response.success) {
          alert(
            "Your request has been submitted to the admin for approval. You can view the status in 'My Requests' section."
          );
          resetForm();
        }
      }
    } catch (err) {
      console.error("Error saving user:", err);
      setError(err.message || "Failed to save user");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      customPermissions: user.customPermissions || {
        dashboard: false,
        projects: false,
        plots: false,
        customers: false,
        suppliers: false,
        items: false,
        chartOfAccounts: false,
        salesInvoice: false,
        purchaseEntry: false,
        cashPayment: false,
        bankPayment: false,
        reports: false,
      },
    });
    setShowForm(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await userApi.delete(userId);
        if (response.success) {
          await fetchUsers(); // Refresh the list
        }
      } catch (err) {
        console.error("Error deleting user:", err);
        setError(err.message || "Failed to delete user");
      }
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const response = await userApi.toggleStatus(userId);
      if (response.success) {
        await fetchUsers(); // Refresh the list
      }
    } catch (err) {
      console.error("Error toggling user status:", err);
      setError(err.message || "Failed to toggle user status");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "operator",
      customPermissions: {
        dashboard: false,
        projects: false,
        plots: false,
        customers: false,
        suppliers: false,
        items: false,
        chartOfAccounts: false,
        salesInvoice: false,
        purchaseEntry: false,
        cashPayment: false,
        bankPayment: false,
        reports: false,
      },
    });
    setEditingUser(null);
    setShowForm(false);
    setError("");
  };

  const togglePermission = (permissionKey) => {
    setFormData({
      ...formData,
      customPermissions: {
        ...formData.customPermissions,
        [permissionKey]: !formData.customPermissions[permissionKey],
      },
    });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "operator":
        return "bg-blue-100 text-blue-800";
      case "custom":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-red-700 hover:text-red-900"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Users Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage user accounts, roles, and permissions (Admin Only)
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <FiPlus className="w-5 h-5" />
          Add User
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={resetForm}
        title={editingUser ? "Edit User" : "Add New User"}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email *
              </label>
              <input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password {!editingUser && "*"}
              </label>
              <input
                type="password"
                placeholder={
                  editingUser ? "Leave blank to keep current" : "Enter password"
                }
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                required={!editingUser}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Role & Permissions *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <label
                  key={role.value}
                  className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition ${
                    formData.role === role.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={role.value}
                    checked={formData.role === role.value}
                    onChange={(e) =>
                      setFormData({ ...formData, role: e.target.value })
                    }
                    className="sr-only"
                  />
                  <span className="font-semibold text-foreground">
                    {role.label}
                  </span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {role.description}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Custom Permissions Section */}
          {formData.role === "custom" && (
            <div className="border border-border rounded-lg p-4 bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Configure Access Rights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availablePermissions.map((permission) => (
                  <label
                    key={permission.key}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg cursor-pointer hover:bg-background transition"
                  >
                    <input
                      type="checkbox"
                      checked={formData.customPermissions[permission.key]}
                      onChange={() => togglePermission(permission.key)}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-sm text-foreground">
                      {permission.label}
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Select the modules this user can access
              </p>
            </div>
          )}

          {/* Role Information */}
          {formData.role === "admin" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                <strong>Admin Role:</strong> Full access to all system features,
                including user management and system settings.
              </p>
            </div>
          )}

          {formData.role === "operator" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Operator Role:</strong> Can perform data entry and
                manage projects, customers, suppliers, sales, purchases, and
                payments. Cannot access reports or user management.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting
                ? "Saving..."
                : editingUser
                ? "Update User"
                : "Create User"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={submitting}
              className="flex-1 bg-muted text-foreground py-2 rounded-lg hover:bg-muted/80 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
                  User
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-muted/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <FiUser className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                      {user.role === "custom" && user.customPermissions && (
                        <span className="text-xs text-muted-foreground">
                          {
                            Object.values(user.customPermissions).filter(
                              (v) => v === true
                            ).length
                          }{" "}
                          permissions
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => toggleUserStatus(user._id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 hover:bg-muted rounded-lg transition text-foreground"
                        title="Edit user"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(user._id)}
                        className={`p-2 hover:bg-muted rounded-lg transition ${
                          user.isActive ? "text-orange-600" : "text-green-600"
                        }`}
                        title={
                          user.isActive ? "Deactivate user" : "Activate user"
                        }
                      >
                        <FiUserX className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                        title="Delete user"
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
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <FiUser className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No users found. Add your first user to get started.</p>
        </div>
      )}
    </div>
  );
}
