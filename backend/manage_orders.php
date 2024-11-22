<?php
include 'session_start.php';
include 'db.php';

header('Content-Type: application/json');

// Check if the user is logged in and is a farmer
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'farmer') {
    echo json_encode(['status' => 'error', 'message' => 'You are not authorized to manage orders.']);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$orderId = $data['order_id'] ?? null;
$action = $data['action'] ?? null;

if (!$orderId || !$action) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request. Order ID or action missing.']);
    exit();
}

try {
    $conn->begin_transaction();

    // Fetch order details
    $sql = "SELECT o.offer_id, o.quantity, off.quantity AS available_quantity
            FROM Ordr o
            JOIN Offer off ON o.offer_id = off.offer_id
            WHERE o.order_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $orderId);
    $stmt->execute();
    $order = $stmt->get_result()->fetch_assoc();

    if (!$order) {
        throw new Exception('Order not found.');
    }

    if ($action === 'accept') {
        if ($order['available_quantity'] < $order['quantity']) {
            throw new Exception('Not enough stock available to fulfill the order.');
        }

        // Update order status to confirmed
        $sql = "UPDATE Ordr SET status = 'confirmed' WHERE order_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $orderId);
        $stmt->execute();

        // Decrement available quantity
        $sql = "UPDATE Offer SET quantity = quantity - ? WHERE offer_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('ii', $order['quantity'], $order['offer_id']);
        $stmt->execute();

        $message = 'Order successfully confirmed.';
    } elseif ($action === 'reject') {
        // Update order status to rejected
        $sql = "UPDATE Ordr SET status = 'rejected' WHERE order_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $orderId);
        $stmt->execute();

        $message = 'Order successfully rejected.';
    } else {
        throw new Exception('Invalid action.');
    }

    // Commit transaction
    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => $message]);
} catch (Exception $e) {
    // Rollback transaction on error
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
