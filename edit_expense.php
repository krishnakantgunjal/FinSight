<?php include('config.php'); ?>
<!DOCTYPE html>
<html>
<head>
  <title>Edit Expense</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
</head>
<body class="bg-light">
<div class="container mt-5 col-md-5">
  <h3 class="text-center mb-4">Edit Expense</h3>

<?php
$id = $_GET['id'];
$result = $conn->query("SELECT * FROM expenses WHERE id=$id");
$row = $result->fetch_assoc();
?>

<form method="post">
  <input type="text" name="title" value="<?= $row['title'] ?>" class="form-control mb-3" required>
  <select name="category" class="form-control mb-3" required>
    <option <?= ($row['category']=='Food')?'selected':'' ?>>Food</option>
    <option <?= ($row['category']=='Travel')?'selected':'' ?>>Travel</option>
    <option <?= ($row['category']=='Shopping')?'selected':'' ?>>Shopping</option>
    <option <?= ($row['category']=='Bills')?'selected':'' ?>>Bills</option>
    <option <?= ($row['category']=='Others')?'selected':'' ?>>Others</option>
  </select>
  <input type="number" step="0.01" name="amount" value="<?= $row['amount'] ?>" class="form-control mb-3" required>
  <input type="date" name="expense_date" value="<?= $row['expense_date'] ?>" class="form-control mb-3" required>
  <textarea name="note" class="form-control mb-3"><?= $row['note'] ?></textarea>
  <button type="submit" name="update" class="btn btn-primary w-100">Update Expense</button>
</form>

<?php
if (isset($_POST['update'])) {
  $title = $_POST['title'];
  $category = $_POST['category'];
  $amount = $_POST['amount'];
  $date = $_POST['expense_date'];
  $note = $_POST['note'];

  $sql = "UPDATE expenses SET title='$title', category='$category', amount='$amount', expense_date='$date', note='$note' WHERE id=$id";
  $conn->query($sql);
  echo "<script>alert('Updated Successfully');window.location='view_expenses.php';</script>";
}
?>
</div>
</body>
</html>
