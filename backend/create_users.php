<?php
include 'session_start.php';
header('Content-Type: application/json');
include 'db.php';
// Check if the user is logged in and has the 'admin' role
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "admin") {
    echo json_encode(["status" => "error", "message" => "You are not authorized to create users."]);
    exit();
}
// Extract user details from the input data
$data = json_decode(file_get_contents("php://input"), true);
$name = $data['name'] ?? null;
$email = $data['email'] ?? null;
$password = $data['password'] ?? null;
$role = $data['role'] ?? null;
// Validate data
if (!$name || !$email || !$password || !$role) {
    echo json_encode(["status" => "error", "message" => "All fields are required."]);
    exit();
}
// SQL statement to check if the email already exists
$sql = "SELECT * FROM Usr WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Account with this email already exists."]);
    exit();
}
// Hash the user's password securely
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);
// SQL statement to insert the new user into the database
$sql = "INSERT INTO Usr (name, email, password, role) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ssss", $name, $email, $hashedPassword, $role);
// Execute the statement
if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "User created successfully!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to create user."]);
}

$stmt->close();
$conn->close();
?>
