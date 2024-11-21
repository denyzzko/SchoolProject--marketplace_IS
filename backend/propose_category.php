<?php
include 'session_start.php';
header('Content-Type: application/json');

include 'db.php';
// Prevent unauthorized access
if (!isset($_SESSION["user_id"]) || ($_SESSION["role"] !== "registered" && $_SESSION["role"] !== "customer" && $_SESSION["role"] !== "farmer")) {
    echo json_encode([
        "status" => "error",
        "message" => "You are not authorized to propose a category."
    ]);
    exit();
}

// Get category info and store as new pending proposal
$user_id = $_SESSION["user_id"];
$data = json_decode(file_get_contents("php://input"), true);
$proposal = $data['name'] ?? null;
$status = 'pending';
$parent_category_id = $data['parent_category'] ?? null;

if (!$proposal) {
    echo json_encode([
        "status" => "error",
        "message" => "Proposal cannot be empty."
    ]);
    exit();
}

$sql = "INSERT INTO CategoryProposal (user_id, proposal, status, parent_category_id) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("issi", $user_id, $proposal, $status, $parent_category_id);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Category proposal submitted successfully!"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to submit category proposal."
    ]);
}

$stmt->close();
$conn->close();
