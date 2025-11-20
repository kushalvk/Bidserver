const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema({
    fullName: String,
    dob: Date,
    phoneNumber: Number,
    address: String,
    city: String,
    username: String,
    password: String,
    photo: String
})

// generate token
UserSchema.methods.generateAuthToken = async function () {
    try {
        const token = jwt.sign({
            fullName: this.fullName,
            dob: this.dob,
            phoneNumber: this.phoneNumber,
            address: this.address,
            city: this.city,
            username: this.username,
            password: this.password,
            photo: this.photo
        },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h',
            });
        return token;
    } catch (error) {
        console.log(error)
    }
}

const UserModel = mongoose.model("users", UserSchema)
module.exports = UserModel