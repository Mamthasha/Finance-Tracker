// src/utils/constants.js

// Transaction Categories
export const categories = [
  "Salary",
  "Food",
  "Rent",
  "Entertainment", 
  "Transportation",
  "Other"
];

// Chart Colors
export const pieColors = [
  "#2e7d32", // Green
  "#c62828", // Red
  "#ff9800", // Orange
  "#2196f3", // Blue
  "#9c27b0", // Purple
  "#795548"  // Brown
];

// App Constants
export const ITEMS_PER_PAGE = 10;
export const DEFAULT_BUDGET = 0;
export const CURRENCY = "₹";

// Transaction Types
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense"
};

// Date Format Options
export const DATE_FORMATS = {
  DISPLAY: {
    weekday: 'short',
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  },
  TIME: {
    hour: '2-digit',
    minute: '2-digit'
  },
  MONTH_YEAR: {
    month: 'short',
    year: 'numeric'
  }
};

// Filter Ranges
export const FILTER_RANGES = {
  ALL: "all",
  TODAY: "today",
  THIS_WEEK: "thisWeek",
  THIS_MONTH: "thisMonth",
  CUSTOM: "custom"
};

// Sort Directions
export const SORT_DIRECTIONS = {
  ASC: "asc",
  DESC: "desc"
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TRANSACTIONS: "transactions",
  BUDGETS: "budgets",
  DARK_MODE: "darkMode"
};

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: "This field is required",
  INVALID_EMAIL: "Please enter a valid email address",
  PASSWORD_MIN_LENGTH: "Password must be at least 6 characters",
  INVALID_AMOUNT: "Please enter a valid amount",
  AMOUNT_POSITIVE: "Amount must be greater than 0"
};

// Firebase Error Messages
export const FIREBASE_ERRORS = {
  "auth/invalid-email": "Invalid email address format.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password. Please try again.",
  "auth/too-many-requests": "Too many failed attempts. Account temporarily disabled. Try again later or reset your password.",
  "auth/network-request-failed": "Network error. Please check your internet connection.",
  "auth/email-already-in-use": "Email address is already in use.",
  "auth/weak-password": "Password should be at least 6 characters."
};