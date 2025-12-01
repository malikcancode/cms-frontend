import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dashboardApi from "../../api/dashboardApi";
import Loader from "../../pages/sections/Loader";

// Custom tooltip for better formatting
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        {label && <p className="font-semibold text-foreground mb-1">{label}</p>}
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color }} className="text-sm">
            {entry.name}: Rs. {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Expense Breakdown Pie Chart
export const ExpenseBreakdownChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getExpenseBreakdown();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching expense breakdown:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expense data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Revenue Trend Line Chart
export const RevenueTrendChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getRevenueTrend();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching revenue trend:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#10b981"
          strokeWidth={2}
          name="Revenue"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Revenue vs Expenses Bar Chart
export const RevenueVsExpensesChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getRevenueVsExpenses();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching revenue vs expenses:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No financial data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="revenue" fill="#10b981" name="Revenue" />
        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Project Status Distribution Pie Chart
export const ProjectStatusChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getProjectStatus();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching project status:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No project data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Cash Flow Summary
export const CashFlowChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getCashFlow();
        setData(response.data);
      } catch (error) {
        console.error("Error fetching cash flow:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No cash flow data available
      </div>
    );
  }

  const chartData = [
    { name: "Cash In", value: data.cashIn, color: "#10b981" },
    { name: "Cash Out", value: data.cashOut, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Cash In</p>
          <p className="text-2xl font-bold text-green-600">
            Rs. {data.cashIn.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Cash Out</p>
          <p className="text-2xl font-bold text-red-600">
            Rs. {data.cashOut.toLocaleString()}
          </p>
        </div>
        <div className={`${data.isPositive ? 'bg-blue-50' : 'bg-orange-50'} rounded-lg p-4 text-center`}>
          <p className="text-sm text-muted-foreground mb-1">Net Flow</p>
          <p className={`text-2xl font-bold ${data.isPositive ? 'text-blue-600' : 'text-orange-600'}`}>
            Rs. {data.netFlow.toLocaleString()}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

// Top Projects by Revenue
export const TopProjectsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getTopProjects();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching top projects:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No project revenue data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="revenue" fill="#3b82f6" name="Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Projects Over Budget
export const ProjectsOverBudgetChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getProjectsOverBudget();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching projects over budget:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-green-600">
        ✓ All projects are within budget!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {data.map((project, index) => (
        <div
          key={index}
          className={`border rounded-lg p-4 ${
            project.status === 'over' ? 'border-red-300 bg-red-50' : 'border-yellow-300 bg-yellow-50'
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-foreground">{project.name}</h4>
            <span className={`text-lg font-bold ${
              project.status === 'over' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {project.percentage}%
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Budget</p>
              <p className="font-semibold">Rs. {project.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="font-semibold">Rs. {project.spent.toLocaleString()}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div
              className={`h-2 rounded-full ${
                project.status === 'over' ? 'bg-red-600' : 'bg-yellow-600'
              }`}
              style={{ width: `${Math.min(project.percentage, 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// Accounts Receivable Summary
export const AccountsReceivableChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getAccountsReceivable();
        setData(response.data);
      } catch (error) {
        console.error("Error fetching accounts receivable:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No receivables data available
      </div>
    );
  }

  const chartData = [
    { name: "Current", value: data.current, color: "#10b981" },
    { name: "Overdue", value: data.overdue, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-blue-600">
            Rs. {data.totalOutstanding.toLocaleString()}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Current</p>
          <p className="text-2xl font-bold text-green-600">
            Rs. {data.current.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">
            Rs. {data.overdue.toLocaleString()}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: Rs. ${value.toLocaleString()}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Accounts Payable Summary
export const AccountsPayableChart = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getAccountsPayable();
        setData(response.data);
      } catch (error) {
        console.error("Error fetching accounts payable:", error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (!data) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No payables data available
      </div>
    );
  }

  const chartData = [
    { name: "Due Soon", value: data.dueSoon, color: "#f59e0b" },
    { name: "Overdue", value: data.overdue, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Total Payable</p>
          <p className="text-2xl font-bold text-purple-600">
            Rs. {data.totalPayable.toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Due Soon</p>
          <p className="text-2xl font-bold text-orange-600">
            Rs. {data.dueSoon.toLocaleString()}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">Overdue</p>
          <p className="text-2xl font-bold text-red-600">
            Rs. {data.overdue.toLocaleString()}
          </p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: Rs. ${value.toLocaleString()}`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Low Stock Alerts
export const LowStockAlertsChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getLowStockAlerts();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching low stock alerts:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-green-600">
        ✓ All items are adequately stocked!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={index} className="border border-orange-300 bg-orange-50 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-semibold text-foreground">{item.name}</h4>
              <p className="text-sm text-muted-foreground">
                Current: {item.currentStock} {item.unit} | Min: {item.minStock} {item.unit}
              </p>
            </div>
            <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Low Stock
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Top Suppliers
export const TopSuppliersChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getTopSuppliers();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching top suppliers:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No supplier data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="totalPurchases" fill="#8b5cf6" name="Total Purchases" />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Top Customers
export const TopCustomersChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardApi.getTopCustomers();
        setData(response.data || []);
      } catch (error) {
        console.error("Error fetching top customers:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <Loader />;
  
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No customer data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" width={150} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="totalPurchase" fill="#10b981" name="Total Revenue" />
      </BarChart>
    </ResponsiveContainer>
  );
};
