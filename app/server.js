// node server with get/post using unleash

const express = require("express");
const bodyParser = require("body-parser");
// const unleash = require('unleash-client');
const unleash = require("../sdk-vendor/lib");

const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Unleash client setup
// Use PRO Sandbox
const client = unleash.initialize({
  url: "http://localhost:4242/api/",
  appName: "feedback-hackathon-node",
  customHeaders: {
    Authorization:
      process.env.API_KEY ||
      "*:development.7251814dd48c21eb698c485e9b63233fbfd5bd51f8fa46314a5678fd",
  },
});

client.on("error", console.error);
client.on("warn", console.warn);
client.on("ready", console.log);

client.on("registered", (c) => {
  console.log(`Unleash client registered`, c);
});

client.on("count", (toggle) => {
  console.log("Unleash metrics:", toggle);
});

client.on("sent", (payload) => {
  console.log("\x1b[37m", `Unleash payload`, payload, "\x1b[0m");
});

client.on("error", console.error);

client.on("destroyed", () => {
  console.log("Unleash client destroyed");
});

client.on("unhandled", (reason, promise) => {
  console.error(`Unhandled Rejection at: ${promise} reason: ${reason.message}`);
});

// Start the client!
client.start();

// Express setup
app.get("/test", (req, res) => {
  const isEnabled = client.isEnabled("is-it-any-good");
  res.send(`Feature is-it-any-good is ${isEnabled ? "enabled" : "disabled"}`);
});

app.post("/feedback", (req, res) => {
  // get score from request
  const rating = req.body.rating;
  console.log({ rating });
  // send metric to unleash
  client.sendFeedback("is-it-any-good", rating);
  // send response
  res.send("Thanks for your feedback!");
});

app.listen(3003, () => console.log("Example app listening on port 3000!"));
