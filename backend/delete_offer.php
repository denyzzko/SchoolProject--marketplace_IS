<?php
include 'db.php';
session_start();

// Check if user is logged in and is a farmer
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'farmer') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$user_id = $_SESSION['user_id'];

$data = json_decode(file_get_contents('php://input'), true);
$offer_id = $data['offer_id'];

// Fetch the offer to ensure it belongs to this user
$sql = "SELECT * FROM Offer WHERE offer_id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $offer_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Offer not found or unauthorized']);
    exit();
}

// Delete the offer and related entries
// First, delete from Attribute table
$sql = "DELETE FROM Attribute WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();

// Then, delete from SelfPickingEvent table
$sql = "DELETE FROM SelfPickingEvent WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();

// Finally, delete from Offer table
$sql = "DELETE FROM Offer WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Offer deleted successfully']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete offer']);
}

$conn->close();
?>
