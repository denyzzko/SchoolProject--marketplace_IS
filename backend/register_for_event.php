<?php
include 'db.php';
include 'session_start.php';

header('Content-Type: application/json'); // Set the correct header

// Check if the user is logged in
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

// Check if the offer is of type 'selfpick'
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

// Check if the user is already registered
$sql = "SELECT * FROM Ordr WHERE user_id = ? AND offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $offer_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'User already registered for this event']);
    exit;
}

// Check available spaces
$sql = "SELECT quantity FROM Attribute WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Attribute not found for this offer']);
    exit;
}

$row = $result->fetch_assoc();
$available_spaces = $row['quantity'];

if ($available_spaces <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'No available spaces for this event']);
    exit;
}

// Start transaction
$conn->begin_transaction();

try {
    // Insert new order
    $sql = "INSERT INTO Ordr (user_id, offer_id, quantity, date, status) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $quantity = 1; // For self-pick events
    $date = date('Y-m-d');
    $status = 'confirmed';
    $stmt->bind_param("iiiss", $user_id, $offer_id, $quantity, $date, $status);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to register for the event');
    }

    // Decrement available spaces
    $sql = "UPDATE Attribute SET quantity = quantity - 1 WHERE offer_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $offer_id);
    if (!$stmt->execute()) {
        throw new Exception('Failed to update available spaces');
    }

    // Commit transaction
    $conn->commit();

    // **Add this code to change the user's role if they are 'registered'**
    $roleChanged = false;
    if ($_SESSION['role'] === 'registered') {
        // Update the user's role in the database
        $sql_update_role = "UPDATE Usr SET role = 'customer' WHERE user_id = ?";
        $stmt_update_role = $conn->prepare($sql_update_role);
        $stmt_update_role->bind_param("i", $user_id);
        $stmt_update_role->execute();
        $stmt_update_role->close();

        // Update the session variable
        $_SESSION['role'] = 'customer';

        $message = 'Successfully registered for the event. You have now become a customer.';
        $roleChanged = true;
    } else {
        $message = 'Successfully registered for the event.';
    }

    echo json_encode(['status' => 'success', 'message' => $message, 'roleChanged' => $roleChanged]);

} catch (Exception $e) {
    // Rollback transaction
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
