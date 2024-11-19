<?php
include 'db.php';
session_start();

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$session_user_id = $_SESSION['user_id'];

$sql = "SELECT o.order_id, o.date, u.name AS farmer_name, c.name AS category_name, o.quantity, off.type, a.price_item, a.price_kg
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

$orders = array();
while ($row = $result->fetch_assoc()) {
    $orders[] = $row;
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($orders);
?>
