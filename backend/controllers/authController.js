const User = require('../models/User');
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const generateToken = (id) => {
    return jwt.sign({id},process.env.JWT_SECRET, {expiresIn:"1hr"});
};


exports.registerUser = async (req, res) => {
    const { fullName, email, password, profileImageUrl } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        
        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl: profileImageUrl || "",
        });

        return res.status(201).json({
            token: generateToken(user._id),
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl,
            },
        });

    } catch (err) {
        res.status(500).json({ 
            message: "Error registering user", 
            error: err.message 
        });
    }
};


exports.loginUser = async(req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        res.status(200).json({
            token: generateToken(user._id),
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                profileImageUrl: user.profileImageUrl
            }
        });
    } catch(err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// Get User Info
exports.getUserInfo = async(req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user){
            return res.status(400).json({message:"User not found"});
        }
        res.status(200).json(user);
    } 
    catch (err) {
        return res.status(500).json({ 
            message: "Error registering user",  error: err.message });
    }
};

