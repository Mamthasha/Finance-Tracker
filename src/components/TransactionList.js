import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export default function TransactionList({ transactions }) {
  const deleteTransaction = async (id) => {
    await deleteDoc(doc(db, "transactions", id));
  };

  return (
    <div className="list-container">
      <h2>Transactions</h2>
      {transactions.map(t => (
        <div key={t.id} className={`transaction-item ${t.type==="income"?"income-card":"expense-card"}`}>
          <div className="transaction-left">
            <span>{t.title}</span>
            <span>{t.type} | {t.category}</span>
          </div>
          <div className="transaction-right">
            <span>{t.type==="income"?"+":"-"}₹{t.amount}</span>
            <button onClick={()=>deleteTransaction(t.id)}>✖</button>
          </div>
        </div>
      ))}
    </div>
  );
}
