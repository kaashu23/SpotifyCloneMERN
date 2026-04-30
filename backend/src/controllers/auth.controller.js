const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

async function registerUser(req, res) {
    const { username, email, password, role = "user" } = req.body;

    const isUSerAlredyexist = await userModel.findOne({
        $or: [
            {
                username,
            },
            {
                email
            }
        ]
    })

    if (isUSerAlredyexist) {
        return res.status(409).json({
            message: "User already exist"
        })
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username,
        email,
        password: hash,
        role
    })

    const token = jwt.sign({
        id: user._id,
        role: user.role
    }, process.env.JWT_SECRET)

    res.status(201).json({
        message: "User registered successfully",
        token, // Send token to frontend
        user: {
            id: user._id,
            username: user.username,
            email: user.email,
            role: user.role
        }
    })
}

async function loginUser(req,res){
    const {username , email , password} = req.body;
    
    const query = [];
    if (username) query.push({ username });
    if (email) query.push({ email });

    if (query.length === 0) {
        return res.status(400).json({ message: "Username or email is required" });
    }

    const user = await userModel.findOne({ $or: query });

    if(!user){
        return res.status(401).json({
            message : "Invalid Credentials"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if(!isPasswordValid){
        return res.status(401).json({
            message : "Invalid Credentials"
        })
    }

    const token = jwt.sign({
        id : user._id,
        role : user.role
    }, process.env.JWT_SECRET)

    res.status(200).json({
        message : "User logged in successfully",
        token, // Send token to frontend
        user : {
            id : user._id,
            username : user.username,
            email : user.email,
            role : user.role
        }
    })

}

async function logoutUser(req,res){
    // With JWT headers, the backend doesn't need to do anything for logout
    res.status(200).json({
        message : "User logged out successfully (Clear token on frontend)"
    })
}

async function getMe(req, res) {
    try {
        const user = await userModel.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe
}