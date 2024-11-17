<?php
include 'db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$session_user_id = $_SESSION['user_id'];

$sql = "SELECT o.date, o.order_id, u.name AS farmer_name, c.name AS category_name, o.quantity, off.price
        FROM Ordr o
        JOIN Offer off ON o.offer_id = off.offer_id
        JOIN Usr u ON off.user_id = u.user_id
        JOIN Category c ON off.category_id = c.category_id
        WHERE o.user_id = ?";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['error' => 'SQL prepare error: ' . $conn->error]);
    exit;
}

$stmt->bind_param("i", $session_user_id);
if (!$stmt->execute()) {
    echo json_encode(['error' => 'SQL execute error: ' . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
if (!$result) {
    echo json_encode(['error' => 'SQL result error: ' . $stmt->error]);
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
