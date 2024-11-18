<?php
include 'db.php';
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

// Get the input data
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['order_id'], $input['rating'], $input['comment'])) {
    echo json_encode(['success' => false, 'message' => 'Incomplete data']);
    exit;
}

$user_id = $_SESSION['user_id'];
$order_id = $input['order_id'];
$rating = $input['rating'];
$comment = $input['comment'];

// Get the offer_id associated with the order
$sql = "SELECT offer_id FROM Ordr WHERE order_id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log('SQL prepare error: ' . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Server error while preparing statement']);
    exit;
}

$stmt->bind_param("ii", $order_id, $user_id);
if (!$stmt->execute()) {
    error_log('SQL execute error: ' . $stmt->error);
    echo json_encode(['success' => false, 'message' => 'Server error while executing statement']);
    exit;
}

$result = $stmt->get_result();

if (!$result || $result->num_rows !== 1) {
    error_log('Order not found for user_id: ' . $user_id . ' and order_id: ' . $order_id);
    echo json_encode(['success' => false, 'message' => 'Order not found']);
    exit;
}

$row = $result->fetch_assoc();
$offer_id = $row['offer_id'];

// Insert the review into the database
$insert_sql = "INSERT INTO Review (user_id, offer_id, rating, comment) VALUES (?, ?, ?, ?)";
$insert_stmt = $conn->prepare($insert_sql);
if (!$insert_stmt) {
    error_log('SQL prepare error for review: ' . $conn->error);
    echo json_encode(['success' => false, 'message' => 'Server error while preparing review statement']);
    exit;
}

$insert_stmt->bind_param("iiis", $user_id, $offer_id, $rating, $comment);

if ($insert_stmt->execute()) {
    echo json_encode(['success' => true]);
} else {
    error_log('SQL execute error for review insert: ' . $insert_stmt->error);
    echo json_encode(['success' => false, 'message' => 'Failed to save review']);
}

// Close the statements and the connection
$stmt->close();
$insert_stmt->close();
$conn->close();
?>
