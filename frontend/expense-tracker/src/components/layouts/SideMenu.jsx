import react, { useContext } from 'react';
import { SIDE_MENU_DATA } from '../../utils/data';
import { UserContext } from '../../context/userContext';
import { useNavigate } from 'react-router-dom';
import CharAvatar from '../Cards/CharAvatar';
import toast from 'react-hot-toast';
import { LuCirclePlus } from "react-icons/lu"; 

const SideMenu = ({ activeMenu, onAddTransaction }) => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const handleClick = (route) => {
    if (route === '/logout') {
      handleLogout();
      return;
    }
    navigate(route);
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate('/login');
  };

  return (
    <div className='w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 p-5 sticky top-15.25 z-20'>
      <div className='flex flex-col items-center justify-center gap-3 mt-3 mb-7 '>
        {user?.profileImageUrl ? (
          <img
            src={user?.profileImageUrl || ""}
            alt="Profile Image"
            className='w-20 h-20 bg-slate-400 rounded-full'
          />
        ) : (
          <CharAvatar
            fullName={user?.fullName}
            width="w-20"
            height="h-20"
            style="text-xl"
          />
        )}

        <h5 className='text-gray-950 font-medium leading-6'>
          {user?.fullName || ""}
        </h5>
      </div>

      {SIDE_MENU_DATA.map((item, index) => {
        // Change: Update "Add Transaction" button color from green to purple
        if (item.label === "Income") {
          return (
            <button
              key={`menu_add_${index}`}
              className="w-full flex items-center gap-4 text-[15px] py-3 px-6 rounded-lg mb-3 text-gray-500 hover:bg-purple-50 hover:text-primary transition-all group"
              onClick={onAddTransaction} 
            >
              <div className="p-1 bg-gray-100 rounded-md group-hover:bg-purple-100 transition-colors">
                <LuCirclePlus className="text-xl group-hover:text-primary" />
              </div>
              Add Transaction
            </button>
          );
        }

        // Change: Rename "Expense" to "All Transactions"
        const menuLabel = item.label === "Expense" ? "All Transactions" : item.label;

        return (
          <button
            key={`menu_${index}`}
            className={`w-full flex items-center gap-4 text-[15px] ${
              activeMenu == menuLabel ? "text-white bg-primary shadow-lg shadow-purple-100" : "text-gray-600 hover:bg-gray-50"
            } py-3 px-6 rounded-lg mb-3 transition-all`}
            onClick={() => handleClick(item.path)}
          >
            <item.icon className="text-xl" />
            {menuLabel}
          </button>
        );
      })}
    </div>
  );
};

export default SideMenu;