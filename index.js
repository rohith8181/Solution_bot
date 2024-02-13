require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const axios = require('axios');
mongoose.set("strictQuery", false);

const app = express();
const PORT = process.env.PORT || 4040;

const cors = require("cors");
app.use(cors());
app.use(express.json());

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Database connected Success");
    } catch (err) {
        console.log("Error Connecting to database", err);
    }
}

const RunServer = async () => {
    try {
        const response = await axios.get('https://solution-bot-153.onrender.com');
        console.log(response.data);
    } catch (err) {
        console.log("Error in running server", err)
    }
}
RunServer();
const interval = 14 * 60 * 1000;
setInterval(RunServer, interval);

const { handler } = require('./Controllers/index');


app.use(require('./Controllers/paybalance'));

app.post("/", async (req, res) => {
    res.send(await handler(req));
})

app.get("/", async (req, res) => {
    res.send("Server is Working...")
})

connectDB().then(() => {
    app.listen(PORT, (err) => {
        if (err) {
            console.log("Error in Setting Port", err);
        }
        else {
            console.log("Server started at port ", PORT);
        }
    })
})
