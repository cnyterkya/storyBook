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


//logout a user
router.post("/logout", async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).send({ message: "Logged out Successfully" }, token);
    } catch (error) {
        console.log("Failed to logout: ", error);
        res.status(500).send({ message: "Logout Failed" });
    }
});

//get all user
router.get("/users", async (req, res) => {
    try {
        const users = await User.find({}, 'id email role');
        res.status(200).send({ message: "Users found successfully" }, users);
    } catch (error) {
        console.log("Error Fetching Users: ", error);
        res.status(500).send({ message: "Failed to Fecth Users" });
    }
});

//delete a user
router.delete("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            res.status(404).send({ message: "User not Found" });
        }
        res.status(200).send({ message: "User Deleted Successfully" });
    } catch (error) {
        console.log("Error Deleting Users: ", error);
        res.status(500).send({ message: "Error Deleting User" });
    }
});

//update a user role
router.put("/users/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        if (!user) {
            res.status(404).send({ message: "User not Found" });
        }
        res.status(200).send({ message: "User Role Updated Successfully" }, user);
    } catch (error) {
        console.log("Error Updating User Role: ", error);
        res.status(500).send({ message: "Error Updating User Role" });
    }
});


module.exports = router;