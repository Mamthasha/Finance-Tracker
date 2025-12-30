import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useTransactions } from "../../contexts/TransactionContext";

const pieColors = ["#2e7d32", "#c62828", "#ff9800", "#2196f3", "#9c27b0", "#99580dff", "#ec720dff"];

export default function SummaryCharts() {
  const { totals, barChartData = [], categoryData = [], darkMode } = useTransactions();
  
  // Safely extract totals with defaults
  const income = totals?.income || 0;
  const expense = totals?.expense || 0;
  
  return (
    <section className="row g-3 mb-4">
      {/* Income vs Expense Pie Chart */}
      <div className="col-lg-4">
        <div className={`card shadow h-100 ${darkMode ? 'bg-dark text-light' : ''}`}>
          <div className="card-body">
            <h3 className="card-title h5">Income vs Expense</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                {(income + expense) > 0 ? (
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Income", value: income },
                        { name: "Expense", value: expense }
                      ]}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value, percent }) => `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
                    >
                      <Cell fill="#4CAF50" />
                      <Cell fill="#F44336" />
                    </Pie>
                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                ) : (
                  <div className="text-center text-muted py-5">
                    <p>No transaction data</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Overview Bar Chart */}
      <div className="col-lg-4">
        <div className={`card shadow h-100 ${darkMode ? 'bg-dark text-light' : ''}`}>
          <div className="card-body">
            <h3 className="card-title h5">Monthly Overview</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                {barChartData.length > 0 ? (
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
                    <XAxis dataKey="month" stroke={darkMode ? "#e0e0e0" : "#333"} />
                    <YAxis stroke={darkMode ? "#e0e0e0" : "#333"} />
                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Amount']} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#4CAF50" />
                    <Bar dataKey="expenses" name="Expenses" fill="#F44336" />
                  </BarChart>
                ) : (
                  <div className="text-center text-muted py-5">
                    <p>No monthly data</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Spending by Category Pie Chart */}
      <div className="col-lg-4">
        <div className={`card shadow h-100 ${darkMode ? 'bg-dark text-light' : ''}`}>
          <div className="card-body">
            <h3 className="card-title h5">Spending by Category</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                {categoryData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, value, percent }) => `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={pieColors[i % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                ) : (
                  <div className="text-center text-muted py-5">
                    <p>No category data</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}