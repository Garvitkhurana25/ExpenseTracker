import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import moment from 'moment'

// 1. Added onEdit to the props destructuring
const ExpenseList = ({transactions, onDelete, onDownload, onEdit}) => {
    return (
    <div className='card'>
        <div className='flex items-center justify-between'>
            <h5 className='text-lg'>Expense Sources</h5>

            <button className='card-btn' onClick={onDownload}>
                <LuDownload className='text-base'/>DownLoad
            </button>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2'>
            {transactions?.map((expense) => (
                <TransactionInfoCard
                    key={expense._id}
                    title={expense.category}
                    icon={expense.icon}
                    date={moment(expense.date).format("Do MMM YYYY")}
                    amount={expense.amount}
                    type="expense"
                    onDelete={() => onDelete(expense._id)}
                    // 2. Pass the onEdit prop down to the card
                    onEdit={() => onEdit(expense)} 
                />
            ))}
        </div>
    </div>
    )
}

export default ExpenseList