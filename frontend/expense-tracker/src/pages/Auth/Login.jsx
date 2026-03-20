import React, { useState, useContext } from "react"; 
import Authlayout from "../../components/layouts/Authlayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState(""); 
    const [error, setError] = useState(null);

    const { updateUser } = useContext(UserContext);

    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault(); 

        if (!validateEmail(email)){
            setError("Please enter a valid email address.");
            return;
        }

        if(!password){
            setError("Please Enter the Password");
            return;
        }
        setError("");

        // Login API Call
        try{
            const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
                email,
                password,
            });
            const {token, user} = response.data;

            if(token){
                localStorage.setItem("token",token);
                updateUser(user);
                const userRole = response.data?.user?.role;
                if (userRole === "admin") {
                        navigate("/admin-dashboard");
                    } else {
                        navigate("/dashboard");
                    }
            }
        } catch(error){
            if (error.response && error.response.data.message){
                setError(error.response.data.message);
            } else{
                setError("Something went Wrong. Please Try again");
            }
        }
    };

    return (
        <Authlayout>
            <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
                <h3 className="text-xl font-semibold text-black">Welcome Back!</h3>
                <p className="text-xs text-slate-700 mt-1 mb-6"> Please Enter Your Details to Login! </p>

                <form onSubmit={handleLogin}>
                    <Input 
                        value={email} 
                        onChange={({target}) => setEmail(target.value)}
                        label="Email Address"
                        placeholder="abc@gmail.com"
                        type="text"
                    />

                    
                        <Input 
                            value={password} 
                            onChange={({target}) => setPassword(target.value)}
                            label="Password"
                            placeholder="Min 8 Characters"
                            type="password"
                        />
                    

                    {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}

                    <button type="submit" className="btn-primary">
                        Login
                    </button>
                    <p className="text-[13px] text-slate-800 mt-3">Don't have an account?{" "}
                        <Link className="font-medium text-primary underline" to='/registration'>SignUp</Link>
                    </p>
                </form>
            </div>
        </Authlayout>
    );
};

export default Login;