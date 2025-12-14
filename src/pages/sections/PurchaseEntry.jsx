"use client";

import { useState, useEffect, useContext } from "react";
import { FiPlus, FiPrinter, FiEdit2, FiTrash2 } from "react-icons/fi";
import Modal from "../../components/Modal";
import { purchaseApi } from "../../api/purchaseApi";
import { itemApi } from "../../api/itemApi";
import { userApi } from "../../api/userApi";
import { projectApi } from "../../api/projectApi";
import { supplierApi } from "../../api/supplierApi";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import { AuthContext } from "../../context/AuthContext";
import Loader from "./Loader";

export default function PurchaseEntry() {
  const { user } = useContext(AuthContext);
  const [purchases, setPurchases] = useState([]);
  const [items, setItems] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    serialNo: "",
    date: "",
    purchaseOrderNo: "",
    vendorInvoiceNo: "",
    vendorCode: "",
    vendorName: "",
    vendorAddress: "",
    vendorPhone: "",
    inventoryLocation: "",
    project: "",
    employeeReference: "",
    item: "",
    itemCode: "",
    itemName: "",
    description: "",
    quantity: "",
    unit: "",
    rate: "",
    grossAmount: "",
    discount: "",
    netAmount: "",
    itemCurrentStock: 0,
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Generate serial number
  const generateSerialNo = (purchasesCount) => {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const count = (purchasesCount + 1).toString().padStart(4, "0");
    return `PUR-${year}${month}-${count}`;
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Fetch purchases, items, employees, projects, and suppliers
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [purchasesRes, itemsRes, employeesRes, projectsRes, suppliersRes] =
        await Promise.all([
          purchaseApi.getAll(),
          itemApi.getAll(),
          userApi.getAll(),
          projectApi.getAll(),
          supplierApi.getAll(),
        ]);

      if (purchasesRes.success) {
        setPurchases(purchasesRes.data);
      }
      if (itemsRes.success) {
        setItems(itemsRes.data);
      }
      if (employeesRes.success) {
        setEmployees(employeesRes.data);
      }
      if (projectsRes.success) {
        setProjects(projectsRes.data);
      }
      if (suppliersRes.success) {
        setSuppliers(suppliersRes.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error.message || "Failed to fetch data");
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

  // Initialize serial number and date when form is shown
  useEffect(() => {
    if (showForm && !formData.serialNo) {
      setFormData((prev) => ({
        ...prev,
        serialNo: generateSerialNo(purchases.length),
        date: getTodayDate(),
      }));
    }
  }, [showForm, formData.serialNo, purchases.length]);

  // Handle supplier/vendor selection from dropdown
  const handleSupplierSelect = (e) => {
    const selectedSupplierId = e.target.value;
    const selectedSupplier = suppliers.find(
      (sup) => sup._id === selectedSupplierId
    );

    if (selectedSupplier) {
      setFormData({
        ...formData,
        vendorCode: selectedSupplier.code,
        vendorName: selectedSupplier.name,
        vendorAddress: selectedSupplier.address || "",
        vendorPhone: selectedSupplier.phone,
      });
    } else {
      // Clear vendor fields if no selection
      setFormData({
        ...formData,
        vendorCode: "",
        vendorName: "",
        vendorAddress: "",
        vendorPhone: "",
      });
    }
  };

  // Handle item selection from dropdown
  const handleItemSelect = (e) => {
    const selectedItemId = e.target.value;
    const selectedItem = items.find((item) => item._id === selectedItemId);

    if (selectedItem) {
      setFormData({
        ...formData,
        item: selectedItem._id,
        itemCode: selectedItem.itemCode,
        itemName: selectedItem.name,
        unit: selectedItem.measurement,
        itemCurrentStock: selectedItem.currentStock || 0,
        // Don't auto-fill description - let user enter manually
      });
    }
  };

  // Calculate amounts when quantity, rate, or discount changes
  useEffect(() => {
    if (formData.quantity && formData.rate) {
      const gross = parseFloat(formData.quantity) * parseFloat(formData.rate);
      const net = gross - (parseFloat(formData.discount) || 0);

      setFormData((prev) => ({
        ...prev,
        grossAmount: gross.toFixed(2),
        netAmount: net.toFixed(2),
      }));
    }
  }, [formData.quantity, formData.rate, formData.discount]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      const purchaseQuantity = parseFloat(formData.quantity);

      const purchaseData = {
        ...formData,
        quantity: purchaseQuantity,
        rate: parseFloat(formData.rate),
        grossAmount: parseFloat(formData.grossAmount),
        discount: parseFloat(formData.discount) || 0,
        netAmount: parseFloat(formData.netAmount),
      };

      // Remove display-only fields before sending
      delete purchaseData.itemCurrentStock;

      // Check if user is admin - admins can create/edit directly
      if (user?.role === "admin") {
        let response;
        if (editingPurchase) {
          response = await purchaseApi.update(
            editingPurchase._id,
            purchaseData
          );
          setSuccessMessage("Purchase updated successfully!");
        } else {
          response = await purchaseApi.create(purchaseData);
          setSuccessMessage("Purchase created successfully!");
        }

        if (response.success) {
          await fetchAllData();
          resetForm();
          setEditingPurchase(null);
          setShowForm(false);
        }
      } else {
        // Non-admin users must submit a request
        const requestData = {
          requestType: editingPurchase ? "edit_purchase" : "create_purchase",
          requestData: purchaseData,
          entityId: editingPurchase?._id || null,
        };

        const response = await requestApprovalApi.createRequest(requestData);
        if (response.success) {
          setSuccessMessage(
            "Your request has been submitted to the admin for approval. You can view the status in 'My Requests' section."
          );
          resetForm();
          setEditingPurchase(null);
          setShowForm(false);
        }
      }
    } catch (error) {
      console.error("Error saving purchase:", error);
      setError(error.message || "Failed to save purchase");
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      serialNo: generateSerialNo(purchases.length),
      date: getTodayDate(),
      purchaseOrderNo: "",
      vendorInvoiceNo: "",
      vendorCode: "",
      vendorName: "",
      vendorAddress: "",
      vendorPhone: "",
      inventoryLocation: "",
      project: "",
      employeeReference: "",
      item: "",
      itemCode: "",
      itemName: "",
      description: "",
      quantity: "",
      unit: "",
      rate: "",
      grossAmount: "",
      discount: "",
      netAmount: "",
      maxQuantityAllowed: null,
      itemAvailableQuantity: null,
      itemCurrentStock: null,
    });
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowForm(false);
    setEditingPurchase(null);
    resetForm();
    setError("");
  };

  // Handle edit purchase
  const handleEdit = (purchase) => {
    setEditingPurchase(purchase);
    setFormData({
      serialNo: purchase.serialNo,
      date: purchase.date
        ? new Date(purchase.date).toISOString().split("T")[0]
        : getTodayDate(),
      purchaseOrderNo: purchase.purchaseOrderNo || "",
      vendorInvoiceNo: purchase.vendorInvoiceNo || "",
      vendorCode: purchase.vendorCode || "",
      vendorName: purchase.vendorName || "",
      vendorAddress: purchase.vendorAddress || "",
      vendorPhone: purchase.vendorPhone || "",
      inventoryLocation: purchase.inventoryLocation || "",
      project: purchase.project?._id || "",
      employeeReference: purchase.employeeReference?._id || "",
      item: purchase.item?._id || "",
      itemCode: purchase.itemCode || "",
      itemName: purchase.itemName || "",
      description: purchase.description || "",
      quantity: purchase.quantity?.toString() || "",
      unit: purchase.unit || "",
      rate: purchase.rate?.toString() || "",
      grossAmount: purchase.grossAmount?.toString() || "",
      discount: purchase.discount?.toString() || "0",
      netAmount: purchase.netAmount?.toString() || "",
    });
    setShowForm(true);
  };

  // Handle delete purchase
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) {
      return;
    }

    setError("");
    setSuccessMessage("");

    try {
      const response = await purchaseApi.delete(id);
      if (response.success) {
        setSuccessMessage("Purchase deleted successfully!");
        await fetchAllData();
      }
    } catch (error) {
      console.error("Error deleting purchase:", error);
      setError(error.message || "Failed to delete purchase");
    }
  };

  // Handle print purchase - Generate PDF and open in new tab
  const handlePrint = (purchase) => {
    // Create HTML content for the purchase receipt
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Receipt - ${purchase.serialNo}</title>
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
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              background: #f5f5f5;
              padding: 10px;
              font-weight: bold;
              margin-bottom: 10px;
              border-left: 4px solid #333;
            }
            .info-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
              margin-bottom: 10px;
            }
            .info-item {
              display: flex;
              padding: 8px;
            }
            .info-label {
              font-weight: bold;
              min-width: 150px;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .item-details {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              margin-top: 10px;
            }
            .amount-section {
              margin-top: 20px;
              padding: 15px;
              background: #f0f0f0;
              border-radius: 5px;
            }
            .amount-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #ddd;
            }
            .amount-row.total {
              font-size: 1.2em;
              font-weight: bold;
              border-top: 2px solid #333;
              border-bottom: 2px solid #333;
              margin-top: 10px;
              padding-top: 10px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              color: #666;
              font-size: 0.9em;
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
              font-size: 0.9em;
              color: #666;
              margin-top: 5px;
            }
            @media print {
              body {
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>PURCHASE RECEIPT</h1>
            <p>YM CONSTRUCTIONS</p>
          </div>

          <div class="section">
            <div class="section-title">Purchase Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Serial No:</span>
                <span class="info-value">${purchase.serialNo}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date(
                  purchase.date
                ).toLocaleDateString()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Purchase Order:</span>
                <span class="info-value">${purchase.purchaseOrderNo}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Invoice No:</span>
                <span class="info-value">${purchase.vendorInvoiceNo}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Vendor Details</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Vendor Name:</span>
                <span class="info-value">${purchase.vendorName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Vendor Code:</span>
                <span class="info-value">${purchase.vendorCode || "N/A"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Address:</span>
                <span class="info-value">${
                  purchase.vendorAddress || "N/A"
                }</span>
              </div>
              <div class="info-item">
                <span class="info-label">Phone:</span>
                <span class="info-value">${purchase.vendorPhone || "N/A"}</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Inventory Information</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Project/Job:</span>
                <span class="info-value">${
                  purchase.project?.name || "N/A"
                }</span>
              </div>
              <div class="info-item">
                <span class="info-label">Location:</span>
                <span class="info-value">${
                  purchase.inventoryLocation || "N/A"
                }</span>
              </div>
              <div class="info-item">
                <span class="info-label">Employee Ref:</span>
                <span class="info-value">${
                  purchase.employeeReference?.name || "N/A"
                }</span>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">Item Details</div>
            <div class="item-details">
              <div class="info-item">
                <span class="info-label">Item Code:</span>
                <span class="info-value">${purchase.itemCode}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Item Name:</span>
                <span class="info-value">${purchase.itemName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Description:</span>
                <span class="info-value">${purchase.description || "N/A"}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Quantity:</span>
                <span class="info-value">${purchase.quantity} ${
      purchase.unit
    }</span>
              </div>
              <div class="info-item">
                <span class="info-label">Rate:</span>
                <span class="info-value">Rs. ${purchase.rate.toLocaleString()}</span>
              </div>
            </div>

            <div class="amount-section">
              <div class="amount-row">
                <span>Gross Amount:</span>
                <span>Rs. ${purchase.grossAmount.toLocaleString()}</span>
              </div>
              <div class="amount-row">
                <span>Discount:</span>
                <span>Rs. ${purchase.discount.toLocaleString()}</span>
              </div>
              <div class="amount-row total">
                <span>Net Amount:</span>
                <span>Rs. ${purchase.netAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div class="signatures">
            <div class="signature-box">
              <div class="signature-line">Prepared by</div>
              <div class="signature-label">Name & Signature</div>
            </div>
            <div class="signature-box">
              <div class="signature-line">Received by</div>
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

    // Open in new tab
    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
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
        <h1 className="text-3xl font-bold text-foreground">Purchase Entry</h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <FiPlus className="w-5 h-5" />
          New Purchase
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCloseModal}
        title={editingPurchase ? "Edit Purchase Entry" : "New Purchase Entry"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ===== TOP FIELDS ===== */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Serial No"
              value={formData.serialNo}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
              required
            />

            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />

            <input
              type="text"
              placeholder="Purchase Order No"
              value={formData.purchaseOrderNo}
              onChange={(e) =>
                setFormData({ ...formData, purchaseOrderNo: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />

            <input
              type="text"
              placeholder="Vendor Invoice No"
              value={formData.vendorInvoiceNo}
              onChange={(e) =>
                setFormData({ ...formData, vendorInvoiceNo: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />
          </div>

          {/* ===== VENDOR SECTION ===== */}
          <h2 className="text-lg font-semibold mt-4">Vendor Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              onChange={handleSupplierSelect}
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2 md:col-span-4"
            >
              <option value="">Select Vendor/Supplier</option>
              {suppliers
                .filter((sup) => sup.status === "active")
                .map((supplier) => (
                  <option key={supplier._id} value={supplier._id}>
                    {supplier.name} - {supplier.code} ({supplier.company})
                  </option>
                ))}
            </select>

            <input
              type="text"
              placeholder="Vendor Code"
              value={formData.vendorCode}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
            />

            <input
              type="text"
              placeholder="Vendor Name"
              value={formData.vendorName}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
              required
            />

            <input
              type="text"
              placeholder="Address"
              value={formData.vendorAddress}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
            />

            <input
              type="text"
              placeholder="Telephone"
              value={formData.vendorPhone}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
            />
          </div>

          {/* ===== INVENTORY INFO ===== */}
          <h2 className="text-lg font-semibold mt-4">Inventory Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Inventory Location"
              value={formData.inventoryLocation}
              onChange={(e) =>
                setFormData({ ...formData, inventoryLocation: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />

            <select
              value={formData.project}
              onChange={(e) =>
                setFormData({ ...formData, project: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            >
              <option value="">Select Project/Job</option>
              {projects.map((proj) => (
                <option key={proj._id} value={proj._id}>
                  {proj.name} - {proj.code}
                </option>
              ))}
            </select>

            <select
              value={formData.employeeReference}
              onChange={(e) =>
                setFormData({ ...formData, employeeReference: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            >
              <option value="">Select Employee Reference</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} - {emp.email}
                </option>
              ))}
            </select>
          </div>

          {/* ===== ITEM ENTRY FORM ===== */}
          <h2 className="text-lg font-semibold mt-4">Item Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.item}
              onChange={handleItemSelect}
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2 md:col-span-2"
              required
            >
              <option value="">Select Item from Inventory</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name} - {item.itemCode} ({item.categoryName})
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Item Code"
              value={formData.itemCode}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
            />

            <input
              type="text"
              placeholder="Item Name"
              value={formData.itemName}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2 md:col-span-2 h-20"
            />

            <div>
              <input
                type="number"
                placeholder="Quantity"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
                className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2 w-full"
                required
              />
              {formData.item && (
                <p className="text-xs text-muted-foreground mt-1">
                  Current Stock: {formData.itemCurrentStock}
                </p>
              )}
            </div>

            <input
              type="text"
              placeholder="Unit"
              value={formData.unit}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
            />

            <input
              type="number"
              placeholder="Rate"
              value={formData.rate}
              onChange={(e) =>
                setFormData({ ...formData, rate: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
              required
            />

            <input
              type="number"
              placeholder="Gross Amount (Auto-calculated)"
              value={formData.grossAmount}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
            />

            <input
              type="number"
              placeholder="Discount"
              value={formData.discount}
              onChange={(e) =>
                setFormData({ ...formData, discount: e.target.value })
              }
              className="px-4 py-2 border border-border rounded-lg bg-background focus:ring-primary focus:ring-2"
            />

            <input
              type="number"
              placeholder="Net Amount (Auto-calculated)"
              value={formData.netAmount}
              readOnly
              className="px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed md:col-span-2"
            />
          </div>

          {/* ===== BUTTONS ===== */}
          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2 rounded-lg hover:opacity-90 transition font-medium"
            >
              Save Purchase
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
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Supplier
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Qty × Rate
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {purchases.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No purchases found. Click "New Purchase" to create your
                    first entry.
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr
                    key={purchase._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(purchase.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {purchase.vendorName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {purchase.project?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground font-medium">
                      {purchase.itemName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {purchase.quantity} {purchase.unit} × Rs.{" "}
                      {purchase.rate.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      Rs. {purchase.netAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(purchase)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                          title="Edit Purchase"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(purchase._id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                          title="Delete Purchase"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(purchase)}
                          className="p-2 hover:bg-muted rounded-lg transition text-foreground"
                          title="Print Purchase Receipt"
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
