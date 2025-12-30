import React, { useState } from "react";
import { useTransactions } from "../../contexts/TransactionContext";
import { downloadCSV, downloadWord } from "../../utils/downloadUtils";

export default function TransactionList() {
  const {
    transactions,
    paginatedTransactions,
    darkMode,
    startIndex,
    endIndex,
    currentPage,
    totalPages,
    setCurrentPage,
    pageSize,
    setPageSize,
    handleSort,
    confirmDelete,
    openEdit
  } = useTransactions();

  const [showModal, setShowModal] = useState(false);
  const [downloadType, setDownloadType] = useState("");

  const go = (n) => setCurrentPage(n);

  const handleDownloadClick = (type) => {
    setDownloadType(type);
    setShowModal(true);
  };

  const handleModalChoice = (all) => {
    const data = all ? transactions : paginatedTransactions;
    downloadType === "csv" ? downloadCSV(data) : downloadWord(data);
    setShowModal(false);
  };

  return (
    <section className={`card shadow mb-4 ${darkMode ? "bg-dark text-light" : ""}`}>
      <div className="card-body">

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="card-title mb-0">
            Transaction Details
            <span className="badge bg-primary ms-2">
              Page {currentPage} of {totalPages}
            </span>
          </h2>

          {/* PAGE SIZE SELECTOR with dark mode */}
          <div className="d-flex align-items-center gap-2">
            <span className={`${darkMode ? "text-light" : "text-muted"}`}>Show</span>
            <select
              className={`form-select form-select-sm w-auto ${darkMode ? "bg-secondary text-light border-dark" : ""}`}
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className={`${darkMode ? "text-light" : "text-muted"}`}>entries</span>
          </div>
        </div>

        {/* Download Buttons */}
        <div className="d-flex gap-2 mb-3">
          <button className={`btn btn-sm ${darkMode ? "btn-outline-light" : "btn-outline-success"}`} onClick={() => handleDownloadClick("csv")}>
            Download CSV
          </button>
          <button className={`btn btn-sm ${darkMode ? "btn-outline-light" : "btn-outline-primary"}`} onClick={() => handleDownloadClick("word")}>
            Download Word
          </button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="custom-modal-backdrop">
            <div className={`custom-modal ${darkMode ? "bg-dark text-light border-light" : ""}`}>
              <h5>Download Transactions</h5>
              <p>Download current page or all transactions?</p>
              <div className="d-flex justify-content-end gap-2">
                <button className={`btn btn-sm ${darkMode ? "btn-outline-light" : "btn-outline-secondary"}`} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button className={`btn btn-sm ${darkMode ? "btn-outline-light" : "btn-outline-primary"}`} onClick={() => handleModalChoice(false)}>
                  Current Page
                </button>
                <button className={`btn btn-sm ${darkMode ? "btn-outline-light" : "btn-outline-success"}`} onClick={() => handleModalChoice(true)}>
                  All Transactions
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-responsive">
          {paginatedTransactions.length === 0 ? (
            <div className="text-center py-5 text-muted">No transactions found.</div>
          ) : (
            <>
              <table className={`table table-hover ${darkMode ? "table-dark" : ""}`}>
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th onClick={() => handleSort("date")} style={{ cursor: 'pointer' }}>Date</th>
                    <th onClick={() => handleSort("title")} style={{ cursor: 'pointer' }}>Transaction</th>
                    <th onClick={() => handleSort("type")} style={{ cursor: 'pointer' }}>Type</th>
                    <th onClick={() => handleSort("category")} style={{ cursor: 'pointer' }}>Category</th>
                    <th onClick={() => handleSort("amount")} style={{ cursor: 'pointer' }}>Amount</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTransactions.map((t, i) => (
                    <tr key={t.id}>
                      <td>{startIndex + i + 1}</td>
                      <td>{new Date(t.date).toLocaleDateString()}</td>
                      <td>{t.title}</td>
                      <td>
                        <span className={`badge ${t.type === "income" ? "bg-success" : "bg-danger"}`}>
                          {t.type}
                        </span>
                      </td>
                      <td><span className="badge bg-info">{t.category}</span></td>
                      <td className={`fw-bold ${t.type === "income" ? "text-success" : "text-danger"}`}>
                        ₹{t.amount.toLocaleString()}
                      </td>
                      <td>
                        <button className={`btn btn-sm me-2 ${darkMode ? "btn-outline-light" : "btn-outline-primary"}`} onClick={() => openEdit(t)}>
                          Edit
                        </button>
                        <button className={`btn btn-sm ${darkMode ? "btn-outline-light" : "btn-outline-danger"}`} onClick={() => confirmDelete(t.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination with dark mode */}
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className={`${darkMode ? "text-light" : "text-muted"}`}>
                  Showing {startIndex + 1} to {Math.min(endIndex, transactions.length)} of {transactions.length}
                </small>

                <nav aria-label="Transaction pagination">
                  <ul className={`pagination mb-0 ${darkMode ? "pagination-dark" : ""}`}>
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button 
                        className={`page-link ${darkMode ? "bg-dark text-light border-secondary" : ""}`}
                        onClick={() => go(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Prev
                      </button>
                    </li>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <li 
                        key={i + 1} 
                        className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                      >
                        <button 
                          className={`page-link ${darkMode ? "bg-dark text-light border-secondary" : ""} ${currentPage === i + 1 ? (darkMode ? "bg-primary" : "") : ""}`}
                          onClick={() => go(i + 1)}
                        >
                          {i + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button 
                        className={`page-link ${darkMode ? "bg-dark text-light border-secondary" : ""}`}
                        onClick={() => go(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}