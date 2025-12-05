import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

const categories = ["Salary", "Food", "Rent", "Entertainment", "Other"];

export default function TransactionForm({ user }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState(categories[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount || !type) return alert("Fill all fields");

    await addDoc(collection(db, "transactions"), {
      title,
      amount: Number(amount),
      type,
      category,
      date: new Date().toISOString(),
      uid: user.uid
    });

    setTitle(""); setAmount(""); setType(""); setCategory(categories[0]);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
      <input type="number" placeholder="Amount" value={amount} min="0" onChange={e => setAmount(e.target.value)} />
      <select value={category} onChange={e => setCategory(e.target.value)}>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="type-box">
        <label><input type="radio" name="type" value="income" checked={type==="income"} onChange={e=>setType(e.target.value)} /> Income</label>
        <label><input type="radio" name="type" value="expense" checked={type==="expense"} onChange={e=>setType(e.target.value)} /> Expense</label>
      </div>
      <button type="submit">Add</button>
    </form>
  );
}
