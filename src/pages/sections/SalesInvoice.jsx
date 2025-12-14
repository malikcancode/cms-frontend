"use client";

import { useState, useEffect, useContext } from "react";
import { FiPlus, FiPrinter, FiShare2, FiEdit2, FiTrash2 } from "react-icons/fi";
import Modal from "../../components/Modal";
import salesInvoiceApi from "../../api/salesInvoiceApi";
import customerApi from "../../api/customerApi";
import projectApi from "../../api/projectApi";
import userApi from "../../api/userApi";
import itemApi from "../../api/itemApi";
import { getAllPlots } from "../../api/plotApi";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import { AuthContext } from "../../context/AuthContext";
import Loader from "./Loader";

export default function SalesInvoice() {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [formData, setFormData] = useState({
    // Header Fields
    date: "",
    // purchaseOrderNo: "",
    // deliveryChallanNo: "",
    termsOfPayment: "Cash",
    incomeAccount: "",

    // Customer Info
    customer: "",
    customerCode: "",
    customerName: "",
    address: "",
    telephone: "",

    // Items
    items: [
      {
        itemType: "Inventory",
        itemCode: "",
        description: "",
        quantity: "",
        unit: "",
        rate: "",
        grossAmount: 0,
        discountPercent: 0,
        discount: 0,
        netAmount: 0,
        availableStock: null,
        itemId: null,
        plotId: null,
      },
    ],

    // Footer
    inventoryLocation: "",
    project: "",
    jobNo: "",
    jobDescription: "",
    employeeReference: "",
    remarks: "",
    additionalDiscount: 0,
    carriageFreight: 0,
    amountReceived: 0,
  });

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Fetch sales invoices, customers, projects, employees, and items
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        invoicesRes,
        customersRes,
        projectsRes,
        employeesRes,
        itemsRes,
        plotsRes,
      ] = await Promise.all([
        salesInvoiceApi.getAll(),
        customerApi.getAll(),
        projectApi.getAll(),
        userApi.getAll(),
        itemApi.getAll(),
        getAllPlots(),
      ]);

      setInvoices(invoicesRes.data || []);
      setCustomers(customersRes.data || []);
      setProjects(projectsRes.data || []);
      setEmployees(employeesRes.data || []);
      setItems(itemsRes.data || []);
      setPlots(plotsRes.data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Failed to fetch data");
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

  // Initialize date when form is shown
  useEffect(() => {
    if (showForm && !formData.date) {
      setFormData((prev) => ({
        ...prev,
        date: getTodayDate(),
      }));
    }
  }, [showForm, formData.date]);

  // Handle customer selection from dropdown
  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const selectedCustomer = customers.find((c) => c._id === customerId);

    if (selectedCustomer) {
      setFormData({
        ...formData,
        customer: customerId,
        customerCode: selectedCustomer.code || "",
        customerName: selectedCustomer.name || "",
        address: selectedCustomer.address || "",
        telephone: selectedCustomer.phone || "",
      });
    } else {
      setFormData({
        ...formData,
        customer: "",
        customerCode: "",
        customerName: "",
        address: "",
        telephone: "",
      });
    }
  };

  // Handle item selection from dropdown
  const handleItemSelect = (index, itemId) => {
    const selectedItem = items.find((item) => item._id === itemId);

    if (selectedItem) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        itemCode: selectedItem.itemCode || "",
        unit: selectedItem.measurement || "",
        rate: selectedItem.sellingPrice || 0,
        availableStock: selectedItem.currentStock || 0,
        itemId: selectedItem._id,
        plotId: null,
      };

      // Recalculate amounts
      const { gross, discount, net } = calculateItemAmount(newItems[index]);
      newItems[index].grossAmount = gross;
      newItems[index].discount = discount;
      newItems[index].netAmount = net;

      setFormData({ ...formData, items: newItems });
    }
  };

  // Handle plot selection from dropdown
  const handlePlotSelect = (index, plotId) => {
    const selectedPlot = plots.find((plot) => plot._id === plotId);

    if (selectedPlot) {
      const newItems = [...formData.items];
      newItems[index] = {
        ...newItems[index],
        itemCode: selectedPlot.plotNumber || "",
        description: `${selectedPlot.plotType} Plot - ${selectedPlot.plotSize} ${selectedPlot.unit}`,
        unit: "plot",
        rate: selectedPlot.rate || selectedPlot.basePrice || 0,
        availableStock: selectedPlot.availableStock || 0,
        itemId: null,
        plotId: selectedPlot._id,
      };

      // Recalculate amounts
      const { gross, discount, net } = calculateItemAmount(newItems[index]);
      newItems[index].grossAmount = gross;
      newItems[index].discount = discount;
      newItems[index].netAmount = net;

      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateItemAmount = (item) => {
    const gross = (item.quantity || 0) * (item.rate || 0);
    const discount = gross * ((item.discountPercent || 0) / 100);
    const net = gross - discount;
    return { gross, discount, net };
  };

  const calculateTotals = () => {
    const itemsTotal = formData.items.reduce(
      (sum, item) => sum + item.netAmount,
      0
    );
    const netTotal =
      itemsTotal -
      (formData.additionalDiscount || 0) +
      (formData.carriageFreight || 0);
    const balance = netTotal - (formData.amountReceived || 0);
    return { itemsTotal, netTotal, balance };
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];

    // If itemType is changing, reset the item fields
    if (field === "itemType") {
      newItems[index] = {
        itemType: value,
        itemCode: "",
        description: "",
        quantity: "",
        unit: "",
        rate: "",
        grossAmount: 0,
        discountPercent: 0,
        discount: 0,
        netAmount: 0,
        availableStock: null,
        itemId: null,
        plotId: null,
      };
    } else {
      newItems[index][field] = value;

      if (["quantity", "rate", "discountPercent"].includes(field)) {
        const { gross, discount, net } = calculateItemAmount(newItems[index]);
        newItems[index].grossAmount = gross;
        newItems[index].discount = discount;
        newItems[index].netAmount = net;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          itemType: "Inventory",
          itemCode: "",
          description: "",
          quantity: "",
          unit: "",
          rate: "",
          grossAmount: 0,
          discountPercent: 0,
          discount: 0,
          netAmount: 0,
          availableStock: null,
          itemId: null,
          plotId: null,
        },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validate stock availability before submission (for new invoices)
      if (!editingInvoice) {
        const stockErrors = [];
        for (const item of formData.items) {
          const quantity = parseFloat(item.quantity) || 0;
          const availableStock = item.availableStock || 0;

          if (quantity > availableStock) {
            stockErrors.push(
              `Item ${item.itemCode}: Requested ${quantity} ${item.unit}, but only ${availableStock} available in stock`
            );
          }
        }

        if (stockErrors.length > 0) {
          setError(
            "Insufficient stock for the following items:\n" +
              stockErrors.join("\n")
          );
          setLoading(false);
          return;
        }
      }

      // Validate and calculate totals
      const processedItems = formData.items.map((item) => ({
        itemType: item.itemType || "Inventory",
        itemCode: item.itemCode,
        description: item.description || "",
        quantity: parseFloat(item.quantity) || 0,
        unit: item.unit,
        rate: parseFloat(item.rate) || 0,
        grossAmount: parseFloat(item.grossAmount) || 0,
        discountPercent: parseFloat(item.discountPercent) || 0,
        discount: parseFloat(item.discount) || 0,
        netAmount: parseFloat(item.netAmount) || 0,
        plot: item.plotId || undefined,
        item: item.itemId || undefined,
      }));

      const invoiceData = {
        ...formData,
        items: processedItems,
        additionalDiscount: parseFloat(formData.additionalDiscount) || 0,
        carriageFreight: parseFloat(formData.carriageFreight) || 0,
        amountReceived: parseFloat(formData.amountReceived) || 0,
      };

      // Check if user is admin - admins can create/edit directly
      if (user?.role === "admin") {
        if (editingInvoice) {
          await salesInvoiceApi.update(editingInvoice._id, invoiceData);
          setSuccessMessage("Sales invoice updated successfully!");
        } else {
          await salesInvoiceApi.create(invoiceData);
          setSuccessMessage("Sales invoice created successfully!");
        }
        await fetchAllData();
      } else {
        // Non-admin users must submit a request
        const requestData = {
          requestType: editingInvoice
            ? "edit_sales_invoice"
            : "create_sales_invoice",
          requestData: invoiceData,
          entityId: editingInvoice?._id || null,
        };

        await requestApprovalApi.createRequest(requestData);
        setSuccessMessage(
          "Your request has been submitted to the admin for approval. You can view the status in 'My Requests' section."
        );
      }

      resetForm();
      setEditingInvoice(null);
      setShowForm(false);
    } catch (err) {
      console.error("Error saving sales invoice:", err);
      setError(err.message || "Failed to save sales invoice");
    } finally {
      setLoading(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      date: getTodayDate(),
      // purchaseOrderNo: "",
      // deliveryChallanNo: "",
      termsOfPayment: "Cash",
      incomeAccount: "",
      customer: "",
      customerCode: "",
      customerName: "",
      address: "",
      telephone: "",
      items: [
        {
          itemType: "Inventory",
          itemCode: "",
          description: "",
          quantity: "",
          unit: "",
          rate: "",
          grossAmount: 0,
          discountPercent: 0,
          discount: 0,
          netAmount: 0,
          availableStock: null,
          itemId: null,
          plotId: null,
        },
      ],
      inventoryLocation: "",
      project: "",
      jobNo: "",
      jobDescription: "",
      employeeReference: "",
      remarks: "",
      additionalDiscount: 0,
      carriageFreight: 0,
      amountReceived: 0,
    });
  };

  // Handle modal close
  const handleCloseModal = () => {
    resetForm();
    setEditingInvoice(null);
    setShowForm(false);
  };

  // Handle edit invoice
  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      date: invoice.date
        ? new Date(invoice.date).toISOString().split("T")[0]
        : getTodayDate(),
      // purchaseOrderNo: invoice.purchaseOrderNo || "",
      // deliveryChallanNo: invoice.deliveryChallanNo || "",
      termsOfPayment: invoice.termsOfPayment || "Cash",
      incomeAccount: invoice.incomeAccount || "",
      customer: invoice.customer?._id || "",
      customerCode: invoice.customerCode || "",
      customerName: invoice.customerName || "",
      address: invoice.address || "",
      telephone: invoice.telephone || "",
      items: invoice.items.map((item) => ({
        itemCode: item.itemCode || "",
        description: item.description || "",
        quantity: item.quantity?.toString() || "",
        unit: item.unit || "",
        rate: item.rate?.toString() || "",
        grossAmount: item.grossAmount || 0,
        discountPercent: item.discountPercent || 0,
        discount: item.discount || 0,
        netAmount: item.netAmount || 0,
      })),
      inventoryLocation: invoice.inventoryLocation || "",
      project: invoice.project?._id || "",
      jobNo: invoice.jobNo || "",
      jobDescription: invoice.jobDescription || "",
      employeeReference: invoice.employeeReference?._id || "",
      remarks: invoice.remarks || "",
      additionalDiscount: invoice.additionalDiscount || 0,
      carriageFreight: invoice.carriageFreight || 0,
      amountReceived: invoice.amountReceived || 0,
    });
    setShowForm(true);
  };

  // Handle delete invoice
  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this sales invoice?")
    ) {
      return;
    }

    try {
      setLoading(true);
      await salesInvoiceApi.delete(id);
      setSuccessMessage("Sales invoice deleted successfully!");
      await fetchAllData();
    } catch (err) {
      console.error("Error deleting sales invoice:", err);
      setError(err.message || "Failed to delete sales invoice");
    } finally {
      setLoading(false);
    }
  };

  // Handle print invoice - Generate PDF and open in new tab
  const handlePrint = (invoice) => {
    // Calculate totals for the invoice
    const itemsTotal = invoice.items.reduce(
      (sum, item) => sum + (item.netAmount || 0),
      0
    );
    const netTotal =
      itemsTotal -
      (invoice.additionalDiscount || 0) +
      (invoice.carriageFreight || 0);
    const balance = netTotal - (invoice.amountReceived || 0);

    // Create HTML content for the sales invoice
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Invoice - ${invoice.serialNo || "N/A"}</title>
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
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #f97316;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #f97316;
              margin-bottom: 5px;
              font-size: 32px;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .invoice-info {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .info-section {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #f97316;
            }
            .info-section h3 {
              color: #f97316;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .info-row {
              display: flex;
              padding: 5px 0;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              min-width: 140px;
              color: #555;
            }
            .info-value {
              color: #333;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .items-table thead {
              background: #f97316;
              color: white;
            }
            .items-table th {
              padding: 12px 8px;
              text-align: left;
              font-size: 12px;
              font-weight: 600;
            }
            .items-table td {
              padding: 10px 8px;
              border-bottom: 1px solid #ddd;
              font-size: 13px;
            }
            .items-table tbody tr:hover {
              background: #f9f9f9;
            }
            .items-table tbody tr:last-child td {
              border-bottom: 2px solid #f97316;
            }
            .text-right {
              text-align: right;
            }
            .text-center {
              text-align: center;
            }
            .totals-section {
              display: grid;
              grid-template-columns: 1fr 400px;
              gap: 20px;
              margin-top: 30px;
            }
            .additional-info {
              background: #f9f9f9;
              padding: 15px;
              border-radius: 8px;
            }
            .additional-info h3 {
              color: #f97316;
              margin-bottom: 10px;
              font-size: 16px;
            }
            .totals-box {
              background: #fff;
              border: 2px solid #f97316;
              border-radius: 8px;
              padding: 20px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
              border-bottom: 1px solid #eee;
            }
            .total-row.grand {
              font-size: 18px;
              font-weight: bold;
              color: #f97316;
              border-top: 2px solid #f97316;
              border-bottom: 2px solid #f97316;
              margin-top: 10px;
              padding-top: 12px;
            }
            .total-row.balance {
              font-size: 16px;
              font-weight: bold;
              color: #dc2626;
            }
            .footer {
              margin-top: 50px;
              text-align: center;
              color: #666;
              font-size: 12px;
              border-top: 2px solid #f97316;
              padding-top: 20px;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-paid {
              background: #dcfce7;
              color: #166534;
            }
            .status-partial {
              background: #fef9c3;
              color: #854d0e;
            }
            .status-pending {
              background: #fed7aa;
              color: #9a3412;
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
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SALES INVOICE</h1>
            <p>YM CONSTRUCTIONS</p>
          </div>

          <div class="invoice-info">
            <div class="info-section">
              <h3>Invoice Details</h3>
              <div class="info-row">
                <span class="info-label">Invoice No:</span>
                <span class="info-value">${invoice.serialNo || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${new Date(
                  invoice.date
                ).toLocaleDateString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Purchase Order:</span>
                <span class="info-value">${
                  invoice.purchaseOrderNo || "N/A"
                }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Delivery Challan:</span>
                <span class="info-value">${
                  invoice.deliveryChallanNo || "N/A"
                }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment Terms:</span>
                <span class="info-value">${
                  invoice.termsOfPayment || "Cash"
                }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Status:</span>
                <span class="status-badge status-${
                  invoice.status || "pending"
                }">
                  ${
                    (invoice.status || "pending").charAt(0).toUpperCase() +
                    (invoice.status || "pending").slice(1)
                  }
                </span>
              </div>
            </div>

            <div class="info-section">
              <h3>Customer Information</h3>
              <div class="info-row">
                <span class="info-label">Customer Code:</span>
                <span class="info-value">${invoice.customerCode || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Customer Name:</span>
                <span class="info-value">${invoice.customerName || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Telephone:</span>
                <span class="info-value">${invoice.telephone || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Address:</span>
                <span class="info-value">${invoice.address || "N/A"}</span>
              </div>
            </div>
          </div>

          <div class="invoice-info">
            <div class="info-section">
              <h3>Project Information</h3>
              <div class="info-row">
                <span class="info-label">Project:</span>
                <span class="info-value">${
                  invoice.project?.name || invoice.jobDescription || "N/A"
                }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Job No:</span>
                <span class="info-value">${invoice.jobNo || "N/A"}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Location:</span>
                <span class="info-value">${
                  invoice.inventoryLocation || "N/A"
                }</span>
              </div>
            </div>

            <div class="info-section">
              <h3>Additional Information</h3>
              <div class="info-row">
                <span class="info-label">Employee Ref:</span>
                <span class="info-value">${
                  invoice.employeeReference?.name || "N/A"
                }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Income Account:</span>
                <span class="info-value">${
                  invoice.incomeAccount || "N/A"
                }</span>
              </div>
              <div class="info-row">
                <span class="info-label">Remarks:</span>
                <span class="info-value">${invoice.remarks || "None"}</span>
              </div>
            </div>
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th>Item Code</th>
                <th>Description</th>
                <th class="text-center">Qty</th>
                <th class="text-center">Unit</th>
                <th class="text-right">Rate</th>
                <th class="text-right">Gross</th>
                <th class="text-center">Disc %</th>
                <th class="text-right">Discount</th>
                <th class="text-right">Net Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.itemCode || "N/A"}</td>
                  <td>${item.description || "N/A"}</td>
                  <td class="text-center">${item.quantity || 0}</td>
                  <td class="text-center">${item.unit || "N/A"}</td>
                  <td class="text-right">Rs. ${(item.rate || 0).toLocaleString(
                    undefined,
                    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                  )}</td>
                  <td class="text-right">Rs. ${(
                    item.grossAmount || 0
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td class="text-center">${item.discountPercent || 0}%</td>
                  <td class="text-right">Rs. ${(
                    item.discount || 0
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</td>
                  <td class="text-right"><strong>Rs. ${(
                    item.netAmount || 0
                  ).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}</strong></td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals-section">
            <div class="additional-info">
              <h3>Payment Summary</h3>
              <div class="info-row">
                <span class="info-label">Additional Discount:</span>
                <span class="info-value">Rs. ${(
                  invoice.additionalDiscount || 0
                ).toLocaleString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Carriage & Freight:</span>
                <span class="info-value">Rs. ${(
                  invoice.carriageFreight || 0
                ).toLocaleString()}</span>
              </div>
            </div>

            <div class="totals-box">
              <div class="total-row">
                <span>Items Total:</span>
                <span>Rs. ${itemsTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
              </div>
              <div class="total-row">
                <span>Additional Discount:</span>
                <span>- Rs. ${(invoice.additionalDiscount || 0).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</span>
              </div>
              <div class="total-row">
                <span>Carriage & Freight:</span>
                <span>+ Rs. ${(invoice.carriageFreight || 0).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</span>
              </div>
              <div class="total-row grand">
                <span>NET TOTAL:</span>
                <span>Rs. ${netTotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
              </div>
              <div class="total-row">
                <span>Amount Received:</span>
                <span>Rs. ${(invoice.amountReceived || 0).toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}</span>
              </div>
              <div class="total-row balance">
                <span>BALANCE DUE:</span>
                <span>Rs. ${balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}</span>
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
            <p><strong>Thank you for your business!</strong></p>
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Sales Invoices</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition"
        >
          <FiPlus className="w-5 h-5" />
          New Invoice
        </button>
      </div>

      <Modal
        isOpen={showForm}
        onClose={handleCloseModal}
        title={editingInvoice ? "Edit Sales Invoice" : "New Sales Invoice"}
        size="5xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error and Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Invoice Header */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2">
              Invoice Header
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Purchase Order No.
                </label>
                <input
                  type="text"
                  placeholder="PO Number"
                  value={formData.purchaseOrderNo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchaseOrderNo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div> */}
              {/* <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Delivery Challan No.
                </label>
                <input
                  type="text"
                  placeholder="Challan Number"
                  value={formData.deliveryChallanNo}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      deliveryChallanNo: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div> */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Terms of Payment *
                </label>
                <select
                  value={formData.termsOfPayment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      termsOfPayment: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Income Account
                </label>
                <select
                  value={formData.incomeAccount}
                  onChange={(e) =>
                    setFormData({ ...formData, incomeAccount: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">Select Income Account</option>
                  <option value="Sales Revenue">Sales Revenue</option>
                  <option value="Property Sales">Property Sales</option>
                  <option value="Service Income">Service Income</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2">
              Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Select Customer *
                </label>
                <select
                  value={formData.customer}
                  onChange={handleCustomerSelect}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.code} - {customer.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Customer Code
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled"
                  value={formData.customerCode}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled"
                  value={formData.customerName}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Telephone
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled"
                  value={formData.telephone}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  readOnly
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled"
                  value={formData.address}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-border pb-2">
              <h3 className="font-semibold text-lg text-foreground">
                Invoice Items
              </h3>
              <button
                type="button"
                onClick={addItem}
                className="text-sm px-3 py-1 bg-primary text-primary-foreground rounded-lg hover:opacity-90"
              >
                + Add Item
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Type
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Item/Plot Code
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Description
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Qty
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Unit
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Rate
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Gross
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Disc %
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Discount
                    </th>
                    <th className="px-2 py-2 text-left text-xs font-semibold">
                      Net
                    </th>
                    <th className="px-2 py-2 text-xs font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.items.map((item, index) => (
                    <tr key={index} className="border-b border-border">
                      <td className="px-2 py-2">
                        <select
                          value={item.itemType}
                          onChange={(e) =>
                            handleItemChange(index, "itemType", e.target.value)
                          }
                          className="w-24 px-2 py-1 border border-border rounded bg-background text-foreground text-xs"
                        >
                          <option value="Inventory">Item</option>
                          <option value="Plot">Plot</option>
                        </select>
                      </td>
                      <td className="px-2 py-2">
                        {item.itemType === "Plot" ? (
                          <select
                            value={item.plotId || ""}
                            onChange={(e) => {
                              const selectedPlot = plots.find(
                                (p) => p._id === e.target.value
                              );
                              if (selectedPlot) {
                                handlePlotSelect(index, selectedPlot._id);
                              }
                            }}
                            className="w-32 px-2 py-1 border border-border rounded bg-background text-foreground text-xs"
                          >
                            <option value="">-- Select Plot --</option>
                            {plots
                              .filter(
                                (p) =>
                                  p.status === "Available" ||
                                  p.status === "Booked" ||
                                  p.status === "Hold" ||
                                  p.status === "Under Construction"
                              )
                              .map((plot) => (
                                <option key={plot._id} value={plot._id}>
                                  {plot.plotNumber} - {plot.status}
                                </option>
                              ))}
                          </select>
                        ) : (
                          <select
                            value={item.itemCode}
                            onChange={(e) => {
                              const selectedItem = items.find(
                                (i) => i.itemCode === e.target.value
                              );
                              if (selectedItem) {
                                handleItemSelect(index, selectedItem._id);
                              }
                            }}
                            className="w-32 px-2 py-1 border border-border rounded bg-background text-foreground text-xs"
                          >
                            <option value="">-- Select Item --</option>
                            {items.map((inv) => (
                              <option key={inv._id} value={inv.itemCode}>
                                {inv.itemCode} - {inv.name}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <textarea
                          rows={3}
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full px-2 py-1 border border-border rounded bg-background text-foreground text-xs"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <div>
                          <input
                            type="number"
                            placeholder="0"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className={`w-16 px-2 py-1 border rounded bg-background text-foreground text-xs ${
                              item.availableStock !== null &&
                              parseFloat(item.quantity || 0) >
                                item.availableStock
                                ? "border-red-500"
                                : "border-border"
                            }`}
                          />
                          {item.availableStock !== null && (
                            <div className="text-xs mt-1">
                              <span
                                className={
                                  parseFloat(item.quantity || 0) >
                                  item.availableStock
                                    ? "text-red-600 font-medium"
                                    : "text-muted-foreground"
                                }
                              >
                                Stock: {item.availableStock}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="text"
                          placeholder="Auto"
                          value={item.unit}
                          className="w-16 px-2 py-1 border border-border rounded bg-muted text-muted-foreground text-xs cursor-not-allowed"
                          readOnly
                        />
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "rate",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 px-2 py-1 border border-border rounded bg-background text-foreground text-xs"
                        />
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">
                        {item.grossAmount.toFixed(2)}
                      </td>
                      <td className="px-2 py-2">
                        <input
                          type="number"
                          placeholder="0"
                          value={item.discountPercent}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "discountPercent",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-16 px-2 py-1 border border-border rounded bg-background text-foreground text-xs"
                        />
                      </td>
                      <td className="px-2 py-2 text-xs text-muted-foreground">
                        {item.discount.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-xs font-semibold text-foreground">
                        {item.netAmount.toFixed(2)}
                      </td>
                      <td className="px-2 py-2 text-center">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-foreground border-b border-border pb-2">
              Additional Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Inventory Location
                </label>
                <select
                  value={formData.inventoryLocation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      inventoryLocation: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Location</option>
                  <option value="Main Warehouse">Main Warehouse</option>
                  <option value="Site Storage">Site Storage</option>
                  <option value="Office">Office</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Project *
                </label>
                <select
                  value={formData.project}
                  onChange={(e) => {
                    const projectId = e.target.value;
                    const selectedProject = projects.find(
                      (p) => p._id === projectId
                    );
                    setFormData({
                      ...formData,
                      project: projectId,
                      jobNo: selectedProject?.code || "",
                      jobDescription: selectedProject?.name || "",
                    });
                  }}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                >
                  <option value="">-- Select Project --</option>
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.code} - {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Job No.
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled"
                  value={formData.jobNo}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Job Description
                </label>
                <input
                  type="text"
                  placeholder="Auto-filled"
                  value={formData.jobDescription}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Employee Reference
                </label>
                <select
                  value={formData.employeeReference}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      employeeReference: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">-- Select Employee --</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Remarks
                </label>
                <textarea
                  placeholder="Additional notes"
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Totals Section */}
          <div className="space-y-3 border-t border-border pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Additional Discount
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.additionalDiscount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        additionalDiscount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Carriage & Freight
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.carriageFreight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        carriageFreight: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items Total:</span>
                  <span className="font-semibold text-foreground">
                    Rs.{" "}
                    {formData.items
                      .reduce((sum, item) => sum + item.netAmount, 0)
                      .toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Net Total:</span>
                  <span className="font-bold text-lg text-foreground">
                    Rs. {calculateTotals().netTotal.toLocaleString()}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Amount Received
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={formData.amountReceived}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        amountReceived: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Balance:</span>
                  <span className="font-bold text-lg text-red-600">
                    Rs. {calculateTotals().balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-lg hover:opacity-90 transition font-medium"
            >
              Create Invoice
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
                  Serial No
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Net Total
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Received
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Balance
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
              {invoices.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No sales invoices found. Create your first invoice!
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => (
                  <tr
                    key={invoice._id}
                    className="hover:bg-muted/50 transition"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {invoice.serialNo}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {invoice.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {invoice.project?.name || invoice.jobDescription || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      Rs. {(invoice.netTotal || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      Rs. {(invoice.amountReceived || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-600">
                      Rs. {(invoice.balance || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "partial"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition"
                          title="Edit Invoice"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(invoice._id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                          title="Delete Invoice"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePrint(invoice)}
                          className="p-2 hover:bg-muted rounded-lg transition text-foreground"
                          title="Print Invoice"
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
