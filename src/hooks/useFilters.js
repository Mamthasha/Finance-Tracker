// src/hooks/useFilters.js
import { useState, useMemo, useCallback } from "react";
import { 
  filterByDateRange, 
  sortTransactions, 
  getMonthOptions,
  getUniqueValues 
} from "../utils/helpers";

export default function useFilters(transactions = [], categories = []) {
  // Basic filters
  const [filterMonth, setFilterMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Advanced filters
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
    range: "all"
  });
  
  const [titleFilter, setTitleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [amountFilter, setAmountFilter] = useState({
    min: "",
    max: "",
    operator: "all"
  });
  
  // Sorting
  const [sortConfig, setSortConfig] = useState({
    column: null,
    direction: "asc"
  });

  // Get month options
  const monthOptions = useMemo(() => {
    return getMonthOptions(transactions);
  }, [transactions]);

  // Get unique categories from transactions
  const getUniqueCategories = useMemo(() => {
    return getUniqueValues(transactions, "category");
  }, [transactions]);

  // Sorting handler
  const handleSort = useCallback((column) => {
    setSortConfig(prev => ({
      column,
      direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc"
    }));
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setDateFilter({
      startDate: "",
      endDate: "",
      range: "all"
    });
    setTitleFilter("");
    setTypeFilter("all");
    setCategoryFilter("all");
    setAmountFilter({
      min: "",
      max: "",
      operator: "all"
    });
    setSortConfig({ column: null, direction: "asc" });
    setFilterMonth("All");
    setSearchTerm("");
  }, []);

  // Main filtering and sorting function
  const getFilteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Apply month filter
    if (filterMonth !== "All") {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const monthYear = transactionDate.toLocaleDateString('en-US', {
          month: 'short',
          year: 'numeric'
        });
        return monthYear === filterMonth;
      });
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(transaction => 
        transaction.title.toLowerCase().includes(term) ||
        transaction.category.toLowerCase().includes(term) ||
        transaction.type.toLowerCase().includes(term)
      );
    }
    
    // Apply date range filter
    if (dateFilter.range !== "all") {
      filtered = filterByDateRange(filtered, dateFilter.range, {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate
      });
    }
    
    // Apply title filter
    if (titleFilter.trim()) {
      const term = titleFilter.toLowerCase().trim();
      filtered = filtered.filter(transaction => 
        transaction.title.toLowerCase().includes(term)
      );
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.type === typeFilter);
    }
    
    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.category === categoryFilter);
    }
    
    // Apply amount filter
    if (amountFilter.operator !== "all") {
      const min = parseFloat(amountFilter.min) || 0;
      const max = parseFloat(amountFilter.max) || Infinity;
      
      switch (amountFilter.operator) {
        case "greater":
          filtered = filtered.filter(transaction => transaction.amount >= min);
          break;
          
        case "less":
          filtered = filtered.filter(transaction => transaction.amount <= max);
          break;
          
        case "between":
          filtered = filtered.filter(transaction => 
            transaction.amount >= min && transaction.amount <= max
          );
          break;
      }
    }
    
    // Apply sorting
    if (sortConfig.column) {
      filtered = sortTransactions(filtered, sortConfig.column, sortConfig.direction);
    }
    
    return filtered;
  }, [
    transactions, 
    filterMonth, 
    searchTerm, 
    dateFilter, 
    titleFilter, 
    typeFilter, 
    categoryFilter, 
    amountFilter, 
    sortConfig
  ]);

  // Calculate pagination info
  const getPaginationInfo = useCallback((itemsPerPage = 10, currentPage = 1) => {
    const totalItems = getFilteredAndSortedTransactions.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = getFilteredAndSortedTransactions.slice(startIndex, endIndex);
    
    return {
      totalItems,
      totalPages,
      startIndex,
      endIndex,
      paginatedItems,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [getFilteredAndSortedTransactions]);

  // Get active filters count
  const getActiveFiltersCount = useMemo(() => {
    let count = 0;
    
    if (filterMonth !== "All") count++;
    if (searchTerm.trim()) count++;
    if (dateFilter.range !== "all") count++;
    if (titleFilter.trim()) count++;
    if (typeFilter !== "all") count++;
    if (categoryFilter !== "all") count++;
    if (amountFilter.operator !== "all") count++;
    if (sortConfig.column) count++;
    
    return count;
  }, [
    filterMonth, 
    searchTerm, 
    dateFilter, 
    titleFilter, 
    typeFilter, 
    categoryFilter, 
    amountFilter, 
    sortConfig
  ]);

  // Get filter summary
  const getFilterSummary = useMemo(() => {
    const summary = [];
    
    if (filterMonth !== "All") {
      summary.push(`Month: ${filterMonth}`);
    }
    
    if (dateFilter.range !== "all") {
      summary.push(`Date Range: ${dateFilter.range === "custom" ? "Custom" : dateFilter.range}`);
    }
    
    if (typeFilter !== "all") {
      summary.push(`Type: ${typeFilter === "income" ? "Income" : "Expense"}`);
    }
    
    if (categoryFilter !== "all") {
      summary.push(`Category: ${categoryFilter}`);
    }
    
    if (amountFilter.operator !== "all") {
      let amountText = `Amount: ${amountFilter.operator}`;
      if (amountFilter.min) amountText += ` ≥ ${amountFilter.min}`;
      if (amountFilter.max) amountText += ` ≤ ${amountFilter.max}`;
      summary.push(amountText);
    }
    
    if (sortConfig.column) {
      summary.push(`Sorted by: ${sortConfig.column} (${sortConfig.direction})`);
    }
    
    return summary;
  }, [
    filterMonth, 
    dateFilter, 
    typeFilter, 
    categoryFilter, 
    amountFilter, 
    sortConfig
  ]);

  return {
    // State
    filterMonth,
    setFilterMonth,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    titleFilter,
    setTitleFilter,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    amountFilter,
    setAmountFilter,
    sortConfig,
    setSortConfig,
    
    // Data
    monthOptions,
    getUniqueCategories,
    getFilteredAndSortedTransactions,
    
    // Functions
    handleSort,
    clearAllFilters,
    getPaginationInfo,
    
    // Info
    getActiveFiltersCount,
    getFilterSummary,
    
    // Computed
    hasActiveFilters: getActiveFiltersCount > 0
  };
}