import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef
} from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  writeBatch,
  updateDoc
} from "firebase/firestore";

const TransactionContext = createContext();
export const useTransactions = () => useContext(TransactionContext);

const CATEGORIES = ["Salary", "Food", "Rent", "Entertainment", "Transportation", "Other"];
const MONTHS = [
  "All", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DEFAULT_PAGE_SIZE = 10;

export function TransactionProvider({ children }) {
  const navigate = useNavigate();

  /* ================= AUTH ================= */
  const [user, setUser] = useState({
    uid: "guest",
    displayName: "Guest",
    email: null,
    isGuest: true
  });
  const [loading, setLoading] = useState(true);

  /* ================= DATA ================= */
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState(
    CATEGORIES.reduce((o, c) => ({ ...o, [c]: 0 }), {})
  );
  const [budgetDocId, setBudgetDocId] = useState(null);

  /* ================= UI ================= */
  const [darkMode, setDarkMode] = useState(() => {
    const s = localStorage.getItem("darkMode");
    return s !== null ? s === "true" : false;
  });

  /* ================= FILTERS ================= */
  const [filterMonth, setFilterMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ column: null, direction: "asc" });

  // Date range filters
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
    filterType: "none" // "none", "range", "before", "after", "on"
  });

  /* ================= PAGINATION ================= */
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  /* ================= MODALS ================= */
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  /* ================= REFS FOR DOUBLING FIX ================= */
  const authUnsubscribeRef = useRef(null);
  const initialLoadRef = useRef(false);
  const mergeAttemptedRef = useRef(new Set());

  /* ================= LOAD GUEST DATA ================= */
  const loadGuestData = useCallback(() => {
    const guestTransactions = JSON.parse(localStorage.getItem("guestTransactions") || "[]");
    const guestBudgets = JSON.parse(localStorage.getItem("guestBudgets") || "{}");
    
    setTransactions(guestTransactions);
    setBudgets(guestBudgets);
  }, []);

  /* ================= LOAD USER DATA ================= */
  const loadUserData = useCallback(async (uid) => {
    try {
      const tq = query(collection(db, "transactions"), where("uid", "==", uid));
      const tsnap = await getDocs(tq);
      const loadedTransactions = tsnap.docs
        .map(d => ({ 
          id: d.id, 
          ...d.data(),
          date: d.data().date || new Date().toISOString()
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setTransactions(loadedTransactions);

      const bq = query(collection(db, "budgets"), where("uid", "==", uid));
      const bsnap = await getDocs(bq);
      if (!bsnap.empty) {
        const bdoc = bsnap.docs[0];
        setBudgetDocId(bdoc.id);
        setBudgets(bdoc.data().values || {});
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  }, []);

  /* ================= MERGE GUEST DATA ================= */
  const mergeGuestData = useCallback(async (uid) => {
    if (mergeAttemptedRef.current.has(uid)) {
      return;
    }
    
    mergeAttemptedRef.current.add(uid);

    const guestTransactions = JSON.parse(localStorage.getItem("guestTransactions") || "[]");
    const guestBudgets = JSON.parse(localStorage.getItem("guestBudgets") || "{}");

    if (guestTransactions.length === 0) {
      return;
    }

    try {
      const existingQuery = query(collection(db, "transactions"), where("uid", "==", uid));
      const existingSnap = await getDocs(existingQuery);
      
      const createTxSignature = (tx) => {
        const date = tx.date ? new Date(tx.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        const amount = parseFloat(tx.amount).toFixed(2);
        return `${tx.title.toLowerCase().trim()}_${amount}_${tx.type}_${tx.category}_${date}`;
      };
      
      const existingSignatures = new Set(
        existingSnap.docs.map(d => createTxSignature(d.data()))
      );
      
      const batch = writeBatch(db);
      const newTransactions = [];
      
      guestTransactions.forEach(({ id, ...tx }) => {
        const txSignature = createTxSignature(tx);
        if (!existingSignatures.has(txSignature)) {
          const docRef = doc(collection(db, "transactions"));
          const newTx = { 
            ...tx, 
            uid,
            date: tx.date || new Date().toISOString()
          };
          batch.set(docRef, newTx);
          newTransactions.push({ id: docRef.id, ...newTx });
        }
      });
      
      if (Object.keys(guestBudgets).length > 0) {
        const budgetQuery = query(collection(db, "budgets"), where("uid", "==", uid));
        const budgetSnap = await getDocs(budgetQuery);
        
        if (budgetSnap.empty) {
          const budgetRef = doc(collection(db, "budgets"));
          batch.set(budgetRef, { uid, values: guestBudgets });
        } else {
          const existingBudget = budgetSnap.docs[0];
          const existingValues = existingBudget.data().values || {};
          const mergedBudgets = { ...existingValues, ...guestBudgets };
          const budgetRef = doc(db, "budgets", existingBudget.id);
          batch.update(budgetRef, { values: mergedBudgets });
        }
      }
      
      if (newTransactions.length > 0 || Object.keys(guestBudgets).length > 0) {
        await batch.commit();
        localStorage.removeItem("guestTransactions");
        localStorage.removeItem("guestBudgets");
        await loadUserData(uid);
      }
    } catch (error) {
      console.error("Error merging guest data:", error);
      mergeAttemptedRef.current.delete(uid);
    }
  }, [loadUserData]);

  /* ================= AUTH LISTENER ================= */
  useEffect(() => {
    if (authUnsubscribeRef.current) {
      authUnsubscribeRef.current();
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (initialLoadRef.current && !firebaseUser) {
        return;
      }
      
      setLoading(true);
      
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || "User",
          email: firebaseUser.email,
          isGuest: false
        });
        
        await mergeGuestData(firebaseUser.uid);
        await loadUserData(firebaseUser.uid);
        
        initialLoadRef.current = true;
      } else {
        setUser({
          uid: "guest",
          displayName: "Guest",
          email: null,
          isGuest: true
        });
        
        mergeAttemptedRef.current.clear();
        loadGuestData();
        initialLoadRef.current = true;
      }
      
      setLoading(false);
    });

    authUnsubscribeRef.current = unsubscribe;

    return () => {
      if (authUnsubscribeRef.current) {
        authUnsubscribeRef.current();
        authUnsubscribeRef.current = null;
      }
    };
  }, [loadGuestData, loadUserData, mergeGuestData]);

  /* ================= DARK MODE ================= */
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  /* ================= CRUD OPERATIONS ================= */
  const addTransaction = useCallback(async ({ title, amount, type, category, description = "" }) => {
    const newTx = {
      title: title.trim(),
      amount: +parseFloat(amount).toFixed(2),
      type,
      category,
      description: description.trim(),
      date: new Date().toISOString(),
      uid: user.uid
    };

    if (user.isGuest) {
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const guestTx = { 
        id: guestId, 
        ...newTx
      };
      
      setTransactions(prev => [guestTx, ...prev]);
      
      const guestTransactions = JSON.parse(
        localStorage.getItem("guestTransactions") || "[]"
      );
      guestTransactions.unshift(guestTx);
      localStorage.setItem("guestTransactions", JSON.stringify(guestTransactions));
    } else {
      try {
        const docRef = await addDoc(collection(db, "transactions"), newTx);
        const firebaseTx = { 
          id: docRef.id, 
          ...newTx
        };
        setTransactions(prev => [firebaseTx, ...prev]);
      } catch (error) {
        console.error("Error adding transaction:", error);
      }
    }
    
    setCurrentPage(1);
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    console.log("Attempting to delete transaction:", id);
    
    if (!user.isGuest && !id.startsWith("guest_")) {
      try {
        await deleteDoc(doc(db, "transactions", id));
        console.log("Deleted from Firebase");
      } catch (error) {
        console.error("Error deleting from Firebase:", error);
        return;
      }
    } else if (user.isGuest && id.startsWith("guest_")) {
      const guestTransactions = JSON.parse(
        localStorage.getItem("guestTransactions") || "[]"
      );
      const updated = guestTransactions.filter(t => t.id !== id);
      localStorage.setItem("guestTransactions", JSON.stringify(updated));
      console.log("Deleted from localStorage");
    } else {
      console.warn("Invalid transaction ID for deletion:", id);
      return;
    }
    
    setTransactions(prev => prev.filter(t => t.id !== id));
    setTransactionToDelete(null);
  }, [user]);

  const editTransaction = useCallback(async (id, updatedData) => {
    console.log("Editing transaction:", id, updatedData);
    
    const updatedTx = {
      ...updatedData,
      amount: +parseFloat(updatedData.amount).toFixed(2),
      date: new Date(updatedData.date).toISOString(),
      uid: user.uid
    };

    if (!user.isGuest && !id.startsWith("guest_")) {
      try {
        await updateDoc(doc(db, "transactions", id), updatedTx);
        console.log("Updated in Firebase");
      } catch (error) {
        console.error("Error updating in Firebase:", error);
        return;
      }
    } else if (user.isGuest && id.startsWith("guest_")) {
      const guestTransactions = JSON.parse(
        localStorage.getItem("guestTransactions") || "[]"
      );
      const updated = guestTransactions.map(t => 
        t.id === id ? { ...t, ...updatedTx } : t
      );
      localStorage.setItem("guestTransactions", JSON.stringify(updated));
      console.log("Updated in localStorage");
    } else {
      console.warn("Invalid transaction ID for edit:", id);
      return;
    }
    
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updatedTx } : t)
    );
    setEditingTransaction(null);
  }, [user]);

  /* ================= BUDGET FUNCTIONS ================= */
  const updateBudget = useCallback(async (category, amount) => {
    const amountValue = parseFloat(amount) || 0;
    const updatedBudgets = { ...budgets, [category]: amountValue };
    
    setBudgets(updatedBudgets);
    
    if (user.isGuest) {
      localStorage.setItem("guestBudgets", JSON.stringify(updatedBudgets));
    } else {
      try {
        if (budgetDocId) {
          await updateDoc(doc(db, "budgets", budgetDocId), { values: updatedBudgets });
        } else {
          const docRef = await addDoc(collection(db, "budgets"), {
            uid: user.uid,
            values: updatedBudgets
          });
          setBudgetDocId(docRef.id);
        }
      } catch (error) {
        console.error("Error updating budget:", error);
      }
    }
  }, [budgets, user, budgetDocId]);

  /* ================= TRANSACTION DETAILS HELPER ================= */
  const getTransactionById = useCallback((id) => {
    return transactions.find(t => t.id === id);
  }, [transactions]);

  /* ================= DATE FILTER HELPERS ================= */
  const applyDateFilter = useCallback((transaction) => {
    if (dateRange.filterType === "none") return true;
    
    try {
      const transDate = new Date(transaction.date);
      transDate.setHours(0, 0, 0, 0);
      
      if (dateRange.filterType === "on" && dateRange.startDate) {
        const targetDate = new Date(dateRange.startDate);
        targetDate.setHours(0, 0, 0, 0);
        return transDate.getTime() === targetDate.getTime();
      }
      
      if (dateRange.filterType === "before" && dateRange.startDate) {
        const beforeDate = new Date(dateRange.startDate);
        beforeDate.setHours(0, 0, 0, 0);
        return transDate.getTime() < beforeDate.getTime();
      }
      
      if (dateRange.filterType === "after" && dateRange.startDate) {
        const afterDate = new Date(dateRange.startDate);
        afterDate.setHours(0, 0, 0, 0);
        return transDate.getTime() > afterDate.getTime();
      }
      
      if (dateRange.filterType === "range" && dateRange.startDate && dateRange.endDate) {
        const start = new Date(dateRange.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRange.endDate);
        end.setHours(23, 59, 59, 999);
        return transDate >= start && transDate <= end;
      }
      
      return true;
    } catch (error) {
      console.warn("Error applying date filter:", error);
      return true;
    }
  }, [dateRange]);

  /* ================= FILTER + SORT ================= */
  const getFilteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    filtered = filtered.filter(applyDateFilter);
    
    if (searchTerm) {
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (typeFilter !== "all") {
      filtered = filtered.filter(t => t.type === typeFilter);
    }
    
    if (categoryFilter !== "all") {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }
    
    if (filterMonth !== "All") {
      const monthIndex = MONTHS.findIndex(m => m === filterMonth) - 1;
      if (monthIndex >= 0) {
        filtered = filtered.filter(t => {
          try {
            return new Date(t.date).getMonth() === monthIndex;
          } catch {
            return false;
          }
        });
      }
    }
    
    if (sortConfig.column) {
      filtered.sort((a, b) => {
        const dir = sortConfig.direction === "asc" ? 1 : -1;
        if (sortConfig.column === "amount") return dir * (a.amount - b.amount);
        if (sortConfig.column === "date") return dir * (new Date(a.date) - new Date(b.date));
        return dir * String(a[sortConfig.column] || "").localeCompare(
          String(b[sortConfig.column] || "")
        );
      });
    }
    
    return filtered;
  }, [transactions, searchTerm, typeFilter, categoryFilter, filterMonth, sortConfig, applyDateFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(1, Math.ceil(getFilteredAndSortedTransactions.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTransactions = getFilteredAndSortedTransactions.slice(startIndex, endIndex);

  /* ================= TOTALS ================= */
  const totals = useMemo(() => {
    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    const expense = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
    
    return { 
      income: parseFloat(income.toFixed(2)), 
      expense: parseFloat(expense.toFixed(2)), 
      balance: parseFloat((income - expense).toFixed(2)) 
    };
  }, [transactions]);

  /* ================= CHART DATA ================= */
  const barChartData = useMemo(() => {
    const monthlyData = {};
    
    transactions.forEach(t => {
      try {
        const date = new Date(t.date);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('default', { month: 'short', year: 'numeric' });
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthName, income: 0, expenses: 0 };
        }
        
        if (t.type === 'income') {
          monthlyData[monthKey].income += parseFloat(t.amount) || 0;
        } else {
          monthlyData[monthKey].expenses += parseFloat(t.amount) || 0;
        }
      } catch (error) {
        console.warn("Invalid date in transaction:", t);
      }
    });
    
    return Object.values(monthlyData)
      .sort((a, b) => new Date(b.month) - new Date(a.month))
      .slice(0, 6);
  }, [transactions]);

  const categoryData = useMemo(() => {
    const categoryMap = {};
    
    transactions.forEach(t => {
      if (t.type === 'expense') {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + (parseFloat(t.amount) || 0);
      }
    });
    
    return Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  /* ================= DATE RANGE FUNCTIONS ================= */
  const setDateFilter = useCallback((type, start = "", end = "") => {
    setDateRange({
      startDate: start,
      endDate: end,
      filterType: type
    });
    setCurrentPage(1);
  }, []);

  const clearDateFilter = useCallback(() => {
    setDateRange({
      startDate: "",
      endDate: "",
      filterType: "none"
    });
  }, []);

  /* ================= LOGOUT ================= */
  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      
      mergeAttemptedRef.current.clear();
      initialLoadRef.current = false;
      
      setUser({
        uid: "guest",
        displayName: "Guest",
        email: null,
        isGuest: true
      });
      
      loadGuestData();
      setFilterMonth("All");
      setSearchTerm("");
      setTypeFilter("all");
      setCategoryFilter("all");
      setSortConfig({ column: null, direction: "asc" });
      setDateRange({
        startDate: "",
        endDate: "",
        filterType: "none"
      });
      setCurrentPage(1);
      setBudgetDocId(null);
      
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  }, [navigate, loadGuestData]);

  return (
    <TransactionContext.Provider
      value={{
        CATEGORIES,
        monthOptions: MONTHS,
        user,
        loading,
        darkMode,
        setDarkMode,
        transactions,
        paginatedTransactions,
        getFilteredAndSortedTransactions,
        totals,
        barChartData,
        categoryData,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalPages,
        startIndex,
        endIndex,
        filterMonth,
        setFilterMonth,
        searchTerm,
        setSearchTerm,
        typeFilter,
        setTypeFilter,
        categoryFilter,
        setCategoryFilter,
        dateRange,
        setDateFilter,
        clearDateFilter,
        budgets,
        updateBudget,
        budgetDocId,
        editingTransaction,
        addTransaction,
        deleteTransaction,
        editTransaction,
        getTransactionById,
        transactionToDelete,
        confirmDelete: setTransactionToDelete,
        openEdit: setEditingTransaction,
        sortConfig,
        handleSort: (column) => {
          setSortConfig(prev => ({
            column,
            direction: prev.column === column && prev.direction === "asc" ? "desc" : "asc"
          }));
        },
        handleLogout
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}