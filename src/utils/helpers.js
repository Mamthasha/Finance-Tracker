// src/utils/helpers.js

/**
 * Format currency amount
 * @param {number} amount - The amount to format
 * @param {string} currency - Currency symbol (default: ₹)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = "₹") => {
  if (typeof amount !== "number" || isNaN(amount)) {
    return `${currency}0`;
  }
  return `${currency}${amount.toLocaleString("en-IN")}`;
};

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatType - Type of format (display, time, monthYear)
 * @returns {string} Formatted date string
 */
export const formatDate = (date, formatType = "display") => {
  if (!date) return "";
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";
  
  const formats = {
    display: {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    },
    time: {
      hour: '2-digit',
      minute: '2-digit'
    },
    monthYear: {
      month: 'short',
      year: 'numeric'
    },
    iso: "yyyy-MM-dd"
  };
  
  if (formatType === "iso") {
    return dateObj.toISOString().split('T')[0];
  }
  
  return dateObj.toLocaleDateString('en-US', formats[formatType] || formats.display);
};

/**
 * Calculate percentage
 * @param {number} part - Part value
 * @param {number} total - Total value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (part, total) => {
  if (!total || total <= 0) return 0;
  return Math.min((part / total) * 100, 100);
};

/**
 * Get month options from transactions
 * @param {Array} transactions - List of transactions
 * @returns {Array} Sorted month options
 */
export const getMonthOptions = (transactions) => {
  const monthsMap = {};
  
  transactions.forEach(transaction => {
    const monthYear = formatDate(transaction.date, "monthYear");
    monthsMap[monthYear] = true;
  });
  
  return ["All", ...Object.keys(monthsMap).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const dateA = new Date(`${monthA} 1, ${yearA}`);
    const dateB = new Date(`${monthB} 1, ${yearB}`);
    return dateA - dateB;
  })];
};

/**
 * Filter transactions by date range
 * @param {Array} transactions - Transactions to filter
 * @param {string} range - Range type (today, thisWeek, thisMonth, custom)
 * @param {Object} customDates - Custom date range {startDate, endDate}
 * @returns {Array} Filtered transactions
 */
export const filterByDateRange = (transactions, range, customDates = {}) => {
  if (range === "all") return transactions;
  
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  
  let startDate, endDate;
  
  switch (range) {
    case "today":
      startDate = new Date(now);
      endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1);
      break;
      
    case "thisWeek":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - startDate.getDay());
      endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7);
      break;
      
    case "thisMonth":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      break;
      
    case "custom":
      if (customDates.startDate) {
        startDate = new Date(customDates.startDate);
      }
      if (customDates.endDate) {
        endDate = new Date(customDates.endDate);
        endDate.setHours(23, 59, 59, 999);
      }
      break;
      
    default:
      return transactions;
  }
  
  return transactions.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    
    if (startDate && transactionDate < startDate) return false;
    if (endDate && transactionDate > endDate) return false;
    
    return true;
  });
};

/**
 * Sort transactions by field
 * @param {Array} transactions - Transactions to sort
 * @param {string} field - Field to sort by
 * @param {string} direction - Sort direction (asc/desc)
 * @returns {Array} Sorted transactions
 */
export const sortTransactions = (transactions, field, direction = "asc") => {
  return [...transactions].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];
    
    // Handle date sorting
    if (field === "date") {
      valueA = new Date(a.date);
      valueB = new Date(b.date);
      return direction === "asc" ? valueA - valueB : valueB - valueA;
    }
    
    // Handle string sorting
    if (typeof valueA === "string") {
      return direction === "asc" 
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    // Handle number sorting
    return direction === "asc" ? valueA - valueB : valueB - valueA;
  });
};

/**
 * Calculate totals from transactions
 * @param {Array} transactions - Transactions to calculate
 * @returns {Object} Totals object {incomeTotal, expenseTotal, balance}
 */
export const calculateTotals = (transactions) => {
  return transactions.reduce((totals, transaction) => {
    if (transaction.type === "income") {
      totals.incomeTotal += transaction.amount;
    } else {
      totals.expenseTotal += transaction.amount;
    }
    totals.balance = totals.incomeTotal - totals.expenseTotal;
    return totals;
  }, { incomeTotal: 0, expenseTotal: 0, balance: 0 });
};

/**
 * Calculate category spending
 * @param {Array} transactions - Transactions to analyze
 * @param {Array} categories - List of categories
 * @returns {Array} Category data for charts
 */
export const getCategoryData = (transactions, categories) => {
  return categories.map(category => {
    const spent = transactions
      .filter(t => t.category === category && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: category,
      value: spent,
      spent
    };
  }).filter(item => item.value > 0);
};

/**
 * Get unique values from array
 * @param {Array} array - Array to get unique values from
 * @param {string} property - Property to extract (optional)
 * @returns {Array} Unique values
 */
export const getUniqueValues = (array, property = null) => {
  if (property) {
    return [...new Set(array.map(item => item[property]))].sort();
  }
  return [...new Set(array)].sort();
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password
 * @param {string} password - Password to validate
 * @param {number} minLength - Minimum length required
 * @returns {Object} Validation result {isValid, message}
 */
export const validatePassword = (password, minLength = 6) => {
  if (!password || password.trim() === "") {
    return { isValid: false, message: "Password is required" };
  }
  if (password.length < minLength) {
    return { isValid: false, message: `Password must be at least ${minLength} characters` };
  }
  return { isValid: true, message: "" };
};

/**
 * Get Firebase error message
 * @param {string} errorCode - Firebase error code
 * @returns {string} User-friendly error message
 */
export const getFirebaseErrorMessage = (errorCode) => {
  const errorMessages = {
    "auth/invalid-email": "Invalid email address format.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/too-many-requests": "Too many failed attempts. Account temporarily disabled. Try again later or reset your password.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
    "auth/email-already-in-use": "Email address is already in use.",
    "auth/weak-password": "Password should be at least 6 characters."
  };
  
  return errorMessages[errorCode] || "An error occurred. Please try again.";
};

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
export const generateId = () => {
  return `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if user is on mobile device
 * @returns {boolean} True if mobile
 */
export const isMobile = () => {
  return window.innerWidth <= 768;
};

/**
 * Get current month and year
 * @returns {string} Current month and year (e.g., "Jan 2024")
 */
export const getCurrentMonthYear = () => {
  return new Date().toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });
};