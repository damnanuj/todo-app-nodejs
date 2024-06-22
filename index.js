const express = require("express");
require("dotenv").config();
const clc = require("cli-color");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs")
// const cors = require("cors")
// const cookieParser = require("cookie-parser")

//constants
const app = express();
const PORT = process.env.PORT;
// const PORT = 8000;

// app.use(cookieParser())
// app.use(cors())
app.use(express.json()); //body parser json format POSTMAN
app.use(express.urlencoded({ extended: true })); //body parser url

//file imports
const { userDataValidation } = require("./models/utils/authUtil");
const userModel = require("./models/userModel");

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

app.get("/", (req, res) => {
  console.log("server is running");
  return res.send("Home page");
});

// app.get("/test", (req, res)=> {
//   return res.render("test");
// });

app.get("/register", (req, res) => {
  return res.render("registration-page");
});

app.post("/register", async (req, res) => {
  console.log(req.body);
  const { name, username, email, password } = req.body;

  //data validation
  try {
    await userDataValidation({ name, username, email, password });
  } catch (error) {
    return res.status(400).json(error);
  }

  //email and username is unique or not

  //encrypt the password
  const hashedPassword = await bcrypt.hash(
    password , 
    parseInt(process.env.SALT)
  )

  //store data in db

  const userObj = new userModel({
    name,
    username,
    email,
    password: hashedPassword,
  })
  try {
    const userDb= await userObj.save()
    return res.status(201).json({
      message : "Registration Successfully",
      data:userDb,
    });
  } catch (error) {
    return res.status(500).json({
      message : "Internal server error",
      error:error,
    });
  }

});





app.get("/login", (req, res) => {
  return res.render("login-page");
});

app.listen(PORT, () => {
  console.log(clc.yellowBright(`server is running on port :`));
  console.log(clc.yellowBright(`http://localhost:${PORT}`));
});
