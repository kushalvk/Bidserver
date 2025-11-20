const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
    photo: {
        type: String,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    sportCatagory: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: Number,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: String,
    },
    tshirtSize: {
        type: String,
        required: true,
    },
    trouserSize: {
        type: String,
        required: true,
    },
    achievements: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Sold', 'Unsold', 'Available'],
        default: 'Available',
    },
    SoldFor: {
        type: Number,
    },
    team: {
        type: String,
    },
    auctionId: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    minBid: {
        type: Number,
        required: true,
    }
}, { timestamps: true })

module.exports = mongoose.model("Player", PlayerSchema);
