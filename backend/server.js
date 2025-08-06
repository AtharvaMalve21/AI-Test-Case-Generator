const express = require("express");
const cors = require("cors");
require("dotenv").config();

const githubRoutes = require("./routes/github.routes");
const apiRoutes = require("./routes/api.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URI,
    credentials: true,
  })
);

app.use(express.json());

app.use("/api/github", githubRoutes);
app.use("/api/ai", apiRoutes);

app.get("/", (req, res) => {
  res.json({ message: `Test Case Generator API running on port ${PORT}` });
});

app.listen(PORT, () => {
  console.log(`Server is listening to port ${PORT}`);
});

module.exports = app;
