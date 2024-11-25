<?php
include 'session_start.php';
include 'db.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['order_id'])) {
    echo json_encode(['success' => false, 'message' => 'Incomplete data provided']);
    exit;
}

$order_id = intval($_POST['order_id']);

$conn->begin_transaction();

try {
    // Get associated offer_id
    $getOrderSql = "SELECT offer_id FROM Ordr WHERE order_id = ?";
    $stmt = $conn->prepare($getOrderSql);
    if (!$stmt) {
        throw new Exception('Failed to prepare select statement: ' . $conn->error);
    }
    $stmt->bind_param("i", $order_id);
    if (!$stmt->execute()) {
        throw new Exception('Failed to execute select statement: ' . $stmt->error);
    }
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        throw new Exception('Order not found');
    }
    $row = $result->fetch_assoc();
    $offer_id = $row['offer_id'];
    // Delete order from Ordr table
    $deleteOrderSql = "DELETE FROM Ordr WHERE order_id = ?";
    $stmt = $conn->prepare($deleteOrderSql);
    if (!$stmt) {
        throw new Exception('Failed to prepare delete statement: ' . $conn->error);
    }

    $stmt->bind_param("i", $order_id);
    if (!$stmt->execute()) {
        throw new Exception('Failed to delete order: ' . $stmt->error);
    }
    // Update the quantity in Attribute table
    $updateAttributeSql = "UPDATE Attribute SET quantity = quantity + 1 WHERE offer_id = ?";
    $stmt = $conn->prepare($updateAttributeSql);
    if (!$stmt) {
        throw new Exception('Failed to prepare update statement: ' . $conn->error);
    }
    $stmt->bind_param("i", $offer_id);
    if (!$stmt->execute()) {
        throw new Exception('Failed to update available spaces: ' . $stmt->error);
    }

    $conn->commit();
    // Return success
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // Roll back transaction if errror occured
    $conn->rollback();
    error_log("Transaction rolled back due to error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

if (isset($stmt)) {
    $stmt->close();
}

$conn->close();
?>
