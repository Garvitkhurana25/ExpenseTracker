import React, { useState, useEffect } from "react";

import axiosInstance from "../../utils/axiosInstance";

import { API_PATHS } from "../../utils/apiPaths";

import toast from "react-hot-toast";

import { LuX, LuWallet, LuCalendar, LuPenLine, LuTag, LuSmile } from "react-icons/lu";



const AddTransactionModal = ({ isOpen, onClose, onRefresh }) => {

    const [transactionType, setTransactionType] = useState("expense");

    const [amount, setAmount] = useState("");

    const [category, setCategory] = useState("");

    const [description, setDescription] = useState("");

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const [selectedIcon, setSelectedIcon] = useState("");

    const [setComparison] = useState({ currentTotal: 0, lastTotal: 0, needsWarning: false });



    const iconOptions = ["💰", "💼", "🏦", "🍕", "🚗", "🏠", "🛍️", "🎁", "📈", "🏥", "🍱", "🚕", "🏠", "📄"];



    useEffect(() => {

        if (!isOpen) {

            setAmount("");

            setCategory("");

            setDescription("");

            setSelectedIcon("");

            setDate(new Date().toISOString().split('T')[0]);

        }

    }, [isOpen]);



    const handleSave = async () => {



        if (!amount || !category || !date || !description || !selectedIcon) {

            return toast.error("All Fields (including Icon and Description) are required");

        }



        const isIncome = transactionType === "income";

        const path = isIncome ? API_PATHS.INCOME.ADD_INCOME : API_PATHS.EXPENSE.ADD_EXPENSE;



        const requestBody = {

            amount: Number(amount),



            [isIncome ? "source" : "category"]: category.trim(),

            description: description.trim(),

            date: new Date(date).toISOString(),

            icon: selectedIcon, 

        };



        try {

            const response = await axiosInstance.post(path, requestBody);

            if (response.data) {

                toast.success(`${isIncome ? 'Income' : 'Expense'} added successfully!`);

                onRefresh();

                onClose();

            }

        } catch (error) {

            console.error("Submission Error:", error.response?.data);

            toast.error(error.response?.data?.message || "Failed to add transaction");

        }

    };



    if (!isOpen) return null;



    return (

        <div className="fixed inset-0 z-999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">

            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center p-6 border-b border-gray-50 sticky top-0 bg-white z-10">

                    <h2 className="text-lg font-bold text-gray-800">Add Transaction</h2>

                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">

                        <LuX size={20} className="text-gray-400" />

                    </button>

                </div>



                <div className="p-6 space-y-4">


                    <div className="flex bg-gray-100 p-1 rounded-2xl">

                        <button

                            type="button"

                            onClick={() => setTransactionType("expense")}

                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${transactionType === "expense" ? "bg-white text-red-500 shadow-sm" : "text-gray-500"}`}

                        >

                            Expense

                        </button>

                        <button

                            type="button"

                            onClick={() => setTransactionType("income")}

                            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${transactionType === "income" ? "bg-white text-green-600 shadow-sm" : "text-gray-500"}`}

                        >

                            Income

                        </button>

                    </div>



                    {/* Icon Selector */}

                    <div className="space-y-2">

                        <p className="text-[10px] font-bold text-gray-400 uppercase ml-1 flex items-center gap-1">

                            <LuSmile size={12} /> Select Icon

                        </p>

                        <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 rounded-2xl border border-gray-100">

                            {iconOptions.map((icon) => (

                                <button

                                    key={icon}

                                    type="button"

                                    onClick={() => setSelectedIcon(icon)}

                                    className={`h-10 w-10 flex items-center justify-center rounded-xl transition-all border-2 ${selectedIcon === icon ? "border-green-500 bg-white text-xl shadow-sm" : "border-transparent text-lg hover:bg-gray-200"}`}

                                >

                                    {icon}

                                </button>

                            ))}

                        </div>

                    </div>


                    <div className="space-y-3">

                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">

                            <LuWallet className={transactionType === "expense" ? "text-red-400" : "text-green-500"} size={22} />

                            <input

                                type="number"

                                placeholder="Amount"

                                className="w-full bg-transparent text-xl font-bold outline-none"

                                value={amount}

                                onChange={(e) => setAmount(e.target.value)}

                            />

                        </div>



                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">

                            <LuTag className="text-gray-400" size={22} />

                            <input

                                type="text"

                                placeholder={transactionType === "income" ? "Source (Salary, Freelance)" : "Category (Food, Rent)"}

                                className="w-full bg-transparent outline-none font-medium text-gray-700"

                                value={category}

                                onChange={(e) => setCategory(e.target.value)}

                            />

                        </div>



                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">

                            <LuCalendar className="text-gray-400" size={22} />

                            <input

                                type="date"

                                className="w-full bg-transparent outline-none text-gray-700 font-medium"

                                value={date}

                                onChange={(e) => setDate(e.target.value)}

                            />

                        </div>



                        <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100 focus-within:ring-2 focus-within:ring-primary/20 transition-all">

                            <LuPenLine className="text-gray-400" size={22} />

                            <input

                                type="text"

                                placeholder="Description"

                                className="w-full bg-transparent outline-none text-sm text-gray-600"

                                value={description}

                                onChange={(e) => setDescription(e.target.value)}

                            />

                        </div>

                    </div>



                    <button

                        type="button"

                        onClick={handleSave}

                        className={`w-full mt-2 py-4 rounded-2xl text-white font-bold shadow-lg transition-all active:scale-[0.98] ${transactionType === "expense" ? "bg-red-500 shadow-red-100 hover:bg-red-600" : "bg-green-600 shadow-green-100 hover:bg-green-700"}`}

                    >

                        Save Transaction

                    </button>

                </div>

            </div>

        </div>

    );

};



export default AddTransactionModal;

