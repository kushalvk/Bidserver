const express = require("express");
const UserModel = require("../Models/UserSchema");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const {default: upload} = require('../Middlewares/Upload');
const {uploadOnCloudinary} = require("../cloudinary/Cloudinary");

const router = express.Router();

// register
router.post("/signup", upload.single("photo"), async (req, res) => {
    try {
        const { fullName, dob, phoneNumber, address, city, username, password } = req.body;

        if (!req.file) {
            return res.status(400).json({ error: "Please upload a photo" });
        }

        let userPhoto = null;
        if (req.file) {
            const userPhotoLocalPath = req?.file?.buffer;
            userPhoto = await uploadOnCloudinary(userPhotoLocalPath);
        }

        const hash_password = await bcrypt.hash(password, 12);

        const newUser = await UserModel.create({
            fullName,
            dob,
            phoneNumber,
            address,
            city,
            username,
            password: hash_password,
            photo: userPhoto?.url || null
        });

        res.status(201).json({
            message: "User created successfully",
            user: newUser
        });

    } catch (err) {
        if (err.message.includes('MulterError')) {
            return res.status(400).json({ error: "File upload error", details: err.message });
        }
        res.status(500).json({ error: "Signup failed", details: err.message });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: "Please provide username and password" });
        }

        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password" });
        }

        const token = await user.generateAuthToken();
        res.status(200).json({ user, token });
    } catch (err) {
        res.status(500).json({ error: "Login failed", details: err.message });
    }
});

const verifyToken = (req, res, next) => {
    try {
        if (!req.headers.authorization) {
            return res.status(401).json({ error: "No authorization header provided" });
        }

        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: "Invalid or expired token" });
            }
            req.user = decoded;
            next();
        });
    } catch (err) {
        res.status(500).json({ error: "Token verification failed", details: err.message });
    }
};

router.get("/loggedinuser", verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findOne({ username: req.user.username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch user data", details: err.message });
    }
});

router.get("/user/:id", async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ error: "User ID is required" });
        }

        const user = await UserModel.findById(id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ user });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        res.status(500).json({ error: "Failed to fetch user", details: err.message });
    }
});

router.post("/updateuser/:id", upload.single("photo"), async (req, res) => {
    const userId = req.params.id;

    let userPhoto = null;
    if (req.file) {
        const userPhotoLocalPath = req?.file?.buffer;
        userPhoto = await uploadOnCloudinary(userPhotoLocalPath);
    }

    const { address, city, dob, fullName, phoneNumber, username } = req.body;

    const userdata = {
        address,
        city,
        dob,
        fullName,
        phoneNumber,
        username,
    };

    if (userPhoto) userdata.photo = userPhoto.url;

    UserModel.findByIdAndUpdate(userId, userdata)
        .then((update) => res.json(update))
        .catch((err) => res.json(err));
});

module.exports = router;