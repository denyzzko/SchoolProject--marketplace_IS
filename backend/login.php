<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // retrieve user inputs
    $email = $_POST["email"];
    $password = $_POST["password"];

    // check if email exists in the database
    $sql = "SELECT * FROM Usr WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows == 1) {
        // email exists so verify password
        $row = $result->fetch_assoc();
        if (password_verify($password, $row["password"])) {
            // password correct so set session and redirect
            $_SESSION["user_id"] = $row["user_id"];
            $_SESSION["role"] = $row["role"];
            $_SESSION["name"] = $row["name"];

            header("Location: ../index.html");
            exit();
        } else {
            echo "Invalid password!";
        }
    } else {
        echo "No user found with this email!";
    }

    // close statement and connectio
    $stmt->close();
    $conn->close();
}
?>
