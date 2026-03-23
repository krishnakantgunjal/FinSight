<?php
include('config.php');
$id = $_GET['id'];
$conn->query("DELETE FROM expenses WHERE id=$id");
header("Location: view_expenses.php");
?>
