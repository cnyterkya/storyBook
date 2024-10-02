const express = require("express");
const User = require("../model/user.model");
const generateToken = require("../middleware/generateToken");
const router = express.Router();

//register a new user
router.post("/register", async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const user = new User({ email, password, username });
        await user.save();
        res.status(200).send({ message: "User Registered Successfully", user: user })
    } catch (error) {
        console.log("Failed to register: ", error);
        res.status(500).send({ message: "Registration Failed" });
    }
});

//login a user
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ message: "User not Found" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).send({ message: "Invalid Password" });
        }

        const token = await generateToken(user._id);
        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: true
        })
        res.status(200).send({
            message: "Login Successful", token, user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role
            }
        })

    } catch (error) {
        console.log("Failed to login: ", error);
        res.status(500).send({ message: "Login Failed" });
    }
});



module.exports = router;