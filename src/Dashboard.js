// src/Dashboard.js
import React, { useEffect, useState, useCallback } from "react";
import "./App.css";

import {
  PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection, addDoc, getDocs, deleteDoc,
  doc, query, where, setDoc, writeBatch
} from "firebase/firestore";

const pieColors = ["#2e7d32", "#c62828", "#ff9800", "#2196f3", "#9c27b0", "#795548"];
const categories = ["Salary", "Food", "Rent", "Entertainment", "Transportation", "Other"];

export default function Dashboard() {
  // ---------------- AUTH ----------------
  const [user, setUser] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [hasSynced, setHasSynced] = useState(false); // ADDED: Track if sync has been done

  // ---------------- STATE ----------------
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState(
    categories.reduce((obj, c) => ({ ...obj, [c]: 0 }), {})
  );
  const [budgetDocId, setBudgetDocId] = useState(null);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState(categories[0]);

  const [filterMonth, setFilterMonth] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved === "true";
  });

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    // Load from localStorage if guest
    const savedTransactions = localStorage.getItem("transactions");
    const savedBudgets = localStorage.getItem("budgets");
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
    
    if (savedBudgets) {
      setBudgets(JSON.parse(savedBudgets));
    }
  }, []);

  // ---------------- AUTH LISTENER ----------------
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setHasSynced(false); // RESET sync flag when user changes
        await loadUserData(firebaseUser.uid);
      } else {
        setUser(null);
        setHasSynced(false); // RESET sync flag for guest
        // Load guest data from localStorage
        const savedTransactions = localStorage.getItem("transactions");
        const savedBudgets = localStorage.getItem("budgets");
        
        if (savedTransactions) {
          setTransactions(JSON.parse(savedTransactions));
        }
        
        if (savedBudgets) {
          setBudgets(JSON.parse(savedBudgets));
        }
      }
      setLoading(false);
    });
    
    return () => unsub();
  }, []);

  // ---------------- LOAD USER DATA ----------------
  const loadUserData = async (userId) => {
    try {
      // Load transactions
      const transactionsQuery = query(
        collection(db, "transactions"),
        where("uid", "==", userId)
      );
      const transactionsSnap = await getDocs(transactionsQuery);
      const userTransactions = transactionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setTransactions(userTransactions);

      // Load budgets
      const budgetsQuery = query(
        collection(db, "budgets"),
        where("uid", "==", userId)
      );
      const budgetsSnap = await getDocs(budgetsQuery);
      
      if (!budgetsSnap.empty) {
        const budgetDoc = budgetsSnap.docs[0];
        setBudgetDocId(budgetDoc.id);
        setBudgets(budgetDoc.data().values || {});
      } else {
        // Initialize empty budgets for new user
        const defaultBudgets = categories.reduce((obj, c) => ({ ...obj, [c]: 0 }), {});
        setBudgets(defaultBudgets);
      }
      
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // ---------------- SYNC LOCAL DATA TO FIRESTORE ----------------
  const syncLocalDataToFirebase = useCallback(async (userId) => {
    // Skip if already synced for this session
    if (hasSynced) {
      console.log("Already synced data for this session");
      return;
    }

    const localTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    const localBudgets = JSON.parse(localStorage.getItem("budgets") || "{}");
    
    // If no local data, skip syncing
    if (localTransactions.length === 0 && Object.keys(localBudgets).length === 0) {
      console.log("No local data to sync");
      setHasSynced(true);
      return;
    }

    try {
      console.log("Starting sync of local data to Firebase...");
      
      // Get existing transactions from Firestore
      const existingTransactionsQuery = query(
        collection(db, "transactions"),
        where("uid", "==", userId)
      );
      const existingTransactionsSnap = await getDocs(existingTransactionsQuery);
      const existingTransactions = existingTransactionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Create a map of existing transactions by unique key
      const existingTransactionMap = new Map();
      existingTransactions.forEach(t => {
        const key = `${t.title}-${t.amount}-${t.type}-${t.category}-${new Date(t.date).toISOString().split('T')[0]}`;
        existingTransactionMap.set(key, true);
      });
      
      const batch = writeBatch(db);
      let newTransactionsCount = 0;
      
      // Add only new local transactions to Firestore
      for (const transaction of localTransactions) {
        const { id: localId, ...transactionData } = transaction;
        
        // Create unique key for this transaction
        const transactionKey = `${transactionData.title}-${transactionData.amount}-${transactionData.type}-${transactionData.category}-${new Date(transactionData.date).toISOString().split('T')[0]}`;
        
        // Only add if it doesn't already exist in Firestore
        if (!existingTransactionMap.has(transactionKey)) {
          const newDocRef = doc(collection(db, "transactions"));
          batch.set(newDocRef, {
            ...transactionData,
            uid: userId
          });
          newTransactionsCount++;
        }
      }

      // Sync budgets if needed
      if (Object.keys(localBudgets).length > 0) {
        const budgetsQuery = query(
          collection(db, "budgets"),
          where("uid", "==", userId)
        );
        const budgetsSnap = await getDocs(budgetsQuery);
        
        if (budgetsSnap.empty) {
          // Create new budget document
          const budgetDocRef = doc(collection(db, "budgets"));
          batch.set(budgetDocRef, {
            uid: userId,
            values: localBudgets
          });
          setBudgetDocId(budgetDocRef.id);
        } else {
          // Update existing budget
          const budgetDoc = budgetsSnap.docs[0];
          setBudgetDocId(budgetDoc.id);
          const existingBudgets = budgetDoc.data().values || {};
          
          // Merge budgets (keep existing values for categories not in local)
          const mergedBudgets = { ...existingBudgets };
          Object.keys(localBudgets).forEach(key => {
            if (localBudgets[key] > 0) {
              mergedBudgets[key] = localBudgets[key];
            }
          });
          
          batch.set(budgetDoc.ref, {
            uid: userId,
            values: mergedBudgets
          }, { merge: true });
        }
      }

      // Only commit if there are changes
      if (newTransactionsCount > 0 || Object.keys(localBudgets).length > 0) {
        await batch.commit();
        console.log(`✅ Synced ${newTransactionsCount} new transactions to Firebase`);
        
        // Clear localStorage only after successful sync
        localStorage.removeItem("transactions");
        localStorage.removeItem("budgets");
        
        // Reload data from Firestore to include newly synced data
        await loadUserData(userId);
      } else {
        console.log("✅ No new data to sync (all data already exists in Firestore)");
        localStorage.removeItem("transactions");
        localStorage.removeItem("budgets");
      }
      
      setHasSynced(true); // Mark as synced for this session
      
    } catch (error) {
      console.error("Error syncing data to Firebase:", error);
      // Don't clear localStorage if sync failed
    }
  }, [hasSynced]); // Only depend on hasSynced

  // Call sync function when user logs in (only once)
  useEffect(() => {
    if (user && !hasSynced) {
      syncLocalDataToFirebase(user.uid);
    }
  }, [user, hasSynced, syncLocalDataToFirebase]);

  // ---------------- SAVE TO LOCALSTORAGE WHEN GUEST ----------------
  useEffect(() => {
    if (user === null) { // Guest user
      localStorage.setItem("transactions", JSON.stringify(transactions));
      localStorage.setItem("budgets", JSON.stringify(budgets));
    }
  }, [transactions, budgets, user]);

  // ---------------- DARK MODE ----------------
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  // ---------------- ADD TRANSACTION ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !amount || !type) {
      alert("Please fill all fields");
      return;
    }
    
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    const newTransaction = {
      title: title.trim(),
      amount: amountValue,
      type,
      category,
      date: new Date().toISOString(),
      uid: user ? user.uid : null
    };

    try {
      if (user) {
        // Add to Firestore
        const docRef = await addDoc(collection(db, "transactions"), newTransaction);
        
        // Update local state with Firestore ID
        setTransactions(prev => [{
          id: docRef.id,
          ...newTransaction
        }, ...prev]);
      } else {
        // Add to local storage with temporary ID
        const tempId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const transactionWithId = {
          id: tempId,
          ...newTransaction
        };
        setTransactions(prev => [transactionWithId, ...prev]);
      }

      // Reset form
      setTitle("");
      setAmount("");
      setType("");
      setCategory(categories[0]);
      
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert(`Failed to add transaction: ${error.message}`);
    }
  };

  // ---------------- DELETE TRANSACTION ----------------
  const deleteTransaction = async (id) => {
    if (!id) return;
    
    const isLocal = id.startsWith("local_");
    
    try {
      if (user && !isLocal) {
        // Delete from Firestore
        await deleteDoc(doc(db, "transactions", id));
      }
      
      // Update local state
      setTransactions(prev => prev.filter(t => t.id !== id));
      
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    }
  };

  // ---------------- UPDATE BUDGET ----------------
  const updateBudget = async (categoryName, value) => {
    const numValue = parseFloat(value) || 0;
    const newBudgets = { ...budgets, [categoryName]: numValue };
    setBudgets(newBudgets);

    try {
      if (user) {
        if (budgetDocId) {
          await setDoc(doc(db, "budgets", budgetDocId), {
            uid: user.uid,
            values: newBudgets
          }, { merge: true });
        } else {
          const docRef = await addDoc(collection(db, "budgets"), {
            uid: user.uid,
            values: newBudgets
          });
          setBudgetDocId(docRef.id);
        }
      }
    } catch (error) {
      console.error("Error updating budget:", error);
      alert("Failed to update budget");
    }
  };

  // ---------------- FILTERING & CALCULATIONS ----------------
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);
    const monthYear = transactionDate.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
    
    const matchesMonth = filterMonth === "All" || filterMonth === monthYear;
    const matchesSearch = 
      transaction.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesMonth && matchesSearch;
  });

  // Calculate totals
  const { incomeTotal, expenseTotal } = filteredTransactions.reduce((totals, transaction) => {
    if (transaction.type === "income") {
      totals.incomeTotal += transaction.amount;
    } else {
      totals.expenseTotal += transaction.amount;
    }
    return totals;
  }, { incomeTotal: 0, expenseTotal: 0 });

  const balance = incomeTotal - expenseTotal;

  // Month-wise data for chart
  const monthsMap = {};
  transactions.forEach(transaction => {
    const monthYear = new Date(transaction.date).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric'
    });
    
    if (!monthsMap[monthYear]) {
      monthsMap[monthYear] = { income: 0, expenses: 0 };
    }
    
    if (transaction.type === "income") {
      monthsMap[monthYear].income += transaction.amount;
    } else {
      monthsMap[monthYear].expenses += transaction.amount;
    }
  });

  const monthOptions = ["All", ...Object.keys(monthsMap).sort((a, b) => {
    const [monthA, yearA] = a.split(' ');
    const [monthB, yearB] = b.split(' ');
    const dateA = new Date(`${monthA} 1, ${yearA}`);
    const dateB = new Date(`${monthB} 1, ${yearB}`);
    return dateA - dateB;
  })];

  const barChartData = Object.entries(monthsMap)
    .map(([month, data]) => ({
      month,
      income: data.income,
      expenses: data.expenses
    }))
    .sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      const dateA = new Date(`${monthA} 1, ${yearA}`);
      const dateB = new Date(`${monthB} 1, ${yearB}`);
      return dateA - dateB;
    });

  // Category data for pie chart
  const categoryData = categories.map(cat => {
    const spent = filteredTransactions
      .filter(t => t.category === cat && t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: cat,
      value: spent,
      spent,
      budget: budgets[cat] || 0
    };
  }).filter(item => item.value > 0);

  // Overspend categories
  const overspendCategories = categoryData
    .filter(item => item.budget > 0 && item.spent > item.budget)
    .map(item => item.name);

  // ---------------- LOGOUT ----------------
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setHasSynced(false); // RESET sync flag on logout
      // Clear transactions and reload guest data from localStorage
      setTransactions([]);
      const saved = localStorage.getItem("transactions");
      if (saved) {
        setTransactions(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // ---------------- LOADING STATE ----------------
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // ---------------- UI ----------------
  return (
    <div className={`App ${darkMode ? "dark" : ""}`}>
      <header className="app-header">
        <h1>💰 Finance Tracker</h1>
        
        <div className="header-controls">
          {user ? (
            <div className="user-info">
              <span className="user-email">{user.email}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <a href="/login" className="auth-link">
                <button className="btn-login">Login</button>
              </a>
              <a href="/signup" className="auth-link">
                <button className="btn-signup">Sign Up</button>
              </a>
            </div>
          )}
          
          <label className="dark-mode-toggle">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Dark Mode</span>
          </label>
        </div>
      </header>

      <main className="main-content">
        {/* ADD TRANSACTION FORM */}
        <section className="form-section">
          <h2>Add New Transaction</h2>
          <form className="transaction-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                placeholder="Transaction Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="form-group">
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group type-selection">
              <label className={`type-option ${type === "income" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="type"
                  value="income"
                  checked={type === "income"}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
                <span className="type-label">Income</span>
              </label>
              
              <label className={`type-option ${type === "expense" ? "active" : ""}`}>
                <input
                  type="radio"
                  name="type"
                  value="expense"
                  checked={type === "expense"}
                  onChange={(e) => setType(e.target.value)}
                  required
                />
                <span className="type-label">Expense</span>
              </label>
            </div>
            
            <button type="submit" className="btn-submit">
              {user ? "Add Transaction (Cloud)" : "Add Transaction (Local)"}
            </button>
          </form>
        </section>

        {/* SUMMARY CARDS */}
        <section className="summary-section">
          <div className="summary-cards">
            <div className="summary-card income-card">
              <h3>Total Income</h3>
              <p className="amount">₹{incomeTotal.toLocaleString()}</p>
            </div>
            
            <div className="summary-card expense-card">
              <h3>Total Expenses</h3>
              <p className="amount">₹{expenseTotal.toLocaleString()}</p>
            </div>
            
            <div className="summary-card balance-card">
              <h3>Current Balance</h3>
              <p className={`amount ${balance >= 0 ? "positive" : "negative"}`}>
                ₹{balance.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* BUDGETS SECTION */}
        <section className="budgets-section">
          <h2>Monthly Budgets</h2>
          <div className="budgets-grid">
            {categories.map(cat => {
              const spent = filteredTransactions
                .filter(t => t.category === cat && t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0);
              const budget = budgets[cat] || 0;
              const percentage = budget > 0 ? (spent / budget) * 100 : 0;
              const isOverspent = budget > 0 && spent > budget;
              
              return (
                <div key={cat} className="budget-card">
                  <div className="budget-header">
                    <h4>{cat}</h4>
                    {isOverspent && <span className="overspent-badge">⚠ Overspent!</span>}
                  </div>
                  
                  <div className="budget-progress">
                    <div className="progress-bar">
                      <div 
                        className={`progress-fill ${isOverspent ? "overspent" : ""}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="budget-stats">
                      <span className="spent">₹{spent.toLocaleString()}</span>
                      <span className="budget">/ ₹{budget.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="budget-input">
                    <input
                      type="number"
                      placeholder="Set budget"
                      value={budget || ""}
                      onChange={(e) => updateBudget(cat, e.target.value)}
                      min="0"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CHARTS SECTION */}
        <section className="charts-section">
          {/* Income vs Expense Pie Chart */}
          <div className="chart-card">
            <h3>Income vs Expense</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                {(incomeTotal + expenseTotal) > 0 ? (
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Income", value: incomeTotal },
                        { name: "Expense", value: expenseTotal }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => 
                        `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                      }
                    >
                      <Cell fill="#4CAF50" />
                      <Cell fill="#F44336" />
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                ) : (
                  <div className="no-data">
                    <p>No transaction data to display</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Bar Chart */}
          <div className="chart-card">
            <h3>Monthly Overview</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                {barChartData.length > 0 ? (
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Legend />
                    <Bar dataKey="income" name="Income" fill="#4CAF50" />
                    <Bar dataKey="expenses" name="Expenses" fill="#F44336" />
                  </BarChart>
                ) : (
                  <div className="no-data">
                    <p>No monthly data to display</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="chart-card">
            <h3>Spending by Category</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                {categoryData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value, percent }) => 
                        `${name}: ₹${value.toLocaleString()} (${(percent * 100).toFixed(1)}%)`
                      }
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Amount']} />
                    <Legend />
                  </PieChart>
                ) : (
                  <div className="no-data">
                    <p>No category data to display</p>
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="filters-section">
          <div className="filters-container">
            <div className="search-filter">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="month-filter">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              >
                {monthOptions.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* TRANSACTIONS LIST */}
        <section className="transactions-section">
          <h2>Recent Transactions {filteredTransactions.length > 0 && `(${filteredTransactions.length})`}</h2>
          <div className="transactions-list">
            {filteredTransactions.length === 0 ? (
              <div className="no-transactions">
                <p>No transactions found. Add your first transaction above!</p>
              </div>
            ) : (
              filteredTransactions.map(transaction => {
                const date = new Date(transaction.date);
                const formattedDate = date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                
                return (
                  <div
                    key={transaction.id}
                    className={`transaction-item ${transaction.type === "income" ? "income" : "expense"}`}
                  >
                    <div className="transaction-info">
                      <div className="transaction-main">
                        <h4 className="transaction-title">{transaction.title}</h4>
                        <span className="transaction-category">{transaction.category}</span>
                      </div>
                      <div className="transaction-meta">
                        <span className="transaction-date">{formattedDate}</span>
                        <span className={`transaction-amount ${transaction.type}`}>
                          {transaction.type === "income" ? "+" : "-"}₹{transaction.amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTransaction(transaction.id)}
                      title="Delete transaction"
                    >
                      ×
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>Finance Tracker • {user ? `Logged in as ${user.email}` : "Guest Mode"}</p>
        <p>Total Transactions: {transactions.length} • Filtered: {filteredTransactions.length}</p>
        {overspendCategories.length > 0 && (
          <p className="overspend-warning">
            ⚠ Overspending in {overspendCategories.length} category{overspendCategories.length > 1 ? 's' : ''}: {overspendCategories.join(', ')}
          </p>
        )}
      </footer>
    </div>
  );
}