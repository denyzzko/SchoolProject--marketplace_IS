<?php
include 'session_start.php';
header('Content-Type: application/json');

include 'db.php';

// Check if the user is logged in and has a moderator role
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "moderator") {
    echo json_encode(["status" => "error", "message" => "You are not authorized to manage proposals."]);
    exit();
}

// Function to generate full category path
function getCategoryFullPath($categoryId, $conn) {
    $path = [];
    // Traverse up the category hierarchy until root
    while ($categoryId !== null) {
        // SQL query to fetch category details based on the category_id
        $sql = "SELECT category_id, name, parent_category FROM Category WHERE category_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $categoryId);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 1) {
            $row = $result->fetch_assoc();
            array_unshift($path, $row['name']);
            $categoryId = $row['parent_category'];
        } else {
            break;
        }

        $stmt->close();
    }
    // Return full path as a string, separated by /
    return implode('/', $path);
}
// SQL to retrieve all pending category proposals and related user information
$sql = "SELECT cp.proposal_id, cp.proposal, cp.status, cp.parent_category_id, u.email 
        FROM CategoryProposal cp 
        JOIN Usr u ON cp.user_id = u.user_id 
        WHERE cp.status = 'pending'";
$result = $conn->query($sql);
// Array to store proposals
$proposals = [];
// Process each proposal
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

if (empty($proposals)) {
    echo json_encode(["status" => "success", "message" => "No new category proposals available.", "proposals" => []]);
} else {
    echo json_encode(["status" => "success", "proposals" => $proposals]);
}

$conn->close();
?>