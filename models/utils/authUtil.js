const regexPatterns = {
  name: /^[a-zA-Z\s]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9]{3,15}$/,
  // upper lower number and special character pass regex
  // password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])[A-Za-z]{8,}$/,
};

const userDataValidation = ({ name, username, email, password }) => {
  return new Promise((resolve, reject) => {
    name.trim();
    email.trim();
    username.trim();
    password.trim();
    console.log(name, username, email, password);

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

module.exports = { userDataValidation };
