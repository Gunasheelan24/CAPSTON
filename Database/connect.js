const mongoose = require("mongoose");
const url = process.env.NODE_DB;

let mongoConnect = mongoose
  .connect(url)
  .then((connection) => console.log("Connected To The Db"))
  .catch((err) => console.log(err));

exports.mongoConnect = mongoConnect;
