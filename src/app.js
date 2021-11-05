const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("./auth");
const User = require("../model/user");

const app = express();

app.use(express.json());

// Registration (could use password strength logic)
app.post("/register", async (req, res) => {
    try {
        const { firstName, lastName, companyName, email, password } = req.body;

        if (!(email && password && companyName && firstName && lastName)) {
            res.status(400).send("Missing Fields");
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        encryptedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            firstName,
            lastName,
            companyName,
            email: email.toLowerCase(),
            password: encryptedPassword,
        });

        const token = jwt.sign(
            { user_id: user._id, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        user.token = token;
        res.status(201).json(user);
    } catch (err) {
        console.log(err);
    }
});

// Login
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email)) {
            res.status(400).send("Missing email address");
        } else if (!(email)) {
            res.status(400).send("Missing password");
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user._id, email },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
            user.token = token;
            res.status(200).json(user);
        }
        res.status(400).send("Invalid Email or Password");
    } catch (err) {
        console.log(err);
    }
});

//Test Post for Authorization
app.post("/welcome", auth, (req, res) => {
    res.status(200).send("Welcome");
});

module.exports = app;