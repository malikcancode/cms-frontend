"use client";

export default function IncomeStatement() {
  const incomeStatement = {
    revenue: 6700000,
    expenses: {
      labourWages: 850000,
      materialExpense: 650000,
      electricalWork: 325000,
      plumbing: 175000,
      transportation: 200000,
      administrativeExpenses: 150000,
      marketingExpenses: 100000,
    },
    otherIncome: 50000,
    otherExpenses: 25000,
  };

  const totalExpenses = Object.values(incomeStatement.expenses).reduce(
    (a, b) => a + b,
    0
  );
  const grossProfit = incomeStatement.revenue - totalExpenses;
  const netIncome =
    grossProfit + incomeStatement.otherIncome - incomeStatement.otherExpenses;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Income Statement</h1>

      <div className="bg-card border border-border rounded-lg p-8 max-w-6xl">
        <div className="text-center mb-8 pb-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            Construction Management System
          </h2>
          <p className="text-sm text-muted-foreground mt-2">Income Statement</p>
          <p className="text-xs text-muted-foreground">
            For the Period Ended December 31, 2024
          </p>
        </div>

        <div className="space-y-4">
          {/* Revenue Section */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-foreground">
                Revenue from Sales
              </span>
              <span className="font-semibold text-foreground">
                Rs. {incomeStatement.revenue.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-semibold text-foreground mb-3">
              Less: Operating Expenses
            </p>
            <div className="space-y-2 ml-4">
              {Object.entries(incomeStatement.expenses).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>
                  <span className="text-foreground">
                    Rs. {value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-border">
              <span className="font-semibold text-foreground">
                Total Operating Expenses
              </span>
              <span className="font-semibold text-foreground">
                Rs. {totalExpenses.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span className="text-foreground">Gross Profit</span>
              <span className="text-green-600">
                Rs. {grossProfit.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-semibold text-foreground mb-3">
              Other Income/Expenses
            </p>
            <div className="space-y-2 ml-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other Income</span>
                <span className="text-green-600">
                  Rs. {incomeStatement.otherIncome.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Other Expenses</span>
                <span className="text-red-600">
                  Rs. {incomeStatement.otherExpenses.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-b-2 border-foreground pt-4 pb-4">
            <div className="flex justify-between font-bold text-xl">
              <span className="text-foreground">Net Income</span>
              <span className="text-blue-600">
                Rs. {netIncome.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
