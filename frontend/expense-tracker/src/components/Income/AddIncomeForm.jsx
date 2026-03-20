import React, { useState, useEffect } from 'react'
import Input from '../Inputs/Input';
// import EmojiPickerPopup from '../EmojiPickerPopup';

const AddIncomeForm = ({ onAddIncome, data }) => {
    const [income, setIncome] = useState({
        source: "",
        amount: "",
        date: "",
        icon: "",
    });

    // CRITICAL: This updates the form fields whenever 'data' changes (e.g., clicking a different edit button)
    useEffect(() => {
        if (data) {
            setIncome({
                source: data.source || "",
                amount: data.amount || "",
                // Formats the date to YYYY-MM-DD so the HTML date input can read it
                date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
                icon: data.icon || "",
            });
        } else {
            // Reset form if there is no data (Adding new)
            setIncome({ source: "", amount: "", date: "", icon: "" });
        }
    }, [data]);

    const handleChange = (key, value) => setIncome({ ...income, [key]: value });

    return (
        <div className=''>
            <EmojiPickerPopup
                icon={income.icon}
                onSelect={(selectedIcon) => handleChange("icon", selectedIcon)}
            />
            <Input
                value={income.source}
                onChange={({ target }) => handleChange("source", target.value)}
                label="Income Source"
                placeholder="Freelancer, Salary etc."
                type="text"
            />

            <Input
                value={income.amount}
                onChange={({ target }) => handleChange("amount", target.value)}
                label="Amount"
                placeholder=""
                type="number"
            />
            <Input
                value={income.date}
                onChange={({ target }) => handleChange("date", target.value)}
                label="Date"
                placeholder=""
                type="date"
            />

            <div className='flex justify-end mt-6'>
                <button
                    type='button'
                    className='add-btn add-btn-fill'
                    onClick={() => onAddIncome(income)}
                >
                    {/* Change button text based on mode */}
                    {data ? "Update Income" : "Add Income"}
                </button>
            </div>
        </div>
    )
}

export default AddIncomeForm