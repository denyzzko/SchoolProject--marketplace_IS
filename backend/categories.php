<?php
include 'db.php';
header('Content-Type: application/json');
$parentId = isset($_GET['parent_id']) ? $_GET['parent_id'] : null;
$sql = $parentId
    ? "SELECT * FROM Category WHERE parent_category = ?"
    : "SELECT * FROM Category WHERE parent_category IS NULL";

$stmt = $conn->prepare($sql);

if ($parentId) {
    $stmt->bind_param("i", $parentId);
}

$stmt->execute();
$result = $stmt->get_result();

$categories = [];
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode($categories);
$stmt->close();
$conn->close();
?>
