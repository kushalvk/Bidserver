const express = require("express");
const TeamModel = require("../Models/TeamSchema");
const AuctionModel = require("../Models/AuctionSchema");
const {default: upload} = require('../Middlewares/Upload');
const {uploadOnCloudinary} = require("../cloudinary/Cloudinary");

const router = express.Router();

router.post("/add-team", upload.single("photo"), async (req, res) => {
    try {
        const { name, sponsor, auctionId } = req.body;

        let teamPhoto  = null;
        if (req.file) {
            const teamPhotoLocalPath = req?.file?.buffer;
            teamPhoto = await uploadOnCloudinary(teamPhotoLocalPath);
        }

        if (!name && !sponsor ) {
            res.status(400).json({ error: "name & sponsor is required" });
        }

        const auction = await AuctionModel.findOne({auctionId});
        if (!auction) {
            return res.status(404).json({ message: "Auction not found" });
        }

        const pointsAvailable = auction.pointsPerTeam;
        const reservedPoints = auction.minBid * auction.playersPerTeam;
        const maxPoints = pointsAvailable - reservedPoints;

        await TeamModel.create({ name, photo: teamPhoto.url, sponsor, auctionId, pointsAvailable, reservedPoints, maxPoints });

        res.status(200).json({ message: "Team added successfully" });
    } catch (err) {
        console.error("Error adding team:", err);
        res.status(500).json({ message: "Failed to add team", error: err.message });
    }
});


router.get("/all-team/:auctionId", async (req, res) => {
    try {
        const {auctionId} = req.params;

        TeamModel.find({auctionId, isDeleted: false})
            .then((teams) => res.status(200).send(teams))
            .catch((err) => res.status(500).json({message: "Error to fetch team : Controller ", err}));
    } catch (e) {
        res.status(400).send({message: "Fail to fetch team", e});
    }
})

router.post("/update-team/:id", upload.single("photo"), async (req, res) => {
    try {
        const {id} = req.params;
        const {name} = req.body;

        let teamPhoto = null;
        if (req.file) {
            const teamPhotoLocalPath = req?.file?.buffer;
            teamPhoto = await uploadOnCloudinary(teamPhotoLocalPath);
        }

        if (teamPhoto) {
            TeamModel.findByIdAndUpdate(id, {name, photo: teamPhoto.url})
                .then(() => res.status(200).send({message: "team updated successfully!"}))
                .catch((err) => res.status(500).json({message: "Error to update team : Controller ", err}));
        } else {
            TeamModel.findByIdAndUpdate(id, {name})
                .then(() => res.status(200).send({message: "team updated successfully!"}))
                .catch((err) => res.status(500).json({message: "Error to update team : Controller ", err}));
        }
    } catch (e) {
        res.status(400).send({message: "Fail to update team", e});
    }
})

router.delete("/delete-team/:id", async (req, res) => {
    try {
        const {id} = req.params;

        TeamModel.findByIdAndUpdate(id, {isDeleted: true})
            .then(() => res.status(200).send({message: "Team Deleted successfully!"}))
            .catch((err) => res.status(500).json({message: "Error to delete team : Controller ", err}));
    } catch (e) {
        res.status(400).send({message: "Fail to delete team", e});
    }
})

module.exports = router;