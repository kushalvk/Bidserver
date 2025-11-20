const mongoose = require("mongoose");

const AuctionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    auctionId: {
        type: String,
        unique: true
    },
    sportType: {
        type: String,
        required: true
    },
    pointsPerTeam: {
        type: Number,
        required: true
    },
    minBid: {
        type: Number,
        required: true
    },
    bidIncrement: {
        type: Number,
        required: true
    },
    playersPerTeam: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    auctionPhoto: {
        type: String,
    },
    createdBy: {
        type: String,
        required: true
    },
    isdelete: {
        type: Boolean,
        default: false
    },
    autoSelectUnsold: {
        type: Boolean,
        default: false
    }
});

// Pre-save hook to generate an incrementing auctionId
AuctionSchema.pre("save", async function (next) {
    if (!this.auctionId) {
        try {
            const lastAuction = await mongoose.model("Auction").findOne().sort({ _id: -1 }); // Get the latest auction
            let newId = 1; // Default ID if no auction exists

            if (lastAuction && lastAuction.auctionId) {
                const lastIdNumber = parseInt(lastAuction.auctionId.replace("Auct", ""), 10);
                newId = lastIdNumber + 1;
            }

            this.auctionId = `Auct${newId.toString().padStart(3, "0")}`;
        } catch (error) {
            return next(error);
        }
    }
    next();
});

module.exports = mongoose.model("Auction", AuctionSchema);
