<?php 
include 'db.php';  // Ensure this file contains the PDO connection setup

header('Content-Type: application/json');  // Set response content type as JSON

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize user inputs
    $name = htmlspecialchars(trim($_POST["name"]));
    $email = htmlspecialchars(trim($_POST["email"]));
    $password = password_hash(trim($_POST["password"]), PASSWORD_BCRYPT);  // Hash the password
    $role = htmlspecialchars(trim($_POST["role"]));

    try {
        // Check if email already exists
        $check_email = $pdo->prepare("SELECT * FROM Usr WHERE email = ?");
        $check_email->execute([$email]);
        $result = $check_email->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            echo json_encode(["status" => "error", "message" => "Email is already registered!"]);
        } else {
            // Insert user into database
            $sql = "INSERT INTO Usr (name, email, password, role) VALUES (?, ?, ?, ?)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([$name, $email, $password, $role]);

            echo json_encode(["status" => "success", "message" => "Registration successful!"]);
        }
    } catch (PDOException $e) {
        echo json_encode(["status" => "error", "message" => "Error: " . $e->getMessage()]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>
