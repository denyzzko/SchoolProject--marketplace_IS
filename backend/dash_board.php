<?php
session_start();  // Start the session to access session variables

// Check if the user is logged in by checking if the "user_id" session variable exists
if (!isset($_SESSION["user_id"])) {
    // If not logged in, redirect the user to the login page
    header("Location: ../frontend/login.html");
    exit();  // Stop further execution
}

// If the user is logged in, show the dashboard content
echo "Welcome to your dashboard, " . $_SESSION["name"] . "!";

// Show different content based on user role
if ($_SESSION["role"] == "admin") {
    echo "You are an admin.";
} else {
    echo "You are a regular user.";
}
?>
