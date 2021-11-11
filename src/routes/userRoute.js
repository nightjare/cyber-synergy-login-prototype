const router = require("express").Router();
require('dotenv').config()
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../model/user");
const Token = require("../model/token");

function getToken (req, res, next) {
    let token = req.cookies.token;
    if (!token) {
        return res.status(403).send("Missing Token");
    }
    try {
        req.token = token;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
}


router.get("/", async (req, res) => {
    try {
        const users = await (User.find({}).select({email: 1, password: 1})).exec();
        res.status(201).json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Registration (could use password strength logic)
router.post("/register", async (req, res) => {
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

        user.save();
        res.status(201).json(user);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/token", getToken, async (req, res) => {
    try {
        let accessToken;
        let tokens = await Token.findOne({token: req.token.refresh}).select({token:1, _id: 0}).exec();
        let user = jwt.verify(req.body.token, process.env.REFRESH_KEY);
        if (user && tokens) {
            accessToken = jwt.sign(user, process.env.TOKEN_KEY, { expiresIn: "30m" });
        } else {
            res.status(400).send("Invalid Token");
        }
        console.log(accessToken);
        res.cookie('token', {access: accessToken, refresh: req.token.refresh}, { httpOnly: true });
        return res.status(200).json({accessToken: accessToken});
    } catch (err) {
        res.send(err);
    }
})

router.delete("/logout", async (req, res) => {
    try {
        await Token.findOneAndDelete({token: req.body.token}).exec();
        return res.status(200).json("You have been logged out");
    } catch (err) {
        res.send(err);
    }
})

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email)) {
            res.status(400).send("Missing email address");
        } else if (!(password)) {
            res.status(400).send("Missing password");
        }

        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            const accessToken = jwt.sign(
                { user_id: user._id, email, admin: user.admin },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "30m",
                }
            );
            const refreshToken = jwt.sign({ user_id: user._id, email, admin: user.admin }, process.env.REFRESH_KEY);
            
            await Token.create({
                token: refreshToken
            })

            res.cookie('token', {access: accessToken, refresh: refreshToken}, { httpOnly: true });

            return res.status(200).json({accessToken: accessToken, refreshToken: refreshToken});
        }
        res.status(400).send("Invalid Email or Password");
    } catch (err) {
        console.log(err);
    }
});

router.get("/privelege", auth, (req, res) => {
    if (req.user) {
        res.status(200).send(req.user.admin);
    } else {
        res.status(400).send("not a token");
    }
})

//Test Post for Authorization
router.post("/welcome", auth, (req, res) => {
    if(req.user.admin > 0) {
        res.status(200).send("Welcome Admin!")
    } else {
        res.status(200).send("Welcome");
    }
});

module.exports = router;