const bodyParser = require("body-parser");
const express = require("express");
const nodemailer = require("nodemailer");
require("dotenv").config();
const server = express();

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

const secretKey = process.env.RECAPTCHA_SECRET_KEY;

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
  if (!req.body) return res.sendStatus(400);
  console.log(req.body);
  const { emailValue, tokenRecapcha } = req.body;
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${tokenRecapcha}`;

  const msgAbtSubscr = `<p> You have a new subscriber! 🙂 <br/><br/>
Email: ${emailValue}
</p>`;

  if (!tokenRecapcha) {
    return res.json({
      msg: "There was a problem with your request. Please try again later.",
    });
  }
  request(verificationUrl, (err, response, body) => {
    // Stop process for any errors
    if (err) {
      return res.json({
        msg: "Unable to process request.",
      });
    }
    // Destructure body object
    // Check the reCAPTCHA v3 documentation for more information
    const { success, score } = JSON.parse(body);
    // reCAPTCHA validation
    if (!success || score < 0.4) {
      return res.json({
        msg: "Sending failed. Robots aren't allowed here.",
        score: score,
      });
    }
    // When no problems occur, "send" the form
    console.log("Congrats you sent the form:\n", emailVal, messageVal);

    // Return feedback to user with msg
    return res.json({
      msg: "Your message was sent successfully!",
      score: score,
    });
  });

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
    }
  );
});

server.post("/review", urlencodedParser, function (req, res) {
  const msgNewReview = `<p> You have a new review! 🙂 <br/><br/>
Poduct: ${req.body.linkId}<br/>
Rating: ${req.body.rating}<br/>
Title: ${req.body.title}<br/>
Review: ${req.body.review}<br/>
Date: ${req.body.date}<br/>
Name: ${req.body.name}<br/>
Email: ${req.body.email}</p>`;

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

server.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
