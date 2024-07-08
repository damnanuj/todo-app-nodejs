const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isEmailVerified :{
    type :Boolean,
    default : false
  }
});

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
// module.exports =mongoose.model("user", userSchema); //by this line itll be exported as the filename
