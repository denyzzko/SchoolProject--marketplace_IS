<?php
include 'db.php';
include 'session_start.php';
header('Content-Type: application/json');

// Prevent unauthorized access
if (!isset($_SESSION["user_id"]) || ($_SESSION["role"] !== "registered" && $_SESSION["role"] !== "customer" && $_SESSION["role"] !== "farmer")) {
    echo json_encode([
        "status" => "error",
        "message" => "You are not authorized to propose a category."
    ]);
    exit();
}

//Get User ID from sesion
$user_id = $_SESSION["user_id"];
//Get input data from REQUEST
$data = json_decode(file_get_contents("php://input"), true);
$proposal = $data['name'] ?? null;
$status = 'pending';
$parent_category_id = $data['parent_category'] ?? null;

//Check if category proposal name is provided
if (!$proposal) {
    echo json_encode([
        "status" => "error",
        "message" => "Proposal cannot be empty."
    ]);
    exit();
}

//Prepare-SQL query to insert category proposal
$sql = "INSERT INTO CategoryProposal (user_id, proposal, status, parent_category_id) VALUES (?, ?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("issi", $user_id, $proposal, $status, $parent_category_id);

//Execute the query
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
