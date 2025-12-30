import React, { useState, useEffect } from "react";
import { useTransactions } from "../../contexts/TransactionContext";

export default function EditModal() {
  const {
    editingTransaction,
    editTransaction,
    openEdit,
    darkMode
  } = useTransactions();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    if (editingTransaction) {
      setTitle(editingTransaction.title || "");
      setAmount(editingTransaction.amount?.toString() || "");
      setType(editingTransaction.type || "");
      setCategory(editingTransaction.category || "");
      setDate(
        editingTransaction.date
          ? new Date(editingTransaction.date).toISOString().split("T")[0]
          : ""
      );
    }
  }, [editingTransaction]);

  if (!editingTransaction) return null;

  const submit = (e) => {
    e.preventDefault();
    editTransaction(editingTransaction.id, {
      title,
      amount,
      type,
      category,
      date
    });
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className={`modal-dialog modal-dialog-centered`}>
        <div className={`modal-content ${darkMode ? "bg-dark text-light" : ""}`}>
          <div className={`modal-header ${darkMode ? "border-secondary" : ""}`}>
            <h5 className="modal-title">Edit Transaction</h5>
            <button
              className={`btn-close ${darkMode ? "btn-close-white" : ""}`}
              onClick={() => openEdit(null)}
            />
          </div>

          <div className="modal-body">
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label">Title</label>
                <input
                  className={`form-control ${darkMode ? "bg-secondary text-light" : ""}`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className={`form-control ${darkMode ? "bg-secondary text-light" : ""}`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Category</label>
                <input
                  className={`form-control ${darkMode ? "bg-secondary text-light" : ""}`}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Type</label>
                <div className="btn-group w-100">
                  <input
                    type="radio"
                    className="btn-check"
                    name="editType"
                    id="editIncome"
                    value="income"
                    checked={type === "income"}
                    onChange={(e) => setType(e.target.value)}
                  />
                  <label
                    className={`btn ${
                      type === "income" ? "btn-success" : "btn-outline-success"
                    }`}
                    htmlFor="editIncome"
                  >
                    Income
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="editType"
                    id="editExpense"
                    value="expense"
                    checked={type === "expense"}
                    onChange={(e) => setType(e.target.value)}
                  />
                  <label
                    className={`btn ${
                      type === "expense" ? "btn-danger" : "btn-outline-danger"
                    }`}
                    htmlFor="editExpense"
                  >
                    Expense
                  </label>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className={`form-control ${darkMode ? "bg-secondary text-light" : ""}`}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
              </div>

              <div className={`modal-footer ${darkMode ? "border-secondary" : ""}`}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => openEdit(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
