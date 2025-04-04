require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { authRouter, authenticateToken } = require("./auth");
const gadgetsRouter = require("./gadgets");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

app.use("/gadgets", authenticateToken, gadgetsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
