const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const regexPatterns = {
  name: /^[a-zA-Z\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z]{3}.{0,12}$/,
  // upper lower number and special character pass regex
  // password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
};

const userDataValidation = (name, username, email, password) => {
  return new Promise((resolve, reject) => {
    name = name && name.trim();
    username = username && username.trim();
    email = email && email.trim();
    password = password && password.trim();

    // console.log("21hiii=>>", name, username, email, password);

    if (!name || !username || !email || !password) {
      return reject("All fields are required");
    }

    if (!regexPatterns.name.test(name)) {
      return reject("Please enter a valid name");
    }
    if (!regexPatterns.username.test(username)) {
      return reject(
        "Username must be alphanumeric and between 3 to 15 characters."
      );
    }
    if (!regexPatterns.email.test(email)) {
      return reject("Please enter a valid email address");
    }
    if (!regexPatterns.password.test(password)) {
      return reject(
        "Password must be at least 8 characters long and include an uppercase letter and a lowercase letter."
      );
    }

    resolve();
  });
};

// Login details validation

const loginValidation = ({ userId, password }) => {
  return new Promise((resolve, reject) => {
    if (typeof userId !== "string" || typeof password !== "string") {
      return reject("UserId and Password must be strings");
    }

    userId = userId.trim();
    password = password.trim();

    if (!userId || !password) {
      return reject("Please enter all fields");
    }

    resolve();
  });
};

//generate email verification token

const generateToken = ({ email }) => {
  const token = jwt.sign(email, process.env.SECRET_KEY);
  return token;
};

//send verification mail

const sendVerificationMail = ({ email, token }) => {
  console.log("Line 77 auth==>>", email, token);

  let transpoter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for port 465, false for other ports like 587
    auth: {
      user: "damnanuj21@gmail.com",
      pass: process.env.APP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  let mailOptions = {
    from: "TODO-APP <damnanuj21@gmail.com>",
    to: email,
    subject: "Email verification for TODO-APP",
    text: "Hello. Please verify your email for the TODO-APP.",
    html: `<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Todo App</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  
    <style type="text/css">
      a[x-apple-data-detectors] {color: inherit !important;}
    </style>
  
  </head>
  <body style="margin: 0; padding: 0;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
      <tr>
        <td style="padding: 20px 0 30px 0;">
  
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; border: 1px solid #cccccc;">
    <tr>
      <td align="center" bgcolor="#defcf9" style="padding: 40px 0 30px 0;">
       
      </td>
    </tr>
    <tr>
      <td bgcolor="#ffffff" style="padding: 40px 30px 40px 30px;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="color: #00adb5; font-family: Arial, sans-serif;">
              <h3 style="font-size: 24px; margin: 0; margin-bottom:6px; text-align:center; font-family: Montserrat, sans-serif;">Hey</h3>
              <h3 style="font-size: 24px; margin: 0; text-align:center; "color: #00adb5;  font-family: Montserrat, sans-serif;">Activate your Email</h3>
            </td>
          </tr>
          <tr>
            <td style="color: #153643; font-family: Arial, sans-serif; font-size: 16px; line-height: 24px; padding: 20px 0 30px 0;">
                           
            <a href="https://todo-app-nodejs-m7v9.onrender.com/verifytoken/${token}" style=" border: none;
            background-color: #ef7e5c;
    color: white;
    padding: 15px 32px;
    text-align: center;
  
    text-decoration: none;
    display: inline-block;
    font-size: 16px;
    margin: 4px 175px;
    cursor: pointer;
    border-radius:5px;">Activate Account</a>
            </td>
  
        </table>
      </td>
    </tr>
    <tr>
      <td bgcolor="#ef7e5c" style="padding: 30px 30px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
          <tr>
            <td style="color: #ffffff; font-family: Arial, sans-serif; font-size: 14px;">
              <p style="margin: 0;">&reg; Someone, somewhere 2021<br/>
             <a href="" style="color: #ffffff;">Subscribe</a> to us!</p>
            </td>
            </tr>
        </table>
      </td>
    </tr>
    </table>
  
        </td>
      </tr>
    </table>
  </body>`,
  };

  // <img src="https://www.jotform.com/blog/wp-content/uploads/2020/01/email-marketing-intro-02-700x544.png" alt="logo" width="300" height="230" style="display: block;" />
  transpoter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log(
        `Email has been sent successfully : ${email}` + info.response
      );
    }
  });
};

module.exports = {
  sendVerificationMail,
  userDataValidation,
  loginValidation,
  regexPatterns,
  generateToken,
};
