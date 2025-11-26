"use client";

export default function InventoryReport() {
  const inventory = [
    {
      item: "Cement",
      unit: "Bag",
      quantity: 450,
      rate: 500,
      total: 225000,
      status: "In Stock",
    },
    {
      item: "Bricks",
      unit: "Piece",
      quantity: 5000,
      rate: 5,
      total: 25000,
      status: "In Stock",
    },
    {
      item: "Steel",
      unit: "KG",
      quantity: 1200,
      rate: 200,
      total: 240000,
      status: "Low Stock",
    },
    {
      item: "PVC Pipes",
      unit: "Meter",
      quantity: 300,
      rate: 150,
      total: 45000,
      status: "In Stock",
    },
    {
      item: "Crush",
      unit: "Ton",
      quantity: 50,
      rate: 3000,
      total: 150000,
      status: "In Stock",
    },
    {
      item: "Sand",
      unit: "Ton",
      quantity: 30,
      rate: 2000,
      total: 60000,
      status: "Low Stock",
    },
    {
      item: "Paint",
      unit: "Liter",
      quantity: 200,
      rate: 800,
      total: 160000,
      status: "In Stock",
    },
  ];

  const totalInventoryValue = inventory.reduce(
    (sum, item) => sum + item.total,
    0
  );
  const lowStockItems = inventory.filter(
    (item) => item.status === "Low Stock"
  ).length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Inventory Report</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Items
          </p>
          <p className="text-2xl font-bold text-primary mt-2">
            {inventory.length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Total Inventory Value
          </p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            Rs. {totalInventoryValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm font-medium text-muted-foreground">
            Low Stock Items
          </p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            {lowStockItems}
          </p>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted border-b border-border">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Item Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Unit
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Total Value
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {inventory.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/50 transition">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {item.item}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {item.unit}
                  </td>
                  <td className="px-6 py-4 text-sm text-foreground">
                    {item.quantity.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    Rs. {item.rate.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-foreground">
                    Rs. {item.total.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "In Stock"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-muted font-bold">
                <td colSpan="4" className="px-6 py-4 text-sm text-foreground">
                  Total Inventory Value
                </td>
                <td className="px-6 py-4 text-sm text-foreground">
                  Rs. {totalInventoryValue.toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
