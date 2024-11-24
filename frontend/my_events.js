// Initialize Filter Category Selection
window.addEventListener('DOMContentLoaded', () => {
    initFilterCategorySelection();
    loadEvents();
});

function initFilterCategorySelection() {
    const categorySelectionDiv = document.getElementById('filter-category-selection');
    if (!categorySelectionDiv) {
        console.error('Category selection element not found');
        return;
    }

    categorySelectionDiv.innerHTML = '';

    fetch('../backend/categories.php')
        .then(response => response.json())
        .then(categories => {
            if (categories.length > 0) {
                const select = document.createElement('select');
                select.id = 'filter-category-select-0';
                select.dataset.level = 0;

                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select Category';
                select.appendChild(defaultOption);

                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.category_id;
                    option.textContent = category.name;
                    select.appendChild(option);
                });

                categorySelectionDiv.appendChild(select);

                select.addEventListener('change', onFilterCategoryChange);
            } else {
                console.error('No top-level categories found.');
            }
        })
        .catch(error => console.error('Error fetching categories:', error));
}

function onFilterCategoryChange(event) {
    const select = event.target;
    const selectedCategoryId = select.value;
    const level = parseInt(select.dataset.level);

    const categorySelectionDiv = document.getElementById('filter-category-selection');
    const selects = categorySelectionDiv.querySelectorAll('select');
    selects.forEach(s => {
        if (parseInt(s.dataset.level) > level) {
            s.parentNode.removeChild(s);
        }
    });

    if (selectedCategoryId) {
        fetch(`../backend/categories.php?parent_id=${selectedCategoryId}`)
            .then(response => response.json())
            .then(subcategories => {
                if (subcategories.length > 0) {
                    const subcategorySelect = document.createElement('select');
                    subcategorySelect.id = `filter-category-select-${level + 1}`;
                    subcategorySelect.dataset.level = level + 1;

                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Select Subcategory';
                    subcategorySelect.appendChild(defaultOption);

                    subcategories.forEach(subcategory => {
                        const option = document.createElement('option');
                        option.value = subcategory.category_id;
                        option.textContent = subcategory.name;
                        subcategorySelect.appendChild(option);
                    });

                    categorySelectionDiv.appendChild(subcategorySelect);

                    subcategorySelect.addEventListener('change', onFilterCategoryChange);
                }
            })
            .catch(error => console.error('Error fetching subcategories:', error));
    }
}

// Function to fetch events from the backend and display them as individual items
function loadEvents() {
    fetchEventsAndRender();
}

function fetchEventsAndRender() {
    const categorySelectionDiv = document.getElementById('filter-category-selection');
    const selects = categorySelectionDiv.querySelectorAll('select');
    let selectedCategoryId = null;
    selects.forEach(select => {
        if (select.value) {
            selectedCategoryId = select.value;
        }
    });

    let queryParams = [];
    if (selectedCategoryId) {
        queryParams.push(`category_id=${encodeURIComponent(selectedCategoryId)}`);
    }

    const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

    fetch(`../backend/my_events.php${queryString}`)
        .then(response => response.json())
        .then(data => {
            displayEvents(data);
        })
        .catch(error => console.error('Error fetching events:', error));
}

// Function to render events based on data
function displayEvents(events) {
    const eventContainer = document.getElementById('event-container');
    eventContainer.innerHTML = '';
    events.forEach(event => {
        const eventBox = document.createElement('div');
        eventBox.classList.add('event-item');
        
        eventBox.innerHTML = `
            <div class="event-details">
                <p><strong>Location:</strong> ${event.location}</p>
                <p><strong>From:</strong> ${event.start_date}</p>
                <p><strong>To:</strong> ${event.end_date}</p>
                <p><strong>Name:</strong> ${event.full_category_name}</p>
                <button class="event-button" onclick="cancelOrder('${event.order_id}')">Cancel</button>
            </div>
        `;
        eventContainer.appendChild(eventBox);
    });
}

function cancelOrder(orderId) {
    currentOrderId = orderId;
    document.getElementById('popup_cancel-overlay').style.display = 'flex';
}

function confirmCancel(isConfirmed) {
    document.getElementById('popup_cancel-overlay').style.display = 'none';

    if (isConfirmed && currentOrderId !== null) {
        const formData = new FormData();
        formData.append('order_id', currentOrderId);

        fetch('../backend/cancel_order.php', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadEvents();
                } else {
                    alert('Failed to cancel order: ' + data.message);
                }
            })
            .catch(error => {
                alert('There was an error cancelling the order. Please try again later.');
            });
    }
}

document.getElementById('apply-filters-button').addEventListener('click', function() {
    fetchEventsAndRender();
});
