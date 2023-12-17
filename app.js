const express = require("express");
const app = express();
const dotEnv = require("dotenv").config({ path: "./config.env" });
const port = process.env.NODE_PORT || 3000;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const stripe = require("stripe")(
  "sk_test_51OMCvBSAAZeIHngPhnTKGv2N8QpLg5KDe38Zf3dh2roL1oIjIV3MJEznzEBEbjo9ePr91PKITlOfvTj8sumlsnel00nM9N4OB3"
);
const { appRouter } = require("./model/user");
const { upload } = require("./middleware/File");
const { model } = require("./Database/ParisAirways");
const { userModel } = require("./Database/Schema");
require("./Database/connect");

//MiddleWare's
app.use(express.json());
app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.options("*", cors());
app.use(upload.single("photo"));
app.use(express.static("./png"));
app.use(cookieParser());

// Router
app.use("/", appRouter);

//Payment MiddleWare For Stripe
let from;
let to;
let name;
let price = 0;
app.post("/ParisAirways/v1/checkoutPage", async (req, res, next) => {
  const air = req.body.datas;
  price = req.body.result;
  const myDomain = "http://localhost:5173";
  const payment = {
    ID: air.Airplane.Price,
    Flight: air.FlightName,
  };
  const sessionUrl = await stripe.checkout.sessions.create({
    line_items: [
      {
        quantity: 1,
        product: payment.Flight,
        price_data: {
          currency: "INR",
          product_data: {
            name: "FLIGHT",
          },
          unit_amount: req.body.result * 100,
        },
      },
    ],
    mode: "payment",
    success_url: `${myDomain}/ParisAirways/v1/Secure/Success`,
    cancel_url: `${myDomain}?canceled=true`,
  });
  from = req.body.datas.from;
  to = req.body.datas.to;
  name = req.body.datas.Airplane.FlightName;
  res.json({
    url: sessionUrl.url,
  });
  try {
  } catch (error) {
    res.status(404).json({
      status: "failed",
      message: error,
    });
  }
});

app.post("/ParisAirways/v1/ShowTicket", async (req, res, next) => {
  try {
    let user = await userModel.findOne({ email: "gunasheelan1624@gmail.com" });
    user.history = {
      price: price,
      from: from,
      to: to,
      flightName: name,
    };
    let tick = await user.save({ validateModifiedOnly: true });
    res.status(200).json({
      status: "Success",
      message: tick,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failure",
      message: error,
    });
  }
});

app.get("/User", async (req, res) => {
  try {
    let user = await model.find();
    res.status(200).json({
      message: user,
    });
  } catch (error) {
    res.status(404).json({
      status: "Failed",
      message: error,
    });
  }
});

//Port Listening

app.listen(port, () => console.log("(❁´◡`❁)"));
