// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

let reviewsData = []; // Store reviews data globally

// Function to fetch reviews from the backend and display them as individual items
function loadReviews() {
    const farmerId = getUrlParameter('farmer_id');
    if (!farmerId) {
        console.error('Farmer ID is missing in the URL.');
        return;
    }

    // Update fetch call to include the farmer_id as a query parameter
    fetch(`../backend/view_reviews.php?farmer_id=${farmerId}`)
    .then(response => response.json())
    .then(data => {
        if (!data || data.length === 0) {
            console.error('No reviews found or data is empty for farmer ID:', farmerId);
            return;
        }
        if (data.success === false) {
            console.error('Error:', data.message);
            return;
        }
        reviewsData = data; // Save the data globally
        displayAverageRating(reviewsData);
        renderReviews(reviewsData);
    })
    .catch(error => console.error('Error fetching reviews:', error));
}

// Load reviews and average rating when the page is loaded
window.onload = loadReviews;

// Function to render reviews based on data
function renderReviews(reviews) {
    console.log('Rendering reviews, count:', reviews.length);  // Debug log
    const container = document.getElementById('review-container');
    container.innerHTML = '';
    reviews.forEach(review => {
        const item = document.createElement('div');
        item.classList.add('review-item');
        
        // Generate star rating based on the numeric rating
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        item.innerHTML = `
            <div class="review-content">
                <p><strong>Name:</strong> ${review.full_category_name}</p>
                <p><strong>Rating:</strong> <span class="rating">${stars}</span></p>
                <p><strong>Comment:</strong> <span class="comment">${review.comment}</span></p>
            </div>
        `;
        container.appendChild(item);
    });
}

// Function to calculate and display the average rating
function displayAverageRating(reviews) {
    const totalRating = reviews.reduce((acc, review) => acc + parseInt(review.rating), 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    document.getElementById('average-rating').textContent = `Average Rating: ${averageRating} ★`;
}

// Function to sort reviews based on selected criteria
function sortReviews(criteria) {
    let sortedData = [...reviewsData]; // Clone the original data to avoid mutating it

    if (criteria === 'rating-high') {
        sortedData.sort((a, b) => b.rating - a.rating);
    } else if (criteria === 'rating-low') {
        sortedData.sort((a, b) => a.rating - b.rating);
    } else if (criteria === 'date') {
        sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderReviews(sortedData);

    // Update active button
    document.querySelectorAll('.filter-button').forEach(button => button.classList.remove('active'));
    document.getElementById(`sort-${criteria}`).classList.add('active');
}

// Add event listeners to sorting buttons
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('sort-date').addEventListener('click', () => sortReviews('date'));
    document.getElementById('sort-rating-high').addEventListener('click', () => sortReviews('rating-high'));
    document.getElementById('sort-rating-low').addEventListener('click', () => sortReviews('rating-low'));
});
