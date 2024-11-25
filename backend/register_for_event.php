<?php
include 'db.php';
include 'session_start.php';

header('Content-Type: application/json');

//Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in']);
    exit;
}

//Get User ID from session
$user_id = $_SESSION['user_id'];
//Get input from REQUEST
$input = json_decode(file_get_contents('php://input'), true);

//Check if offer_id is provided 
if (!isset($input['offer_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Offer ID not provided']);
    exit;
}

//Get offer_id from input
$offer_id = $input['offer_id'];

//SQL query to get offer type
$sql = "SELECT type FROM Offer WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();
$result = $stmt->get_result();

//Check if offer exists
if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Offer not found']);
    exit;
}

//Check if offer is a selfpick
$row = $result->fetch_assoc();
if ($row['type'] !== 'selfpick') {
    echo json_encode(['status' => 'error', 'message' => 'Offer is not a self-pick event']);
    exit;
}

//SQL query to check if user is already registred for the selfpicking event
$sql = "SELECT * FROM Ordr WHERE user_id = ? AND offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $user_id, $offer_id);
$stmt->execute();
$result = $stmt->get_result();

//Check if user is already registered
if ($result->num_rows > 0) {
    echo json_encode(['status' => 'error', 'message' => 'User already registered for this event']);
    exit;
}

//SQL query to get available quantity
$sql = "SELECT quantity FROM Attribute WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();
$result = $stmt->get_result();

//Check if that attribute exists
if ($result->num_rows === 0) {
    echo json_encode(['status' => 'error', 'message' => 'Attribute not found for this offer']);
    exit;
}

//Get remaing spaces left for the event
$row = $result->fetch_assoc();
$available_spaces = $row['quantity'];

//Check for available spaces
if ($available_spaces <= 0) {
    echo json_encode(['status' => 'error', 'message' => 'No available spaces for this event']);
    exit;
}

$conn->begin_transaction();

try {
    //Inser the registration for the event into Order
    $sql = "INSERT INTO Ordr (user_id, offer_id, quantity, date, status) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $quantity = 1; // For self-pick events always 1 registered user
    $date = date('Y-m-d');
    $status = 'confirmed';
    $stmt->bind_param("iiiss", $user_id, $offer_id, $quantity, $date, $status);
    
    if (!$stmt->execute()) {
        throw new Exception('Failed to register for the event');
    }

    //SQL query to update Attribute table with the new quantity
    $sql = "UPDATE Attribute SET quantity = quantity - 1 WHERE offer_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $offer_id);
    if (!$stmt->execute()) {
        throw new Exception('Failed to update available spaces');
    }

    $conn->commit();

    //Check if user is registred, if so set him to customer
    $roleChanged = false;
    if ($_SESSION['role'] === 'registered') {
        $sql_update_role = "UPDATE Usr SET role = 'customer' WHERE user_id = ?";
        $stmt_update_role = $conn->prepare($sql_update_role);
        $stmt_update_role->bind_param("i", $user_id);
        $stmt_update_role->execute();
        $stmt_update_role->close();

        //Update of role
        $_SESSION['role'] = 'customer';

        $message = 'Successfully registered for the event. You have now become a customer.';
        $roleChanged = true;
    } else {
        $message = 'Successfully registered for the event.';
    }

    echo json_encode(['status' => 'success', 'message' => $message, 'roleChanged' => $roleChanged]);

} catch (Exception $e) {
    //Rollback in case of error
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}

$stmt->close();
$conn->close();
?>
