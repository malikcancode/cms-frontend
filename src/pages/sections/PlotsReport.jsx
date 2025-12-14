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
  FiBox,
  FiBarChart2,
} from "react-icons/fi";
import Loader from "./Loader";

export default function PlotsReport() {
  const [reportData, setReportData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Filters
  const [filters, setFilters] = useState({
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
      const response = await projectApi.getAll();
      if (response.success) {
        let filteredProjects = response.data || [];

        // Apply filters
        if (filters.status) {
          filteredProjects = filteredProjects.filter(
            (p) => p.status === filters.status
          );
        }
        if (filters.startDate) {
          filteredProjects = filteredProjects.filter(
            (p) => new Date(p.startDate) >= new Date(filters.startDate)
          );
        }
        if (filters.endDate) {
          filteredProjects = filteredProjects.filter(
            (p) => new Date(p.completionDate) <= new Date(filters.endDate)
          );
        }

        setReportData(filteredProjects);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch project reports");
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
      status: "",
      startDate: "",
      endDate: "",
    });
    setTimeout(() => fetchReport(), 100);
  };

  const exportToPDF = () => {
    if (!reportData || reportData.length === 0) {
      alert("No data to export");
      return;
    }

    // Calculate totals
    const totalEstimatedCost = reportData.reduce(
      (sum, project) => sum + (project.estimatedCost || 0),
      0
    );
    const totalValueOfProject = reportData.reduce(
      (sum, project) => sum + (project.valueOfJob || 0),
      0
    );

    // Build filter description
    let filterDesc = "";
    if (filters.status) filterDesc += `Status: ${filters.status}`;
    if (filters.startDate)
      filterDesc += ` | From: ${new Date(
        filters.startDate
      ).toLocaleDateString()}`;
    if (filters.endDate)
      filterDesc += ` | To: ${new Date(filters.endDate).toLocaleDateString()}`;
    if (!filterDesc) filterDesc = "All Projects";

    const printWindow = window.open("", "", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Project Reports</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; padding: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 15px; }
            .header h1 { font-size: 24px; margin-bottom: 5px; }
            .header h2 { font-size: 18px; margin-bottom: 10px; color: #333; }
            .header .filters { font-size: 12px; color: #666; margin-top: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
            th, td { border: 1px solid #000; padding: 6px; text-align: left; }
            th { background-color: #f0f0f0; font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .totals { background-color: #f9f9f9; font-weight: bold; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; }
            .signature-section { display: grid; grid-template-columns: repeat(3, 1fr); gap: 40px; margin-top: 30px; }
            .signature-box { text-align: center; }
            .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; font-size: 12px; }
            @media print {
              body { padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>YM CONSTRUCTIONS</h1>
            <h2>Project Reports</h2>
            <div class="filters">${filterDesc}</div>
            <div class="filters">Generated on: ${new Date().toLocaleString()}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Project Name</th>
                <th>Client</th>
                <th>Project No</th>
                <th class="text-center">Status</th>
                <th>Start Date</th>
                <th>Completion</th>
                <th class="text-right">Estimated Cost</th>
                <th class="text-right">Project Value</th>
                <th>Project Incharge</th>
              </tr>
            </thead>
            <tbody>
              ${reportData
                .map(
                  (project) => `
                <tr>
                  <td>${project.name || "-"}</td>
                  <td>${project.client || "-"}</td>
                  <td>${project.jobNo || "-"}</td>
                  <td class="text-center">${project.status || "-"}</td>
                  <td>${
                    project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : "-"
                  }</td>
                  <td>${
                    project.completionDate
                      ? new Date(project.completionDate).toLocaleDateString()
                      : "-"
                  }</td>
                  <td class="text-right">Rs. ${(
                    project.estimatedCost || 0
                  ).toLocaleString()}</td>
                  <td class="text-right">Rs. ${(
                    project.valueOfJob || 0
                  ).toLocaleString()}</td>
                  <td>${project.jobIncharge || "-"}</td>
                </tr>
              `
                )
                .join("")}
              <tr class="totals">
                <td colspan="6" class="text-right">Total:</td>
                <td class="text-right">Rs. ${totalEstimatedCost.toLocaleString()}</td>
                <td class="text-right">Rs. ${totalValueOfProject.toLocaleString()}</td>
                <td>-</td>
              </tr>
            </tbody>
          </table>

          <div class="footer">
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line">Prepared by</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">Reviewed by</div>
              </div>
              <div class="signature-box">
                <div class="signature-line">Approved by</div>
              </div>
            </div>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    setSuccess("Report exported successfully");
    setTimeout(() => setSuccess(""), 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      Completed: "bg-blue-100 text-blue-800",
      "On Hold": "bg-yellow-100 text-yellow-800",
      Cancelled: "bg-red-100 text-red-800",
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
            Project Reports
          </h1>
          <p className="text-muted-foreground mt-1">
            Comprehensive project overview and analytics
          </p>
        </div>
        <button
          onClick={exportToPDF}
          disabled={!reportData || reportData.length === 0}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiDownload className="w-5 h-5" />
          Export PDF
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Start Date (From)
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
              Completion Date (To)
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

      {reportData && reportData.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Projects
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {reportData.length}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FiBox className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-green-600 font-medium">
                  {reportData.filter((p) => p.status === "Active").length}{" "}
                  Active
                </span>
                <span className="text-muted-foreground mx-2">•</span>
                <span className="text-blue-600 font-medium">
                  {reportData.filter((p) => p.status === "Completed").length}{" "}
                  Completed
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Estimated Cost
                  </p>
                  <p className="text-2xl font-bold text-foreground mt-2">
                    Rs.{" "}
                    {reportData
                      .reduce((sum, p) => sum + (p.estimatedCost || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <FiDollarSign className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Job Value
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    Rs.{" "}
                    {reportData
                      .reduce((sum, p) => sum + (p.valueOfJob || 0), 0)
                      .toLocaleString()}
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
                    Completed Jobs
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    {reportData.filter((p) => p.jobCompleted).length}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FiBarChart2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-card border border-border rounded-lg">
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Project Name
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Client
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Project No
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Start Date
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Completion
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Estimated Cost
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Project Value
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">
                        Project Incharge
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {reportData.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="px-4 py-8 text-center text-muted-foreground"
                        >
                          No projects found matching the filters.
                        </td>
                      </tr>
                    ) : (
                      reportData.map((project) => (
                        <tr
                          key={project._id}
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-foreground">
                            {project.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {project.client || "N/A"}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {project.jobNo || "-"}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                project.status
                              )}`}
                            >
                              {project.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {project.startDate
                              ? new Date(project.startDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {project.completionDate
                              ? new Date(
                                  project.completionDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-foreground">
                            Rs. {(project.estimatedCost || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-green-600">
                            Rs. {(project.valueOfJob || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {project.jobIncharge || "-"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {(!reportData || reportData.length === 0) && !loading && (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <FiBox className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-lg">No projects found.</p>
          <p className="text-muted-foreground text-sm mt-2">
            Try adjusting your filters or create a new project.
          </p>
        </div>
      )}
    </div>
  );
}
