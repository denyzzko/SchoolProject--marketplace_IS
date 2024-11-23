<?php
include 'db.php';
include 'session_start.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$session_user_id = $_SESSION['user_id'];

$sql = "SELECT o.order_id, o.date, o.status, u.name AS farmer_name, c.category_id, o.quantity, off.type, a.price_kg
        FROM Ordr o
        JOIN Offer off ON o.offer_id = off.offer_id
        JOIN Usr u ON off.user_id = u.user_id
        JOIN Category c ON off.category_id = c.category_id
        JOIN Attribute a ON off.offer_id = a.offer_id
        WHERE o.user_id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log('SQL prepare error: ' . $conn->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

$stmt->bind_param("i", $session_user_id);
if (!$stmt->execute()) {
    error_log('SQL execute error: ' . $stmt->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

$result = $stmt->get_result();
if (!$result) {
    error_log('SQL result error: ' . $stmt->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

// Function to get full category info, excluding main categories "Fruit" and "Vegetable"
function getFullCategoryInfo($categoryId, $conn) {
    $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $categoryId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Skip categories that have no parent (i.e., root categories)
        if (is_null($row['parent_category'])) {
            return ''; // Skip root categories
        }
        
        // If the category has no parent, return the name
        if (empty($row['parent_category'])) {
            return $row['name'];
        }
        
        // Get the parent category name
        $parentId = $row['parent_category'];
        $parentStmt = $conn->prepare($sql);
        $parentStmt->bind_param("i", $parentId);
        $parentStmt->execute();
        $parentResult = $parentStmt->get_result();

        if ($parentRow = $parentResult->fetch_assoc()) {
            // If the parent category is "Fruit" or "Vegetable", return only the child name
            if (in_array($parentRow['name'], ['Fruit', 'Vegetable'])) {
                return $row['name'];
            } else {
                return $parentRow['name'] . ' ' . $row['name'];
            }
        }
        $parentStmt->close();
    }

    $stmt->close();
    return '';
}

$orders = array();
while ($row = $result->fetch_assoc()) {
    $categoryInfo = getFullCategoryInfo($row['category_id'], $conn);
    $row['full_category_name'] = $categoryInfo;
    // Add the order only if the category is not empty
    if (!empty($row['full_category_name'])) {
        $orders[] = $row;
    }
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($orders);
?>