import React from "react";
import { useTransactions } from "../../contexts/TransactionContext";

export default function DeleteModal() {
  const {
    transactionToDelete,
    deleteTransaction,
    confirmDelete,
    darkMode
  } = useTransactions();

  if (!transactionToDelete) return null;

  const handleDelete = async () => {
    await deleteTransaction(transactionToDelete);
  };

  const handleCancel = () => {
    confirmDelete(null);
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
            <h5 className="modal-title text-danger">Confirm Delete</h5>
            <button
              className={`btn-close ${darkMode ? "btn-close-white" : ""}`}
              onClick={handleCancel}
            />
          </div>

          <div className="modal-body">
            <p>Are you sure you want to delete this transaction?</p>
            <p className="text-muted small">This action cannot be undone.</p>
          </div>

          <div className={`modal-footer ${darkMode ? "border-secondary" : ""}`}>
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
