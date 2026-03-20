import React, { useState, useEffect } from "react";
import moment from "moment";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { LuFilter, LuTrendingUp } from "react-icons/lu";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";

const FinancialStats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(moment().subtract(1, "year").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(moment().format("YYYY-MM-DD"));

  const fetchStats = async () => {
    setLoading(true);
    try {
      // 1. Log the exact URL it's trying to reach
      const url = `${API_PATHS.STATS.COMPARE_MONTHS}?startDate=${startDate}&endDate=${endDate}`;
      console.log("TRYING TO FETCH FROM:", url);

      const response = await axiosInstance.get(url);
      console.log("BACKEND DATA CHECK:", response.data);

      const { currentIncomeTotal, currentTotal, chartData: monthlyData } = response.data;

      const finalChartData = monthlyData && monthlyData.length > 0 
        ? monthlyData 
        : [{ name: 'Selected Period', Income: currentIncomeTotal || 0, Expense: currentTotal || 0 }];

      const totalRangeIncome = finalChartData.reduce((acc, curr) => acc + (curr.Income || 0), 0);
      const totalRangeExpense = finalChartData.reduce((acc, curr) => acc + (curr.Expense || 0), 0);

      const spendPercentage = totalRangeIncome > 0 
        ? ((totalRangeExpense / totalRangeIncome) * 100).toFixed(1) 
        : 0;

      setData({
        chartData: finalChartData,
        income: totalRangeIncome,
        expense: totalRangeExpense,
        spendPercentage: spendPercentage,
        insightText: `In this period, you spent ${spendPercentage}% of your total income.`
      });
    } catch (error) {
      // 2. Force an alert to show the exact error code
      console.error("FULL ERROR:", error.response || error);
      alert(`API FAILED! Status Code: ${error.response?.status || 'Unknown'}. Message: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm my-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Financial Analysis</h2>
          <p className="text-sm text-gray-500">Compare income vs expenses over time</p>
        </div>

        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
          <input
            type="date"
            className="bg-transparent text-sm outline-none border-none focus:ring-0"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span className="text-gray-400">-</span>
          <input
            type="date"
            className="bg-transparent text-sm outline-none border-none focus:ring-0"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
          <button
            onClick={fetchStats}
            className="p-2 bg-primary text-white rounded-lg hover:opacity-90 transition-all"
          >
            <LuFilter size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-87.5 flex items-center justify-center text-gray-400">Loading data...</div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-87.5 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData}>
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    angle={-20} // Slants the text for better fit
                    textAnchor="end"
                    height={50} // Gives extra space for the slanted text
                />
                <YAxis hide />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Bar dataKey="Income" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center gap-6">
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-2 text-primary mb-2">
                <LuTrendingUp size={20} />
                <span className="font-medium text-sm">Spending Ratio</span>
              </div>
              <h3 className="text-3xl font-bold text-slate-900">{data.spendPercentage}%</h3>
              <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                {data.insightText}
              </p>
              <div className="w-full bg-slate-200 h-2 mt-4 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(data.spendPercentage, 100)}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Income</p>
                <p className="font-semibold text-orange-600">₹{data.income.toLocaleString()}</p>
              </div>
              <div className="text-center border-l border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Expense</p>
                <p className="font-semibold text-red-600">₹{data.expense.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-87.5 flex items-center justify-center text-gray-400">No data found for this range.</div>
      )}
    </div>
  );
};

export default FinancialStats;