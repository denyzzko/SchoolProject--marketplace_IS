<?php
include 'db.php';
include 'session_start.php';

header('Content-Type: application/json'); // Nastavení správné hlavičky

// Kontrola, zda je uživatel přihlášen
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$input = json_decode(file_get_contents('php://input'), true);

if (!isset($input['offer_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Offer ID not provided']);
    exit;
}

$offer_id = $input['offer_id'];

// Kontrola, zda je nabídka typu 'selfpick'
$sql = "SELECT type FROM Offer WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Offer not found']);
    exit;
}

$row = $result->fetch_assoc();
if ($row['type'] !== 'selfpick') {
    echo json_encode(['status' => 'error', 'message' => 'Offer is not a self-pick event']);
    exit;
}

// Kontrola, zda již uživatel není zaregistrován
$sql = "SELECT * FROM Ordr WHERE user_id = ? AND offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $offer_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'User already registered for this event']);
    exit;
}

// Vložení nové objednávky
$sql = "INSERT INTO Ordr (user_id, offer_id, quantity, date, status) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$quantity = 1; // Pro self-pick eventy
$date = date('Y-m-d');
$status = 'confirmed';
$stmt->bind_param("iiiss", $user_id, $offer_id, $quantity, $date, $status);

if ($stmt->execute()) {
    echo json_encode(['status' => 'success', 'message' => 'Successfully registered for the event']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Failed to register for the event']);
}

$stmt->close();
$conn->close();
?>
