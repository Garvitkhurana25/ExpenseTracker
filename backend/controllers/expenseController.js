// const User = require('../models/User');
const xlsx = require('xlsx');
const Expense = require('../models/Expense');

// Add all Expense sources
exports.addExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const{ icon, category, amount, date} = req.body;

        // Validation: Check for Missing Data!
        if(!category || !amount || !date){
            return res.status(400).json({message:"All Fields are required"});
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    }
    catch (error) {
    res.status(500).json({message:"Server Error"});
}
} 

// Get all Expense sources
exports.getAllExpense = async (req, res) => {
    const userId = req.user.id;

    try{
        const expense = await Expense.find({userId}).sort({date: -1});
        res.json(expense);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
};

// Delete Expense sources
exports.deleteExpense = async (req, res) => {
    try{
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message:"Expense Deleted Successfully"});
    }catch (error) {
        res.status(500).json({message:"Server Error"});
    }
};

// Download Expense EXcel
exports.downloadExpenseExcel = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { userId: req.user.id }; // Lock it to the logged-in user

        // Apply the date filter if the frontend sends it
        if (startDate && endDate) {
            query.date = {
                $gte: moment(startDate).startOf('day').toDate(),
                $lte: moment(endDate).endOf('day').toDate()
            };
        }

        const expenses = await Expense.find(query).sort({ date: -1 });

        // Build the CSV string
        let csv = "Date,Title,Amount,Category,Description\n";
        expenses.forEach(expense => {
            const formattedDate = moment(expense.date).format("YYYY-MM-DD");
            // Wrap description in quotes to prevent commas from breaking the CSV
            const safeDescription = expense.description ? `"${expense.description.replace(/"/g, '""')}"` : "N/A";
            
            csv += `${formattedDate},${expense.title || 'N/A'},${expense.amount},${expense.category || 'N/A'},${safeDescription}\n`;
        });

        // Tell the browser/Postman this is a downloadable file
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=expense_report.csv');
        res.status(200).send(csv);

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Server Error during download" });
    }
};

exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { category, amount, date, icon, notes } = req.body;

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            id,
            { category, amount, date, icon, notes },
            { new: true, runValidators: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense record not found" });
        }

        res.status(200).json(updatedExpense);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.getCategoryStats = async (req, res) => {
    try {
        const stats = await Expense.aggregate([
            { $match: { userId: req.user._id } }, 
            {
                $group: {
                    _id: "$category", 
                    totalAmount: { $sum: "$amount" } 
                }
            },
            { $sort: { totalAmount: -1 } } // Shows the highest spending first
        ]);

        const totalExpense = stats.reduce((acc, curr) => acc + curr.totalAmount, 0);

        res.status(200).json({
            totalExpense,
            categories: stats
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching category stats" });
    }
};