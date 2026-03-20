import React, { useEffect, useState } from "react";
// import useUserAuth from "../../hooks/useUserAuth"
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { API_PATHS } from "../../utils/apiPaths";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosinstance";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import Model from "../../components/Model";
// import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import ExpenseList from "../../components/Expense/ExpenseList";
import DeleteAlert from "../../components/DeleteAlert";
const Expense = () => {
    
        const [expenseData,setExpenseData] = useState([]);
        const [loading,setLoading] = useState(false);
        const [openDeleteAlert, setOpenDeleteAlert] = useState({
            show: false,
            data: null,
        });
        const [OpenAddExpenseModel,setOpenAddExpenseModel] = useState(false);
        const [editingExpense, setEditingExpense] = useState(null);


        // Get All Expenses
        const fetchExpenseDetails = async() => {
        if(loading) return;

        setLoading(true);
        
        try{
            const response = await axiosInstance.get(
                `${API_PATHS.EXPENSE.GET_ALL_EXPENSE}`
            );

            if(response.data){
                setExpenseData(response.data);
            }
        }catch(error){
            console.log('Something Went Wrong. Please Try again later')
        } finally{
            setLoading(false);
        }
    };


    // Handle Add Expense
    const handleAddExpense = async(expense) => {
        const {category,amount,date,icon} = expense;

        if(!category.trim()) {
            toast.error("Category is required");
            return;
        }

        if (!amount || isNaN(amount) || Number(amount) <=0){
            toast.error("Amount Should be a valid number or greater than zero ")
            return;
        }

        if(!date){
            toast.error("Date is Required");
            return;
        }
        try{
            await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, {
                category,
                amount,
                date,
                icon,
            });
            setOpenAddExpenseModel(false);
            toast.success("Expense Added SuccessFully")
            fetchExpenseDetails();
        }catch(error){
            console.error(
                "Error Adding Expense",error.response?.data?.message || error.message);
        }
    };

    const handleSaveExpense = async (expenseData) => {
    try {
        if (editingExpense) {
            // PUT request for editing
            await axiosInstance.put(`/api/v1/expense/update-expense/${editingExpense._id}`, expenseData);
            toast.success("Expense updated successfully");
        } else {
            // POST request for adding new
            await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, expenseData);
            toast.success("Expense added successfully");
        }
        
        setEditingExpense(null);
        setOpenAddExpenseModel(false);
        fetchExpenseDetails(); // Refresh list
    } catch (error) {
        toast.error("Error saving expense");
    }
};

        // Delete Expense
    const deleteExpense = async(id) => {
        try{
            await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id))

            setOpenDeleteAlert({show: false, data: null});
            toast.success("Expense Details Deleted Successfully");
            fetchExpenseDetails();
        }catch(error){
            console.error("Error Deleting Expense:",error.response?.data?.message || error.message);
        }
    };

    // Handle Download Expense Details
    const handleDownloadExpenseDetails = async(expense) => {
        try{
            const response = await axiosInstance.get(
                API_PATHS.EXPENSE.DOWNLOAD_EXPENSE,
                {
                    responseType:"blob"
                }
            );
            // Create a URL for the blob
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Expense_details.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        }catch(error)
        {
            console.error("Error Downloading Expense Details: ",error)
            toast.error("Failed to download expense details, Please Try again ");
        }
    };
    

    useEffect(() => {
        fetchExpenseDetails();

        return() => {};
    },[]);

    return (
        <DashboardLayout activeMenu="Expense">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div className="">
                        <ExpenseOverview 
                            transactions={expenseData}
                            onExpenseIncome={() => setOpenAddExpenseModel(true)}
                        />
                    </div>

                    <ExpenseList
                        transactions={expenseData}
                        onDelete={(id) => {
                            setOpenDeleteAlert({ show: true, data: id });
                        }}
                        onDownload={handleDownloadExpenseDetails}
                        // ADD THIS PROP BELOW
                        onEdit={(expense) => {
                            setEditingExpense(expense);
                            setOpenAddExpenseModel(true);
                        }}
                    />
                </div>

                <Model
                    isOpen={OpenAddExpenseModel}
                    onClose={() => {
                        setOpenAddExpenseModel(false);
                        setEditingExpense(null);
                    }}
                    title={editingExpense ? "Edit Expense" : "Add Expense"}
                >
                    <AddExpenseForm 
                        onAddExpense={handleSaveExpense} 
                        data={editingExpense} // Ensure this prop name matches your Form
                    />
</Model>

                <Model
                    isOpen={openDeleteAlert.show}
                    onClose={() => setOpenDeleteAlert({ show: false, data: null})}
                    title=" Delete Expense"
                >
                    <DeleteAlert
                        content="Are you sure ? You want to delete this Expense detail?"
                        onDelete={() => deleteExpense(openDeleteAlert.data)}
                    />
                </Model>
            </div>
        </DashboardLayout>
    )
} 
export default Expense