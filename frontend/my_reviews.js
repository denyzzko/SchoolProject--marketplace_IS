// Function to fetch reviews from the backend and display them as individual items
function loadReviews() {
    fetch('../backend/my_reviews.php')
        .then(response => response.json())
        .then(data => {
            displayAverageRating(data);
            renderReviews(data);
        })
        .catch(error => console.error('Error fetching reviews:', error));
}

// Function to render reviews based on data
function renderReviews(reviews) {
    const container = document.getElementById('review-container');
    container.innerHTML = '';
    reviews.forEach(review => {
        const item = document.createElement('div');
        item.classList.add('review-item');
        
        // Generate star rating based on the numeric rating
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);

        item.innerHTML = `
            <div class="review-content">
                <p><strong>Name:</strong> ${review.category_name}</p>
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
    fetch('../backend/my_reviews.php')
        .then(response => response.json())
        .then(data => {
            if (criteria === 'rating-high') {
                data.sort((a, b) => b.rating - a.rating);
            } else if (criteria === 'rating-low') {
                data.sort((a, b) => a.rating - b.rating);
            } else if (criteria === 'date') {
                data.sort((a, b) => new Date(b.date) - new Date(a.date));
            } else if (criteria === 'category-az') {
                data.sort((a, b) => a.category_name.localeCompare(b.category_name));
            } else if (criteria === 'category-za') {
                data.sort((a, b) => b.category_name.localeCompare(a.category_name));
            }
            renderReviews(data);

            document.querySelectorAll('.filter-button').forEach(button => button.classList.remove('active'));
            document.getElementById(`sort-${criteria}`).classList.add('active');
        })
        .catch(error => console.error('Error sorting reviews:', error));
}

// Load reviews and average rating when the page is loaded
window.onload = loadReviews;
