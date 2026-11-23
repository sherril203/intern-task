const jwt = require("jsonwebtoken");
require("dotenv").config();

const jwt_secret = process.env.jwt_secret;

// Generate token
const tokengenerator = (id) => {
    return jwt.sign(
        { id: id },
        jwt_secret,
        { expiresIn: "1h" }
    );
};

module.exports = tokengenerator;