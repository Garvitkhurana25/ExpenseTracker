const mongoose = require("mongoose");
const moment = require("moment");
const Expense = require("../models/Expense"); 
const Income = require("../models/Income");

exports.getSpendingComparison = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // 1. Get custom dates from frontend (Query Params)
        // If no dates are provided, default to the last 6 months
        
        const { startDate, endDate } = req.query;
        const customStart = startDate ? moment(startDate).startOf('day').toDate() : moment().subtract(6, 'months').startOf('month').toDate();
        const customEnd = endDate ? moment(endDate).endOf('day').toDate() : moment().endOf('day').toDate();

        // Standard Dashboard Ranges
        const startOfthisMonth = moment().startOf('month').toDate();
        const endOfthisMonth = moment().endOf('month').toDate();
        const startOflastMonth = moment().subtract(1, 'month').startOf('month').toDate();
        const endOflastMonth = moment().subtract(1, 'month').endOf('month').toDate();
        const startOfCurrentYear = moment().startOf('year').toDate(); 
        const startOfLastYear = moment().subtract(1, 'year').startOf('year').toDate(); 
        const endOfLastYear = moment().subtract(1, 'year').endOf('year').toDate(); 

        // Helper for simple sums
        const getSum = async (Model, start, end) => {
            const result = await Model.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]);
            return result[0]?.total || 0;
        };

        // 2. Monthly Breakdown Aggregation (This makes the filter work for 3/6 months)
        const getMonthlyStats = async (Model, start, end) => {
            return await Model.aggregate([
                { $match: { userId: new mongoose.Types.ObjectId(userId), date: { $gte: start, $lte: end } } },
                { $group: { 
                    _id: { month: { $month: "$date" }, year: { $year: "$date" } }, 
                    total: { $sum: "$amount" } 
                }},
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);
        };

        // Execute Standard Queries
        const currentTotal = await getSum(Expense, startOfthisMonth, endOfthisMonth);
        const lastTotal = await getSum(Expense, startOflastMonth, endOflastMonth);
        const currentIncomeTotal = await getSum(Income, startOfthisMonth, endOfthisMonth);
        const yearlyCurrent = await getSum(Expense, startOfCurrentYear, moment().toDate());
        const yearlyLast = await getSum(Expense, startOfLastYear, endOfLastYear);

        // Execute Custom Range Queries
        const monthlyExpenses = await getMonthlyStats(Expense, customStart, customEnd);
        const monthlyIncomes = await getMonthlyStats(Income, customStart, customEnd);

        // 3. Format Data for the BarChart
        // We merge Incomes and Expenses by month name
        const allMonths = [...new Set([...monthlyExpenses, ...monthlyIncomes].map(item => `${item._id.year}-${item._id.month}`))];

        allMonths.sort((a, b) => {
            const [yearA, monthA] = a.split('-').map(Number);
            const [yearB, monthB] = b.split('-').map(Number);
            return yearA !== yearB ? yearA - yearB : monthA - monthB;
        });
        
        const chartData = allMonths.map(monthKey => {
            const [year, month] = monthKey.split('-').map(Number);
            const exp = monthlyExpenses.find(e => e._id.month === month && e._id.year === year)?.total || 0;
            const inc = monthlyIncomes.find(i => i._id.month === month && i._id.year === year)?.total || 0;
            
            return {
                name: `${moment().month(month - 1).format("MMM")} ${year}`, 
                Expense: exp,
                Income: inc
            };
        });

        // --- Send Response ---
        return res.json({
            currentTotal,
            lastTotal,
            currentIncomeTotal,
            yearlyCurrent,
            yearlyLast,
            needsWarning: currentTotal > lastTotal,
            needsYearlyWarning: yearlyCurrent > yearlyLast,
            chartData // This is what the Filtered Bar Chart will use
        });

    } catch (error) {
        console.error("Comparison Error:", error);
        return res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.downloadAllTransactions = async (req, res) => {
    try {
        // Grab filters from the frontend query
        const { startDate, endDate, type } = req.query;
        const userId = req.user.id; // Lock to current user

        // Build the date filter if dates are provided
        let dateFilter = {};
        if (startDate && endDate) {
            dateFilter = {
                date: {
                    $gte: moment(startDate).startOf('day').toDate(),
                    $lte: moment(endDate).endOf('day').toDate()
                }
            };
        }

        let transactions = [];

        // Fetch Incomes if type is 'all' or 'income'
        if (!type || type === 'all' || type === 'income') {
            const incomes = await Income.find({ userId, ...dateFilter }).lean();
            // Tag them so we know they are incomes in the CSV
            const formattedIncomes = incomes.map(i => ({ ...i, type: 'Income' }));
            transactions = [...transactions, ...formattedIncomes];
        }

        // Fetch Expenses if type is 'all' or 'expense'
        if (!type || type === 'all' || type === 'expense') {
            const expenses = await Expense.find({ userId, ...dateFilter }).lean();
            // Tag them so we know they are expenses in the CSV
            const formattedExpenses = expenses.map(e => ({ ...e, type: 'Expense' }));
            transactions = [...transactions, ...formattedExpenses];
        }

        // Sort all transactions by date (Newest first)
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Build the CSV String
        let csv = "Date,Type,Title,Amount,Category,Description\n";
        transactions.forEach(t => {
            const formattedDate = moment(t.date).format("YYYY-MM-DD");
            const safeDescription = t.description ? `"${t.description.replace(/"/g, '""')}"` : "N/A";
            
            // Format amount with a + or - for clarity
            const amountPrefix = t.type === 'Income' ? '+' : '-';
            
            csv += `${formattedDate},${t.type},${t.title || 'N/A'},${amountPrefix}${t.amount},${t.category || 'N/A'},${safeDescription}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=transactions_history.csv');
        res.status(200).send(csv);

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Server Error during download" });
    }
};