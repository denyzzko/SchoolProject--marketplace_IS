<?php
include 'db.php';
header('Content-Type: application/json');

$parent_category_id = isset($_GET['parent_category_id']) ? intval($_GET['parent_category_id']) : null;

$sql = "SELECT category_id, name FROM Category WHERE parent_category ";
if (is_null($parent_category_id)) {
    $sql .= "IS NULL";
} else {
    $sql .= "= ?";
}

$stmt = $conn->prepare($sql);

if (!is_null($parent_category_id)) {
    $stmt->bind_param("i", $parent_category_id);
}

$stmt->execute();
$result = $stmt->get_result();

$categories = array();
while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode($categories);

$stmt->close();
$conn->close();
?>
