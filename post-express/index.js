const express = require("express");
const path = require("path");
const fs = require("fs");

const PORT = 8888;

const app = express();

// need this to receive json
app.use(express.json());

// health check
app.get("/ping", function (req, res) {
  return res.send("pong");
});

//
app.get("/users", async function (req, res) {
  let users = fs.readFileSync("./users.txt", "utf8");

  users = users.split("\n");

  res.send({ users });
});

//
app.post("/users", async function (req, res) {
  const { user = null } = req.body;

  if (!user) {
    return res.status(422).send({
      msg: "`user` key is not present...",
    });
  }

  const users = fs.readFileSync("./users.txt", "utf8");

  if (users.split("\n").includes(user)) {
    return res.status(500).send({
      msg: "user already exists...",
    });
  }

  fs.appendFileSync("./users.txt", "\n" + user);

  return res.send({
    msg: `${user} is added to users`,
  });
});

app.listen(PORT, function () {
  console.log("server running on port:", PORT);
});

// // Append to file
// fs.appendFile("file.txt", "\nAppended content", (err) => {
//   if (err) {
//     console.error("Error appending to file:", err);
//     return;
//   }
//   console.log("Content appended successfully");
// });
