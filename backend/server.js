const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://fin-sight-henna.vercel.app",
  "https://fin-sight-04rg6wgqv-krishnakantgunjals-projects.vercel.app",
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.options("*", cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
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

