const path = require("path");
const express = require("express");
const PORT = process.env.PORT || 3000;
const app = express();

module.exports = app;

const createApp = () => {
  // body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // static file-serving middleware
  app.use(express.static(path.join(__dirname, "..", "frontend/build")));

  // sends index.html
  app.use("*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "frontend/build/index.html"));
  });
};

const startListening = () => {
  // start listening (and create a 'server' object representing our server)
  app.listen(PORT, () => console.log(`I'm listening on port ${PORT}!`));
};

async function bootApp() {
  await createApp();
  await startListening();
}

bootApp();
