const { fetchData } = require("./controller/controller.js");
const express = require("express");
const cors = require("cors");
const server = express();

const port = 4000;

server.use(cors());

server.get("/datas", fetchData);

server.listen(port, (err) => {
  if (!err) console.log("Server listening at port", port);
  else console.log("Error connecting server", err);
});
