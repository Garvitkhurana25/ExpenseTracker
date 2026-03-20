const User = require('../models/User');
const xlsx = require('xlsx');
const Income = require('../models/Income');

// Add all income sources
exports.addIncome = async (req, res) => {
    const userId = req.user.id;

    try {
        // Ensure 'description' and 'icon' are being pulled from the body
        const { icon, source, amount, date, description } = req.body;

        // Updated Validation
        if (!source || !amount || !date || !icon || !description) {
            return res.status(400).json({ message: "All Fields (including Icon and Description) are required" });
        }

        const newIncome = new Income({
            userId,
            icon,        // User selected icon
            source,
            amount,
            description, // Now explicitly saved
            date: new Date(date)
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
}
// Get all income sources
exports.getAllIncome = async (req, res) => {
    const userId = req.user.id;

    try{
        const income = await Income.find({userId}).sort({date: -1});
        res.json(income);
    } catch (error) {
        res.status(500).json({message:"Server Error"});
    }
};

// Delete income sources
exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findOneAndDelete({ 
            _id: req.params.id, 
            userId: req.user.id 
        });

        if (!income) {
            return res.status(404).json({ message: "Income record not found or unauthorized" });
        }
        res.json({ message: "Income Deleted Successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

exports.downloadIncomeExcel = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        let query = { userId: req.user.id }; // Only get THIS user's data

        // Apply date filter if provided
        if (startDate && endDate) {
            query.date = {
                $gte: moment(startDate).startOf('day').toDate(),
                $lte: moment(endDate).endOf('day').toDate()
            };
        }

        const incomes = await Income.find(query).sort({ date: -1 });

        // Build CSV string
        let csv = "Date,Title,Amount,Category,Description\n";
        incomes.forEach(income => {
            const formattedDate = moment(income.date).format("YYYY-MM-DD");
            // Ensure commas in descriptions don't break the CSV columns
            const safeDescription = income.description ? `"${income.description.replace(/"/g, '""')}"` : "N/A";
            
            csv += `${formattedDate},${income.title || 'N/A'},${income.amount},${income.category || 'N/A'},${safeDescription}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=income_report.csv');
        res.status(200).send(csv);

    } catch (error) {
        console.error("Download Error:", error);
        res.status(500).json({ message: "Server Error during download" });
    }
};

exports.updateIncome = async (req, res) => {
    const { id } = req.params; 
    const { source, amount, date, icon } = req.body; 

    try {

        const updatedIncome = await Income.findByIdAndUpdate(
            id,
            { source, amount, date, icon },
            { new: true, runValidators: true } 
        );

        if (!updatedIncome) {
            return res.status(404).json({ message: "Income record not found" });
        }

        res.status(200).json(updatedIncome);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};