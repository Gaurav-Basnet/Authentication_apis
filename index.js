const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const app = express();
const path = require("path");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


app.use(express.json());``
const userRoutes = require("./routes/userRoute");




app.use("/user",userRoutes);

mongoose.connect("mongodb://127.0.0.1:27017/authentication");
app.listen(8000, () => {
  console.log("App running on the port 8000");
});
