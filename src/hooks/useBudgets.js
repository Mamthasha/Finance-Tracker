// src/hooks/useBudgets.js
import { useState, useEffect, useCallback } from "react";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  query,
  where,
  onSnapshot
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { categories } from "../utils/constants";

export default function useBudgets() {
  const [budgets, setBudgets] = useState(() => {
    // Initialize with default categories
    const defaultBudgets = {};
    categories.forEach(category => {
      defaultBudgets[category] = 0;
    });
    return defaultBudgets;
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [budgetDocId, setBudgetDocId] = useState(null);

  // Load budgets from Firebase
  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const user = auth.currentUser;
      
      if (!user) {
        // Load from localStorage for guest mode
        const savedBudgets = localStorage.getItem("budgets");
        if (savedBudgets) {
          setBudgets(JSON.parse(savedBudgets));
        }
        setLoading(false);
        return;
      }
      
      // Load from Firebase for authenticated users
      const budgetsQuery = query(
        collection(db, "budgets"),
        where("uid", "==", user.uid)
      );
      
      const querySnapshot = await getDocs(budgetsQuery);
      
      if (!querySnapshot.empty) {
        const budgetDoc = querySnapshot.docs[0];
        setBudgetDocId(budgetDoc.id);
        setBudgets(budgetDoc.data().values || {});
      } else {
        // Initialize with default budgets
        const defaultBudgets = {};
        categories.forEach(category => {
          defaultBudgets[category] = 0;
        });
        setBudgets(defaultBudgets);
        setBudgetDocId(null);
      }
      
    } catch (error) {
      console.error("Error loading budgets:", error);
      setError("Failed to load budgets");
      
      // Fallback to localStorage
      const savedBudgets = localStorage.getItem("budgets");
      if (savedBudgets) {
        setBudgets(JSON.parse(savedBudgets));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Real-time listener for budgets
  useEffect(() => {
    const user = auth.currentUser;
    
    if (!user) {
      // No real-time updates for guest mode
      return;
    }
    
    const budgetsQuery = query(
      collection(db, "budgets"),
      where("uid", "==", user.uid)
    );
    
    const unsubscribe = onSnapshot(budgetsQuery, (snapshot) => {
      if (!snapshot.empty) {
        const budgetDoc = snapshot.docs[0];
        setBudgetDocId(budgetDoc.id);
        setBudgets(budgetDoc.data().values || {});
      } else {
        // Initialize with default budgets
        const defaultBudgets = {};
        categories.forEach(category => {
          defaultBudgets[category] = 0;
        });
        setBudgets(defaultBudgets);
        setBudgetDocId(null);
      }
    }, (error) => {
      console.error("Real-time budget listener error:", error);
      setError("Real-time budget updates failed");
    });
    
    return () => unsubscribe();
  }, []);

  // Save to localStorage when in guest mode
  useEffect(() => {
    if (!auth.currentUser) {
      localStorage.setItem("budgets", JSON.stringify(budgets));
    }
  }, [budgets]);

  // Update a budget
  const updateBudget = useCallback(async (category, amount) => {
    try {
      setError(null);
      
      const user = auth.currentUser;
      const amountValue = parseFloat(amount) || 0;
      
      // Update local state
      const updatedBudgets = { ...budgets, [category]: amountValue };
      setBudgets(updatedBudgets);
      
      if (user) {
        // Save to Firebase
        if (budgetDocId) {
          await setDoc(doc(db, "budgets", budgetDocId), {
            uid: user.uid,
            values: updatedBudgets
          }, { merge: true });
        } else {
          const docRef = await setDoc(doc(collection(db, "budgets")), {
            uid: user.uid,
            values: updatedBudgets
          });
          setBudgetDocId(docRef.id);
        }
      }
      
      return { success: true };
      
    } catch (error) {
      console.error("Error updating budget:", error);
      setError("Failed to update budget");
      return { success: false, error: error.message };
    }
  }, [budgets, budgetDocId]);

  // Update multiple budgets
  const updateMultipleBudgets = useCallback(async (budgetUpdates) => {
    try {
      setError(null);
      
      const user = auth.currentUser;
      
      // Update local state
      const updatedBudgets = { ...budgets };
      Object.entries(budgetUpdates).forEach(([category, amount]) => {
        updatedBudgets[category] = parseFloat(amount) || 0;
      });
      setBudgets(updatedBudgets);
      
      if (user) {
        // Save to Firebase
        if (budgetDocId) {
          await setDoc(doc(db, "budgets", budgetDocId), {
            uid: user.uid,
            values: updatedBudgets
          }, { merge: true });
        } else {
          const docRef = await setDoc(doc(collection(db, "budgets")), {
            uid: user.uid,
            values: updatedBudgets
          });
          setBudgetDocId(docRef.id);
        }
      }
      
      return { success: true };
      
    } catch (error) {
      console.error("Error updating multiple budgets:", error);
      setError("Failed to update budgets");
      return { success: false, error: error.message };
    }
  }, [budgets, budgetDocId]);

  // Reset all budgets to zero
  const resetBudgets = useCallback(async () => {
    try {
      setError(null);
      
      const user = auth.currentUser;
      const resetBudgets = {};
      categories.forEach(category => {
        resetBudgets[category] = 0;
      });
      
      setBudgets(resetBudgets);
      
      if (user) {
        if (budgetDocId) {
          await setDoc(doc(db, "budgets", budgetDocId), {
            uid: user.uid,
            values: resetBudgets
          }, { merge: true });
        } else {
          const docRef = await setDoc(doc(collection(db, "budgets")), {
            uid: user.uid,
            values: resetBudgets
          });
          setBudgetDocId(docRef.id);
        }
      }
      
      return { success: true };
      
    } catch (error) {
      console.error("Error resetting budgets:", error);
      setError("Failed to reset budgets");
      return { success: false, error: error.message };
    }
  }, [budgetDocId]);

  // Sync local budgets to Firebase
  const syncLocalBudgets = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return { success: false, error: "No user logged in" };
      }
      
      setError(null);
      
      const localBudgets = JSON.parse(localStorage.getItem("budgets") || "{}");
      
      if (Object.keys(localBudgets).length === 0) {
        return { success: true, message: "No local budgets to sync" };
      }
      
      // Merge local budgets with existing budgets
      const mergedBudgets = { ...budgets };
      Object.entries(localBudgets).forEach(([category, amount]) => {
        if (amount > 0) {
          mergedBudgets[category] = amount;
        }
      });
      
      // Save merged budgets
      if (budgetDocId) {
        await setDoc(doc(db, "budgets", budgetDocId), {
          uid: user.uid,
          values: mergedBudgets
        }, { merge: true });
      } else {
        const docRef = await setDoc(doc(collection(db, "budgets")), {
          uid: user.uid,
          values: mergedBudgets
        });
        setBudgetDocId(docRef.id);
      }
      
      // Clear local storage
      localStorage.removeItem("budgets");
      setBudgets(mergedBudgets);
      
      return { success: true, message: "Budgets synced successfully" };
      
    } catch (error) {
      console.error("Error syncing budgets:", error);
      setError("Failed to sync budgets");
      return { success: false, error: error.message };
    }
  }, [budgets, budgetDocId]);

  // Clear all budgets (for guest mode)
  const clearAllBudgets = useCallback(() => {
    if (auth.currentUser) {
      setError("Cannot clear budgets while logged in");
      return { success: false, error: "Must be in guest mode" };
    }
    
    const defaultBudgets = {};
    categories.forEach(category => {
      defaultBudgets[category] = 0;
    });
    
    setBudgets(defaultBudgets);
    localStorage.removeItem("budgets");
    return { success: true };
  }, []);

  // Get budget by category
  const getBudgetByCategory = useCallback((category) => {
    return budgets[category] || 0;
  }, [budgets]);

  // Get total budget
  const getTotalBudget = useCallback(() => {
    return Object.values(budgets).reduce((total, amount) => total + amount, 0);
  }, [budgets]);

  // Check if any category is overspent
  const getOverspentCategories = useCallback((categorySpending) => {
    return Object.entries(categorySpending)
      .filter(([category, spent]) => {
        const budget = budgets[category] || 0;
        return budget > 0 && spent > budget;
      })
      .map(([category]) => category);
  }, [budgets]);

  // Calculate budget utilization
  const getBudgetUtilization = useCallback((categorySpending) => {
    return Object.entries(categorySpending).map(([category, spent]) => {
      const budget = budgets[category] || 0;
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      
      return {
        category,
        spent,
        budget,
        percentage,
        isOverspent: budget > 0 && spent > budget,
        remaining: Math.max(0, budget - spent)
      };
    });
  }, [budgets]);

  return {
    // State
    budgets,
    loading,
    error,
    budgetDocId,
    
    // Functions
    loadBudgets,
    updateBudget,
    updateMultipleBudgets,
    resetBudgets,
    syncLocalBudgets,
    clearAllBudgets,
    getBudgetByCategory,
    getTotalBudget,
    getOverspentCategories,
    getBudgetUtilization,
    
    // Computed
    hasBudgets: Object.values(budgets).some(amount => amount > 0),
    
    // Utilities
    clearError: () => setError(null)
  };
}