<?php
session_start();

// Set inactivity timeout
$timeout = 600; // 10 minutes

if (isset($_SESSION['last_activity'])) {
    //Calcute the elapsed time since last activity
    $elapsedTime = time() - $_SESSION['last_activity'];
    //If time exceeds timeout, destroy session
    if ($elapsedTime > $timeout) {
        session_unset();
        session_destroy();
        echo json_encode(["status" => "error", "message" => "Session timed out. Please log in again."]);
        exit();
    }
}

//Update last activity timestamp
$_SESSION['last_activity'] = time();
?>