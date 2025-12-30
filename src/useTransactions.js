import { useState, useEffect, useCallback } from 'react';
import { 
  collection, addDoc, getDocs, deleteDoc,
  doc, query, where, updateDoc, onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

export const useTransactions = (user) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load transactions automatically when user changes
  useEffect(() => {
    if (!user?.uid) {
      setTransactions([]);
      return;
    }
    
    setLoading(true);
    
    // Using real-time listener (onSnapshot) instead of getDocs
    const transactionsQuery = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(
      transactionsQuery,
      (snapshot) => {
        const userTransactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setTransactions(userTransactions);
        setError(null);
        setLoading(false);
        
        // Debug: Check what's being fetched
        console.log("Transactions loaded:", userTransactions.length);
        if (userTransactions.length === 0) {
          console.log("No transactions found for user:", user.uid);
        }
      },
      (err) => {
        setError("Failed to load transactions");
        console.error("Error loading transactions:", err);
        setLoading(false);
      }
    );
    
    // Cleanup listener on unmount or user change
    return () => unsubscribe();
  }, [user?.uid]); // Re-run when user ID changes

  // The rest of your functions remain the same...
  const addTransaction = useCallback(async (transactionData) => {
    setLoading(true);
    try {
      let newTransaction;
      if (user) {
        const docRef = await addDoc(collection(db, "transactions"), transactionData);
        newTransaction = { id: docRef.id, ...transactionData };
      } else {
        const tempId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        newTransaction = { id: tempId, ...transactionData };
      }
      
      setTransactions(prev => [newTransaction, ...prev]);
      setError(null);
      return newTransaction;
    } catch (err) {
      setError("Failed to add transaction");
      console.error("Error adding transaction:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteTransaction = useCallback(async (id) => {
    setLoading(true);
    try {
      const isLocal = id.startsWith("local_");
      
      if (user && !isLocal) {
        await deleteDoc(doc(db, "transactions", id));
      }
      
      setTransactions(prev => prev.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      setError("Failed to delete transaction");
      console.error("Error deleting transaction:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateTransaction = useCallback(async (id, updates) => {
    setLoading(true);
    try {
      const isLocal = id.startsWith("local_");
      
      if (user && !isLocal) {
        await updateDoc(doc(db, "transactions", id), updates);
      }
      
      setTransactions(prev => prev.map(t => 
        t.id === id ? { ...t, ...updates } : t
      ));
      setError(null);
    } catch (err) {
      setError("Failed to update transaction");
      console.error("Error updating transaction:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    deleteTransaction,
    updateTransaction,
    setTransactions
  };
};