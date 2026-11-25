const tokengenerator = require('../Middleware/Auth');
const UserModel = require('../models/user.model');
const bcrypt = require('bcrypt');

const UserRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        // Check existing user
        const existdata = await UserModel.findOne({ email });

        if (existdata) {
            return res.status(400).json({
                message: "User already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const savedUser = await UserModel.create({
            username: name,
            email,
            password: hashedPassword,
            role: "user"
        });

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (err) {
        console.error("Register error:", err);

        return res.status(500).json({
            message: err.message || "Signup failed"
        });
    }
};



const Userlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existdata = await UserModel.findOne({ email });

        if (!existdata) {
            return res.status(400).json({
                message: "User not registered"
            });
        }

        const matchedPassword = await bcrypt.compare(
            password,
            existdata.password
        );

        if (!matchedPassword) {
            return res.status(401).json({
                message: "Invalid password"
            });
        }

        const token = tokengenerator(existdata._id);

        return res.status(200).json({
            message: "User login successful",
            data: {
                token,
                User: {
                    id: existdata._id,
                    username: existdata.username,
                    email: existdata.email,
                    role: existdata.role
                }
            }
        });

    } catch (err) {
        console.error("Login error:", err);

        return res.status(500).json({
            message: "Login failed"
        });
    }
};

const getUserProfile = async (req, res) => {
    try {
        console.log("Logged in user ID:", req.user.id);

        const user = await UserModel.findById(req.user.id)
            .select("-password");

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            data: {
                username: user.username,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Unable to fetch profile"
        });
    }
};

module.exports = { UserRegister, Userlogin,getUserProfile };