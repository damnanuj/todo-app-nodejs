const express = require("express");
require("dotenv").config();
const clc = require("cli-color");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const connectMongodbSession = require("connect-mongodb-session")(session);
// const cors = require("cors")
// const cookieParser = require("cookie-parser")

//constants
const app = express();
const PORT = process.env.PORT;
// const PORT = 8000;
const store = new connectMongodbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// app.use(cookieParser())
// app.use(cors())
app.use(express.json()); //body parser json format POSTMAN
app.use(express.urlencoded({ extended: true })); //body parser url
app.use(
  session({
    secret: process.env.SECRET_KEY,
    store: store,
    resave: false,
    saveUninitialized: false,
  })
);

//file imports
const {
  userDataValidation,
  loginValidation,
  regexPatterns,
} = require("./models/utils/authUtil");
const userModel = require("./models/userModel");
const isAuth = require("./middleware/authMiddleware");

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

  try {
    //email and username is unique or not
    const userEmailExist = await userModel.findOne({ email: email });
    if (userEmailExist) {
      return res.status(400).json("Email already exist");
    }
    const userUsernameExist = await userModel.findOne({ username: username });
    if (userUsernameExist) {
      return res.status(400).json("username already exist");
    }

    //encrypt the password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT)
    );

    //store data in db

    const userObj = new userModel({
      name,
      username,
      email,
      password: hashedPassword,
    });

    const userDb = await userObj.save();
    // return res.status(201).json({
    //   message: "Registration Successfully",
    //   data: userDb,
    // });
    return res.redirect("/dashboard")
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
});

// user login api

app.get("/login", (req, res) => {
  return res.render("login-page");
});

app.post("/login", async (req, res) => {
  console.log("line 110:", req.body);
  const { userId, password } = req.body;

  //loginData validation
  try {
    await loginValidation({ userId, password });
  } catch (error) {
    return res.status(400).json(error);
  }

  //find the user from the dataBase
  try {
    let userDb = {};
    //if the user login with email
    if (regexPatterns.email.test(userId)) {
      userDb = await userModel.findOne({ email: userId });
      console.log("found user with email");
    }
    //if login with username
    else {
      userDb = await userModel.findOne({ username: userId });
      console.log("found user with username");
    }

    //if user doesn't exist and we get null
    if (!userDb) {
      return res.status(400).json("user not found, please register first");
      // return res.redirect("/register")
    }
    // console.log(userDb);
    //comapare the password
    const passwordIsMatched = await bcrypt.compare(password, userDb.password);
    // console.log(passwordIsMatched);
    if (!passwordIsMatched) {
      return res.status(400).json("Incorrect password");
    }

    //session based authentication
    console.log(req.session);
    req.session.isAuth = true;
    req.session.user = {
      userId: userDb._id,
      username: userDb.username,
      email: userDb.email,
    };

    // return res.status(200).json("Login successfull")
    return res.redirect("/dashboard")
  } catch (error) {
    return res.status(500).json(error);
  }
});

//dashboard api
// isAuth is middleware protecting the api 
app.get("/dashboard",isAuth, (req,res)=>{
  console.log("dashboard api");
  return res.send("Dashboard page")
})

// logout api
app.get("/logout",isAuth, (req,res)=>{
  console.log("logout api");
  return res.send("logout successfully")
})



 
app.listen(PORT, () => {
  console.log(clc.yellowBright(`server is running on port :`));
  console.log(clc.yellowBright(`http://localhost:${PORT}`));
});
