<?php
include 'db.php';
include 'session_start.php';

//Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

//Get User ID from session
$session_user_id = $_SESSION['user_id'];

//SQL query to get order details
$sql = "SELECT o.order_id, o.date, o.status, u.name AS farmer_name, c.category_id, o.quantity, off.type, a.price_kg
        FROM Ordr o
        LEFT JOIN Offer off ON o.offer_id = off.offer_id
        LEFT JOIN Usr u ON off.user_id = u.user_id
        LEFT JOIN Category c ON off.category_id = c.category_id
        LEFT JOIN Attribute a ON off.offer_id = a.offer_id
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
    if (is_null($categoryId)) {
        return 'Offer was deleted';
    }

    //SQL Query to get category name and parent category
    $sql = "SELECT name, parent_category FROM Category WHERE category_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $categoryId);
    $stmt->execute();
    $result = $stmt->get_result();

    //Fetch category info
    if ($row = $result->fetch_assoc()) {
        if (is_null($row['parent_category'])) {
            return $row['name'];
        }

        //Get parent category info
        $parentId = $row['parent_category'];
        $parentStmt = $conn->prepare($sql);
        $parentStmt->bind_param("i", $parentId);
        $parentStmt->execute();
        $parentResult = $parentStmt->get_result();

        //Fetch parent category info
        if ($parentRow = $parentResult->fetch_assoc()) {
            if (in_array($parentRow['name'], ['Fruit', 'Vegetable'])) {
                return $row['name'];
            } else {
                return $parentRow['name'] . ' ' . $row['name'];
            }
        }
        $parentStmt->close();
    }

    $stmt->close();
    return 'Unknown';
}

//Fetch order details and add full category name
$orders = array();
while ($row = $result->fetch_assoc()) {
    $categoryInfo = getFullCategoryInfo($row['category_id'], $conn);
    $row['full_category_name'] = $categoryInfo;
    if (!empty($row['full_category_name'])) {
        $orders[] = $row;
    }
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($orders);
?>