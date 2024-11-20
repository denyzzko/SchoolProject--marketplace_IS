<?php
session_start();
header('Content-Type: application/json');

include 'db.php';

// Check if the user is a moderator
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "moderator") {
    echo json_encode(["status" => "error", "message" => "You are not authorized to manage proposals."]);
    exit();
}

// Function to generate full category path
function getCategoryFullPath($categoryId, $conn) {
    $path = [];

    while ($categoryId !== null) {
        $sql = "SELECT category_id, name, parent_category FROM Category WHERE category_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $categoryId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            array_unshift($path, $row['name']); // Prepend category name
            $categoryId = $row['parent_category']; // Move to parent category
        } else {
            break;
        }

        $stmt->close();
    }

    return implode('/', $path); // Join path elements with a slash
}

// Retrieve pending proposals
$sql = "SELECT cp.proposal_id, cp.proposal, cp.status, cp.parent_category_id, u.email 
        FROM CategoryProposal cp 
        JOIN Usr u ON cp.user_id = u.user_id 
        WHERE cp.status = 'pending'";
$result = $conn->query($sql);

$proposals = [];

while ($row = $result->fetch_assoc()) {
    $fullPath = $row['parent_category_id'] 
        ? getCategoryFullPath($row['parent_category_id'], $conn) . '/' . $row['proposal']
        : $row['proposal'];
    
    $proposals[] = [
        "proposal_id" => $row['proposal_id'],
        "proposal" => $row['proposal'],
        "full_path" => $fullPath,
        "parent_category_id" => $row['parent_category_id'],
        "status" => $row['status'],
        "email" => $row['email'],
    ];
}

// Check if there are proposals
if (empty($proposals)) {
    echo json_encode(["status" => "success", "message" => "No new category proposals available.", "proposals" => []]);
} else {
    echo json_encode(["status" => "success", "proposals" => $proposals]);
}

$conn->close();
?>