<?php
include 'session_start.php';
include 'db.php';

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Check if required data is provided
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['order_id'])) {
    echo json_encode(['success' => false, 'message' => 'Incomplete data provided']);
    exit;
}

$order_id = intval($_POST['order_id']);

// Start a transaction to ensure data consistency
$conn->begin_transaction();

try {
    // Delete the order from the Ordr table
    $deleteOrderSql = "DELETE FROM Ordr WHERE order_id = ?";
    $stmt = $conn->prepare($deleteOrderSql);
    if (!$stmt) {
        throw new Exception('Failed to prepare delete statement: ' . $conn->error);
    }

    $stmt->bind_param("i", $order_id);
    if (!$stmt->execute()) {
        throw new Exception('Failed to delete order: ' . $stmt->error);
    }

    // Commit the transaction
    if (!$conn->commit()) {
        throw new Exception('Failed to commit transaction: ' . $conn->error);
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    // Rollback the transaction in case of any error
    $conn->rollback();
    error_log("Transaction rolled back due to error: " . $e->getMessage()); // Log the error message to help with debugging
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

if (isset($stmt)) {
    $stmt->close();
}

$conn->close();
?>
