const User = require("../models/User");
const Income = require("../models/Income");
const Expense = require("../models/Expense");

exports.getAdminStats = async (req, res) => {
    try {

        const totalIncomeData = await Income.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]);
        const totalExpenseData = await Expense.aggregate([{ $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }]);


        const userIncomeStats = await Income.aggregate([
            { $group: { _id: "$userId", totalIncome: { $sum: "$amount" }, incomeEntries: { $sum: 1 } } }
        ]);


        const userExpenseStats = await Expense.aggregate([
            { $group: { _id: "$userId", totalExpense: { $sum: "$amount" }, expenseEntries: { $sum: 1 } } }
        ]);


        const users = await User.find({ role: "user" }).select("fullName email");


        const detailedUsers = users.map(user => {
            const income = userIncomeStats.find(s => s._id.toString() === user._id.toString());
            const expense = userExpenseStats.find(s => s._id.toString() === user._id.toString());

            return {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                totalIncome: income?.totalIncome || 0,
                incomeEntries: income?.incomeEntries || 0,
                totalExpense: expense?.totalExpense || 0,
                expenseEntries: expense?.expenseEntries || 0
            };
        });

        res.status(200).json({
            projectLevel: {
                totalIncome: totalIncomeData[0]?.total || 0,
                incomeEntries: totalIncomeData[0]?.count || 0,
                totalExpense: totalExpenseData[0]?.total || 0,
                expenseEntries: totalExpenseData[0]?.count || 0,
                platformBalance: (totalIncomeData[0]?.total || 0) - (totalExpenseData[0]?.total || 0)
            },
            userLevel: detailedUsers
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("-password");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        

        await Income.deleteMany({ userId: req.params.id });
        await Expense.deleteMany({ userId: req.params.id });

        res.status(200).json({ message: "User and their data removed" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.exportDataCSV = async (req, res) => {
    try {
        const users = await User.find({ role: "user" }).select("fullName email createdAt"); 
        const incomes = await Income.find();
        const expenses = await Expense.find();


        let csv = "User Name,Email,Joined Date,Total Income,Total Expense,Net Balance\n";


        users.forEach(user => {
            const userIncomes = incomes.filter(i => i.userId.toString() === user._id.toString());
            const userExpenses = expenses.filter(e => e.userId.toString() === user._id.toString());

            const totalIn = userIncomes.reduce((sum, i) => sum + i.amount, 0);
            const totalOut = userExpenses.reduce((sum, e) => sum + e.amount, 0);
            const balance = totalIn - totalOut;

            csv += `${user.fullName},${user.email},${new Date(user.createdAt).toLocaleDateString()},${totalIn},${totalOut},${balance}\n`;
        });


        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=platform_stats.csv');
        res.status(200).send(csv);
    } catch (error) {
        res.status(500).json({ message: "Export failed", error: error.message });
    }
};