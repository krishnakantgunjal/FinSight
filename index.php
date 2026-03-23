<?php
require_once 'db.php';

$pdo = getPDO();
$message = '';

// Handle Add Expense Form
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_expense'])) {
    $date = $_POST['date'] ?? '';
    $category = trim($_POST['category'] ?? '');
    $amount = $_POST['amount'] ?? '';
    $description = trim($_POST['description'] ?? '');
    $user_id = 1; // temp user

    if ($date && $category && $amount) {
        $stmt = $pdo->prepare('INSERT INTO expenses (user_id, date, category, amount, description) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$user_id, $date, $category, $amount, $description]);
        $message = "✅ Expense added successfully!";
    } else {
        $message = "⚠️ Please fill Date, Category, and Amount.";
    }
}

// Handle Filters
$search = trim($_GET['search'] ?? '');
$categoryFilter = trim($_GET['category'] ?? '');
$fromDate = $_GET['from_date'] ?? '';
$toDate = $_GET['to_date'] ?? '';

$query = "SELECT * FROM expenses WHERE user_id = 1";
$params = [];

// Add search conditions dynamically
if ($search !== '') {
    $query .= " AND (description LIKE ? OR amount LIKE ? OR date LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($categoryFilter !== '') {
    $query .= " AND category = ?";
    $params[] = $categoryFilter;
}

if ($fromDate !== '' && $toDate !== '') {
    $query .= " AND date BETWEEN ? AND ?";
    $params[] = $fromDate;
    $params[] = $toDate;
}

$query .= " ORDER BY date DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$expenses = $stmt->fetchAll();

// Fetch distinct categories for dropdown
$catStmt = $pdo->query("SELECT DISTINCT category FROM expenses WHERE user_id = 1");
$categories = $catStmt->fetchAll(PDO::FETCH_COLUMN);
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Personal Expense Tracker</title>
<style>
    body {
        font-family: Arial, sans-serif;
        background: #f8f9fa;
        margin: 0;
        padding: 20px;
    }
    h1 {
        text-align: center;
        margin-bottom: 25px;
        color: #333;
    }
    form {
        background: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        max-width: 500px;
        margin: 0 auto 30px;
    }
    .filter-form {
        max-width: 100%;
        margin-bottom: 25px;
        background: #ffffff;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    input, select, textarea, button {
        width: 100%;
        padding: 10px;
        margin: 8px 0;
        border: 1px solid #ccc;
        border-radius: 6px;
    }
    button {
        background-color: #007bff;
        color: white;
        border: none;
        cursor: pointer;
    }
    button:hover {
        background-color: #0056b3;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        background: white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    th, td {
        border: 1px solid #ddd;
        padding: 10px;
        text-align: center;
    }
    th {
        background-color: #007bff;
        color: white;
    }
    .message {
        text-align: center;
        font-weight: bold;
        margin-bottom: 15px;
    }
    a {
        text-decoration: none;
        color: #007bff;
    }
    a:hover {
        text-decoration: underline;
    }
</style>
</head>
<body>

<h1>Personal Expense Tracker</h1>

<div class="message"><?= htmlspecialchars($message) ?></div>

<!-- ADD EXPENSE FORM -->
<form method="POST" action="">
    <input type="hidden" name="add_expense" value="1">
    <label for="date">Date:</label>
    <input type="date" name="date" required>

    <label for="category">Category:</label>
    <input type="text" name="category" placeholder="e.g., Food, Transport, Bills" required>

    <label for="amount">Amount (₹):</label>
    <input type="number" step="0.01" name="amount" required>

    <label for="description">Description:</label>
    <textarea name="description" rows="2" placeholder="Optional note"></textarea>

    <button type="submit">Add Expense</button>
</form>

<!-- FILTER & SEARCH FORM -->
<form method="GET" class="filter-form">
    <label>Search (by Description / Date / Amount):</label>
    <input type="text" name="search" placeholder="Search..." value="<?= htmlspecialchars($search) ?>">

    <label>Filter by Category:</label>
    <select name="category">
        <option value="">All Categories</option>
        <?php foreach ($categories as $cat): ?>
            <option value="<?= htmlspecialchars($cat) ?>" <?= $cat === $categoryFilter ? 'selected' : '' ?>>
                <?= htmlspecialchars($cat) ?>
            </option>
        <?php endforeach; ?>
    </select>

    <label>Date Range:</label>
    <input type="date" name="from_date" value="<?= htmlspecialchars($fromDate) ?>">
    <input type="date" name="to_date" value="<?= htmlspecialchars($toDate) ?>">

    <button type="submit">Apply Filters</button>
    <a href="index.php" style="display:inline-block; margin-top:10px; text-decoration:none; color:#e63946;">Reset</a>
</form>

<h2 style="text-align:center; margin:30px 0 10px;">Expense History</h2>

<table>
    <thead>
        <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount (₹)</th>
            <th>Description</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?php if (count($expenses) > 0): ?>
            <?php foreach ($expenses as $exp): ?>
                <tr>
                    <td><?= htmlspecialchars($exp['date']) ?></td>
                    <td><?= htmlspecialchars($exp['category']) ?></td>
                    <td><?= htmlspecialchars($exp['amount']) ?></td>
                    <td><?= htmlspecialchars($exp['description']) ?></td>
                    <td>
                        <a href="edit_expense.php?id=<?= $exp['id'] ?>">✏️ Edit</a> |
                        <a href="delete_expense.php?id=<?= $exp['id'] ?>" onclick="return confirm('Are you sure you want to delete this expense?')">🗑️ Delete</a>
                    </td>
                </tr>
            <?php endforeach; ?>
        <?php else: ?>
            <tr><td colspan="5">No expenses found.</td></tr>
        <?php endif; ?>
    </tbody>
</table>

</body>
</html>
