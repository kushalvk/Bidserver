
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

const UserRoute = require("./Routers/User_Route");
const AuctionRoute = require("./Routers/Auction_Route");
const PlayerRoute = require("./Routers/Player_Route");
const SponsorRoute = require("./Routers/Sponsor_Route");
const TeamRoute = require("./Routers/Team_Route");
const MixRoute = require("./Routers/Mixed_Route");

const app = express();
const corsOptions = {
    origin: [process.env.FRONT_URL],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Auth-Token', 'Origin'],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.static("Images"));

// Increase the size limit for both JSON and URL encoded data
app.use(bodyParser.json({ limit: '10mb' }));  // Adjust this limit as per your needs (for file upload)
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Database Connected"))
    .catch(() => console.log("Database not connected"));

app.use(UserRoute);
app.use(AuctionRoute);
app.use(PlayerRoute);
app.use(SponsorRoute);
app.use(TeamRoute);
app.use(MixRoute);

app.get("/", (req, res) => {
    res.json("hello Player..!");
});

app.listen(3001, () => {
    console.log("Server is running on port 3001");
});
