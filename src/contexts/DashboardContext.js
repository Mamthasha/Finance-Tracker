// src/contexts/DashboardContext.js
import React, { createContext, useContext, useState, useMemo } from "react";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState({});

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("Salary");

  const [filterMonth, setFilterMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved !== null) return saved === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const [currentPage, setCurrentPage] = useState(1);

  // Filtered + Sorted Transactions
  const getFilteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];
    return filtered;
  }, [transactions]);

  // Income, Expense, Balance
  const { incomeTotal, expenseTotal } = useMemo(() => {
    return getFilteredAndSortedTransactions.reduce(
      (totals, t) => {
        if (t.type === "income") totals.incomeTotal += t.amount;
        else totals.expenseTotal += t.amount;
        return totals;
      },
      { incomeTotal: 0, expenseTotal: 0 }
    );
  }, [getFilteredAndSortedTransactions]);

  const balance = incomeTotal - expenseTotal;

  // Pagination
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(
    getFilteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedTransactions = getFilteredAndSortedTransactions.slice(
    startIndex,
    endIndex
  );

  // No-warning helper functions
  const handleSubmit = () => {};
  const handleSort = () => {};
  const clearAllFilters = () => {};

  const goToPage = (page) => setCurrentPage(page);
  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage((p) => p + 1);
  const goToPrevPage = () =>
    currentPage > 1 && setCurrentPage((p) => p - 1);

  return (
    <DashboardContext.Provider
      value={{
        user,
        setUser,
        loading,
        setLoading,

        transactions,
        setTransactions,
        budgets,
        setBudgets,

        title,
        setTitle,
        amount,
        setAmount,
        type,
        setType,
        category,
        setCategory,

        filterMonth,
        setFilterMonth,
        searchTerm,
        setSearchTerm,

        darkMode,
        setDarkMode,

        currentPage,
        setCurrentPage,

        handleSubmit,
        handleSort,
        clearAllFilters,

        goToPage,
        goToNextPage,
        goToPrevPage,

        ITEMS_PER_PAGE,
        incomeTotal,
        expenseTotal,
        balance,
        paginatedTransactions,
        totalPages,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => useContext(DashboardContext);
