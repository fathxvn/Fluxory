const express = require("express");
const cors = require("cors");
require("dotenv").config();

const itemRoutes = require("./routes/itemRoutes");
const authRoutes = require("./routes/authRoutes");
const borrowRequestRoutes = require("./routes/borrowRequestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Fluxory API Running",
  }); 
});

app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/borrow-requests", borrowRequestRoutes); 
app.use("/api/dashboard", dashboardRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 
