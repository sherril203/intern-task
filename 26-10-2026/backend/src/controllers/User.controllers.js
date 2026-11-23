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
            return res.status(400).send({
                message: "User not registered"
            });
        }

        // Compare password
        const matchedPassword = await bcrypt.compare(
            password,
            existdata.password
        );

        if (!matchedPassword) {
            return res.status(401).send({
                message: "Invalid password"
            });
        }

        // Generate token
        const token = tokengenerator(existdata._id);

        return res.status(200).send({
            message: "User login successful",
            data: {
                token,
                User: {
                    id: existdata._id,
                    username: existdata.username,
                    email: existdata.email
                }
            }
        });

    } catch (err) {
        console.error("Login error:", err);

        return res.status(500).send({
            message: "Login failed"
        });
    }
};

module.exports = { UserRegister, Userlogin };