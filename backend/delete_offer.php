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

// Fetch the offer and ensure it belongs to the logged-in user
$sql = "SELECT * FROM Offer WHERE offer_id = ? AND user_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $offer_id, $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Offer not found or unauthorized']);
    exit();
}

$conn->begin_transaction();

try {
    // Update pending orders to rejected
    $sql = "UPDATE Ordr SET status = 'rejected' WHERE offer_id = ? AND status = 'pending'";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $offer_id);
    $stmt->execute();

    // Delete the offer
    $sql = "DELETE FROM Offer WHERE offer_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $offer_id);
    $stmt->execute();

    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Offer deleted successfully']);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete offer: ' . $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
