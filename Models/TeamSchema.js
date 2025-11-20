const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    photo: {
        type: String,
        required: true,
    },

    sponsor: {
        type: String,
        required: true,
    },

    auctionId: {
        type: String,
        required: true,
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },

    pointsAvailable: {
        type: Number,
    },

    maxPoints: {
        type: Number,
    },

    reservedPoints: {
        type: Number,
    },

    NoOfPlayers: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

module.exports = mongoose.model("teams", TeamSchema);
