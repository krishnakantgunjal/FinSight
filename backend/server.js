const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/expenses", require("./routes/expenseRoutes"));
app.use("/api/income", require("./routes/incomeRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/dashboard", require("./routes/dashboardRoutes"));
app.use('/api/recurring', require('./routes/recurringRoutes'));
app.use('/api/goals', require('./routes/goalsRoutes'));

// Default Route
app.get("/", (req, res) => {
  res.send("FinSight API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Start automated jobs
  require('./jobs/recurringJob');
});

