<?php
include 'session_start.php';
header('Content-Type: application/json');

include 'db.php';

//Check if user role is moderator
if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "moderator") {
    echo json_encode(["status" => "error", "message" => "You are not authorized to manage categories."]);
    exit();
}

//Get input data
$data = json_decode(file_get_contents("php://input"), true);
$action = $data['action'] ?? null;

//Validate action
if (!$action || !in_array($action, ['add', 'delete'])) {
    echo json_encode(["status" => "error", "message" => "Invalid action specified."]);
    exit();
}

try {
    //Handle actionn add new category
    if ($action === 'add') {
        $parent_category_id = $data['parent_category'] ?? null;
        $name = $data['name'] ?? null;

        //Check if there is name provided
        if (!$name) {
            echo json_encode(["status" => "error", "message" => "Category name is required."]);
            exit();
        }

        //SQL query to add new category
        $sql = "INSERT INTO Category (parent_category, name) VALUES (?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("is", $parent_category_id, $name);

        if ($stmt->execute()) {
            echo json_encode(["status" => "success", "message" => "Category added successfully!"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to add category."]);
        }

        $stmt->close();
    //Handle action delete
    } elseif ($action === 'delete') {
        $category_id = $data['category_id'] ?? null;

        //Check for cateogory id
        if (!$category_id) {
            echo json_encode(["status" => "error", "message" => "Category ID is required for deletion."]);
            exit();
        }

        //SQL query to delete category
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