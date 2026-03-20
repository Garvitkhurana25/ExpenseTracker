import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { 
    LuSearch, LuTrendingUp, LuTrendingDown, LuWallet, 
    LuLogOut, LuTrash2, LuDownload, LuEye, LuEyeOff 
} from 'react-icons/lu';
import toast from 'react-hot-toast';

const UserDetailedTable = ({ users, onDeleteUser, hideFinancials }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-bold">
                <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Total Income (Count)</th>
                    <th className="p-4">Total Expense (Count)</th>
                    <th className="p-4">Net Balance</th>
                    <th className="p-4 text-right">Actions</th> 
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {users?.map(u => (
                    <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                            <p className="font-medium text-gray-800">{u?.fullName}</p>
                            <p className="text-xs text-gray-400">{u?.email}</p>
                        </td>
                        <td className="p-4 text-sm text-green-600 font-medium">
                            {hideFinancials ? "₹ XXXX" : `₹${u?.totalIncome || 0}`} 
                            <span className="text-gray-400 text-xs ml-1">({u?.incomeEntries || 0})</span>
                        </td>
                        <td className="p-4 text-sm text-red-600 font-medium">
                            {hideFinancials ? "₹ XXXX" : `₹${u?.totalExpense || 0}`} 
                            <span className="text-gray-400 text-xs ml-1">({u?.expenseEntries || 0})</span>
                        </td>
                        <td className={`p-4 font-bold ${(u?.totalIncome || 0) - (u?.totalExpense || 0) >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                            {hideFinancials ? "₹ XXXX" : `₹${(u?.totalIncome || 0) - (u?.totalExpense || 0)}`}
                        </td>
                        <td className="p-4 text-right">
                            <button 
                                onClick={() => onDeleteUser(u._id)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                            >
                                <LuTrash2 size={18} />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    // Pre-fill state to avoid initial undefined errors
    const [stats, setStats] = useState({
        projectLevel: { totalIncome: 0, totalExpense: 0, incomeEntries: 0, expenseEntries: 0, platformBalance: 0 },
        userLevel: []
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [hideFinancials, setHideFinancials] = useState(true);

    const fetchData = async () => {
        try {
            // NOTE: Make sure this route points to your getAdminStats controller
            const res = await axiosInstance.get('/api/v1/admin/stats');
            setStats(res.data);
        } catch (error) {
            console.error(error);
            toast.error("Error fetching admin stats");
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            try {
                await axiosInstance.delete(`/api/v1/admin/users/${id}`); 
                toast.success("User removed");
                fetchData(); 
            } catch (error) {
                toast.error(error.response?.data?.message || "Delete failed");
            }
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        toast.success("Logged out successfully");
        navigate("/login"); 
    };

    const handleExport = async () => {
        try {
            const response = await axiosInstance.get('/api/v1/admin/export-csv', {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'platform_data.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("CSV Downloaded Successfully");
        } catch (error) {
            toast.error("Failed to export data");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Safe filtering with fallback to empty array
    const filteredUsers = stats?.userLevel?.filter(user => 
        user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) || 
        user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Admin Global Overview</h1>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => {
                            if (hideFinancials) {
                                const confirmShow = window.confirm("Do you really want to see the amount?");
                                if (confirmShow) setHideFinancials(false);
                            } else {
                                setHideFinancials(true);
                            }
                        }}
                        className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                        title={hideFinancials ? "Show Amounts" : "Hide Amounts"}
                    >
                        {hideFinancials ? <LuEye size={18} /> : <LuEyeOff size={18} />}
                        {hideFinancials ? "Show" : "Hide"}
                    </button>

                    <button 
                        onClick={handleExport}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                        <LuDownload size={18} /> Export
                    </button>

                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors font-medium"
                    >
                        <LuLogOut size={18} /> Logout
                    </button>
                </div>
            </div>
            
            {/* Stats Cards - Now completely crash-proof */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg"><LuTrendingUp size={20}/></div>
                        <p className="text-gray-500 text-sm font-medium">Platform Income</p>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {hideFinancials ? "₹ XXXXXX" : `₹${stats?.projectLevel?.totalIncome || 0}`}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{stats?.projectLevel?.incomeEntries || 0} Entries</p>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg"><LuTrendingDown size={20}/></div>
                        <p className="text-gray-500 text-sm font-medium">Platform Expense</p>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {hideFinancials ? "₹ XXXXXX" : `₹${stats?.projectLevel?.totalExpense || 0}`}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">{stats?.projectLevel?.expenseEntries || 0} Entries</p>
                </div>

                <div className="p-6 bg-white border border-gray-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><LuWallet size={20}/></div>
                        <p className="text-gray-500 text-sm font-medium">Net Platform Balance</p>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">
                        {hideFinancials ? "₹ XXXXXX" : `₹${stats?.projectLevel?.platformBalance || 0}`}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1">Across all {stats?.userLevel?.length || 0} users</p>
                </div>
            </div>

            {/* SEARCH AND TABLE */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">User-Specific Breakdown</h2>
                <div className="relative w-80">
                    <input 
                        type="text" 
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <LuSearch className="absolute left-3 top-2.5 text-gray-400" />
                </div>
            </div>

            <UserDetailedTable 
                users={filteredUsers} 
                onDeleteUser={handleDeleteUser} 
                hideFinancials={hideFinancials} 
            />
        </div>
    );
};

export default AdminDashboard;