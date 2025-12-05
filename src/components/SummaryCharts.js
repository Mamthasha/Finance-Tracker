import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const pieColors = ["#2e7d32", "#c62828", "#ff9800", "#2196f3", "#9c27b0"];

export default function SummaryCharts({ transactions, filteredTransactions, categories, budgets }) {
  const incomeTotal = filteredTransactions.filter(t => t.type==="income").reduce((sum,t)=>sum+t.amount,0);
  const expenseTotal = filteredTransactions.filter(t => t.type==="expense").reduce((sum,t)=>sum+t.amount,0);
  const balance = incomeTotal - expenseTotal;

  // Month-wise
  const monthsMap = {};
  transactions.forEach(t => {
    const month = new Date(t.date).toLocaleString("default",{month:"short",year:"numeric"});
    if (!monthsMap[month]) monthsMap[month]={income:0,expenses:0};
    if(t.type==="income") monthsMap[month].income += t.amount;
    else monthsMap[month].expenses += t.amount;
  });
  const dataMonths = Object.keys(monthsMap).map(m=>({month:m,...monthsMap[m]}));

  // Category pie
  const categoryMap = {};
  filteredTransactions.forEach(t=>{
    if(!categoryMap[t.category]) categoryMap[t.category]=0;
    categoryMap[t.category]+=t.amount;
  });
  const categoryData = Object.keys(categoryMap).map(c=>({name:c,value:categoryMap[c]}));

  return (
    <>
      <div className="summary-box">
        <div>Total Income: ₹{incomeTotal}</div>
        <div>Total Expense: ₹{expenseTotal}</div>
        <div>Balance: <span className={balance>=0?"income":"expense"}>₹{balance}</span></div>
      </div>

      <div className="chart-container">
        <h2>Income vs Expense</h2>
        <ResponsiveContainer width="100%" height={250}>
          {incomeTotal + expenseTotal>0 ? (
            <PieChart>
              <Pie data={[{name:"Income",value:incomeTotal},{name:"Expense",value:expenseTotal}]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {[0,1].map(i=><Cell key={i} fill={pieColors[i]} />)}
              </Pie>
              <Tooltip/><Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          ):<p>No data</p>}
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Month-wise Income vs Expense</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataMonths}>
            <CartesianGrid strokeDasharray="3 3"/>
            <XAxis dataKey="month"/>
            <YAxis/>
            <Tooltip/>
            <Legend/>
            <Bar dataKey="income" fill="#2e7d32"/>
            <Bar dataKey="expenses" fill="#c62828"/>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-container">
        <h2>Spending by Category</h2>
        <ResponsiveContainer width="100%" height={250}>
          {categoryData.length>0 ? (
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {categoryData.map((entry,index)=><Cell key={index} fill={pieColors[index%pieColors.length]} />)}
              </Pie>
              <Tooltip/><Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          ) : <p>No data</p>}
        </ResponsiveContainer>
      </div>
    </>
  );
}
