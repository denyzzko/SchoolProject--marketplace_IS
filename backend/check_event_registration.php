<?php
include 'db.php';
include 'session_start.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['registered' => false]);
    exit;
}

$user_id = $_SESSION['user_id'];
$offer_id = $_GET['offer_id'];

// Check if the user is already registered for this event
$sql = "SELECT * FROM Ordr WHERE user_id = ? AND offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $offer_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows > 0) {
    echo json_encode(['registered' => true]);
} else {
    echo json_encode(['registered' => false]);
}

$stmt->close();
$conn->close();
?>
