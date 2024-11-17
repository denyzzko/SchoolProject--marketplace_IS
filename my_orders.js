// Function to fetch data from the backend and populate the table
function loadOrders() {
    fetch('../backend/my_orders.php')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById('order-table-body');
            tableBody.innerHTML = '';
            data.forEach(order => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${order.date}</td>
                    <td>${order.order_id}</td>
                    <td>${order.farmer_name}</td>
                    <td>${order.category_name}</td>
                    <td>${order.quantity}</td>
                    <td>${order.price} Kč</td>
                    <td><button class='btn' onclick="openPopup(${order.order_id}, '${order.category_name}', '${order.farmer_name}')">Review</button></td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching orders:', error));
}

// Function to open the review popup
function openPopup(orderId, categoryName, farmerName) {
    document.getElementById('popup-header').textContent = `Review - ${categoryName} from ${farmerName}`;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('review-popup').style.display = 'block';

    // Clear previous review and rating
    document.getElementById('review-text').value = '';
    document.getElementById('rating').value = 3;
    document.getElementById('review-popup').setAttribute('data-order-id', orderId);
}

// Function to close the review popup
function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('review-popup').style.display = 'none';
}

// Function to send the review
function sendReview() {
    const reviewText = document.getElementById('review-text').value;
    const rating = document.getElementById('rating').value;
    const orderId = document.getElementById('review-popup').getAttribute('data-order-id');
    if (reviewText.trim() === '') {
        alert('Please write your review');
        return;
    }

    // Prepare data to send to the backend
    const reviewData = {
        order_id: orderId,
        rating: rating,
        comment: reviewText
    };

    // Send the review to the backend
    fetch('../backend/save_review.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closePopup();
        } else {
            alert('There was an error saving your review. Please try again.');
        }
    })
    .catch(error => {
        console.error('Error saving review:', error);
        alert('There was an error saving your review. Please try again.');
    });
}

// Load orders when the page is loaded
window.onload = loadOrders;

// Adding the rating slider to the popup
document.addEventListener('DOMContentLoaded', () => {
    const reviewPopup = document.getElementById('review-popup');
    const ratingContainer = document.createElement('div');
    ratingContainer.innerHTML = `
        <label for="rating">Rating:</label>
        <input type="range" id="rating" name="rating" min="1" max="5" value="3">
        <span id="rating-value">3</span>/5
    `;
    reviewPopup.insertBefore(ratingContainer, document.getElementById('review-text'));

    const ratingInput = document.getElementById('rating');
    const ratingValue = document.getElementById('rating-value');
    ratingInput.addEventListener('input', () => {
        ratingValue.textContent = ratingInput.value;
    });
});
