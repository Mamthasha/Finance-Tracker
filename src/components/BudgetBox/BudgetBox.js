import React from "react";
import { useTransactions } from "../../contexts/TransactionContext";

export default function BudgetBox() {
  const { CATEGORIES, getFilteredAndSortedTransactions, budgets, updateBudget, darkMode } = useTransactions();
  
  return (
    <section className={`card shadow mb-4 ${darkMode ? 'bg-dark text-light' : ''}`}>
      <div className="card-body">
        <h2 className="card-title mb-4">Monthly Budgets</h2>
        <div className="row g-3">
          {CATEGORIES.map(cat => {
            const spent = getFilteredAndSortedTransactions
              .filter(t => t.category === cat && t.type === "expense")
              .reduce((s, t) => s + t.amount, 0);
            const budget = budgets[cat] || 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            const isOverspent = budget > 0 && spent > budget;
            
            return (
              <div key={cat} className="col-md-4 col-lg-2">
                <div className={`card h-100 ${darkMode ? 'bg-secondary text-light' : ''}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h4 className="card-title h6 mb-0">{cat}</h4>
                      {/* Simple warning symbol without Bootstrap icon */}
                      {isOverspent && (
                        <span 
                          className="text-danger fw-bold" 
                          style={{ fontSize: '18px', cursor: 'pointer' }}
                          title="Overspent!"
                        >
                          ⚠
                        </span>
                      )}
                    </div>
                    <div className="progress mb-2" style={{ height: "8px" }}>
                      <div 
                        className={`progress-bar ${isOverspent ? "bg-danger" : "bg-success"}`} 
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <small className="text-muted">₹{spent.toLocaleString()}</small>
                      <small className="text-muted">/ ₹{budget.toLocaleString()}</small>
                    </div>
                    <input
                      type="number"
                      className={`form-control form-control-sm ${darkMode ? 'bg-dark text-light' : ''}`}
                      placeholder="Set budget"
                      value={budget || ""}
                      onChange={e => updateBudget(cat, e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}