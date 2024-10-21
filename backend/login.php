<?php
session_start();  // Start the session
include 'db.php';  // Include the PDO connection setup

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize inputs
    $email = htmlspecialchars(trim($_POST["email"]));
    $password = trim($_POST["password"]);

    try {
        // Prepare SQL to find user by email
        $sql = "SELECT * FROM Usr WHERE email = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$email]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Verify the hashed password
            if (password_verify($password, $row["password"])) {
                // Set session variables
                $_SESSION["user_id"] = $row["user_id"];
                $_SESSION["name"] = $row["name"];
                $_SESSION["role"] = $row["role"];

                // Redirect to the home page after successful login
                header("Location: ../frontend/index.html");
                exit();  // Stop script execution after redirect
            } else {
                echo json_encode(["status" => "error", "message" => "Invalid password!"]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "No user found with this email!"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
