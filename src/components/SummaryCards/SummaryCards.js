import React from "react";
import { useTransactions } from "../../contexts/TransactionContext";

export default function SummaryCards() {
  const { totals } = useTransactions();

  // Safe default in case totals is undefined
  const income = totals?.income ?? 0;
  const expense = totals?.expense ?? 0;
  const balance = income - expense;

  return (
    <section className="mb-4">
      <div className="row g-3">

        {/* Total Income */}
        <div className="col-md-4">
          <div className="card text-white bg-success h-100 shadow">
            <div className="card-body text-center">
              <h3 className="card-title h5">Total Income</h3>
              <p className="card-text display-6">₹{income.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="col-md-4">
          <div className="card text-white bg-danger h-100 shadow">
            <div className="card-body text-center">
              <h3 className="card-title h5">Total Expenses</h3>
              <p className="card-text display-6">₹{expense.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Current Balance */}
        <div className="col-md-4">
          <div
            className={`card h-100 shadow ${
              balance >= 0 ? "bg-info text-white" : "bg-warning text-dark"
            }`}
          >
            <div className="card-body text-center">
              <h3 className="card-title h5">Current Balance</h3>
              <p className="card-text display-6">₹{balance.toLocaleString()}</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
