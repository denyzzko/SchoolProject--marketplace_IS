<?php
session_start();  // Start the session

if (isset($_SESSION["user_id"])) {
    // If logged in, return user info
    echo "Welcome back, " . htmlspecialchars($_SESSION["name"]) . "!";
    echo " <br>You are logged in as " . htmlspecialchars($_SESSION["role"]) . ".";
} else {
    // If not logged in, return a message asking to login or register
    echo "You are not logged in. Please login or register.";
}
?>
