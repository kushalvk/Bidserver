const express = require("express");
const PlayerModel = require("../Models/PlayerSchema");
const TeamModel = require("../Models/TeamSchema");
const AuctionModel = require("../Models/AuctionSchema");
const SponsorModel = require("../Models/SponsorSchema");
const { sendMail } = require("../SendingEmail/SendEmail");

const router = express.Router();

router.put("/sold", async (req, res) => {
    try {
        const {playerId, teamName, SoldFor, minBid} = req.body;

        if (!playerId || !teamName || !SoldFor) {
            return res.status(400).json({message: "Missing required fields!"});
        }

        const player = await PlayerModel.findById(playerId);
        if (!player) {
            return res.status(404).json({message: "Player not found!"});
        }

        const team = await TeamModel.findOne({name: teamName});
        if (!team) {
            return res.status(404).json({message: "Team not found!"});
        }

        if (team.pointsAvailable < SoldFor) {
            return res.status(400).json({message: "Not enough points available!"});
        }

        player.status = "Sold";
        player.SoldFor = SoldFor;
        player.team = teamName;

        team.pointsAvailable -= SoldFor;
        team.maxPoints -= SoldFor;
        team.maxPoints += minBid;
        if (!team.NoOfPlayers) {
            team.NoOfPlayers = 1;
        } else {
            team.NoOfPlayers += 1;
        }
        team.reservedPoints -= minBid;

        await player.save();
        await team.save();

        res.status(200).json({message: "Player marked as Sold!", player, team});

    } catch (err) {
        res.status(500).json({message: "Error sold player"});
    }
})

router.put("/unsold", async (req, res) => {
    try {
        const {playerId} = req.body;

        if (!playerId) {
            res.status(400).json({message: "Missing required PlayerId!"});
        }

        await PlayerModel.findByIdAndUpdate(playerId, {status: "Unsold"})
        res.status(200).json({message: "Player Available successfully"});
    } catch (e) {
        res.status(500).json({message: "Error to Available player"});
    }
})

router.post("/mark-players-unsold/:id", async (req, res) => {
    try {
        const {id} = req.params;
        const {auctionId} = req.body;

        const auction = await AuctionModel.findOne({auctionId});

        const playerData = await PlayerModel.findById(id);
        if (!playerData.team) {
            return res.status(201).json({message: "Player already available"});
        }

        const team = await TeamModel.findOne({name: playerData.team})

        team.pointsAvailable += playerData.SoldFor;
        team.maxPoints += playerData.SoldFor + auction.minBid;
        team.reservedPoints += auction.minBid;
        team.NoOfPlayers -= 1;

        await team.save();

        const player = await PlayerModel.findByIdAndUpdate(id, {status: 'Available', team: "", SoldFor: 0});
        res.status(200).json({message: "Player Marked as Available successfully.", player});
    } catch (e) {
        res.status(500).json({message: "Error to fetching players by id", error: e.message});
    }
});

router.post("/mark-all-player-unsold/:auctionId", async (req, res) => {
    try {
        const {auctionId} = req.params;

        const auction = await AuctionModel.findOne({auctionId});
        if (!auction) {
            return res.status(404).json({message: "Auction not found"});
        }

        const playerUpdateResult = await PlayerModel.updateMany(
            {auctionId},
            {$set: {status: "Available", team: "", SoldFor: 0}}
        );

        const pointsAvailable = auction.pointsPerTeam;
        const reservedPoints = auction.minBid * auction.playersPerTeam;
        const maxPoints = pointsAvailable - reservedPoints;

        const teamUpdateResult = await TeamModel.updateMany(
            {auctionId},
            {
                $set: {
                    pointsAvailable: pointsAvailable,
                    reservedPoints: reservedPoints,
                    maxPoints: maxPoints,
                    NoOfPlayers: 0
                }
            }
        );

        res.status(200).json({
            message: "Players and teams updated successfully",
            playersUpdated: playerUpdateResult.modifiedCount,
            teamsUpdated: teamUpdateResult.modifiedCount
        });
    } catch (e) {
        res.status(500).json({message: "Error updating players and teams", error: e.message});
    }
});

router.delete("/delete-auction/:auctionId", async (req, res) => {
    try {
        const { auctionId } = req.params;

        await TeamModel.updateMany(
            { auctionId: auctionId },
            { isDeleted: true }
        );

        await PlayerModel.updateMany(
            { auctionId: auctionId },
            { isDeleted: true }
        );

        await SponsorModel.updateMany(
            { auctionId: auctionId },
            { isDeleted: true }
        );

        await AuctionModel.findOneAndUpdate(
            { auctionId: auctionId },
            { isdelete: true }
        );

        res.status(200).json({ message: "Auction deleted successfully" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error deleting auction" });
    }
});

router.post("/send-mail", async (req, res) => {
    try {
        const { fullName, email, phone, location, message } = req.body;

        const subject = `Contact Us Form Submission from ${fullName}`;
        const text = `
            Name: ${fullName}
            Email: ${email}
            Phone: ${phone}
            Location: ${location}
            Message: ${message}
        `;
        const html = `
            <p><strong>Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Location:</strong> ${location}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
        `;

        await sendMail(email, subject, text, html);

        res.status(200).json({ message: `Thank you for reaching out, ${fullName}!  We've received your message and will get back to you within 24-48 hours.  We appreciate your interest!` });
    } catch (error) {
        console.error("Error sending email:", error);
        res.status(500).json({ error: "Failed to send email" });
    }
})

module.exports = router;