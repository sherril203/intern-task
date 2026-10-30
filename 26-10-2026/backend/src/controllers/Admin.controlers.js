const tokengenerator = require('../Middleware/Auth');
const AdminModel = require('../models/Admin.model');
const bcrypt = require('bcrypt');

const AdminRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check existing admin
        const existdata = await AdminModel.findOne({ email });

        if (existdata) {
            return res.status(400).send({
                message: "Admin already registered"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save admin
        const savedUser = new AdminModel({
            username: name,
            email,
            password: hashedPassword
        });

        await savedUser.save();

        return res.status(201).send({
            message: "Admin registered successfully"
        });

    } catch (err) {
        console.error("Register error:", err);

        return res.status(500).send({
            message: "Signup failed"
        });
    }
};


const Adminlogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existdata = await AdminModel.findOne({ email });

        if (!existdata) {
            return res.status(400).send({
                message: "Admin not registered"
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
            message: "Admin login successful",
            data: {
                token,
                admin: {
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

module.exports = { AdminRegister, Adminlogin };