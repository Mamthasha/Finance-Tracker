import React, { useState } from "react";
import { useTransactions } from "../contexts/TransactionContext";

export default function DateFilter() {
  const { dateRange, setDateFilter, clearDateFilter, darkMode } = useTransactions();
  const [filterType, setFilterType] = useState("none");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleApplyFilter = () => {
    if (filterType === "none") {
      clearDateFilter();
      return;
    }

    if (filterType === "range" && (!startDate || !endDate)) {
      alert("Please select both start and end dates for date range");
      return;
    }

    if ((filterType === "before" || filterType === "after" || filterType === "on") && !startDate) {
      alert("Please select a date");
      return;
    }

    if (filterType === "range" && new Date(startDate) > new Date(endDate)) {
      alert("Start date cannot be after end date");
      return;
    }

    setDateFilter(filterType, startDate, endDate);
  };

  const handleClearFilter = () => {
    setFilterType("none");
    setStartDate("");
    setEndDate("");
    clearDateFilter();
  };

  const isFilterActive = dateRange.filterType !== "none";

  return (
    <div className={`card mb-3 ${darkMode ? "bg-dark text-light" : ""}`}>
      <div className="card-body">
        <h5 className="card-title mb-3">
          <i className="bi bi-calendar-range me-2"></i>
          Filter by Date
        </h5>
        
        <div className="row g-3">
          {/* Filter Type Selection */}
          <div className="col-md-3">
            <label className="form-label">Filter Type</label>
            <select
              className={`form-select ${darkMode ? "bg-secondary text-light border-secondary" : ""}`}
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="none">No Date Filter</option>
              <option value="range">Date Range</option>
              <option value="before">Before Date</option>
              <option value="after">After Date</option>
              <option value="on">On Specific Date</option>
            </select>
          </div>

          {/* Start Date Input */}
          {(filterType === "range" || filterType === "before" || filterType === "after" || filterType === "on") && (
            <div className="col-md-3">
              <label className="form-label">
                {filterType === "range" ? "Start Date" : 
                 filterType === "before" ? "Before Date" :
                 filterType === "after" ? "After Date" : "Date"}
              </label>
              <input
                type="date"
                className={`form-control ${darkMode ? "bg-secondary text-light border-secondary" : ""}`}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

          {/* End Date Input (only for range) */}
          {filterType === "range" && (
            <div className="col-md-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className={`form-control ${darkMode ? "bg-secondary text-light border-secondary" : ""}`}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="col-md-3 d-flex align-items-end">
            <div className="btn-group w-100">
              <button
                className="btn btn-primary"
                onClick={handleApplyFilter}
                disabled={filterType === "range" && (!startDate || !endDate)}
              >
                <i className="bi bi-funnel me-1"></i>
                Apply Filter
              </button>
              
              {isFilterActive && (
                <button
                  className="btn btn-outline-danger"
                  onClick={handleClearFilter}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Current Filter Status */}
        {isFilterActive && (
          <div className="mt-3 p-2 bg-info bg-opacity-10 rounded">
            <small>
              <i className="bi bi-info-circle me-1"></i>
              <strong>Active Filter:</strong>{" "}
              {dateRange.filterType === "range" && (
                <span>
                  Showing transactions from <strong>{dateRange.startDate}</strong> to <strong>{dateRange.endDate}</strong>
                </span>
              )}
              {dateRange.filterType === "before" && (
                <span>
                  Showing transactions before <strong>{dateRange.startDate}</strong>
                </span>
              )}
              {dateRange.filterType === "after" && (
                <span>
                  Showing transactions after <strong>{dateRange.startDate}</strong>
                </span>
              )}
              {dateRange.filterType === "on" && (
                <span>
                  Showing transactions on <strong>{dateRange.startDate}</strong>
                </span>
              )}
            </small>
          </div>
        )}
      </div>
    </div>
  );
}