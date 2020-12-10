const bodyParser = require("body-parser");
const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const server = express();

const stripe = require("stripe")(process.env.STRIPE_SECRET_TEST); //STRIPE_SECRET_LIVE
const cors = require("cors");
server.use(cors());

// const env = process.env.NODE_ENV || "production";

const PORT = process.env.PORT || 3000;

// server.use(express.static('public'));
server.use(express.json());
server.use(function (req, res, next) {
  // res.set("Access-Control-Allow-Origin", "*")
  // res.set("Access-Control-Allow-Credentials", "true")
  res.header("Access-Control-Allow-Origin", "*");
  // res.setHeader("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "*");

  next();
});

server.options("*", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.send("ok");
});

server.get("/", (req, res) => {
  res.send("Hello, Mr. AK!");
});

// server.use(bodyParser.urlencoded({ extended: false }));
const urlencodedParser = bodyParser.urlencoded({ extended: false });

let transporter = nodemailer.createTransport(
  {
    pool: true,
    service: "Gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL,
      refreshToken: process.env.EMAIL_REFRESH_TOKEN,
      clientId: process.env.EMAIL_CLIENT_ID,
      clientSecret: process.env.EMAIL_CLIENT_SECRET,
    },
  },
  {
    from: `Mailer <${process.env.EMAIL}>`,
  }
);

transporter.verify((error, success) => {
  if (error) return console.log(error);
  console.log("Server is ready to take our messages: ", success);
  transporter.on("token", (token) => {
    console.log("A new access token was generated");
    console.log("User: %s", token.user);
    console.log("Access Token: %s", token.accessToken);
    console.log("Expires: %s", new Date(token.expires));
  });
});

server.post("/subscribe", urlencodedParser, function (req, res) {
  // console.log("!req.body.form.email!:", req.body.form.email);
  const msgAbtSubscr = `<p> You have a new subscriber! 🙂 <br/><br/>
Name: ${req.body.data.name}
Email: ${req.body.data.email}
Language: ${req.body.actLanguage}
</p>`;

  // const msgToClient = `<p style='font-weight:bold;'> Thank U! Table reservation was successful! 🙂 <br/>
  // People: ${req.body.peopleCount}<br/>
  // Date: ${req.body.date}<br/>
  // Time: ${req.body.time}<br/>
  // Name: ${req.body.name}<br/>
  // Phone: ${req.body.phone}<br/>
  // Email: ${req.body.email}</p>`;

  if (!req.body) return res.sendStatus(400);
  console.log(req.body);

  // // email to Client of Restourant
  // transporter.sendMail(
  //   {
  //     // from: process.env.GMAIL_ADDRESS,
  //     to: req.body.email,
  //     subject: "Table reservation",
  //     html: msgToClient,
  //   },
  //   function (err, info) {
  //     if (err) return res.status(500).send(err);
  //     // res.json({ success: true });
  //   }
  // );
  // email to Admin of Restourant
  transporter.sendMail(
    {
      // from: process.env.GMAIL_ADDRESS,
      to: "anker2702@gmail.com", // emailOfRestourantsAdmin
      subject: "New subscriber",
      html: msgAbtSubscr,
    },
    function (err, info) {
      if (err) return res.status(500).send(err);
      // res.json({ success: true });
      res
        .status(200)
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        .set("Access-Control-Allow-Headers", "Content-Type")
        .send(
          JSON.stringify({
            message: "This is public info",
          })
        );

      // .set('Access-Control-Allow-Origin', '*')
      // .send("OK!");
      // .redirect("https://suliko.vercel.app");

      // .redirect("http://localhost:3000");
    }
  );
});

server.post("/review", urlencodedParser, function (req, res) {
  // console.log("!req.body!:", req.body);
  const msgNewReview = `<p> You have a new review! 🙂 <br/><br/>
  Date: ${req.body.data.date}<br/>
Name: ${req.body.data.name}<br/>
Email: ${req.body.data.email}<br/>
Language: ${req.body.actLanguage}</p>
Product: ${req.body.data.linkId}<br/>
Rating: ${req.body.data.rating}<br/>
Title: ${req.body.data.title}<br/>
Review: ${req.body.data.review}<br/>
`;

  if (!req.body) return res.sendStatus(400);
  console.log(req.body);

  transporter.sendMail(
    {
      // from: process.env.GMAIL_ADDRESS,
      to: "anker2702@gmail.com", // emailOfRestourantsAdmin
      subject: "New review",
      html: msgNewReview,
    },
    function (err, info) {
      if (err) return res.status(500).send(err);
      // res.json({ success: true });
      res
        .status(200)
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        .set("Access-Control-Allow-Headers", "Content-Type")
        .send(
          JSON.stringify({
            message: "This is public info",
          })
        );
    }
  );
});

server.post("/pppdate", urlencodedParser, function (req, res) {
  console.log("!req.body!:", req.body);
  const msgNewPaypalPayment = `<p> You have a new paypal payment! 🙂 <br/><br/>
  paid:  ${req.body.paid}<br/>
  cancelled:  ${req.body.cancelled}<br/>
  payerID: ${req.body.payerID}<br/>
  paymentID: ${req.body.paymentID}<br/>
  paymentToken: ${req.body.paymentToken}<br/>
  returnUrl: ${req.body.returnUrl}<br/>
  recipient_name: ${req.body.address.recipient_name}<br/>
  line1: ${req.body.address.line1}<br/>
  city: ${req.body.address.city}<br/>
  state: ${req.body.address.state}<br/>
  postal_code: ${req.body.address.postal_code}<br/>
  country_code: ${req.body.address.country_code}<br/>
  email: ${req.body.email}<br/>`;

  if (!req.body) return res.sendStatus(400);
  console.log(req.body);

  transporter.sendMail(
    {
      // from: process.env.GMAIL_ADDRESS,
      to: "anker2702@gmail.com", // emailOfRestourantsAdmin
      subject: "New Paypal Payment",
      html: msgNewPaypalPayment,
    },
    function (err, info) {
      if (err) return res.status(500).send(err);
      // res.json({ success: true });
      res
        .status(200)
        .set("Access-Control-Allow-Origin", "*")
        .set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        .set("Access-Control-Allow-Headers", "Content-Type")
        .send(
          JSON.stringify({
            message: "This is public info",
          })
        );
    }
  );
});

server.post("/stripe/charge", urlencodedParser, async (req, res) => {
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);

  console.log("stripe-routes.js 9 | route reached", req.body);
  let {
    amount,
    id,
    currency,
    //  receipt_email
  } = req.body;
  console.log(
    "stripe-routes.js 10 | amount and id",
    amount,
    id,
    currency
    // receipt_email
  );

  try {
    const payment = await stripe.paymentIntents.create({
      // expand: ["charges.data.billing_details.address"],
      amount: amount,
      payment_method: id,
      currency: currency,
      description: "Your Company Description",
      confirm: true,
      // receipt_email: receipt_email,
    });
    console.log("stripe-routes.js 19 | payment", payment);
    // console.log(
    //   "JSON.stringify(payment.charges.data):",
    //   JSON.stringify(payment.charges.data)
    // );
    // console.log("payment.charges.data:", payment.charges.data);

    // console.log(
    //   "!!!LOOK HERE!!!",
    //   JSON.stringify(payment.charges.data).split(",")
    // );

    // console.log(
    //   "Object.entries(payment.charges.data):",
    //   Object.entries(payment.charges.data)
    // );

    // console.log(
    //   "Object.entries(payment.charges.data)[0][1].billing_details.address.country:",
    //   Object.entries(payment.charges.data)[0][1].billing_details.address.country
    // );  // !!!

    res.json({
      message: "Payment Successful",
      success: true,
    });

    // console.log("!req.body!:", req.body);
    const msgNewStripePayment = `<p> You have a new stripe payment! 🙂 <br/><br/>

    id: ${Object.entries(payment.charges.data)[0][1].id}<br/>
    amount: ${Object.entries(payment.charges.data)[0][1].amount}<br/>
    currency: ${Object.entries(payment.charges.data)[0][1].currency}<br/>
    payment_intent:  ${
      Object.entries(payment.charges.data)[0][1].payment_intent
    }<br/>
    payment_method: ${
      Object.entries(payment.charges.data)[0][1].payment_method
    }<br/>
    brand: ${
      Object.entries(payment.charges.data)[0][1].payment_method_details.card
        .brand
    }<br/>
    country: ${
      Object.entries(payment.charges.data)[0][1].payment_method_details.card
        .country
    }<br/>
    exp_month: ${
      Object.entries(payment.charges.data)[0][1].payment_method_details.card
        .exp_month
    }<br/>
    exp_year: ${
      Object.entries(payment.charges.data)[0][1].payment_method_details.card
        .exp_year
    }<br/>
    last4: ${
      Object.entries(payment.charges.data)[0][1].payment_method_details.card
        .last4
    }<br/><br/>

    name: ${
      Object.entries(payment.charges.data)[0][1].billing_details.name
    }<br/>
    email: ${
      Object.entries(payment.charges.data)[0][1].billing_details.email
    }<br/>
    city: ${
      Object.entries(payment.charges.data)[0][1].billing_details.address.city
    }<br/>
    country: ${
      Object.entries(payment.charges.data)[0][1].billing_details.address.country
    }<br/>
    line1: ${
      Object.entries(payment.charges.data)[0][1].billing_details.address.line1
    }<br/>
    line2: ${
      Object.entries(payment.charges.data)[0][1].billing_details.address.line2
    }<br/>
    postal_code: ${
      Object.entries(payment.charges.data)[0][1].billing_details.address
        .postal_code
    }<br/>


  `;

    transporter.sendMail(
      {
        // from: process.env.GMAIL_ADDRESS,
        to: "anker2702@gmail.com", // emailOfRestourantsAdmin
        subject: "New Stripe Payment",
        html: msgNewStripePayment,
      },
      function (err, info) {
        if (err) return res.status(500).send(err);
        // res.json({ success: true });
        res
          .status(200)
          .set("Access-Control-Allow-Origin", "*")
          .set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
          .set("Access-Control-Allow-Headers", "Content-Type")
          .send(
            JSON.stringify({
              message: "This is public info",
            })
          );
      }
    );
  } catch (error) {
    console.log("stripe-routes.js 17 | error", error);
    res.json({
      message: "Payment Failed",
      success: false,
    });
  }
});

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
