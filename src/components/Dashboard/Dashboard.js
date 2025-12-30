import React from "react";
import Header from "../Header/Header";
import TransactionForm from "../TransactionForm/TransactionForm";
import SummaryCards from "../SummaryCards/SummaryCards";
import BudgetBox from "../BudgetBox/BudgetBox";
import SummaryCharts from "../SummaryCharts/SummaryCharts";
import Filters from "../Filters/Filters";
import TransactionList from "../TransactionList/TransactionList";
import EditModal from "../Modal/EditModal";
import DeleteModal from "../Modal/DeleteModal";
import DateFilter from "../DateFilter";
import Footer from "../Footer/Footer";

export default function DashboardPage(){
  return (
    <>
      <Header />
      <main className="container-fluid">
        <TransactionForm />
        <SummaryCards />
        <BudgetBox />
        <SummaryCharts />
        <Filters />
        <DateFilter />
        <TransactionList />
      </main>
      <Footer />
      <EditModal />
      <DeleteModal />
    </>
  );
}