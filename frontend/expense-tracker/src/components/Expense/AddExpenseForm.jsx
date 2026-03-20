import React, { useState, useEffect } from 'react'
import Input from '../Inputs/Input'


const AddExpenseForm = ({ onAddExpense, data }) => {
    // Note: Kept the state name 'income' to match your original style but ensured keys match your Expense inputs.
    const [income, setIncome] = useState({
        category: "",
        amount: "",
        date: "",
        icon: "",
    });

    // Automatically fills the form when editing an existing expense
    useEffect(() => {
        if (data) {
            setIncome({
                category: data.category || "",
                amount: data.amount || "",
                // Formats the date string to YYYY-MM-DD for the HTML input
                date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
                icon: data.icon || "",
            });
        } else {
            // Resets form for a fresh "Add" action
            setIncome({ category: "", amount: "", date: "", icon: "" });
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
                value={income.category}
                onChange={({ target }) => handleChange("category", target.value)}
                label="Category"
                placeholder="Rent, Groceries, etc"
                type='text'
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
                    onClick={() => onAddExpense(income)}
                >
                    {data ? "Update Expense" : "Add Expense"}
                </button>
            </div>
        </div>
    )
}

export default AddExpenseForm