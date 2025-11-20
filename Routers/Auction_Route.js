const express = require("express");
const AuctionModel = require("../Models/AuctionSchema");
const {default: upload} = require('../Middlewares/Upload');
const {uploadOnCloudinary} = require("../cloudinary/Cloudinary");

const router = express.Router();

router.post("/new-auction", upload.single("photo"), async (req, res) => {
    const {name, sportType, pointsPerTeam, minBid, bidIncrement, playersPerTeam, date, createdBy} = req.body;

    let auctionPhoto = null;
    if (req.file) {
        const auctionPhotoLocalPath = req?.file?.buffer;
        auctionPhoto = await uploadOnCloudinary(auctionPhotoLocalPath);
    }

    if (!name && !sportType && !pointsPerTeam && !minBid && !bidIncrement && !playersPerTeam && !date && !createdBy && !auctionPhoto) {
        res.status(400).json({error: "All Fields are required"});
    }

    try {
        AuctionModel.create({
            name,
            sportType,
            pointsPerTeam,
            minBid,
            bidIncrement,
            playersPerTeam,
            date,
            createdBy,
            auctionPhoto: auctionPhoto?.url || null
        })
            .then((data) => {
                res.status(200).json({message: "Auction created successfully", data: data})
            })
            .catch(() => {
                res.status(500).json({message: "Error creating auction"});
            })
    } catch (err) {
        res.status(500).json({message: "Error creating auction"});
    }
})

router.get("/all-auction", async (req, res) => {
    try {
        AuctionModel.find({isdelete: false})
            .then((data) => {
                res.status(200).json({message: "Auction fetched successfully", data: data});
            })
            .catch(() => {
                res.status(500).json({message: "Error fetching auction"});
            })
    } catch (err) {
        res.status(500).json({message: "Error fetching auction"});
    }
})

router.get("/auction-created-by/:createdBy", async (req, res) => {
    try {
        const {createdBy} = req.params;
        const auctions = await AuctionModel.find({createdBy});
        res.status(200).json({message: "Auction fetched successfully", data: auctions});
    } catch (err) {
        res.status(500).json({message: "Error fetching auction"});
    }
})

router.get("/auction-selected-player/:selectedPlayer", async (req, res) => {
    try {
        const {selectedPlayer} = req.params;
        const auctions = await AuctionModel.find({selectedPlayers: {$in: [selectedPlayer]}});
        res.status(200).json({message: "Auction fetched successfully", data: auctions});
    } catch (err) {
        res.status(500).json({message: "Error fetching auction"});
    }
});

router.get("/auction-by-id/:auctionId", async (req, res) => {
    try {
        const {auctionId} = req.params;
        const auction = await AuctionModel.findById(auctionId);
        res.status(200).json({message: "Auction fetched successfully", data: auction});
    } catch (err) {
        res.status(500).json({message: "Error fetching auction"});
    }
});

router.put("/update-auction/:auctionId", upload.single("photo"), async (req, res) => {
    try {
        const {auctionId} = req.params;

        let auctionPhoto = null;
        if (req.file) {
            const auctionPhotoLocalPath = req?.file?.buffer;
            if (auctionPhotoLocalPath) auctionPhoto = await uploadOnCloudinary(auctionPhotoLocalPath);
        }

        const updatedData = req.body;
        if (auctionPhoto) updatedData.auctionPhoto = auctionPhoto.url;

        const auction = await AuctionModel.findByIdAndUpdate(auctionId, updatedData);
        res.status(200).json({message: "Auction updated successfully", auction});
    } catch (err) {
        res.status(500).json({message: "Error update auction"});
    }
});

router.get("/auction-by-AuctionId/:auctionId", async (req, res) => {
    try {
        const {auctionId} = req.params;

        const auction = await AuctionModel.findOne({auctionId})
        res.status(200).json(auction);
    } catch (e) {
        res.status(500).json({message: "Error to found auction"});
    }
})

router.post("/auto-select-unsold-player/:auctionId", async (req, res) => {
    try {
        const {auctionId} = req.params;
        const {statusOfButton} = req.body;

        const auction = await AuctionModel.findOneAndUpdate({auctionId}, {autoSelectUnsold: statusOfButton})
        res.status(200).json({message: 'Status Updated Successfully', auction});
    } catch (e) {
        res.status(500).json({message: "Error to update status"});
    }
})

module.exports = router;
