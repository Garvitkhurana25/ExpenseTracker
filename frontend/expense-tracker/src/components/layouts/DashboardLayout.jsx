import React, { useState, useContext } from 'react'; // Added useState
import Navbar from "./Navbar";
import SideMenu from "./SideMenu";
import { UserContext } from "../../context/userContext"; 
import AddTransactionModal from "../Modals/AddTransactionModal"; // Import Modal

const DashboardLayout = ({ children, activeMenu }) => {
    const { user } = useContext(UserContext);
    // Lifted State: This makes the modal accessible globally
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className=''>
            <Navbar activeMenu={activeMenu} />

            {user && (
                <div className='flex'>
                    <div className='hidden lg:block w-64 border-r min-h-screen'>
                        <SideMenu 
                            activeMenu={activeMenu} 
                            onAddTransaction={() => setIsModalOpen(true)} 
                        />
                    </div>

                    <div className='grow mx-5'>{children}</div>
                </div>
            )}

            {/* Global Modal Instance */}
            <AddTransactionModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onRefresh={() => window.location.reload()} // Global refresh
            />
        </div>
    )
}

export default DashboardLayout;