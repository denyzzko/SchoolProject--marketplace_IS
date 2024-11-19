<?php
session_start();
header('Content-Type: application/json');

include 'db.php';

// Check if the user is a moderator
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "moderator") {
    echo json_encode(["status" => "error", "message" => "You are not authorized to manage categories."]);
    exit();
}

// Get JSON input
$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? null;

// Validate action
if (!$action || !in_array($action, ['add', 'delete'])) {
    echo json_encode(["status" => "error", "message" => "Invalid action specified."]);
    exit();
}

try {
    if ($action === 'add') {
        $parent_category_id = $data['parent_category'] ?? null;
        $name = $data['name'] ?? null;

        // Validate input for adding a category
        if (!$name) {
            echo json_encode(["status" => "error", "message" => "Category name is required."]);
            exit();
        }

        // Insert the new category into the database
        $sql = "INSERT INTO Category (parent_category, name) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $parent_category_id, $name);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Category added successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to add category."]);
        }

        $stmt->close();
    } elseif ($action === 'delete') {
        $category_id = $data['category_id'] ?? null;

        // Validate input for deleting a category
        if (!$category_id) {
            echo json_encode(["status" => "error", "message" => "Category ID is required for deletion."]);
            exit();
        }

        // Delete the category from the database
        $sql = "DELETE FROM Category WHERE category_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $category_id);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Category deleted successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to delete category."]);
        }

        $stmt->close();
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "An error occurred: " . $e->getMessage()]);
}

$conn->close();
?>