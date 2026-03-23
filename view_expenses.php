<?php include('config.php'); ?>
<!DOCTYPE html>
<html>
<head>
  <title>All Expenses</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body class="bg-light">

<div class="container mt-5">
  <h3 class="text-center mb-4">Expense Records</h3>
  
  <div class="text-end mb-3">
    <a href="add_expense.php" class="btn btn-primary">+ Add New Expense</a>
  </div>

  <table class="table table-bordered table-striped">
    <thead class="table-dark text-center">
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Category</th>
        <th>Amount (₹)</th>
        <th>Date</th>
        <th>Note</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <?php
      $result = $conn->query("SELECT * FROM expenses ORDER BY expense_date DESC");
      if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
          echo "<tr class='text-center'>
                  <td>{$row['id']}</td>
                  <td>{$row['title']}</td>
                  <td>{$row['category']}</td>
                  <td>{$row['amount']}</td>
                  <td>{$row['expense_date']}</td>
                  <td>{$row['note']}</td>
                  <td>
                    <a href='edit_expense.php?id={$row['id']}' class='btn btn-sm btn-warning'>Edit</a>
                    <a href='delete_expense.php?id={$row['id']}' class='btn btn-sm btn-danger' onclick='return confirm(\"Delete this expense?\")'>Delete</a>
                  </td>
                </tr>";
        }
      } else {
        echo "<tr><td colspan='7' class='text-center'>No expenses found</td></tr>";
      }
      ?>
    </tbody>
  </table>
</div>

</body>
</html>
