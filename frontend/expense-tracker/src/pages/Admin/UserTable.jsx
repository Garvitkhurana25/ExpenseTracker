import React from 'react';
import { LuTrash2, LuUser } from 'react-icons/lu';

const UserTable = ({ users, onDeleteUser }) => {
    return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
    <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50 text-gray-600 text-sm uppercase">
        <tr>
            <th className="p-4 font-semibold">User</th>
            <th className="p-4 font-semibold">Email</th>
            <th className="p-4 font-semibold">Joined Date</th>
            <th className="p-4 font-semibold text-right">Actions</th>
        </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
        {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
            <td className="p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                <LuUser size={16} />
                </div>
                <span className="font-medium text-gray-800">{user.fullName}</span>
            </td>
            <td className="p-4 text-gray-600">{user.email}</td>
            <td className="p-4 text-gray-400 text-sm">
                {new Date(user.createdAt).toLocaleDateString('en-IN')}
            </td>
            <td className="p-4 text-right">
                <button 
                onClick={() => onDeleteUser(user._id)}
                className="text-gray-400 hover:text-red-500 transition-colors p-2"
                title="Delete User"
                >
                <LuTrash2 size={18} />
                </button>
            </td>
            </tr>
        ))}
        </tbody>
    </table>
    {users.length === 0 && (
        <div className="p-8 text-center text-gray-400">No users found on the platform.</div>
    )}
    </div>
    );
};

const UserDetailedTable = ({ users }) => (
    <table className="w-full text-left bg-white rounded-lg overflow-hidden shadow-sm">
        <thead className="bg-gray-50 text-gray-600 text-sm">
            <tr>
                <th className="p-4">User</th>
                <th className="p-4 text-green-600">Total Income (Entries)</th>
                <th className="p-4 text-red-600">Total Expense (Entries)</th>
                <th className="p-4">Net Balance</th>
            </tr>
        </thead>
        <tbody className="divide-y">
            {users?.map(u => (
                <tr key={u._id}>
                    <td className="p-4 font-medium">{u.fullName}</td>
                    <td className="p-4 text-sm">₹{u.totalIncome} ({u.incomeEntries})</td>
                    <td className="p-4 text-sm">₹{u.totalExpense} ({u.expenseEntries})</td>
                    <td className="p-4 font-bold">₹{u.totalIncome - u.totalExpense}</td>
                </tr>
            ))}
        </tbody>
    </table>
);

export default UserTable;