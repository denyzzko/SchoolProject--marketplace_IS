function logout() {
    fetch('../backend/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === "success") {
                window.location.href = "../index.html";
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function loadNavbar() {
    // update navigation bar based on user info & logged in status
    fetch('../backend/index.php')
        .then(response => response.json())
        .then(data => {
            const navLinks = document.getElementById('nav-links');
            const profile = document.getElementById('profile');
            const responseElement = document.getElementById('response');

            if (data.loggedIn) {
                // logged in
                if (data.role === "registered") {
                    // registered specific
                    navLinks.innerHTML = `
                        <a href="../frontend/category_proposal.html">Category Proposal</a>
                        <a href="../frontend/market.html">Market</a>
                        <a href="../frontend/my_events.html">My Events</a>
                    `;
                    profile.innerHTML = `
                        <div class="profile-info">
                            <p><strong>${data.name}</strong></p>
                            <p>${data.role}</p>
                        </div>
                        <img src="/assets/images/profile_icon.png" alt="Profile" class="profile-icon" onclick="toggleDropdown()">
                        <div class="dropdown" id="profileDropdown">
                            <a href="my_profile.html">My Profile</a>
                            <a href="#" onclick="logout()">Logout</a>
                        </div>
                    `;
                }
                else if (data.role === "customer") {
                    // customer specific
                    navLinks.innerHTML = `
                        <a href="../frontend/category_proposal.html">Category Proposal</a>
                        <a href="../frontend/market.html">Market</a>
                        <a href="../frontend/my_events.html">My Events</a>
                    `;
                    profile.innerHTML = `
                        <div class="profile-info">
                            <p><strong>${data.name}</strong></p>
                            <p>${data.role}</p>
                        </div>
                        <img src="/assets/images/profile_icon.png" alt="Profile" class="profile-icon" onclick="toggleDropdown()">
                        <div class="dropdown" id="profileDropdown">
                            <a href="my_profile.html">My Profile</a>
                            <a href="../frontend/my_orders.html">My Orders</a>
                            <a href="#" onclick="logout()">Logout</a>
                        </div>
                    `;
                } else if (data.role === "farmer") {
                    // farmer specific
                    navLinks.innerHTML = `
                        <a href="../frontend/category_proposal.html">Category Proposal</a>
                        <a href="../frontend/market.html">Market</a>
                        <a href="../frontend/my_events.html">My Events</a>
                        <a href="../frontend/orders.html">Manage Orders</a>
                    `;
                    profile.innerHTML = `
                        <div class="profile-info">
                            <p><strong>${data.name}</strong></p>
                            <p>${data.role}</p>
                        </div>
                        <img src="/assets/images/profile_icon.png" alt="Profile" class="profile-icon" onclick="toggleDropdown()">
                        <div class="dropdown" id="profileDropdown">
                            <a href="my_profile.html">My Profile</a>
                            <a href="../frontend/my_orders.html">My Orders</a>
                            <a href="../frontend/my_reviews.html">My Reviews</a>
                            <a href="#" onclick="logout()">Logout</a>
                        </div>
                    `;
                }
                else if (data.role === "admin") {
                    // farmer specific
                    navLinks.innerHTML = `
                        <a href="../frontend/manage_users.html">Manage Users</a>
                        <a href="../frontend/create_users.html">Create Users</a>
                    `;
                    profile.innerHTML = `
                        <div class="profile-info">
                            <p><strong>${data.name}</strong></p>
                            <p>${data.role}</p>
                        </div>
                        <img src="/assets/images/profile_icon.png" alt="Profile" class="profile-icon" onclick="toggleDropdown()">
                        <div class="dropdown" id="profileDropdown">
                            <a href="my_profile.html">My Profile</a>
                            <a href="#" onclick="logout()">Logout</a>
                        </div>
                    `;
                }
                else if (data.role === "moderator") {
                    // moderator specific
                    navLinks.innerHTML = `
                        <a href="../frontend/manage_proposals.html">Proposals</a>
                        <a href="../frontend/manage_categories.html">Categories</a>
                    `;
                    profile.innerHTML = `
                        <div class="profile-info">
                            <p><strong>${data.name}</strong></p>
                            <p>${data.role}</p>
                        </div>
                        <img src="/assets/images/profile_icon.png" alt="Profile" class="profile-icon" onclick="toggleDropdown()">
                        <div class="dropdown" id="profileDropdown">
                            <a href="my_profile.html">My Profile</a>
                            <a href="#" onclick="logout()">Logout</a>
                        </div>
                    `;
                }

                // activate the current page link
                activateCurrentPageLink();

            } else {
                // not logged in
                navLinks.innerHTML = `
                    <a href="../frontend/market.html">Market</a>
                `;
                profile.innerHTML = `
                    <div class="log-reg-buttons">
                        <button onclick="window.location.href='../frontend/register.html'">Register</button>
                        <button onclick="window.location.href='../frontend/login.html'">Login</button>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// profile dropdown menu
function toggleDropdown() {
    var dropdown = document.getElementById("profileDropdown");
    dropdown.classList.toggle("show");
}

// call loadNavbar on page load
window.addEventListener('DOMContentLoaded', loadNavbar);

// close the dropdown if the user clicks outside of it
window.onclick = function(event) {
    if (!event.target.matches('.profile-icon')) {
        var dropdowns = document.getElementsByClassName("dropdown");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};

// function to highlight the active page link
function activateCurrentPageLink() {
    document.querySelectorAll(".nav-links a").forEach((link) => {
        if (link.href === window.location.href) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}
