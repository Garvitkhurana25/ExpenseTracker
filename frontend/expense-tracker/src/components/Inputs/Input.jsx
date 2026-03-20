import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, placeholder, label, type }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleshowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="w-full">
      <label className='text-[13px] text-slate-800 font-medium'>{label}</label>

      <div className='input-box'>
        <input 
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className='w-full py-2 bg-transparent outline-none text-sm'
          value={value}
          onChange={onChange}
        />

        {type === "password" && (
          <div className="cursor-pointer" onClick={toggleshowPassword}>
            {showPassword ? (
              <FaRegEye size={22} className='text-primary' />
            ) : (
              <FaRegEyeSlash size={22} className='text-slate-400' />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Input;