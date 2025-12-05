"use client";

import { useState, useEffect, useContext } from "react";
import {
  getAllPlots,
  createPlot,
  updatePlot,
  deletePlot,
  getPlotsByProject,
  getPlotSummary,
} from "../../api/plotApi";
import { projectApi } from "../../api/projectApi";
import { customerApi } from "../../api/customerApi";
import { requestApprovalApi } from "../../api/requestApprovalApi";
import { AuthContext } from "../../context/AuthContext";
import Modal from "../../components/Modal";
import { FiEdit2, FiTrash2, FiPlus, FiFilter } from "react-icons/fi";
import Loader from "./Loader";

export default function Plots() {
  const { user } = useContext(AuthContext);
  const [plots, setPlots] = useState([]);
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPlot, setSelectedPlot] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    plotNumber: "",
    project: "",
    block: "",
    phase: "",
    plotSize: "",
    unit: "sq ft",
    plotType: "Residential",
    facing: "",
    basePrice: "",
    rate: "",
    quantity: "1",
    totalStock: "1",
    grossAmount: "",
    paymentTerms: "",
    status: "Available",
    customer: "",
    bookingDate: "",
    saleDate: "",
    finalPrice: "",
    bookingAmount: "",
    amountReceived: "",
    registrationDate: "",
    possessionDate: "",
    features: "",
    remarks: "",
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchPlotsByProject(selectedProject);
    } else {
      fetchPlots();
    }
  }, [selectedProject, selectedStatus]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [plotsRes, projectsRes, customersRes, summaryRes] =
        await Promise.all([
          getAllPlots(),
          projectApi.getAll(),
          customerApi.getAll(),
          getPlotSummary(),
        ]);

      if (plotsRes.success) setPlots(plotsRes.data);
      if (projectsRes.success) setProjects(projectsRes.data);
      if (customersRes.success) setCustomers(customersRes.data);
      if (summaryRes.success) setSummary(summaryRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchPlots = async () => {
    try {
      const response = await getAllPlots();
      if (response.success) {
        let filteredPlots = response.data;
        if (selectedStatus) {
          filteredPlots = filteredPlots.filter(
            (p) => p.status === selectedStatus
          );
        }
        setPlots(filteredPlots);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch plots");
    }
  };

  const fetchPlotsByProject = async (projectId) => {
    try {
      const response = await getPlotsByProject(projectId);
      if (response.success) {
        let filteredPlots = response.data;
        if (selectedStatus) {
          filteredPlots = filteredPlots.filter(
            (p) => p.status === selectedStatus
          );
        }
        setPlots(filteredPlots);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch plots");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = (mode, plot = null) => {
    setModalMode(mode);
    setSelectedPlot(plot);

    if (mode === "edit" && plot) {
      setFormData({
        plotNumber: plot.plotNumber || "",
        project: plot.project?._id || "",
        block: plot.block || "",
        phase: plot.phase || "",
        plotSize: plot.plotSize || "",
        unit: plot.unit || "sq ft",
        plotType: plot.plotType || "Residential",
        facing: plot.facing || "",
        basePrice: plot.basePrice || "",
        rate: plot.rate || plot.basePrice || "",
        quantity: plot.quantity || "1",
        totalStock: plot.totalStock || "1",
        grossAmount: plot.grossAmount || "",
        paymentTerms: plot.paymentTerms || "",
        status: plot.status || "Available",
        customer: plot.customer?._id || "",
        bookingDate: plot.bookingDate
          ? new Date(plot.bookingDate).toISOString().split("T")[0]
          : "",
        saleDate: plot.saleDate
          ? new Date(plot.saleDate).toISOString().split("T")[0]
          : "",
        finalPrice: plot.finalPrice || "",
        bookingAmount: plot.bookingAmount || "",
        amountReceived: plot.amountReceived || "",
        registrationDate: plot.registrationDate
          ? new Date(plot.registrationDate).toISOString().split("T")[0]
          : "",
        possessionDate: plot.possessionDate
          ? new Date(plot.possessionDate).toISOString().split("T")[0]
          : "",
        features: Array.isArray(plot.features)
          ? plot.features.join(", ")
          : plot.features || "",
        remarks: plot.remarks || "",
      });
    } else {
      setFormData({
        plotNumber: "",
        project: "",
        block: "",
        phase: "",
        plotSize: "",
        unit: "sq ft",
        plotType: "Residential",
        facing: "",
        basePrice: "",
        rate: "",
        quantity: "1",
        totalStock: "1",
        grossAmount: "",
        paymentTerms: "",
        status: "Available",
        customer: "",
        bookingDate: "",
        saleDate: "",
        finalPrice: "",
        bookingAmount: "",
        amountReceived: "",
        registrationDate: "",
        possessionDate: "",
        features: "",
        remarks: "",
      });
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlot(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const plotData = {
        ...formData,
        plotSize: parseFloat(formData.plotSize),
        basePrice: parseFloat(formData.basePrice),
        rate: formData.rate
          ? parseFloat(formData.rate)
          : parseFloat(formData.basePrice),
        quantity: formData.quantity ? parseInt(formData.quantity) : 1,
        totalStock: formData.totalStock ? parseInt(formData.totalStock) : 1,
        grossAmount: formData.grossAmount
          ? parseFloat(formData.grossAmount)
          : undefined,
        paymentTerms: formData.paymentTerms || undefined,
        finalPrice: formData.finalPrice
          ? parseFloat(formData.finalPrice)
          : undefined,
        bookingAmount: formData.bookingAmount
          ? parseFloat(formData.bookingAmount)
          : undefined,
        amountReceived: formData.amountReceived
          ? parseFloat(formData.amountReceived)
          : undefined,
        features: formData.features
          ? formData.features.split(",").map((f) => f.trim())
          : [],
        customer: formData.customer || undefined,
        bookingDate: formData.bookingDate || undefined,
        saleDate: formData.saleDate || undefined,
        registrationDate: formData.registrationDate || undefined,
        possessionDate: formData.possessionDate || undefined,
      };

      // Check if user is admin - admins can create/edit directly
      if (user?.role === "admin") {
        let response;
        if (modalMode === "create") {
          response = await createPlot(plotData);
          setSuccess("Plot created successfully");
        } else {
          response = await updatePlot(selectedPlot._id, plotData);
          setSuccess("Plot updated successfully");
        }

        if (response.success) {
          await fetchInitialData();
          handleCloseModal();
          setTimeout(() => setSuccess(""), 3000);
        }
      } else {
        // Non-admin users must submit a request
        const requestData = {
          requestType: modalMode === "create" ? "create_plot" : "edit_plot",
          requestData: plotData,
          entityId: selectedPlot?._id || null,
        };

        const response = await requestApprovalApi.createRequest(requestData);
        if (response.success) {
          setSuccess(
            "Your request has been submitted to the admin for approval. You can view the status in 'My Requests' section."
          );
          handleCloseModal();
          setTimeout(() => setSuccess(""), 3000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (plotId) => {
    if (!window.confirm("Are you sure you want to delete this plot?")) return;

    try {
      const response = await deletePlot(plotId);
      if (response.success) {
        setSuccess("Plot deleted successfully");
        await fetchInitialData();
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete plot");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Available: "bg-green-100 text-green-800",
      Booked: "bg-yellow-100 text-yellow-800",
      Sold: "bg-blue-100 text-blue-800",
      "Under Construction": "bg-purple-100 text-purple-800",
      Hold: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Plot Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage residential and commercial plots
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Add New Plot
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Plots</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {summary.total}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {summary.available}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Sold</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {summary.sold}
            </p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">Total Sales Value</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              Rs. {(summary.totalSalesValue || 0).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name} ({project.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
            >
              <option value="">All Status</option>
              <option value="Available">Available</option>
              <option value="Booked">Booked</option>
              <option value="Sold">Sold</option>
              <option value="Under Construction">Under Construction</option>
              <option value="Hold">Hold</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plots Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Plot Number
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Block/Phase
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plots.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    No plots found. Create your first plot to get started.
                  </td>
                </tr>
              ) : (
                plots.map((plot) => (
                  <tr
                    key={plot._id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {plot.plotNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {plot.project?.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {plot.block && plot.phase
                        ? `${plot.block} / ${plot.phase}`
                        : plot.block || plot.phase || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {plot.plotSize} {plot.unit}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {plot.plotType}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          plot.status
                        )}`}
                      >
                        {plot.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">
                          {plot.availableStock || 0}
                        </span>
                        <span className="text-muted-foreground">/</span>
                        <span>{plot.totalStock || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-foreground">
                      Rs. {(plot.basePrice || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {plot.customer?.name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenModal("edit", plot)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plot._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
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

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalMode === "create" ? "Add New Plot" : "Edit Plot"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plot Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="plotNumber"
                value={formData.plotNumber}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                name="project"
                value={formData.project}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Project</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Block
              </label>
              <input
                type="text"
                name="block"
                value={formData.block}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Phase
              </label>
              <input
                type="text"
                name="phase"
                value={formData.phase}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plot Size <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="plotSize"
                value={formData.plotSize}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Unit
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              >
                <option value="sq ft">sq ft</option>
                <option value="sq m">sq m</option>
                <option value="sq yd">sq yd</option>
                <option value="marla">marla</option>
                <option value="kanal">kanal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Plot Type <span className="text-red-500">*</span>
              </label>
              <select
                name="plotType"
                value={formData.plotType}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Mixed Use">Mixed Use</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Facing
              </label>
              <select
                name="facing"
                value={formData.facing}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              >
                <option value="">Select Facing</option>
                <option value="North">North</option>
                <option value="South">South</option>
                <option value="East">East</option>
                <option value="West">West</option>
                <option value="North-East">North-East</option>
                <option value="North-West">North-West</option>
                <option value="South-East">South-East</option>
                <option value="South-West">South-West</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Base Price <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Rate (Per Unit)
              </label>
              <input
                type="number"
                name="rate"
                value={formData.rate}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Same as base price if empty"
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                min="1"
                step="1"
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Total Stock
              </label>
              <input
                type="number"
                name="totalStock"
                value={formData.totalStock}
                onChange={handleInputChange}
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                placeholder="e.g., 50% advance, balance in 3 months"
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
              >
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="Sold">Sold</option>
                <option value="Under Construction">Under Construction</option>
                <option value="Hold">Hold</option>
              </select>
            </div>
          </div>

          {/* Sale Information */}
          {(formData.status === "Booked" || formData.status === "Sold") && (
            <div className="border-t pt-4 mt-4">
              <h3 className="font-semibold text-foreground mb-3">
                Sale Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Customer
                  </label>
                  <select
                    name="customer"
                    value={formData.customer}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Booking Date
                  </label>
                  <input
                    type="date"
                    name="bookingDate"
                    value={formData.bookingDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Final Price
                  </label>
                  <input
                    type="number"
                    name="finalPrice"
                    value={formData.finalPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Booking Amount
                  </label>
                  <input
                    type="number"
                    name="bookingAmount"
                    value={formData.bookingAmount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Amount Received
                  </label>
                  <input
                    type="number"
                    name="amountReceived"
                    value={formData.amountReceived}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                  />
                </div>

                {formData.status === "Sold" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Sale Date
                      </label>
                      <input
                        type="date"
                        name="saleDate"
                        value={formData.saleDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Registration Date
                      </label>
                      <input
                        type="date"
                        name="registrationDate"
                        value={formData.registrationDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Possession Date
                      </label>
                      <input
                        type="date"
                        name="possessionDate"
                        value={formData.possessionDate}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold text-foreground mb-3">
              Additional Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Features (comma-separated)
                </label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="e.g., Park Facing, Corner Plot, Wide Road"
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              {modalMode === "create" ? "Create Plot" : "Update Plot"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
