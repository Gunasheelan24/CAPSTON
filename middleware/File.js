const multerInstance = require("multer");
const sharp = require("sharp");

const multerDest = multerInstance.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./png");
  },
  filename: (req, file, callback) => {
    const extensionName = file.mimetype.split("/")[1];
    callback(null, `12345678910-${Date.now()}.${extensionName}`);
  },
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    console.log("You can't upload this type of file");
  }
};

exports.upload = multerInstance({
  storage: multerDest,
  fileFilter: multerFilter,
});
