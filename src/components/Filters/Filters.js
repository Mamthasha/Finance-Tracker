import React from "react";
import { useTransactions } from "../../contexts/TransactionContext";

export default function Filters() {
  const {
    darkMode,
    searchTerm,
    setSearchTerm,
    filterMonth,
    setFilterMonth,
    monthOptions = []
  } = useTransactions();

  return (
    <section className={`card shadow mb-4 ${darkMode ? "bg-dark text-light" : ""}`}>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-8">
            <input
              type="text"
              className={`form-control ${darkMode ? "bg-secondary text-light" : ""}`}
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <select
              className={`form-select ${darkMode ? "bg-secondary text-light" : ""}`}
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            >
              {monthOptions.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}
