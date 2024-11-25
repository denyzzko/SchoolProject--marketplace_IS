<?php
include 'session_start.php';
include 'db.php';

//Check if request method is POST
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    //Get user inputs and trim them
    $name = htmlspecialchars(trim($_POST["name"]));
    $email = htmlspecialchars(trim($_POST["email"]));
    $password = password_hash(trim($_POST["password"]), PASSWORD_BCRYPT);
    $role = "registered";

    //SQL query to check if email is already registered
    $sql = "SELECT * FROM Usr WHERE email = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    //Check if email is already registered
    if ($result->num_rows > 0) {
        echo "Email is already registered!";
    } else {
        //SQL query to insert new user
        $sql = "INSERT INTO Usr (name, email, password, role) VALUES (?, ?, ?, ?)";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $name, $email, $password, $role);

        if ($stmt->execute()) {
            //Set session variables for the new user
            $_SESSION["user_id"] = $conn->insert_id;
            $_SESSION["name"] = $name;
            $_SESSION["role"] = $role;

            //Redirect to home page after registration
            header("Location: ../index.html");
            exit();
        } else {
            echo "Error: " . $conn->error;
        }
    }

    $stmt->close();
    $conn->close();
}
?>
