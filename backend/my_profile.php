<?php
include 'session_start.php';
header('Content-Type: application/json');
include 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'You are not logged in.']);
    exit();
}

$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $sql = "SELECT name, email, role FROM Usr WHERE user_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode(['status' => 'success', 'name' => $user['name'], 'email' => $user['email'], 'role' => $user['role']]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'User not found.']);
    }

    $stmt->close();
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $name = $data['name'] ?? null;
    $email = $data['email'] ?? null;

    if (!$name || !$email) {
        echo json_encode(['status' => 'error', 'message' => 'Name and email are required.']);
        exit();
    }

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
