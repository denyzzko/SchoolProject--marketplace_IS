<?php
include 'db.php';
header('Content-Type: application/json');
// Retrieve the parent_id parameter from the GET request
$parentId = isset($_GET['parent_id']) ? $_GET['parent_id'] : null;
// If parent_id is provided, select categories with that parent, otherwise select root categories
$sql = $parentId
    ? "SELECT * FROM Category WHERE parent_category = ?"
    : "SELECT * FROM Category WHERE parent_category IS NULL";

$stmt = $conn->prepare($sql);

if ($parentId) {
    $stmt->bind_param("i", $parentId);
}

$stmt->execute();
$result = $stmt->get_result();
// Array to hold fetched categories
$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode($categories);

$stmt->close();
$conn->close();
?>
