import React, {useState} from 'react';
import {HiOutlineMenu, HiOutlineX} from "react-icons/hi";
import SideMenu from './SideMenu';

const Navbar = ({activeMenu}) => {
const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div className='flex gap-5 bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30'>
      <button className='block lg:hidden text-black' 
        onClick={() => {
          setOpenSideMenu(!openSideMenu);
        }}
      >
        {openSideMenu ? (
          <HiOutlineX className='text-2xl'/>
        ) : (
          <HiOutlineMenu className='text-2xl'/>
        )}
      </button>

      <h2 className='text-lg font-medium text-black'>Expense Tracker</h2>

      {openSideMenu && (
        <>
          {/* Backdrop to close menu when clicking outside */}
          <div 
            className='fixed inset-0 bg-black/10 z-40 lg:hidden' 
            onClick={() => setOpenSideMenu(false)}
          />
          
          {/* Mobile Menu Container */}
          <div className='fixed top-16.25 left-0 w-64 h-full bg-white'>
            <SideMenu activeMenu={activeMenu}/>
          </div>
        </>
      )}
    </div>
  )
}

export default Navbar;