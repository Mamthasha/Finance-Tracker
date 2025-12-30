import React, { useState } from "react";
import { useTransactions } from "../../contexts/TransactionContext";

export default function TransactionForm(){
  const { CATEGORIES, addTransaction, darkMode } = useTransactions();
  const [title,setTitle]=useState(""); const [amount,setAmount]=useState(""); const [type,setType]=useState(""); const [category,setCategory]=useState(CATEGORIES[0]);

  const submit = (e) => {
    e.preventDefault();
    if(!title.trim()||!amount||!type){ alert("Please fill all fields"); return; }
    addTransaction({ title, amount, type, category });
    setTitle(""); setAmount(""); setType(""); setCategory(CATEGORIES[0]);
  };

  return (
    <section className={`card shadow mb-4 ${darkMode?'bg-dark text-light':''}`}>
      <div className="card-body">
        <h2 className="card-title mb-4">Add New Transaction <small className="ms-2 text-muted">Auto-saves locally if guest</small></h2>
        <form onSubmit={submit} className="row g-3">
          <div className="col-md-3"><input type="text" className={`form-control ${darkMode?'bg-secondary text-light':''}`} placeholder="Transaction Title" value={title} onChange={e=>setTitle(e.target.value)} required/></div>
          <div className="col-md-2"><input type="number" className={`form-control ${darkMode?'bg-secondary text-light':''}`} placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} min="0" step="0.01" required/></div>
          <div className="col-md-2"><select className={`form-select ${darkMode?'bg-secondary text-light':''}`} value={category} onChange={e=>setCategory(e.target.value)}>{CATEGORIES.map(c=> <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="col-md-3">
            <div className="btn-group w-100" role="group">
              <input type="radio" className="btn-check" name="type" id="incomeType" value="income" checked={type==="income"} onChange={e=>setType(e.target.value)} required/>
              <label className={`btn ${type==="income"?"btn-success":"btn-outline-success"}`} htmlFor="incomeType">Income</label>
              <input type="radio" className="btn-check" name="type" id="expenseType" value="expense" checked={type==="expense"} onChange={e=>setType(e.target.value)} required/>
              <label className={`btn ${type==="expense"?"btn-danger":"btn-outline-danger"}`} htmlFor="expenseType">Expense</label>
            </div>
          </div>
          <div className="col-md-2"><button type="submit" className="btn btn-primary w-100">Add Transaction</button></div>
        </form>
      </div>
    </section>
  );
}
