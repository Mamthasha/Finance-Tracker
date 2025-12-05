import { useEffect, useState } from "react";
import { collection, addDoc, doc, setDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";

const categories = ["Salary", "Food", "Rent", "Entertainment", "Other"];

export default function BudgetBox({ user, transactions }) {
  const [budgets, setBudgets] = useState({});
  const [budgetDocId, setBudgetDocId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "budgets"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, snapshot => {
      if (!snapshot.empty) {
        setBudgetDocId(snapshot.docs[0].id);
        setBudgets(snapshot.docs[0].data().values);
      } else {
        const initialBudgets = categories.reduce((acc, c) => ({ ...acc, [c]: 0 }), {});
        setBudgets(initialBudgets);
      }
    });
    return () => unsub();
  }, [user]);

  const updateBudget = async (cat, value) => {
    const newBudgets = { ...budgets, [cat]: value };
    setBudgets(newBudgets);

    if (budgetDocId) {
      await setDoc(doc(db, "budgets", budgetDocId), { uid: user.uid, values: newBudgets });
    } else {
      const docRef = await addDoc(collection(db, "budgets"), { uid: user.uid, values: newBudgets });
      setBudgetDocId(docRef.id);
    }
  };

  const overspendCategories = categories.filter(c => {
    const spent = transactions.filter(t => t.category===c && t.type==="expense").reduce((sum, t) => sum+t.amount,0);
    return budgets[c] && spent > budgets[c];
  });

  return (
    <div className="budget-box">
      <h2>Monthly Spending Limit</h2>
      {categories.map(c => {
        const spent = transactions.filter(t => t.category===c && t.type==="expense").reduce((sum, t) => sum+t.amount,0);
        return (
          <div key={c} className="budget-item">
            <span><strong>{c}</strong> : Spent = ₹{spent}</span>
            <input type="number" min="0" value={budgets[c]||""} onChange={e=>updateBudget(c, Number(e.target.value))} />
            {overspendCategories.includes(c) && <span className="alert">⚠ Overspent!</span>}
          </div>
        );
      })}
    </div>
  );
}
