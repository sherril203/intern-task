const jwt = require("jsonwebtoken");
require("dotenv").config();

const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Token required. Please login."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.jwt_secret);

        req.adminId = decoded.id;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token. Please login again."
        });
    }
};

module.exports = verifyToken;