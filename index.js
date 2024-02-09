const express = require("express");

const app = express();
const PORT = 4040;

const cors = require("cors");
app.use(cors());
app.use(express.json());
require('./Controllers/db');
require('dotenv').config();

const { handler } = require('./Controllers/index');


app.use(require('./Controllers/paybalance'));

app.post("/", async (req, res) => {
    res.send(await handler(req));
})


app.listen(PORT, (err) => {
    if (err) { console.log(err); }
    console.log("Server started at port ", PORT);
})