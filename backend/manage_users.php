<?php
include 'db.php';
header('Content-Type: application/json');
include 'session_start.php';

// Prevent unauthorized access
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "admin") {
    echo json_encode(["status" => "error", "message" => "You are not authorized to perform this action."]);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $_GET['action'] ?? $data['action'];
if ($action === "search") {
    if (!isset($_GET['email'])) {
        echo json_encode(["status" => "error", "message" => "Email is required."]);
        exit();
    }

    $email = $_GET['email'];
    $sql = "SELECT name, email, role FROM Usr WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        echo json_encode(["status" => "error", "message" => "User not found."]);
    }

    $stmt->close();
} elseif ($action === "update") {
    if (!isset($data['email'], $data['name'], $data['role'])) {
        echo json_encode(["status" => "error", "message" => "All fields are required."]);
        exit();
    }

    $email = $data['email'];
    $name = $data['name'];
    $role = $data['role'];

    $sql = "UPDATE Usr SET name = ?, role = ? WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $name, $role, $email);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "User updated successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update user."]);
    }

    $stmt->close();
} elseif ($action === "delete") {
    if (!isset($data['email'])) {
        echo json_encode(["status" => "error", "message" => "Email is required."]);
        exit();
    }

    $email = $data['email'];

    $sql = "DELETE FROM Usr WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "User deleted successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to delete user."]);
    }

    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action."]);
}

$conn->close();
?>
