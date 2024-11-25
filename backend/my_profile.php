<?php
include 'session_start.php';
header('Content-Type: application/json');
include 'db.php';

//Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'You are not logged in.']);
    exit();
}

//get User ID from session
$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    //SQL query to get user details
    $sql = "SELECT name, email, role FROM Usr WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    //Check if user exists
    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['status' => 'success', 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'User not found.']);
    }

    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //Get input data from REQUEST
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? null;
    $email = $data['email'] ?? null;

    //Check if name and email are provided
    if (!$name || !$email) {
        echo json_encode(['status' => 'error', 'message' => 'Name and email are required.']);
        exit();
    }

    //SQL query to update User
    $sql = "UPDATE Usr SET name = ?, email = ? WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ssi', $name, $email, $userId);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => 'Profile updated successfully.']);
        $_SESSION["name"] = $name;
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Failed to update profile.']);
    }

    $stmt->close();
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request method.']);
}

$conn->close();
?>
