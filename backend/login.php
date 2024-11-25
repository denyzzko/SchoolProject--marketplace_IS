<?php
include 'session_start.php';
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Retrieve the email and password from the POST request
    $email = $_POST["email"];
    $password = $_POST["password"];

    // SQL to check if email exists in the database
    $sql = "SELECT * FROM Usr WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        if (password_verify($password, $row["password"])) {
            // Password correct so set session
            $_SESSION["user_id"] = $row["user_id"];
            $_SESSION["role"] = $row["role"];
            $_SESSION["name"] = $row["name"];

            echo json_encode(["status" => "success"]);
            exit();
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid password!"]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "No user found with this email!"]);
    }

    $stmt->close();
    $conn->close();
}
?>
