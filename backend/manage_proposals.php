<?php
session_start();
header('Content-Type: application/json');

include 'db.php';

// Check if the user is a moderator
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "moderator") {
    echo json_encode(["status" => "error", "message" => "You are not authorized to manage proposals."]);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$proposalId = $data['proposal_id'] ?? null;
$action = $data['action'] ?? null; // 'approve' or 'reject'

// Validate input
if (!$proposalId || !$action) {
    echo json_encode(["status" => "error", "message" => "Invalid request."]);
    exit();
}

if ($action === 'approve') {
    $parentCategoryId = $data['parent_category_id'] ?? null;
    $proposalName = $data['proposal'] ?? null;

    if (!$parentCategoryId || !$proposalName) {
        echo json_encode(["status" => "error", "message" => "Missing category details for approval."]);
        exit();
    }

    // Begin a transaction for approving a proposal
    $conn->begin_transaction();

    try {
        // Update proposal status to 'approved'
        $updateSql = "UPDATE CategoryProposal SET status = 'approved' WHERE proposal_id = ?";
        $stmt = $conn->prepare($updateSql);
        $stmt->bind_param("i", $proposalId);
        $stmt->execute();

        // Add the new category
        $insertSql = "INSERT INTO Category (parent_category, name) VALUES (?, ?)";
        $stmt = $conn->prepare($insertSql);
        $stmt->bind_param("is", $parentCategoryId, $proposalName);
        $stmt->execute();

        $conn->commit();
        echo json_encode(["status" => "success", "message" => "Proposal approved and category added."]);
    } catch (Exception $e) {
        $conn->rollback();
        echo json_encode(["status" => "error", "message" => "Failed to approve proposal."]);
    }

} elseif ($action === 'reject') {
    // Update proposal status to 'rejected'
    $sql = "UPDATE CategoryProposal SET status = 'rejected' WHERE proposal_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $proposalId);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Proposal rejected."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to reject proposal."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid action."]);
}

$stmt->close();
$conn->close();
?>