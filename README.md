# 💰 FinSight – Intelligent Personal Finance Management System

## 🚀 Project Overview
**FinSight** is a modern full-stack personal finance web application designed to help users **track, analyze, and improve their financial habits**.

Unlike traditional expense trackers, FinSight goes beyond simple transaction logging by integrating **budget planning, recurring expense automation, savings goal tracking, and AI-powered financial insights**.

The platform provides a **clean dashboard with real-time analytics**, enabling users to clearly understand their income, spending patterns, and overall financial health.

---

## ✨ FinSight Solution
FinSight provides a complete financial management system:

- 📊 Smart Dashboard with real-time analytics  
- 🏷 Category-based expense & income tracking  
- 📈 Budget management with alerts  
- 🔁 Recurring expense automation  
- 🎯 Savings goal tracking  
- 📂 CSV/XLSX transaction import  
- 📄 PDF export reports  
- 🤖 AI-based financial advice  
- 📱 Fully responsive design  

---

## 🛠 Tech Stack

| Category | Technologies |
|----------|------------|
| Frontend | React (Vite), React Router, Axios |
| UI & Charts | Chart.js, react-chartjs-2, Lucide Icons, react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MySQL (mysql2) |
| Authentication | JWT, Bcrypt |
| File Handling | Multer, CSV Parser, XLSX |
| Automation | Node-cron |
| AI Integration | Gemini, OpenRouter, Groq, OpenAI |
| Deployment | Vercel, Railway |

---

## 📁 Project Structure

```
FinSight/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/             # Business logic (API handlers)
│   │   ├── aiController.js
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── dashboardController.js
│   │   ├── expenseController.js
│   │   ├── goalsController.js
│   │   ├── importController.js
│   │   ├── incomeController.js
│   │   └── recurringController.js
│   ├── jobs/
│   │   └── recurringJob.js      # Cron job for recurring expenses
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT authentication
│   │   ├── upload.js            # File upload handling
│   │   └── validate.js          # Request validation
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── goalsRoutes.js
│   │   ├── incomeRoutes.js
│   │   └── recurringRoutes.js
│   ├── utils/
│   │   ├── mailer.js           # Email utility
│   │   └── merchantMap.js      # Category mapping
│   ├── validators/
│   │   └── expenseValidator.js
│   ├── .env.example            # Environment variables template
│   ├── package.json
│   └── server.js               # Entry point of backend
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AIAdviceWidget.jsx
│   │   │   ├── ComparisonChart.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── GoalCard.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/              # Application pages
│   │   │   ├── AddExpense.jsx
│   │   │   ├── AddIncome.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── Import.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Recurring.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── SetBudget.jsx
│   │   │   └── Settings.jsx
│   │   ├── services/
│   │   │   └── api.js          # API integration
│   │   ├── utils/
│   │   │   ├── exportPDF.js    # PDF export logic
│   │   │   └── formatCurrency.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx            # Entry point of frontend
│   ├── index.html
│   ├── vercel.json             # Deployment config
│   └── package.json
│
├── Media/                      # Project screenshots
├── expense_db.sql              # Database schema
└── .gitignore
```

> This project follows a modular and scalable architecture similar to production-grade applications.

---

## 📸 Screenshots & Features

### 📊 Dashboard
Provides an overview of total income, expenses, balance, and budget usage.  
Helps users quickly understand their financial status.
![Dashboard](./Media/Dashboard.png)


---

### 💸 Expense Management
Allows users to add, categorize, and track expenses.  
Supports filtering by date and category for better insights.
![Expenses](./Media/Expense.png)


---

### 💰 Income Tracking
Records all income sources and displays monthly income trends.  
Helps users compare earnings vs spending.
![Income](./Media/Income.png)


---

### 📈 Budget Planning
Users can set monthly budgets and monitor usage.  
Alerts users when spending approaches limits.
![Budget](./Media/Budget%20Planning.png)


---

### 🎯 Savings Goals
Allows users to define financial goals (e.g., saving money).  
Tracks progress visually to motivate users.
![Goals](./Media/Goals.png)

 

---

### 🔁 Recurring Expenses
Automates repeated expenses like rent or subscriptions.  
Handled using backend cron jobs.
![Recurring](./Media/Recurring%20Expenses.png)



---

### 🤖 Smart Financial Advice
Generates personalized financial advice based on user data.  
Uses AI providers to give actionable suggestions.
![AI Advice](./Media/Smart%20Financial%20Advice.png)


---

### ⚙️ Account Settings
Allows users to manage profile, preferences, and account security.
![Settings](./Media/Account%20Settings.png)

  
---

## 🌟 Why This Project Stands Out

- Combines **Finance + AI (high-demand skill)**  
- Real-world full-stack implementation  
- Includes automation (recurring transactions)  
- AI-powered personalized insights  
- Clean and responsive UI  
- Fully deployed production-ready system  

---

## 🔮 Future Improvements

- AI-based expense prediction  
- Voice-based financial assistant  
- Investment tracking module  
- Multi-user shared budgeting  
- Mobile application  

---

## 👨‍💻 Author

**Krishnakant Shivaji Gunjal**

- GitHub: https://github.com/krishnakantgunjal  
- LinkedIn: https://www.linkedin.com/in/krishnakant-gunjal/  

---
