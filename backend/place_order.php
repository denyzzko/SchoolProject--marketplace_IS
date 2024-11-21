<?php
include 'db.php';

include 'session_start.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in.']);
    exit;
}

$user_id = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);
$offer_id = $data['offer_id'];
$quantity = $data['quantity'];
$date = date('Y-m-d');
$status = 'pending';

// Check if quantity is available
$sql = "SELECT quantity FROM Attribute WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();
$result = $stmt->get_result();
$offer = $result->fetch_assoc();

if ($offer['quantity'] < $quantity) {
    echo json_encode(['status' => 'error', 'message' => 'Not enough quantity available.']);
    exit;
}

// Insert order
$sql = "INSERT INTO Ordr (user_id, offer_id, quantity, date, status) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iiiss", $user_id, $offer_id, $quantity, $date, $status);
$stmt->execute();

// Update quantity in Attribute table
$new_quantity = $offer['quantity'] - $quantity;
$sql = "UPDATE Attribute SET quantity = ? WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $new_quantity, $offer_id);
$stmt->execute();

echo json_encode(['status' => 'success', 'message' => 'Order placed successfully.']);

$stmt->close();
$conn->close();
?>
