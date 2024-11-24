let inactivityTimeout;

function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    // Set timeout for 10 minutes (600,000 milliseconds)
    inactivityTimeout = setTimeout(logoutUser, 600000); 
}

function logoutUser() {
    fetch('../backend/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                location.reload(true);
                window.location.href = "../index.html";
            }
        })
        .catch(error => console.error('Error logging out:', error));
}

// Reset inactivity timer on user interaction
document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

resetInactivityTimer();
