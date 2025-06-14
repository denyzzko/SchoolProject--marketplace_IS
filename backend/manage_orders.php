<?php
include 'session_start.php';
include 'db.php';

header('Content-Type: application/json');

//Check if user is logged in and his role is farmer
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'farmer') {
    echo json_encode(['status' => 'error', 'message' => 'You are not authorized to manage orders.']);
    exit();
}

//Get input data
$data = json_decode(file_get_contents('php://input'), true);
$orderId = $data['order_id'] ?? null;
$action = $data['action'] ?? null;

//Validate request
if (!$orderId || !$action) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request. Order ID or action missing.']);
    exit();
}

try {
    $conn->begin_transaction();

    //SQL query to get offer details
    $sql = "SELECT o.offer_id, o.quantity, attr.quantity AS available_quantity, attr.attribute_id
            FROM Ordr o
            JOIN Offer off ON o.offer_id = off.offer_id
            JOIN Attribute attr ON off.offer_id = attr.offer_id
            WHERE o.order_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $orderId);
    $stmt->execute();
    $order = $stmt->get_result()->fetch_assoc();

    //Check if order exists
    if (!$order) {
        throw new Exception('Order not found.');
    }

    //Handle action accept
    if ($action === 'accept') {
        //Check if quantity is enough for the order
        if ($order['available_quantity'] < $order['quantity']) {
            throw new Exception('Not enough stock available to fulfill the order.');
        }

        //SQL query to update status to confirmed
        $sql = "UPDATE Ordr SET status = 'confirmed' WHERE order_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $orderId);
        $stmt->execute();

        //SQL query to update quantity
        $sql = "UPDATE Attribute SET quantity = quantity - ? WHERE attribute_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('di', $order['quantity'], $order['attribute_id']);
        $stmt->execute();

        $message = 'Order successfully confirmed.';
    //Handle action reject
    } elseif ($action === 'reject') {
        //SQL query to update status to rejected
        $sql = "UPDATE Ordr SET status = 'rejected' WHERE order_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $orderId);
        $stmt->execute();

        $message = 'Order successfully rejected.';
    } else {
        throw new Exception('Invalid action.');
    }

    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => $message]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
