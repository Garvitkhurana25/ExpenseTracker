import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/Income/IncomeOverview";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import Model from "../../components/Model";
import AddIncomeForm from "../../components/Income/AddIncomeForm";
import toast from "react-hot-toast";
import IncomeList from "../../components/Income/IncomeList";
import DeleteAlert from "../../components/DeleteAlert";

const Income = () => {
    const [incomeData, setIncomeData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openDeleteAlert, setOpenDeleteAlert] = useState({
        show: false,
        data: null,
    });
    const [OpenAddIncomeModel, setOpenAddIncomeModel] = useState(false);
    const [editingIncome, setEditingIncome] = useState(null);

    const fetchIncomeDetails = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosInstance.get(`${API_PATHS.INCOME.GET_ALL_INCOME}`);
            if (response.data) {
                setIncomeData(response.data);
            }
        } catch (error) {
            console.log('Something Went Wrong. Please Try again later');
        } finally {
            setLoading(false);
        }
    };

    // Unified function to handle both Add and Edit
    const handleSaveIncome = async (income) => {
        const { source, amount, date, icon } = income;

        // Validation
        if (!source.trim()) {
            toast.error("Source is required");
            return;
        }
        if (!amount || isNaN(amount) || Number(amount) <= 0) {
            toast.error("Amount must be a valid number greater than zero");
            return;
        }
        if (!date) {
            toast.error("Date is Required");
            return;
        }

        try {
            if (editingIncome) {
                // UPDATE Logic
                await axiosInstance.put(`/api/v1/income/update-income/${editingIncome._id}`, {
                    source, amount, date, icon
                });
                toast.success("Income updated successfully");
            } else {
                // ADD Logic
                await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, {
                    source, amount, date, icon
                });
                toast.success("Income Added Successfully");
            }

            setEditingIncome(null);
        setOpenAddIncomeModel(false); // Changed to match your state name
        fetchIncomeDetails();
        } catch (error) {
            console.error("Error saving income:", error);
            toast.error(error.response?.data?.message || "Error saving income");
        }
    };

    const deleteIncome = async (id) => {
        try {
            await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
            setOpenDeleteAlert({ show: false, data: null });
            toast.success("Income Details Deleted Successfully");
            fetchIncomeDetails();
        } catch (error) {
            console.error("Error Deleting Income:", error.response?.data?.message || error.message);
        }
    };

    const handleDownloadIncomeDetails = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
                responseType: "blob"
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "Income_details.xlsx");
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error Downloading Income Details: ", error);
            toast.error("Failed to download Income details");
        }
    };

    useEffect(() => {
        fetchIncomeDetails();
    }, []);

    return (
        <DashboardLayout activeMenu="Income">
            <div className="my-5 mx-auto">
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <IncomeOverview
                            transactions={incomeData}
                            onAddIncome={() => {
                                setEditingIncome(null); // Ensure form is empty for new add
                                setOpenAddIncomeModel(true);
                            }}
                        />
                    </div>

                    <IncomeList
                        transactions={incomeData}
                        onDelete={(id) => {
                            setOpenDeleteAlert({ show: true, data: id });
                        }}
                        // MAKE SURE THIS IS NAMED 'onEdit'
                        onEdit={(income) => {
                            setEditingIncome(income);
                            setOpenAddIncomeModel(true);
                        }}
                        onDownload={handleDownloadIncomeDetails}
                    />
                </div>

                <Model
                    isOpen={OpenAddIncomeModel}
                    onClose={() => {
                        setOpenAddIncomeModel(false);
                        setEditingIncome(null);
                    }}
                    title={editingIncome ? "Edit Income" : "Add Income"}
                >
                    <AddIncomeForm 
                        onAddIncome={handleSaveIncome} 
                        initialData={editingIncome} // Pass the data to the form
                    />
                </Model>

                <Model
                    isOpen={openDeleteAlert.show}
                    onClose={() => setOpenDeleteAlert({ show: false, data: null })}
                    title="Delete Income"
                >
                    <DeleteAlert
                        content="Are you sure you want to delete this income detail?"
                        onDelete={() => deleteIncome(openDeleteAlert.data)}
                    />
                </Model>
            </div>
        </DashboardLayout>
    );
};

export default Income;