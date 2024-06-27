const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema(
  {
    todo: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
  },
  { timestamps: true }
);

const todoModel = mongoose.model("todo", todoSchema);
module.exports = todoModel;
