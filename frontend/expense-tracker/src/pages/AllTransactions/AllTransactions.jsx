import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import TransactionInfoCard from "../../components/Cards/TransactionInfoCard";
import AddTransactionModal from "../../components/Modals/AddTransactionModal";
import InfoCard from "../../components/Cards/InfoCard"; 
import { LuWalletMinimal, LuHandCoins, LuDownload } from "react-icons/lu";
import { addThousandSeperator } from "../../utils/helper"; 
import toast from "react-hot-toast";
import moment from "moment";

const AllTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0 }); 
  const [editData, setEditData] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchAllData = async () => {
    try {
      const [incomeRes, expenseRes] = await Promise.all([
        axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
        axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE),
      ]);

      // Calculate totals
      const totalIncome = incomeRes.data.reduce((acc, curr) => acc + curr.amount, 0);
      const totalExpense = expenseRes.data.reduce((acc, curr) => acc + curr.amount, 0);
      setStats({ totalIncome, totalExpense });

      const combined = [
        ...incomeRes.data.map((i) => ({ ...i, type: "income" })),
        ...expenseRes.data.map((e) => ({ ...e, type: "expense" })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setTransactions(combined);
    } catch (error) {
      console.error("Error fetching transactions", error);
    }
  };

  const handleDelete = async (id, type) => {
    try {
      const path = type === "income" 
        ? `${API_PATHS.INCOME.DELETE_INCOME(id)}` 
        : `${API_PATHS.EXPENSE.DELETE_EXPENSE(id)}`;

      await axiosInstance.delete(path);
      toast.success("Transaction deleted successfully");
      fetchAllData();
    } catch (error) {
      toast.error("Failed to delete transaction");
    }
  };

  const handleEdit = (transaction) => {
    setEditData(transaction);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const [filterType, setFilterType] = useState('all'); // 'all', 'income', or 'expense'
const [startDate, setStartDate] = useState(moment().startOf('month').format('YYYY-MM-DD'));
const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
const [isDownloading, setIsDownloading] = useState(false);

const handleDownload = async () => {
    setIsDownloading(true);
    try {
        // Assuming you add DOWNLOAD_TRANSACTIONS: "/api/v1/stats/download-transactions" to your apiPaths.js
        const response = await axiosInstance.get(
            `/api/v1/stats/download-transactions?type=${filterType}&startDate=${startDate}&endDate=${endDate}`,
            { responseType: 'blob' } 
        );
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${filterType}_transactions_${startDate}_to_${endDate}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        toast.success("Transactions downloaded successfully!");
    } catch (error) {
        toast.error("Failed to download transactions");
        console.error(error);
    } finally {
        setIsDownloading(false);
    }
};
  return (
    <DashboardLayout activeMenu="All Transactions">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandSeperator(stats.totalIncome)}
            color="bg-orange-500"
          />
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandSeperator(stats.totalExpense)}
            color="bg-red-500"
          />
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-end justify-between">
    <div className="flex flex-wrap items-center gap-4">
        {/* Type Filter */}
        <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">Transaction Type</label>
            <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary bg-gray-50"
            >
                <option value="all">All Transactions</option>
                <option value="income">Income Only</option>
                <option value="expense">Expense Only</option>
            </select>
        </div>

        {/* Start Date */}
        <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">Start Date</label>
            <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary bg-gray-50"
            />
        </div>

        {/* End Date */}
        <div>
            <label className="text-xs text-gray-500 block mb-1 font-medium">End Date</label>
            <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary bg-gray-50"
            />
        </div>
    </div>

    {/* Export Button */}
    <button 
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg hover:opacity-90 transition disabled:opacity-50 font-medium"
    >
        <LuDownload size={18} />
        {isDownloading ? "Processing..." : "Export CSV"}
    </button>
</div>
        <div className="card">
          <h5 className="text-lg mb-6">Transaction History</h5>
          <div className="space-y-2">
            {transactions.map((item) => (
              <TransactionInfoCard
                key={item._id}
                title={item.type === "income" ? item.source : item.category}
                icon={item.icon}
                date={moment(item.date).format("Do MMM YYYY")}
                amount={item.amount}
                type={item.type}
                onDelete={() => handleDelete(item._id, item.type)}
                onEdit={() => handleEdit(item)} 
              />
            ))}
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isEditModalOpen}
        onClose={() => {
            setIsEditModalOpen(false);
            setEditData(null);
        }}
        onRefresh={fetchAllData}
        initialData={editData}
      />
    </DashboardLayout>
  );
};

export default AllTransactions;