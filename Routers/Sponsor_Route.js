const express = require("express");
const SponsorModel = require("../Models/SponsorSchema");
const {default: upload} = require('../Middlewares/Upload');
const {uploadOnCloudinary} = require("../cloudinary/Cloudinary");
const router = express.Router();

router.post("/add-sponsor", upload.single("photo"), async (req, res) => {
    try {
        const {name, auctionId} = req.body;

        let sponsorPhoto = null;
        if (req.file) {
            const sponsorPhotoLocalPath = req?.file?.buffer;
            sponsorPhoto = await uploadOnCloudinary(sponsorPhotoLocalPath);
        }

        if (!name && !auctionId) {
            res.status(400).json({ error: "name is required" });
        }

        SponsorModel.create({name, auctionId, photo: sponsorPhoto.url})
            .then(() => res.status(200).send({message: "Sponsor added successfuly"}))
            .catch((err) => res.status(500).send({message: "Fail to Add Sponsor : Controller ", err}));
    } catch (e) {
        res.status(500).send({message: "Fail to Add Sponsor : Controller ", e});
    }
})

router.get("/all-sponsor/:auctionId", (req, res) => {
    try {
        const {auctionId} = req.params;
        SponsorModel.find({auctionId, isDeleted: false})
            .then((sponsor) => res.status(200).send(sponsor))
            .catch((err) => res.status(500).send({message: "Fail to fetch Sponsor : Controller ", err}));
    } catch (e) {
        res.status(500).send({message: "Fail to fetch Sponsor : Controller ", e});
    }
})

router.delete("/delete-sponsor/:id", (req, res) => {
    try {
        const {id} = req.params;
        SponsorModel.findByIdAndUpdate(id, {isDeleted: true})
            .then(() => res.status(200).send({message: "Sponsor deleted successfully!"}))
            .catch((err) => res.status(500).send({message: "Fail to delete Sponsor : Controller ", err}));
    } catch (e) {
        res.status(500).send({message: "Fail to delete Sponsor : Controller ", e});
    }
})

router.post("/update-sponsor/:id", upload.single("photo"), async (req, res) => {
    try {
        const {id} = req.params;
        const {name} = req.body;

        let sponsorPhoto = null;
        if (req.file) {
            const sponsorPhotoLocalPath = req?.file?.buffer;
            sponsorPhoto = await uploadOnCloudinary(sponsorPhotoLocalPath);
        }

        if (sponsorPhoto) {
            SponsorModel.findByIdAndUpdate(id, { name, photo: sponsorPhoto.url })
                .then(() => res.status(200).send({ message: "Sponsor Updated Successfully"}))
                .catch((err) => res.status(500).send({message: "Fail to update Sponsor : Controller ", err}));
        } else {
            SponsorModel.findByIdAndUpdate(id, { name })
                .then(() => res.status(200).send({ message: "Sponsor Updated Successfully"}))
                .catch((err) => res.status(500).send({message: "Fail to update Sponsor : Controller ", err}));
        }
    } catch (e) {
        res.status(500).send({message: "Fail to update Sponsor : Controller ", e});
    }
})

module.exports = router;