const express = require('express');
const cors = require('cors');
const path = require('path');
const router = require('./router/router');

const app = express();

app.use(cors());
app.use(express.json());

const imagePath = path.join(__dirname, 'image');

console.log("Static image folder:", imagePath);

app.use('/files', express.static(imagePath));

app.get("/", (req, res) => {
    res.send("api is working");
});

app.use(router);

module.exports = app;