import moment from 'moment'
import React from 'react'
import { LuDownload } from 'react-icons/lu'
import TransactionInfoCard from '../Cards/TransactionInfoCard'

const IncomeList = ({ transactions, onDelete, onDownload, onEdit }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Income Sources</h3>
                <button className='card-btn' onClick={onDownload}>
                    <LuDownload className='text-base'/>DownLoad
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {transactions.map((item) => (
                    <TransactionInfoCard
                        key={item._id}
                        title={item.source}
                        icon={item.icon}
                        date={item.date}
                        amount={item.amount}
                        type="income"
                        onDelete={() => onDelete(item._id)}
                        // PASS ONEDIT TO THE CARD HERE
                        onEdit={() => onEdit(item)} 
                    />
                ))}
            </div>
        </div>
    );
};

export default IncomeList