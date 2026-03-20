import React, { createContext, useState, useEffect } from "react"; 
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const response = await axiosInstance.get(API_PATHS.AUTH.GET_USER_INFO);
                    console.log("SERVER RESPONSE DATA:", response.data);
                    setUser(response.data);
                } catch (error) {
                    console.error("Session expired:", error);
                    localStorage.removeItem("token");
                    setUser(null);
                    window.location.href = "/login";
                }
            }
            setLoading(false);
        };
        fetchUser();
    }, []);

    const updateUser = (userData) => {
        setUser(userData);
    };

    const clearUser = () => {
        localStorage.removeItem("token"); // Always clear token on logout
        setUser(null);
    };

    return (
        <UserContext.Provider
            value={{
                user,
                updateUser,
                clearUser,
                loading, 
            }}
        >
            {children}
        </UserContext.Provider>
    );
}

export default UserProvider;