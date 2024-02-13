require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
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
        console.log("Error Connecting to database", err.message);
    }
}

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
            console.log("port error", err);
        }
        else {
            console.log("Server started at port ", PORT);
        }
    })
})
