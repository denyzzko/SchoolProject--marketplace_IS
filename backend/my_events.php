<?php
include 'db.php';
include 'session_start.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

// Query to get self-picking events for the current user
$sql = "SELECT e.event_id, e.offer_id, e.location, e.start_date, e.end_date, c.name AS category_name, o2.order_id
        FROM SelfPickingEvent e
        JOIN Offer o ON e.offer_id = o.offer_id
        JOIN Ordr o2 ON o2.offer_id = o.offer_id
        JOIN Category c ON o.category_id = c.category_id
        WHERE o2.user_id = ? AND o.type = 'selfpick'";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    error_log('SQL prepare error: ' . $conn->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

$stmt->bind_param("i", $user_id);
if (!$stmt->execute()) {
    error_log('SQL execute error: ' . $stmt->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

$result = $stmt->get_result();
if (!$result) {
    error_log('SQL result error: ' . $stmt->error);
    echo json_encode(['error' => 'Server error, please try again later.']);
    exit;
}

$events = array();
while ($row = $result->fetch_assoc()) {
    $events[] = $row;
}

$stmt->close();
$conn->close();

header('Content-Type: application/json');
echo json_encode($events);
?>
