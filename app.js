// app.js
const express = require("express");
const app = express();
const port = 5000; // Or any other port number you prefer

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
