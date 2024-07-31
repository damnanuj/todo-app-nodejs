const express = require("express");
const path = require('path'); 
require("dotenv").config();
const clc = require("cli-color");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const connectMongodbSession = require("connect-mongodb-session")(session);
const jwt = require("jsonwebtoken");

// const cors = require("cors")
// const cookieParser = require("cookie-parser")

//====================constants====================
const app = express();
const PORT = process.env.PORT;
// const PORT = 8000;
const store = new connectMongodbSession({
  uri: process.env.MONGO_URI,
  collection: "sessions",
});

// app.use(cookieParser())
// app.use(cors())
//====================middleware====================
// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));
app.set("view engine", "ejs");
app.use(express.json()); //body parser json format POSTMAN
app.use(express.urlencoded({ extended: true })); //body parser url
app.use(express.static("public"));
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
  generateToken,
  sendVerificationMail,
} = require("./utils/authUtil");
const userModel = require("./models/userModel");
const isAuth = require("./middleware/authMiddleware");
const todoValidation = require("./utils/todoValidation");
const todoModel = require("./models/todoModel");
const ratelimitng = require("./middleware/rateLimiting");

//====================db connections====================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log(clc.white.bgGreenBright("Mongodb connected successfully"));
  })
  .catch((err) => {
    console.log(clc.redBright(err));
  });

app.get("/", (req, res) => {
  console.log("server is running");
  return res.render("homepage");
});

// app.get("/test", (req, res)=> {
//   return res.render("test");
// });
//==================== Registration Page ====================
app.get("/register", (req, res) => {
  return res.render("registration-page");
});

app.post("/register", async (req, res) => {
  // console.log(req.body);
  const { name, username, email, password } = req.body;

  //=================user data validation====================
  try {
    await userDataValidation( name, username, email, password );
  } catch (error) {
    return res.status(400).json(error);
  }

  try {
    //=============email and username is unique or not====================
    const userEmailExist = await userModel.findOne({ email: email });
    if (userEmailExist) {
      return res.status(400).json("Email already exist");
    }
    const userUsernameExist = await userModel.findOne({ username: username });
    if (userUsernameExist) {
      return res.status(400).json("username already exist");
    }

    //====================encrypt the password====================
    // const hashedPassword = await bcrypt.hash(
    //   password,
    //   parseInt(process.env.SALT)
    // );

    //====================store userData in db====================

    const userObj = new userModel({
      name,
      username,
      email,
      // password: hashedPassword,
      password: password,
    });

    const userDb = await userObj.save();

    // return res.status(201).json({
    //   message: "Registration Successfully",
    //   data: userDb,
    // });

    //generate email verification token
    const token = generateToken({ email });

    //send verifcation mail
    sendVerificationMail({ email, token });

    return res.status(201).send(`
      <html>
        <head>
          <title>Registration Successful</title>
        </head>
        <body>
          <h1>Registration Successful</h1>
          <h2>Please check your email/spam to verify your account</h2>
          <p>Redirecting to login page in <span id="countdown">3</span> seconds...</p>
          <script>
            let countdownNumber = 5;
            const countdownElement = document.getElementById('countdown');
    
            const countdownInterval = setInterval(() => {
              countdownNumber--;
              countdownElement.textContent = countdownNumber;
    
              if (countdownNumber <= 0) {
                clearInterval(countdownInterval);
                window.location.href = '/login'; // login page URL
              }
            }, 1000);
          </script>
        </body>
      </html>
    `);
    
   
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
});

// ============verify email token ================

app.get("/verifytoken/:token", async (req, res) => {
  // console.log(req.params.token);
  const token = req.params.token;

  const email = jwt.verify(token, process.env.SECRET_KEY);
  console.log(email);

  try {
    await userModel.findOneAndUpdate(
      { email: email },
      { isEmailVerified: true }
    );
    // Generate a new session token
    const sessionToken = generateToken({ email });

    // Set the session token as a cookie (or in the response)
    res.cookie('sessionToken', sessionToken, { httpOnly: true });
    return res.send(`
      <html>
        <head>
          <title>Email Verified</title>
        </head>
        <body>
          <h1>Email has been verified successfully</h1>
          <p>Redirecting to login page in <span id="countdown">3</span> seconds...</p>
          <script>
            let countdownNumber = 3;
            const countdownElement = document.getElementById('countdown');
    
            const countdownInterval = setInterval(() => {
              countdownNumber--;
              countdownElement.textContent = countdownNumber;
    
              if (countdownNumber <= 0) {
                clearInterval(countdownInterval);
                window.location.href = '/login'; // login page URL
              }
            }, 1000);
          </script>
        </body>
      </html>
    `);
    
  } catch (error) {
    return res.status(500).json(error);
  }
});

//==================== user login api====================

app.get("/login", (req, res) => {
  return res.render("login-page", {obj:"hii"});
});

app.post("/login", async (req, res) => {
  // console.log("line 110:", req.body);
  const { userId, password } = req.body;
  console.log(userId,password);

  //====================loginData validation====================
  try {
    await loginValidation({ userId, password });
  } catch (error) {
    return res.status(400).json(error);
  }

  //====================find the user from the dataBase====================
  try {
    let userDb = {};
    //if the user login with email
    if (regexPatterns.email.test(userId)) {
      userDb = await userModel.findOne({ email: userId });
      console.log("found user with email");
      // console.log(userDb);
    }
    //if login with username
    else {
      userDb = await userModel.findOne({username : userId });
      console.log("found user with username");
      // console.log(userDb);
    }

    //if user doesn't exist and we get null
    if (!userDb) {
      return res.status(400).json("user not found, please register first");
      // return res.redirect("/register")
    }
    //check for verified email

    if (!userDb.isEmailVerified) {
      return res.status(400).send(`
        <html>
          <head>
            <title>Email Verification Required</title>
          </head>
          <body>
            <h1>Please verify your email first</h1>
            <p>Redirecting to login page in <span id="countdown">3</span> seconds...</p>
            <script>
              let countdownNumber = 3;
              const countdownElement = document.getElementById('countdown');
    
              const countdownInterval = setInterval(() => {
                countdownNumber--;
                countdownElement.textContent = countdownNumber;
    
                if (countdownNumber <= 0) {
                  clearInterval(countdownInterval);
                  window.location.href = '/login'; // login page URL
                }
              }, 1000);
            </script>
          </body>
        </html>
      `);
    }
    
    // console.log(userDb);
    //====================comapare the password====================

    // const passwordIsMatched = await bcrypt.compare(password, userDb.password);
    // // console.log(passwordIsMatched);
    // if (!passwordIsMatched) {
    //   return res.status(400).json("Incorrect password");
    // }
    if (password !== userDb.password) {
      return res.status(400).json("Incorrect password");
    }
    // ==================================================

    //====================session based authentication====================
    console.log(req.session);
    req.session.isAuth = true;
    req.session.user = {
      userId: userDb._id,
      username: userDb.username,
      email: userDb.email,
    };

    // return res.status(200).json("Login successfull")
    return res.redirect("/dashboard");
  } catch (error) {
    return res.status(500).json(error);
  }
});

//====================dashboard api=====================================
// isAuth is middleware protecting the api
app.get("/dashboard", isAuth, (req, res) => {
  // console.log("dashboard api");
  return res.render("dashboardNewUi");
});
//===================== logout api=====================
app.post("/logout", isAuth, (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error("Error destroying session:", error); // Log the error
      return res.status(500).json("Logout Unsuccessful");
    }

    console.log("Logout successful");
    res.status(200).json({ message: "Logout successful" });
  });
});

//================== logout from all devices api=====================
// app.post("/logout-all-device", isAuth,async (req,res)=>{
//   const userId = req.session.user.userId;
//   //create a session schema
//   const sessionSchema = new Schema({ _id: String }, { strict: false });
//   //convert it into model
//   const sessionModel = mongoose.model("session", sessionSchema);
//   //mongoose query to delete all the related entries
//   try {
//     const deletedSessions = await sessionModel.deleteMany({
//       "session.user.userId": userId,
//     });
//     console.log("Line 115", deletedSessions);
//     res.send({
//       status: 200,
//       message: `Logout from ${deletedSessions.deletedCount} devices successfull`,
//     });
//   } catch (error) {
//     return res.send({
//       status: 500,
//       message: "Internal server error",
//       error: error,
//     });
//   }
//   console.log("Logout from all devices successfull");
// })

// ===================todoCreation api==================================
app.post("/create-item", isAuth, ratelimitng, async (req, res) => {
  const username = req.session.user.username;
  const todo = req.body.todo;

  // console.log(username, todo);
  // todo validation
  try {
    await todoValidation({ todo: todo });
  } catch (error) {
    
    return res.status(400).json(error);
  }

  //store data in db
  const todoObj = new todoModel({
    todo,
    username,
  });
  try {
    const todoDb = await todoObj.save();
    return res.status(201).json({
      message: "todo added successfully",
      data: todoDb,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error,
    });
  }
});

// =================read a user todos from Db============================
// read-item?skip=5
app.get("/read-item", isAuth, async (req, res) => {
  const username = req.session.user.username;
  const SKIP = Number(req.query.skip) || 0;
  const LIMIT = 5;
  // console.log(SKIP);
  try {
    // const todos = await todoModel.find({ username: username });
    //mongodb aggregate method
    //pagination(skip,limit), match

    const todos = await todoModel.aggregate([
      {
        $match: { username: username },
      },
      {
        $skip: SKIP,
      },
      {
        $limit: LIMIT,
      },
    ]);
    // console.log(todos);
    if (todos.length === 0) {
      return res.send({
        status: 204,
        message: "No todo found, please add something",
      });
    }
    return res.send({
      status: 200,
      message: "Read success",
      data: todos,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal error",
      error: error,
    });
  }
});

// ===================Edit TODO Api
app.post("/edit-item", isAuth, async (req, res) => {
  const newData = req.body.newData;
  const todoId = req.body.todoId;
  const username = req.session.user.username;

  if (!todoId) {
    return res.status(400).json("Todo id is missing");
  }
  // todo validation
  try {
    await todoValidation({ todo: newData });
  } catch (error) {
    return res.send({
      status: 400,
      message: error,
    });
  }

  // provided todo id present or not in DB
  try {
    const todoDb = await todoModel.findOne({ _id: todoId });
    // console.log(todoDb);
    if (!todoDb) {
      return res.status(400).json(`Todo not found with this id ${todoId}`);
    }

    //  ownership check of the provided todoId
    const ownerUsername = todoDb.username;
    // console.log(username, ownerUsername);

    if (username !== ownerUsername) {
      return res.send({
        status: 403,
        message: "You are not allowed to edit the todo",
      });
    }

    // all checks done now update the todo
    const todoDbPrev = await todoModel.findOneAndUpdate(
      { _id: todoId },
      { todo: newData }
    );
    // console.log(todoDbPrev);
    return res.send({
      status: 200,
      message: "Todo updated successfully",
      data: todoDbPrev,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});

// ===============Delete todo api======================
app.post("/delete-item", isAuth, async (req, res) => {
  const todoId = req.body.todoId;

  if (!todoId) {
    return res.status(400).json("Todo id is missing");
  }
  try {
    // check if present or not
    const todoDb = await todoModel.findOne({ _id: todoId });
    // console.log(todoDb);
    if (!todoDb) {
      return res.send({
        status: 400,
        message: "No todo found with this id",
      });
    }
    // Ownership check of id

    const username = req.session.user.username;
    const ownerUsername = todoDb.username;
    // console.log(username, ownerUsername);
    if (username !== ownerUsername) {
      return res.send({
        status: 403,
        message: "You are not allowed to delete",
      });
    }
    // all checks done finally delete the todo
    const todoPrev = await todoModel.findOneAndDelete({ _id: todoId });
    // console.log(todoPrev);
    return res.send({
      status: 200,
      message: "Todo deleted successfully",
      data: todoPrev,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
});


// ===============Delete all todos api======================
app.post("/delete-all-items", isAuth, async (req, res) => {
  try {
    // Get the username from the session
    const username = req.session.user.username;

    // Delete all todos associated with the current user
    const result = await todoModel.deleteMany({ username: username });

    // Check if any todos were deleted
    if (result.deletedCount === 0) {
      return res.send({
        status: 400,
        message: "No todos found to delete",
      });
    }

    return res.send({
      status: 200,
      message: "All todos deleted successfully",
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Internal server error",
      error: error,
    });
  }
})
// =========================================
app.listen(PORT, () => {
  (clc.yellowBright(`server is running on port :`));
  console.log(clc.yellowBright(`http://localhost:${PORT}`));
});
