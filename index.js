const express = require("express");
require("dotenv").config();
const clc = require("cli-color");
const mongoose = require("mongoose");

//file imports

//constants
const app = express();
const PORT = process.env.PORT;
// const PORT = 8000;

//db connections
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(clc.blue.bgGreenBright("Mongodb connected successfully"));
  })
  .catch((err) => {
    console.log(clc.redBright(err));
  });

//middleware

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// app.get("/test", (req, res)=> {
//   return res.render("test");
// });

app.get("/register", (req, res) => {
  return res.render("registration-page");
});
app.post("/register", (req, res) => {
  console.log("hiii");
  console.log(req.body);
  return res.send("Regstration successfull");
});

app.get("/login", (req, res) => {
  return res.render("login-page");
});

app.get("/", (req, res) => {
  console.log("server is running");
  return res.send("Home page");
});

app.listen(PORT, () => {
  console.log(clc.yellowBright(`server is running on port : ${PORT}`));
});
