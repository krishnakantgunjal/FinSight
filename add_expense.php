<?php include('config.php'); ?>
<!DOCTYPE html>
<html>
<head>
  <title>Add Expense</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body class="bg-light">

<div class="container mt-5 col-md-5">
  <h3 class="text-center mb-4">Add New Expense</h3>
  
  <form method="post">
    <input type="text" name="title" class="form-control mb-3" placeholder="Expense Title" required>
    
    <select name="category" class="form-control mb-3" required>
      <option value="">Select Category</option>
      <option>Food</option>
      <option>Travel</option>
      <option>Shopping</option>
      <option>Bills</option>
      <option>Others</option>
    </select>

    <input type="number" step="0.01" name="amount" class="form-control mb-3" placeholder="Amount" required>
    <input type="date" name="expense_date" class="form-control mb-3" required>
    <textarea name="note" class="form-control mb-3" placeholder="Note (optional)"></textarea>
    <button type="submit" name="save" class="btn btn-primary w-100">Save Expense</button>
  </form>

  <div class="text-center mt-3">
    <a href="view_expenses.php" class="btn btn-success">View All Expenses</a>
  </div>
</div>

<?php
if (isset($_POST['save'])) {
  $title = $_POST['title'];
  $category = $_POST['category'];
  $amount = $_POST['amount'];
  $date = $_POST['expense_date'];
  $note = $_POST['note'];

  $sql = "INSERT INTO expenses(title, category, amount, expense_date, note)
          VALUES ('$title', '$category', '$amount', '$date', '$note')";
  if ($conn->query($sql)) {
    echo "<script>alert('Expense Added Successfully');</script>";
  } else {
    echo "<script>alert('Error: " . $conn->error . "');</script>";
  }
}
?>
</body>
</html>
