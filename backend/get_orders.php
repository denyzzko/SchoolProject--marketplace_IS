<?php
include 'session_start.php';
include 'db.php';

header('Content-Type: application/json');

// Check if the user is logged in and is a farmer
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'farmer') {
    echo json_encode(['status' => 'error', 'message' => 'You are not authorized to view orders.']);
    exit();
}

$farmerId = $_SESSION['user_id'];

try {
    // Query to fetch orders for the farmer
    $sql = "SELECT 
                o.order_id, 
                o.quantity, 
                u.name AS customer_name,
                c.name AS category_name
            FROM Ordr o
            JOIN Offer off ON o.offer_id = off.offer_id
            JOIN Usr u ON o.user_id = u.user_id
            JOIN Category c ON off.category_id = c.category_id
            WHERE off.user_id = ? AND off.type = 'sale' AND o.status = 'pending'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $farmerId);
    $stmt->execute();
    $result = $stmt->get_result();

    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    if (empty($orders)) {
        echo json_encode(['status' => 'success', 'message' => 'No orders available.', 'orders' => []]);
    } else {
        echo json_encode(['status' => 'success', 'orders' => $orders]);
    }
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to fetch orders: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
