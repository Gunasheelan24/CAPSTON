const sgMail = require("@sendgrid/mail");
const crypto = require("crypto");
const bCrypt = require("bcrypt");
const { userModel } = require("../Database/Schema");
const { model } = require("../Database/ParisAirways");

exports.signUp = async (req, res, next) => {
  console.log("Hey");
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const role = "user";
    const encryptedPassword = await bCrypt.hash(password, 12);
    await userModel.create({
      name,
      email,
      password: encryptedPassword,
      role,
    });
    res.status(201).json({
      status: "success",
      message: "user created successfull",
    });
  } catch (error) {
    res.status(404).json({
      status: "Error",
      message: error,
    });
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    let email = req.body.value.email;
    const findEmail = await userModel.findOne({ email });
    if (findEmail) {
      const token = crypto.randomBytes(32, async (err, random) => {
        if (err) {
          console.log(err);
        }
        const token = random.toString("hex");
        let key =
          "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";
        sgMail.setApiKey(key);
        sgMail.send({
          from: "gunasheelan1624@gmail.com",
          to: email,
          subject: "Your Reset Password",
          html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Document</title>
    <style>
      .logo {
        text-align: center;
      }
      .reset {
        text-align: center;
      }
      .btn {
        padding: 10px;
        color: white;
        font-size: large;
        border-radius: 10px;
        background: red;
        border: 0;
      }
      .center {
        font-size: larger;
        text-align: center;
      }
      .para {
        text-align: center;
        color: red;
        font-size: large;
      }
      .ancor {
        text-decoration: none;
        /* border: 1px solid black; */
        padding: 8px;
        font-size: large;
        color: black;
        border-radius: 10px;
        background-color: red;
      }
    </style>
  </head>
  <body>
    <h1 class="logo">ParisAirways</h1>
    <h2 class="reset">You can now reset your password!</h2>
    <p class="center">
      <a href="http://localhost:3000/ParisAirways/v1/verfyToken/${token}/${email}" class="ancor"> Reset Password </a>
    </p>
    <p class="para">
      You have 24 hours to pick your password. After that, you’ll have to ask
      for a new one
    </p>
  </body>
</html>
`,
        });
        findEmail.resetToken = token;
        findEmail.isexpire = Date.now() + 3700000;
        await findEmail.save({ validateBeforeSave: false });
        res.status(200).json({
          status: "Success",
          message: "Email sent Successfull",
        });
      });
    } else {
      res.status(404).json({
        status: "Error",
        message: "There Is No User On This Email",
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "Error",
      message: error,
    });
  }
};

exports.verfyPassword = async (req, res, next) => {
  try {
    const token = req.params.id;
    const email = req.params.email;
    let userEmail = await userModel.findOne({ email });
    let time = Date.now();
    if (userEmail.isexpire <= time) {
      res.status(401).json({
        status: "Error",
        message: "Your Token Is Expired",
      });
    } else {
      if (token === userEmail.resetToken) {
        userEmail.isexpire = undefined;
        await userEmail.save({ validateBeforeSave: false });
        return res.redirect(
          200,
          `http://localhost:5173/ParisAirways/v1/resetPassword/${email}`
        );
      } else {
        console.log("Success");
        res.status(401).json({
          status: "error",
          message: "Your Token Is Not Valid",
        });
      }
    }
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    let userFind = await userModel.findOne({ email: req.params.email });
    if (userFind.resetToken) {
      userFind.password = req.body.value.password;
      userFind.confirmPassword = req.body.value.confirmPassword;
      userFind.save({
        validateBeforeSave: true,
      });
      res.status(200).json({
        status: "success",
        message: "Password changed Successfull",
      });
    } else {
      res.status(401).json({
        status: "Error",
        message: "You Are Not Allowed To Reset the Password",
      });
    }
  } catch (error) {
    res.status(404).json({
      status: "Error",
      message: error,
    });
  }
};

exports.findRoute = async (req, res, next) => {
  const package = await model.find({
    from: req.params.from,
    to: req.params.to,
  });
  res.status(200).json({
    status: "Success",
    message: package,
  });
  try {
  } catch (error) {
    res.status(404).json({
      status: "Error",
      message: error,
    });
  }
};

exports.allData = async (req, res, next) => {
  try {
    const allData = await model.find();
    res.status(200).json({
      status: "success",
      message: allData,
    });
  } catch (error) {
    res.status(404).json({
      status: "Error",
      message: error,
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    let requestData = req.body.value;
    const email = requestData.email;
    const password = requestData.password;
    const user = await userModel.findOne({ email });
    if (!user) {
      res.status(404).json({
        status: "Error",
        message: "There Is No User In This Email",
      });
    } else {
      const verify = await user.validateTheUserPassword(
        password,
        user.password
      );
      if (verify === false) {
        res.status(401).json({
          status: "Error",
          message: "Your Password Is Incorrect",
        });
      } else {
        const Generated = await user.generateJsonWebToken(user._id);
        let email = user.email.trim();
        res.cookie("jwt", Generated, {});
        res.cookie("email", email, {});
        res.cookie("username", user.name, {});
        res.cookie("id", user._id);
        res.cookie("profile", `http://localhost:3000/${user.profilePicture}`);
        res.status(200).json({
          status: "Success",
          message: "Login Successfull",
        });
      }
    }
  } catch (error) {
    res.status(404).json({
      status: "Error",
      message: error,
    });
  }
};

exports.changeProfile = async (req, res) => {
  try {
    const email = req.params.id;
    let finduser = await userModel.findOne({
      email,
    });
    finduser.profilePicture = req.file.filename;
    let userUpdated = await finduser.save({ validateModifiedOnly: true });
    const Generated = await userUpdated.generateJsonWebToken(userUpdated._id);
    res.status(200).json({
      status: "Success",
      message: "Profile Changed Successfull",
      profile: userUpdated.profilePicture,
    });
  } catch (error) {
    res.status(404).json({
      status: "Error",
      message: error,
    });
  }
};

exports.logOut = async (req, res, next) => {
  try {
    res.cookie("jwt");
    res.cookie("email");
    res.cookie("username");
    res.cookie("id");
    res.cookie("profile");
    res.status(200).json({
      status: "Success",
      message: "Signed Out",
    });
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error,
    });
  }
};
