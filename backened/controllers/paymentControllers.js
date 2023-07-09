const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const dotenv = require("dotenv");

dotenv.config({ path: "backened/config/.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
// console.log("bhjjh", process.env.STRIPE_SECRET_KEY);


exports.processPayment = catchAsyncErrors(async (req, res, next) => {
  try {
    const myPayment = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: "inr",
      metadata: {
        company: "Ecommerce",
      },
    });

    // console.log(myPayment);
    // console.log("payment client_secret", myPayment.client_secret);
    res
      .status(200)
      .json({ success: true, client_secret: myPayment.client_secret });
  } catch (err) {
    res.json({
      message: "Error occured in payment product -->" + err,
    });
  }
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});
