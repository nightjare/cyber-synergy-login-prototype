require("dotenv").config();
const express = require('express');
const mongoose = require("mongoose");
const cors = require('cors');
const app = express() 
const jwt = require('jsonwebtoken');

app.use(cors());

app.options((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});

app.use(express.json());


const { API_PORT, DATABASE_URL } = process.env;
mongoose.connect(DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log("Connected to database");
})
.catch((error) => {
    console.log("Failed to connect to database:");
    console.error(error);
});

const loginRouter = require('./routes/userRoute');

app.use('/user', loginRouter);

// server listening 
app.listen(API_PORT, () => {
    console.log(`API running on port ${API_PORT}`);
});