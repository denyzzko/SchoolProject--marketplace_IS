<?php
include 'db.php';
include 'session_start.php';

//Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'User not logged in.']);
    exit;
}

//Get user ID from session
$user_id = $_SESSION['user_id'];
//Get input from REQUEST
$data = json_decode(file_get_contents('php://input'), true);
$offer_id = $data['offer_id'];
$quantity = $data['quantity'];
$date = date('Y-m-d');
$status = 'pending';

//SQL query to get available quantity
$sql = "SELECT quantity FROM Attribute WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $offer_id);
$stmt->execute();
$result = $stmt->get_result();
$offer = $result->fetch_assoc();

//Check if there is enough quantity to place order
if ($offer['quantity'] < $quantity) {
    echo json_encode(['status' => 'error', 'message' => 'Not enough quantity available.']);
    exit;
}

//SQL Query to insert new order
$sql = "INSERT INTO Ordr (user_id, offer_id, quantity, date, status) VALUES (?, ?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iidss", $user_id, $offer_id, $quantity, $date, $status);
$stmt->execute();

//Update quantity
$new_quantity = $offer['quantity'] - $quantity;
$sql = "UPDATE Attribute SET quantity = ? WHERE offer_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("di", $new_quantity, $offer_id);
$stmt->execute();

//Update user to customer if user is registered
$roleChanged = false;
if ($_SESSION['role'] === 'registered') {
    $sql_update_role = "UPDATE Usr SET role = 'customer' WHERE user_id = ?";
    $stmt_update_role = $conn->prepare($sql_update_role);
    $stmt_update_role->bind_param("i", $user_id);
    $stmt_update_role->execute();
    $stmt_update_role->close();

    //update session role
    $_SESSION['role'] = 'customer';

    $message = 'Order placed successfully. You have now become a customer.';
    $roleChanged = true;
} else {
    $message = 'Order placed successfully.';
}

$stmt->close();
$conn->close();

echo json_encode(['status' => 'success', 'message' => $message, 'roleChanged' => $roleChanged]);

?>
