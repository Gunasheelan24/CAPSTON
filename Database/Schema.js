const mongoose = require("mongoose");
const bCrypt = require("bcrypt");
const jsonToken = require("jsonwebtoken");
const jwtPassword = process.env.NODE_JWT;

const model = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Enter The userName"],
  },
  email: {
    type: String,
    required: [true, "Enter The Email"],
  },
  password: {
    type: String,
    required: [true, "Enter The Password"],
  },
  profilePicture: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    required: [true, "Enter The confirmPassword"],
    enum: ["user", "admin"],
  },
  resetToken: String,
  isexpire: Date,
  history: [{ price: Number, from: String, to: String }],
});

model.methods.validateTheUserPassword = async (
  orginalPassword,
  encryptedPassword
) => {
  try {
    const result = await bCrypt.compare(orginalPassword, encryptedPassword);
    return result;
  } catch (error) {
    console.log(error);
  }
};

model.methods.generateJsonWebToken = async (id) => {
  try {
    const token = await jsonToken.sign({ id: id }, jwtPassword);
    return token;
  } catch (error) {
    console.log(error);
  }
};

const userModel = mongoose.model("signUp", model);
exports.userModel = userModel;
