
const tokengenerator = require('../Middleware/Auth');
const AdminModel = require('../models/Admin.model');
const bcrypt = require('bcrypt');

const AdminRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all required fields"
            });
        }

        const existdata = await AdminModel.findOne({ email });

        if (existdata) {
            return res.status(400).json({
                message: "Admin already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await AdminModel.create({
            username: name,
            email,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "Admin registered successfully"
        });

    } catch (err) {
        console.error("Register error:", err);

        return res.status(500).json({
            message: err.message || "Signup failed"
        });
    }
};


const Adminlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existdata = await AdminModel.findOne({ email });

        if (!existdata) {
            return res.status(400).json({
                message: "Admin not registered"
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
            message: "Admin login successful",
            data: {
                token,
                admin: {
                    id: existdata._id,
                    username: existdata.username,
                    email: existdata.email,
                    role: "admin"
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


// Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        const admin = await AdminModel.findById(req.user.id)
            .select("-password");

        if (!admin) {
            return res.status(404).json({
                message: "Admin not found"
            });
        }

        return res.status(200).json({
            message: "Admin profile fetched successfully",
            data: {
                username: admin.username,
                email: admin.email,
                role: "admin"
            }
        });

    } catch (err) {
        console.error("Profile error:", err);

        return res.status(500).json({
            message: "Unable to fetch admin profile"
        });
    }
};

module.exports = {
    AdminRegister,
    Adminlogin,
    getAdminProfile
};
