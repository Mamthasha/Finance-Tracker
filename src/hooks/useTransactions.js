// src/hooks/useTransactions.js
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc as firestoreDoc,
  query,
  where,
  updateDoc,
  writeBatch,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { categories } from "../utils/constants";
import { generateId, calculateTotals } from "../utils/helpers";

/**
 * useTransactions
 * - Supports guest mode (localStorage) and authenticated users (Firestore)
 * - Provides add/update/delete, batch delete, sync local->firebase
 * - Keeps a realtime listener when user is logged in
 */
export default function useTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // --- Helper: build query for current user
  const buildUserQuery = (user) => {
    return query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      orderBy("date", "desc")
    );
  };

  // --- Load transactions (one-off)
  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;

      if (!user) {
        // guest mode -> load from localStorage
        const saved = localStorage.getItem("transactions");
        setTransactions(saved ? JSON.parse(saved) : []);
        return { success: true, source: "local" };
      }

      // Authenticated -> fetch from Firestore
      const q = buildUserQuery(user);
      const snap = await getDocs(q);
      const userTx = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setTransactions(userTx);
      return { success: true, source: "firebase", count: userTx.length };
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError("Failed to load transactions");
      // fallback to local
      const saved = localStorage.getItem("transactions");
      setTransactions(saved ? JSON.parse(saved) : []);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Real-time listener (sets transactions whenever DB changes)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      // no realtime listener for guest mode
      return;
    }

    const q = buildUserQuery(user);
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const updated = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        setTransactions(updated);
      },
      (err) => {
        console.error("Realtime listener error:", err);
        setError("Real-time updates failed");
      }
    );

    return () => {
      unsubscribe();
    };
  }, []); // intentionally only mount once; currentUser resolution handled in loadTransactions and sync

  // --- persist to localStorage when guest mode
  useEffect(() => {
    if (!auth.currentUser) {
      // only save locally for guest mode
      if (transactions.length > 0) {
        localStorage.setItem("transactions", JSON.stringify(transactions));
      } else {
        localStorage.removeItem("transactions");
      }
    }
  }, [transactions]);

  // --- Add a transaction
  const addTransaction = useCallback(async (transactionData) => {
    setError(null);
    try {
      const user = auth.currentUser;
      const newTx = {
        ...transactionData,
        date: new Date(transactionData.date || new Date()).toISOString(),
        uid: user?.uid || null
      };

      if (user) {
        const ref = await addDoc(collection(db, "transactions"), newTx);
        const txWithId = { id: ref.id, ...newTx };
        // optimistic update handled by realtime listener; but update local state to be safe
        setTransactions(prev => [txWithId, ...prev]);
        return { success: true, transaction: txWithId };
      } else {
        const localId = generateId();
        const txWithId = { id: localId, ...newTx };
        setTransactions(prev => [txWithId, ...prev]);
        return { success: true, transaction: txWithId };
      }
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError("Failed to add transaction");
      return { success: false, error: err.message };
    }
  }, []);

  // --- Update a transaction
  const updateTransaction = useCallback(async (id, updates) => {
    setError(null);
    try {
      const user = auth.currentUser;
      const isLocal = id.startsWith("local_");

      if (user && !isLocal) {
        await updateDoc(firestoreDoc(db, "transactions", id), updates);
      }

      setTransactions(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
      return { success: true };
    } catch (err) {
      console.error("Error updating transaction:", err);
      setError("Failed to update transaction");
      return { success: false, error: err.message };
    }
  }, []);

  // --- Delete a transaction
  const deleteTransaction = useCallback(async (id) => {
    setError(null);
    try {
      const user = auth.currentUser;
      const isLocal = id.startsWith("local_");

      if (user && !isLocal) {
        await deleteDoc(firestoreDoc(db, "transactions", id));
      }

      setTransactions(prev => prev.filter(t => t.id !== id));
      return { success: true };
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError("Failed to delete transaction");
      return { success: false, error: err.message };
    }
  }, []);

  // --- Delete multiple transactions (batch)
  const deleteMultipleTransactions = useCallback(async (ids = []) => {
    setError(null);
    try {
      const user = auth.currentUser;
      const firebaseIds = ids.filter(id => !id.startsWith("local_"));

      if (user && firebaseIds.length > 0) {
        const batch = writeBatch(db);
        firebaseIds.forEach(id => batch.delete(firestoreDoc(db, "transactions", id)));
        await batch.commit();
      }

      setTransactions(prev => prev.filter(t => !ids.includes(t.id)));
      return { success: true, deletedCount: ids.length };
    } catch (err) {
      console.error("Error deleting multiple transactions:", err);
      setError("Failed to delete transactions");
      return { success: false, error: err.message };
    }
  }, []);

  // --- Sync local transactions to Firebase (one-time)
  const syncLocalTransactions = useCallback(async () => {
    setError(null);
    if (syncing) return { success: false, message: "Already syncing" };

    const user = auth.currentUser;
    if (!user) return { success: false, error: "No user logged in" };

    setSyncing(true);
    try {
      const localTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      if (!Array.isArray(localTransactions) || localTransactions.length === 0) {
        localStorage.removeItem("transactions");
        return { success: true, message: "No local data to sync" };
      }

      // fetch existing for the user to avoid duplicates
      const existingQ = query(collection(db, "transactions"), where("uid", "==", user.uid));
      const existingSnap = await getDocs(existingQ);
      const existing = existingSnap.docs.map(d => d.data());

      const existingMap = new Map();
      existing.forEach(t => {
        const key = `${t.title}-${t.amount}-${t.type}-${t.category}-${new Date(t.date).toISOString().split('T')[0]}`;
        existingMap.set(key, true);
      });

      const newTxs = localTransactions.filter(tx => {
        const key = `${tx.title}-${tx.amount}-${tx.type}-${tx.category}-${new Date(tx.date).toISOString().split('T')[0]}`;
        return !existingMap.has(key);
      });

      if (newTxs.length === 0) {
        localStorage.removeItem("transactions");
        return { success: true, message: "All data already synced" };
      }

      const batch = writeBatch(db);
      newTxs.forEach(tx => {
        const { id, ...rest } = tx;
        const ref = firestoreDoc(collection(db, "transactions")); // create new doc ref
        batch.set(ref, { ...rest, uid: user.uid });
      });

      await batch.commit();
      localStorage.removeItem("transactions");
      return { success: true, syncedCount: newTxs.length };
    } catch (err) {
      console.error("Error syncing transactions:", err);
      setError("Failed to sync transactions");
      return { success: false, error: err.message };
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  // --- Clear local transactions (guest mode)
  const clearAllTransactions = useCallback(() => {
    if (auth.currentUser) {
      setError("Cannot clear transactions while logged in");
      return { success: false, error: "Must be in guest mode" };
    }
    setTransactions([]);
    localStorage.removeItem("transactions");
    return { success: true };
  }, []);

  // --- Utility query helpers
  const getTransactionsByDateRange = useCallback((startDate, endDate) => {
    if (!startDate || !endDate) return [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    return transactions.filter(t => {
      const td = new Date(t.date);
      return td >= start && td <= end;
    });
  }, [transactions]);

  const getTransactionsByCategory = useCallback((category) => {
    return transactions.filter(t => t.category === category);
  }, [transactions]);

  const getTransactionsByType = useCallback((type) => {
    return transactions.filter(t => t.type === type);
  }, [transactions]);

  // --- Memoized totals (uses calculateTotals helper if available)
  const totals = useMemo(() => {
    try {
      return calculateTotals(transactions);
    } catch {
      // fallback
      return transactions.reduce((acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      }, { income: 0, expense: 0 });
    }
  }, [transactions]);

  // --- Recent and summaries
  const getRecentTransactions = useCallback((limit = 5) => {
    return transactions.slice(0, limit);
  }, [transactions]);

  const getMonthlySummary = useCallback(() => {
    const monthlyMap = {};
    transactions.forEach(t => {
      const d = new Date(t.date);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expenses: 0 };
      if (t.type === "income") monthlyMap[key].income += t.amount;
      else monthlyMap[key].expenses += t.amount;
    });
    return Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses
    })).sort((a, b) => new Date(`${a.month.split(' ')[0]} 1, ${a.month.split(' ')[1]}`) - new Date(`${b.month.split(' ')[0]} 1, ${b.month.split(' ')[1]}`));
  }, [transactions]);

  const getCategorySummary = useCallback(() => {
    const map = {};
    categories.forEach(cat => { map[cat] = { spent: 0, income: 0 }; });
    transactions.forEach(t => {
      if (!map[t.category]) map[t.category] = { spent: 0, income: 0 };
      if (t.type === "income") map[t.category].income += t.amount;
      else map[t.category].spent += t.amount;
    });
    return Object.entries(map).map(([category, data]) => ({
      category,
      spent: data.spent,
      income: data.income,
      net: data.income - data.spent
    }));
  }, [transactions]);

  // Expose hook API
  return {
    // state
    transactions,
    loading,
    error,
    syncing,

    // totals
    totals,

    // actions
    loadTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    syncLocalTransactions,
    clearAllTransactions,

    // queries
    getTransactionsByDateRange,
    getTransactionsByCategory,
    getTransactionsByType,
    getRecentTransactions,
    getMonthlySummary,
    getCategorySummary,

    // computed
    transactionCount: transactions.length,
    hasTransactions: transactions.length > 0,

    // utilities
    clearError: () => setError(null)
  };
}
