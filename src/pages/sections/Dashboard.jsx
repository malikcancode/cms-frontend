"use client";

import { useState, useEffect } from "react";
import {
  FiBarChart2,
  FiDollarSign,
  FiBox,
  FiTrendingUp,
  FiTrendingDown,
  FiMinus,
} from "react-icons/fi";
import dashboardApi from "../../api/dashboardApi";
import Loader from "./Loader";
import {
  ExpenseBreakdownChart,
  RevenueTrendChart,
  RevenueVsExpensesChart,
  ProjectStatusChart,
  CashFlowChart,
  TopProjectsChart,
  ProjectsOverBudgetChart,
  AccountsReceivableChart,
  AccountsPayableChart,
  LowStockAlertsChart,
  TopSuppliersChart,
  TopCustomersChart,
} from "../../components/charts/DashboardCharts";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  // const [plotStats, setPlotStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChart, setSelectedChart] = useState("expense-breakdown");

  // Chart options for dropdown
  const chartOptions = [
    { value: "expense-breakdown", label: "Expense Breakdown (Pie Chart)" },
    { value: "revenue-trend", label: "Revenue Trend (Line Chart)" },
    { value: "revenue-vs-expenses", label: "Revenue vs Expenses (Bar Chart)" },
    {
      value: "project-status",
      label: "Project Status Distribution (Pie Chart)",
    },
    { value: "cash-flow", label: "Cash Flow Summary" },
    { value: "top-projects", label: "Top 5 Projects by Revenue" },
    { value: "projects-over-budget", label: "Projects Over Budget (Alerts)" },
    { value: "accounts-receivable", label: "Accounts Receivable Summary" },
    { value: "accounts-payable", label: "Accounts Payable Summary" },
    { value: "low-stock-alerts", label: "Low Stock Alerts" },
    { value: "top-suppliers", label: "Top Suppliers by Volume" },
    { value: "top-customers", label: "Top Customers by Revenue" },
  ];

  // Render selected chart
  const renderSelectedChart = () => {
    switch (selectedChart) {
      case "expense-breakdown":
        return <ExpenseBreakdownChart />;
      case "revenue-trend":
        return <RevenueTrendChart />;
      case "revenue-vs-expenses":
        return <RevenueVsExpensesChart />;
      case "project-status":
        return <ProjectStatusChart />;
      case "cash-flow":
        return <CashFlowChart />;
      case "top-projects":
        return <TopProjectsChart />;
      case "projects-over-budget":
        return <ProjectsOverBudgetChart />;
      case "accounts-receivable":
        return <AccountsReceivableChart />;
      case "accounts-payable":
        return <AccountsPayableChart />;
      case "low-stock-alerts":
        return <LowStockAlertsChart />;
      case "top-suppliers":
        return <TopSuppliersChart />;
      case "top-customers":
        return <TopCustomersChart />;
      default:
        return <ExpenseBreakdownChart />;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Helper function to parse change and determine if it's positive, negative, or neutral
  const parseChange = (changeStr) => {
    if (!changeStr)
      return { value: 0, isPositive: false, isNegative: false, display: "0%" };

    const str = String(changeStr).trim();
    const numericValue = parseFloat(str.replace(/[^0-9.-]/g, ""));

    return {
      value: numericValue,
      isPositive: numericValue > 0,
      isNegative: numericValue < 0,
      isNeutral: numericValue === 0,
      display: str,
    };
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch stats, recent projects, and plot stats in parallel
      const [statsResponse, projectsResponse /*, plotStatsResponse*/] =
        await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getRecentProjects(3),
          // dashboardApi.getPlotStats(),
        ]);

      // Handle empty or missing data gracefully
      const statsData = statsResponse?.data?.stats || {
        totalExpenses: 0,
        expensesChange: "0%",
        totalSales: 0,
        salesChange: "0%",
        netProfit: 0,
        profitChange: "0%",
        activeProjects: 0,
        projectsChange: "0",
      };

      // Format stats for display
      const formattedStats = [
        {
          title: "Total Expenses",
          value: `Rs. ${(statsData.totalExpenses || 0).toLocaleString()}`,
          change: statsData.expensesChange || "0%",
          changeData: parseChange(statsData.expensesChange || "0%"),
          icon: FiDollarSign,
          color: "text-red-500",
          bgColor: "bg-red-50",
        },
        {
          title: "Total Sales",
          value: `Rs. ${(statsData.totalSales || 0).toLocaleString()}`,
          change: statsData.salesChange || "0%",
          changeData: parseChange(statsData.salesChange || "0%"),
          icon: FiTrendingUp,
          color: "text-green-500",
          bgColor: "bg-green-50",
        },
        {
          title: "Net Profit",
          value: `Rs. ${(statsData.netProfit || 0).toLocaleString()}`,
          change: statsData.profitChange || "0%",
          changeData: parseChange(statsData.profitChange || "0%"),
          icon: FiBarChart2,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
        },
        {
          title: "Active Projects",
          value: (statsData.activeProjects || 0).toString(),
          change: statsData.projectsChange || "0",
          changeData: parseChange(statsData.projectsChange || "0"),
          icon: FiBox,
          color: "text-purple-500",
          bgColor: "bg-purple-50",
        },
      ];

      setStats(formattedStats);
      setRecentProjects(projectsResponse?.data || []);
      // setPlotStats(plotStatsResponse?.data || null);
    } catch (err) {
      console.error("Dashboard error:", err);
      // Set default values instead of showing error
      const defaultStats = [
        {
          title: "Total Expenses",
          value: "Rs. 0",
          change: "0%",
          changeData: parseChange("0%"),
          icon: FiDollarSign,
          color: "text-red-500",
          bgColor: "bg-red-50",
        },
        {
          title: "Total Sales",
          value: "Rs. 0",
          change: "0%",
          changeData: parseChange("0%"),
          icon: FiTrendingUp,
          color: "text-green-500",
          bgColor: "bg-green-50",
        },
        {
          title: "Net Profit",
          value: "Rs. 0",
          change: "0%",
          changeData: parseChange("0%"),
          icon: FiBarChart2,
          color: "text-blue-500",
          bgColor: "bg-blue-50",
        },
        {
          title: "Active Projects",
          value: "0",
          change: "0",
          changeData: parseChange("0"),
          icon: FiBox,
          color: "text-purple-500",
          bgColor: "bg-purple-50",
        },
      ];
      setStats(defaultStats);
      setRecentProjects([]);
      // setPlotStats(null);
      // Don't show error for empty data or common issues
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-stone-300 capitalize">
          Welcome to YM constructions Management System
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const { isPositive, isNegative, isNeutral, display } =
            stat.changeData;

          // Determine trend icon and colors
          const TrendIcon = isPositive
            ? FiTrendingUp
            : isNegative
            ? FiTrendingDown
            : FiMinus;
          const trendColor = isPositive
            ? "text-green-600"
            : isNegative
            ? "text-red-600"
            : "text-gray-500";
          const trendBgColor = isPositive
            ? "bg-green-50"
            : isNegative
            ? "bg-red-50"
            : "bg-gray-50";

          return (
            <div
              key={stat.title}
              className="relative group bg-card border border-border rounded-2xl p-6 overflow-hidden
             shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]
             transition-all duration-300"
            >
              {/* Glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                  bg-linear-to-br from-white/5 to-transparent pointer-events-none"
              />

              <div className="flex items-start justify-between relative z-10">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm font-medium tracking-wide">
                    {stat.title}
                  </p>

                  <p className="text-3xl font-extrabold text-foreground mt-2 leading-tight">
                    {stat.value}
                  </p>

                  {/* Dynamic trend indicator */}
                  <div
                    className={`inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-md ${trendBgColor}`}
                  >
                    <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
                    <span className={`text-xs font-semibold ${trendColor}`}>
                      {display}
                    </span>
                  </div>
                </div>

                {/* Icon container */}
                <div
                  className={`${stat.bgColor} p-4 rounded-xl shadow-inner 
                  group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon
                    className={`w-7 h-7 ${stat.color} group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.15)]
                    transition-all duration-300`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plot Statistics - Commented out for now
      {plotStats && (
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            Plots Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {plotStats.available}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Available</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">
                {plotStats.booked}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Booked</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {plotStats.sold}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Sold</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {plotStats.total}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Total Plots</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Sales Value</p>
              <p className="text-xl font-bold text-foreground mt-1">
                Rs. {(plotStats.totalSalesValue || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Amount Received</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                Rs. {(plotStats.totalReceived || 0).toLocaleString()}
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Balance Due</p>
              <p className="text-xl font-bold text-orange-600 mt-1">
                Rs. {(plotStats.totalOutstanding || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
      */}

      {/* Analytics Charts Section */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground mb-3 md:mb-0">
            Analytics & Insights
          </h2>
          <div className="flex items-center gap-3">
            <label
              htmlFor="chart-selector"
              className="text-sm font-medium text-muted-foreground"
            >
              Select Chart:
            </label>
            <select
              id="chart-selector"
              value={selectedChart}
              onChange={(e) => setSelectedChart(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-background text-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       cursor-pointer hover:border-primary transition-colors"
            >
              {chartOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart Display Area */}
        <div className="min-h-[400px]">{renderSelectedChart()}</div>
      </div>

      {/* Recent Projects */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Recent Projects
        </h2>
        <div className="space-y-4">
          {recentProjects.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-lg">
              <FiBox className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground text-sm">
                No projects available yet.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Create your first project to see it here.
              </p>
            </div>
          ) : (
            recentProjects.map((project) => (
              <div
                key={project._id || project.name}
                className="border border-border rounded-2xl p-5 bg-card/60 backdrop-blur-sm
             shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-foreground">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {project.status}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm
        ${
          project.status === "Completed"
            ? "bg-green-100 text-green-800"
            : project.status === "In Progress"
            ? "bg-blue-100 text-blue-800"
            : "bg-yellow-100 text-yellow-800"
        }`}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-sm font-medium text-foreground">
                  <span>
                    Budget: Rs. {((project.budget || 0) / 100000).toFixed(1)}L
                  </span>
                  <span>
                    Spent: Rs. {((project.spent || 0) / 100000).toFixed(1)}L
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
