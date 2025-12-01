"use client";

import { useState, useEffect } from "react";
import { reportApi } from "../../api/reportApi";
import { projectApi } from "../../api/projectApi";
import {
  FiDownload,
  FiFilter,
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import Loader from "./Loader";

export default function PlotsReport() {
  const [reportData, setReportData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [filters, setFilters] = useState({
    project: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    fetchProjects();
    fetchReport();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectApi.getAll();
      if (response.success) {
        setProjects(response.data);
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await reportApi.getPlotsReport(filters);
      if (response.success) {
        setReportData(response.data);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch plots report");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setFilters({
      project: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setTimeout(() => fetchReport(), 100);
  };

  const exportToCSV = () => {
    if (!reportData || !reportData.plots) return;

    const headers = [
      "Plot Number",
      "Project",
      "Block",
      "Phase",
      "Size",
      "Type",
      "Status",
      "Base Price",
      "Final Price",
      "Customer",
      "Amount Received",
      "Balance",
      "Sale Date",
    ];

    const rows = reportData.plots.map((plot) => [
      plot.plotNumber,
      plot.project?.name || "",
      plot.block || "",
      plot.phase || "",
      `${plot.plotSize} ${plot.unit}`,
      plot.plotType,
      plot.status,
      plot.basePrice,
      plot.finalPrice || "",
      plot.customer?.name || "",
      plot.amountReceived || 0,
      plot.balance || 0,
      plot.saleDate ? new Date(plot.saleDate).toLocaleDateString() : "",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plots-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    setSuccess("Report exported successfully");
    setTimeout(() => setSuccess(""), 3000);
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
          <h1 className="text-3xl font-bold text-foreground">Plots Report</h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive plots sales and inventory report
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={!reportData || !reportData.plots}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="w-5 h-5" />
          Export CSV
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

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="w-5 h-5 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Project
            </label>
            <select
              name="project"
              value={filters.project}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
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
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              From Date
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              To Date
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-input bg-background rounded-lg focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Apply Filters
          </button>
          <button
            onClick={handleClearFilters}
            className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Plots</p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {reportData.summary.totalPlots}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FiMapPin className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-green-600 font-medium">
                  {reportData.summary.availablePlots} Available
                </span>
                <span className="text-muted-foreground mx-2">•</span>
                <span className="text-blue-600 font-medium">
                  {reportData.summary.soldPlots} Sold
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Sales Value
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    Rs.{" "}
                    {(reportData.summary.totalSalesValue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <FiTrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Amount Received
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    Rs.{" "}
                    {(
                      reportData.summary.totalAmountReceived || 0
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Balance Due</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">
                    Rs.{" "}
                    {(reportData.summary.totalBalanceDue || 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-card border border-border rounded-lg">
            <div className="border-b border-border">
              <div className="flex gap-4 px-6">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`py-4 px-2 border-b-2 font-medium transition ${
                    activeTab === "summary"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All Plots
                </button>
                <button
                  onClick={() => setActiveTab("byProject")}
                  className={`py-4 px-2 border-b-2 font-medium transition ${
                    activeTab === "byProject"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  By Project
                </button>
                <button
                  onClick={() => setActiveTab("byCustomer")}
                  className={`py-4 px-2 border-b-2 font-medium transition ${
                    activeTab === "byCustomer"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  By Customer
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* All Plots Tab */}
              {activeTab === "summary" && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Plot Number
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Project
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Size
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Received
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {reportData.plots.length === 0 ? (
                        <tr>
                          <td
                            colSpan="9"
                            className="px-4 py-8 text-center text-muted-foreground"
                          >
                            No plots found matching the filters.
                          </td>
                        </tr>
                      ) : (
                        reportData.plots.map((plot) => (
                          <tr
                            key={plot._id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-foreground">
                              {plot.plotNumber}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {plot.project?.name || "N/A"}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {plot.plotSize} {plot.unit}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {plot.plotType}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  plot.status
                                )}`}
                              >
                                {plot.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-foreground">
                              Rs.{" "}
                              {(
                                plot.finalPrice ||
                                plot.basePrice ||
                                0
                              ).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {plot.customer?.name || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-green-600 font-medium">
                              Rs. {(plot.amountReceived || 0).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-sm text-orange-600 font-medium">
                              Rs. {(plot.balance || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* By Project Tab */}
              {activeTab === "byProject" && (
                <div className="space-y-6">
                  {reportData.byProject.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No project data available.
                    </p>
                  ) : (
                    reportData.byProject.map((project) => (
                      <div
                        key={project.projectName}
                        className="border border-border rounded-lg p-6"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold text-foreground">
                              {project.projectName}
                            </h3>
                            {project.projectCode && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Code: {project.projectCode}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                              {project.count}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Total Plots
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              Sold
                            </p>
                            <p className="text-lg font-bold text-blue-600">
                              {project.sold}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              Available
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              {project.available}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              Total Value
                            </p>
                            <p className="text-sm font-bold text-foreground">
                              Rs. {project.totalValue.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              Balance
                            </p>
                            <p className="text-sm font-bold text-orange-600">
                              Rs. {project.totalBalance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* By Customer Tab */}
              {activeTab === "byCustomer" && (
                <div className="space-y-6">
                  {reportData.byCustomer.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No customer data available.
                    </p>
                  ) : (
                    reportData.byCustomer.map((customerData) => (
                      <div
                        key={customerData.customer._id}
                        className="border border-border rounded-lg p-6"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="bg-primary/10 p-3 rounded-lg">
                            <FiUser className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-foreground">
                              {customerData.customer.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {customerData.customer.email}
                            </p>
                            {customerData.customer.phone && (
                              <p className="text-sm text-muted-foreground">
                                {customerData.customer.phone}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-foreground">
                              {customerData.count}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Plot(s)
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              Total Value
                            </p>
                            <p className="text-lg font-bold text-foreground">
                              Rs. {customerData.totalValue.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              Amount Paid
                            </p>
                            <p className="text-lg font-bold text-green-600">
                              Rs. {customerData.totalPaid.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground">
                              Balance Due
                            </p>
                            <p className="text-lg font-bold text-orange-600">
                              Rs. {customerData.totalBalance.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-semibold">
                                  Plot
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold">
                                  Project
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold">
                                  Size
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold">
                                  Price
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold">
                                  Paid
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold">
                                  Balance
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-semibold">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {customerData.plots.map((plot, idx) => (
                                <tr key={idx}>
                                  <td className="px-3 py-2 font-medium">
                                    {plot.plotNumber}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {plot.project}
                                  </td>
                                  <td className="px-3 py-2 text-muted-foreground">
                                    {plot.size} {plot.unit}
                                  </td>
                                  <td className="px-3 py-2 font-semibold">
                                    Rs. {(plot.price || 0).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-green-600">
                                    Rs.{" "}
                                    {(
                                      plot.amountReceived || 0
                                    ).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2 text-orange-600">
                                    Rs. {(plot.balance || 0).toLocaleString()}
                                  </td>
                                  <td className="px-3 py-2">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                        plot.status
                                      )}`}
                                    >
                                      {plot.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
