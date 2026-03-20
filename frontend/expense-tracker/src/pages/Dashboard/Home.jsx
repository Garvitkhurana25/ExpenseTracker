import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useUserAuth } from "../../hooks/useUserAuth";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import InfoCard from "../../components/Cards/InfoCard";
import { LuHandCoins, LuWalletMinimal, LuInfo } from "react-icons/lu";
import { IoMdCard } from "react-icons/io";
import { addThousandSeperator } from "../../utils/helper";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import ExpenseTransactions from "../../components/Dashboard/ExpenseTransactions";
import Last30DaysExpenses from "../../components/Dashboard/last30DaysExpenses";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import RecentIncome from "../../components/Dashboard/RecentIncome";
import FinancialStats from "../../components/Dashboard/FinancialStats"; // Import the new component

const Home = () => {
  useUserAuth();
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparison, setComparison] = useState({
    currentTotal: 0,
    lastTotal: 0,
    currentIncomeTotal: 0,
    yearlyCurrent: 0,
    yearlyLast: 0,
    needsWarning: false,
    needsYearlyWarning: false,
    difference: 0,
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`${API_PATHS.DASHBOARD.GET_DATA}`);
      if (response.data) {
        setDashboardData(response.data);
      }
    } catch (error) {
      console.log("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComparison = async () => {
    try {
      const res = await axiosInstance.get("/api/v1/stats/compare-months");
      if (res.data) {
        setComparison(res.data);
      }
    } catch (error) {
      console.error("Comparison API error:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchComparison();
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        {/* Monthly Alert Logic */}
        {comparison.currentTotal === 0 && comparison.lastTotal === 0 ? (
          <div className="mb-6 px-4 py-3 bg-gray-50 text-gray-500 text-sm rounded-xl border border-gray-200 italic">
            📊 No transactions found for comparison this month.
          </div>
        ) : comparison.needsWarning ? (
          <div className="mb-6 flex items-center gap-4 bg-purple-50 border border-purple-100 p-4 rounded-xl shadow-sm">
            <div className="bg-purple-100 p-2 rounded-full text-purple-600">
              <LuInfo size={20} />
            </div>
            <div>
              <p className="text-purple-900 font-medium">Spending Alert</p>
              <p className="text-purple-700 text-sm">
                You've spent <strong>₹{addThousandSeperator(comparison.currentTotal - comparison.lastTotal)}</strong> more than last month.
                <br /><strong>You should focus on saving money.</strong>
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-6 px-4 py-3 bg-emerald-50 text-emerald-700 text-sm rounded-xl inline-flex items-center gap-2 border border-emerald-100">
            <span>✅</span>
            <span>Great job! Your spending is lower than last month.</span>
          </div>
        )}

        {/* Yearly Alert Logic */}
        {comparison.needsYearlyWarning && (
          <div className="mb-6 flex items-center gap-4 bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-sm">
            <div className="bg-amber-100 p-2 rounded-full text-amber-600">
              <LuInfo size={20} />
            </div>
            <div>
              <p className="text-amber-900 font-medium">Annual Spending Insight</p>
              <p className="text-amber-700 text-sm">
                In this year (2026), you've already spent <strong>₹{addThousandSeperator(comparison.yearlyCurrent)}</strong>. This is trending higher than 2025.
              </p>
            </div>
          </div>
        )}

        {/* Main Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandSeperator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
            subtitle="Overall remaining balance"
          />

          <InfoCard
            icon={<LuWalletMinimal />}
            label="Total Income"
            value={addThousandSeperator(dashboardData?.totalIncome || 0)}
            color="bg-orange-500"
            subtitle={`This Month: ₹${addThousandSeperator(comparison.currentIncomeTotal || 0)}`}
          />

          <InfoCard
            icon={<LuHandCoins />}
            label="Total Expense"
            value={addThousandSeperator(dashboardData?.totalExpense || 0)}
            color="bg-red-500"
            subtitle={`This Month: ₹${addThousandSeperator(comparison.currentTotal || 0)}`}
          />
        </div>

        {/* New Chart & Filter Component */}
        <FinancialStats />

        {/* Grids and Overviews */}
        <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/all-transactions")}
          />
          <FinanceOverview
            totalBalance={dashboardData?.totalBalance || 0}
            totalIncome={dashboardData?.totalIncome || 0}
            totalExpense={dashboardData?.totalExpense || 0}
          />
          <ExpenseTransactions
            transactions={dashboardData?.last30DaysExpenses?.transactions || []}
            onSeeMore={() => navigate("/all-transactions")}
          />
          <RecentIncome
            transactions={dashboardData?.last60DaysIncome?.transaction || []}
            onSeeMore={() => navigate("/all-transactions")}
          />
          <Last30DaysExpenses
            data={dashboardData?.last30DaysExpenses?.transactions || []}
          />
          <RecentIncomeWithChart
            data={dashboardData?.last60DaysIncome?.transaction?.slice(0, 4) || []}
            totalIncome={dashboardData?.totalIncome || 0}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;