<?php
$servername = "some.host.com";
$username = "username";
$password = "password";
$dbname = "database_name";

// Create connection using MySQLi
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
