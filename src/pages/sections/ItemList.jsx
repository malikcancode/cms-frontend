"use client";

import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import Modal from "../../components/Modal";
import { itemApi } from "../../api/itemApi";
import Loader from "./Loader";

export default function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Updated form fields
  const [formData, setFormData] = useState({
    categoryCode: "",
    categoryName: "",
    subCategoryCode: "",
    subCategoryName: "",
    itemCode: "",
    name: "",
    description: "",
    brand: "",
    purchasePrice: "",
    measurement: "",
    saleTaxRate: "",
    quantity: "",
    sellingPrice: "",
  });

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  // Fetch all items from backend
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemApi.getAll();
      if (response.success) {
        setItems(response.data);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setError(error.message || "Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

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

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      if (editingItem) {
        // Update existing item
        const response = await itemApi.update(editingItem._id, formData);
        if (response.success) {
          setSuccessMessage("Item updated successfully!");
          await fetchItems();
        }
      } else {
        // Create new item
        const response = await itemApi.create(formData);
        if (response.success) {
          setSuccessMessage("Item created successfully!");
          await fetchItems();
        }
      }

      // Reset form
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error("Error saving item:", error);
      setError(error.message || "Failed to save item");
    }
  };

  // Handle edit button click
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      categoryCode: item.categoryCode || "",
      categoryName: item.categoryName || "",
      subCategoryCode: item.subCategoryCode || "",
      subCategoryName: item.subCategoryName || "",
      itemCode: item.itemCode || "",
      name: item.name || "",
      description: item.description || "",
      brand: item.brand || "",
      purchasePrice: item.purchasePrice || "",
      measurement: item.measurement || "",
      saleTaxRate: item.saleTaxRate || "",
      quantity: item.quantity || "",
      sellingPrice: item.sellingPrice || "",
    });
    setShowForm(true);
  };

  // Handle delete button click
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await itemApi.delete(id);
        if (response.success) {
          setSuccessMessage("Item deleted successfully!");
          await fetchItems();
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        setError(error.message || "Failed to delete item");
      }
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      categoryCode: "",
      categoryName: "",
      subCategoryCode: "",
      subCategoryName: "",
      itemCode: "",
      name: "",
      description: "",
      brand: "",
      purchasePrice: "",
      measurement: "",
      saleTaxRate: "",
      quantity: "",
      sellingPrice: "",
    });
    setEditingItem(null);
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
        <h1 className="text-3xl font-bold text-foreground">Item List</h1>

        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <FiPlus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={showForm}
        onClose={handleCloseModal}
        title={editingItem ? "Edit Inventory Item" : "Add New Inventory Item"}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------------------- PART 1: INVENTORY CATEGORY ---------------------- */}
          {/* 
          <h2 className="text-lg font-semibold">Inventory Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Category Code"
              value={formData.categoryCode}
              onChange={(e) =>
                setFormData({ ...formData, categoryCode: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />

            <input
              type="text"
              placeholder="Category Name"
              value={formData.categoryName}
              onChange={(e) =>
                setFormData({ ...formData, categoryName: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />
          </div>
          */}

          {/* ------------------- PART 2: SUB INVENTORY CATEGORY ------------------- */}
          {/* 
          <h2 className="text-lg font-semibold">Sub Inventory Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Sub Category Code"
              value={formData.subCategoryCode}
              onChange={(e) =>
                setFormData({ ...formData, subCategoryCode: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />

            <input
              type="text"
              placeholder="Sub Category Name"
              value={formData.subCategoryName}
              onChange={(e) =>
                setFormData({ ...formData, subCategoryName: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />
          </div>
          */}

          {/* ---------------- PART 3: INVENTORY ITEM INFORMATION ---------------- */}
          <h2 className="text-lg font-semibold">Inventory Item Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Item Code"
              value={formData.itemCode}
              onChange={(e) =>
                setFormData({ ...formData, itemCode: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />

            <input
              type="text"
              placeholder="Item Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2 md:col-span-2 h-24"
            />

            <input
              type="text"
              placeholder="Brand Name"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />

            <input
              type="text"
              placeholder="Measurement Unit"
              value={formData.measurement}
              onChange={(e) =>
                setFormData({ ...formData, measurement: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />

            <input
              type="number"
              placeholder="Purchase Price"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({ ...formData, purchasePrice: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />

            <input
              type="number"
              placeholder="Sale Tax Rate (%)"
              value={formData.saleTaxRate}
              onChange={(e) =>
                setFormData({ ...formData, saleTaxRate: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />

            <input
              type="number"
              placeholder="Available Quantity"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />

            <input
              type="number"
              placeholder="Selling Price"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({ ...formData, sellingPrice: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium"
            >
              {editingItem ? "Update Item" : "Save Item"}
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

      {/* TABLE */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Unit
                </th>
                {/* <th className="px-6 py-3 text-left text-sm font-semibold">
                  Category
                </th> */}
                <th className="px-6 py-3 text-left text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No items found. Click "Add Item" to create your first item.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item._id} className="hover:bg-muted/50 transition">
                    <td className="px-6 py-4">{item.name}</td>
                    <td className="px-6 py-4">{item.measurement}</td>
                    {/* <td className="px-6 py-4">{item.categoryName}</td> */}

                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 hover:bg-muted rounded-lg transition"
                        title="Edit"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600"
                        title="Delete"
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
