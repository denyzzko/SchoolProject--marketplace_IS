<?php
include 'db.php';  // Include the pg_connect setup

session_start();  // Start the session

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize inputs
    $email = pg_escape_string($conn, $_POST["email"]);
    $password = $_POST["password"];

    $sql = "SELECT * FROM Usr WHERE email = '$email'";
    $result = pg_query($conn, $sql);

    if (pg_num_rows($result) == 1) {
        $row = pg_fetch_assoc($result);
        if (password_verify($password, $row["password"])) {
            // Set session variables for the logged-in user
            $_SESSION["user_id"] = $row["user_id"];
            $_SESSION["role"] = $row["role"];
            $_SESSION["name"] = $row["name"];
            echo "Login successful!";
        } else {
            echo "Invalid password!";
        }
    } else {
        echo "No user found with this email!";
    }
}
?>
