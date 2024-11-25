<?php
include 'db.php';

header('Content-Type: application/json');

// Retrieve the parent_category_id from the GET request
$parent_category_id = isset($_GET['parent_category_id']) ? intval($_GET['parent_category_id']) : null;

// SQL query to select category ID and name from the Category table
$sql = "SELECT category_id, name FROM Category WHERE parent_category ";

if (is_null($parent_category_id)) {
    // If no parent id is provided, fetch categories where parent_category is NULL
    $sql .= "IS NULL";
} else {
    // If a parent id is provided, fetch categories with the specified parent id
    $sql .= "= ?";
}

$stmt = $conn->prepare($sql);

if (!is_null($parent_category_id)) {
    $stmt->bind_param("i", $parent_category_id);
}

$stmt->execute();

// Get the result rom the executed statement
$result = $stmt->get_result();

// Array to hold categories
$categories = array();

while ($row = $result->fetch_assoc()) {
    $categories[] = $row;
}

echo json_encode($categories);

$stmt->close();
$conn->close();
?>
