document.addEventListener('DOMContentLoaded', loadProfile);

// Load user profiel info
function loadProfile() {
    fetch('../backend/my_profile.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('role').textContent = data.role;
                document.getElementById('name').textContent = data.name;
                document.getElementById('email').textContent = data.email;
            } else {
                displayMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading profile:', error);
            displayMessage('An error occurred while loading your profile.', 'error');
        });
}

// Show form for user info edit
function editProfile() {
    document.getElementById('edit-form').style.display = 'block';
    document.getElementById('edit-button').style.display = 'none';

    document.getElementById('edit-name').value = document.getElementById('name').textContent;
    document.getElementById('edit-email').value = document.getElementById('email').textContent;
}

// Hide form
function cancelEdit() {
    document.getElementById('edit-form').style.display = 'none';
    document.getElementById('edit-button').style.display = 'inline-block';
}

// Save edited user info
function saveProfile() {
    const name = document.getElementById('edit-name').value.trim();
    const email = document.getElementById('edit-email').value.trim();

    if (!name || !email) {
        displayMessage('Name and email are required.', 'error');
        return;
    }

    fetch('../backend/my_profile.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                document.getElementById('name').textContent = name;
                document.getElementById('email').textContent = email;
                cancelEdit();
                displayMessage(data.message, 'success');
            } else {
                displayMessage(data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
            displayMessage('An error occurred while updating your profile.', 'error');
        });
}

function displayMessage(message, type) {
    const messageElement = document.getElementById('message');
    messageElement.textContent = message;
    messageElement.style.color = type === 'success' ? 'green' : 'red';
}
