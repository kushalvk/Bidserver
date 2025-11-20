const express = require("express");
const PlayerModel = require("../Models/PlayerSchema");
const {default: upload} = require("../Middlewares/Upload");
const {uploadOnCloudinary} = require("../cloudinary/Cloudinary");

const router = express.Router();

router.post("/new-player", upload?.single("photo"), async (req, res) => {
    try {
        const {
            username,
            firstName,
            lastName,
            sportCatagory,
            mobileNumber,
            email,
            dateOfBirth,
            tshirtSize,
            trouserSize,
            achievements,
            auctionId,
            minBid
        } = req.body;

        if (!username || !auctionId) {
            return res.status(400).json({
                message: "Username and Auction ID are required",
                success: false
            });
        }

        const playerExist = await PlayerModel.findOne({ username });
        if (playerExist) {
            return res.status(409).json({
                message: "Player already exists",
                success: false
            });
        }

        let photoUrl = null;
        if (req.file) {
            const playerLocalPath = req.file.buffer;
            const uploadResult = await uploadOnCloudinary(playerLocalPath);
            if (!uploadResult?.url) {
                throw new Error("Failed to upload photo to Cloudinary");
            }
            photoUrl = uploadResult.url;
        }

        const newPlayer = await PlayerModel.create({
            photo: photoUrl,
            username,
            firstName,
            lastName,
            sportCatagory,
            mobileNumber,
            email,
            dateOfBirth,
            tshirtSize,
            trouserSize,
            achievements,
            auctionId,
            minBid: minBid || 0
        });

        if (!newPlayer) {
            throw new Error("Failed to create player in database");
        }

        return res.status(201).json({
            message: "Player created successfully",
            success: true,
            data: newPlayer
        });

    } catch (err) {
        console.error("Error in /new-player:", err);
        const statusCode = err.statusCode || 500;
        return res.status(statusCode).json({
            message: err.message || "Error processing request",
            success: false,
            error: err.message
        });
    }
});

router.post("/update-player", upload.single("photo"), async (req, res) => {
    try {
        const {
            username,
            firstName,
            lastName,
            sportCatagory,
            mobileNumber,
            email,
            dateOfBirth,
            tshirtSize,
            trouserSize,
            achievements,
            auctionId
        } = req.body;

        let player = null;
        if (req.file) {
            const playerLocalPath = req?.file?.buffer;
            if (playerLocalPath) player = await uploadOnCloudinary(playerLocalPath);
        }

        const updatedData = {
            firstName,
            lastName,
            sportCatagory,
            mobileNumber,
            email,
            dateOfBirth,
            tshirtSize,
            trouserSize,
            achievements,
            auctionId
        }
        if (player) updatedData.photo = player.url;

        if (!username) {
            return res.status(400).json({message: "Username is required"});
        }

        const updatedPlayer = await PlayerModel.findOneAndUpdate(
            {username},
            updatedData,
        );

        res.status(200).json({message: "Player updated successfully", data: updatedPlayer});
    } catch (err) {
        res.status(500).json({message: "Error to Update Player : Controller", error: err.message});
    }
});

router.get("/player-profile", async (req, res) => {
    try {
        const {username} = req.query; // Use query parameters
        if (!username) {
            return res.status(400).json({message: "Username is required"});
        }

        const player = await PlayerModel.findOne({username});
        if (player) {
            res.status(200).json({message: "Player fetched successfully", data: player});
        } else {
            res.status(404).json({message: "Player not found"});
        }
    } catch (err) {
        res.status(500).json({message: "Error fetching players", error: err.message});
    }
});

router.delete("/delete-player", async (req, res) => {
    try {
        const {username} = req.query;
        await PlayerModel.findOneAndUpdate({username}, {isDeleted: true});
        res.status(200).json({message: "Player deleted successfully"});
    } catch (err) {
        res.status(500).json({message: "Error deleting player", error: err.message});
    }
});

router.get("/players-by-name/:username", async (req, res) => {
    try {
        const {username} = req.params;
        const players = await PlayerModel.find({username});
        res.status(200).json({message: "Players fetched successfully", data: players});
    } catch (err) {
        res.status(500).json({message: "Error fetching players"});
    }
});

router.post("/players/:username/bid", async (req, res) => {
    const {username} = req.params;
    const {status, currentBid, team} = req.body;
    await PlayerModel.updateOne({username}, {status, currentBid, team});
    res.status(200).json({message: "Bidder data updated successfully"});
});

router.get("/players-by-id/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const player = await PlayerModel.findById(id);
        res.status(200).json(player);
    } catch (e) {
        res.status(500).json({message: "Error to fetching players by id", error: e.message});
    }
});

router.get("/players-by-auctionId/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const player = await PlayerModel.find({auctionId: id, isDeleted: false});
        res.status(200).json(player);
    } catch (e) {
        res.status(500).json({message: "Error to fetching players by id", error: e.message});
    }
});

router.post("/change-min-bid/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {minBid} = req.body;

        const player = await PlayerModel.findByIdAndUpdate(id, {minBid});
        res.status(200).json(player);
    } catch (e) {
        res.status(500).json({message: "Error to fetching players by id", error: e.message});
    }
});

module.exports = router;
