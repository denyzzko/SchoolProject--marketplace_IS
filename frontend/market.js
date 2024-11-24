// Kontrola uživatelského stavu při načtení stránky
let isUserLoggedIn = false;
let userRole = null;

fetch('../backend/index.php')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            isUserLoggedIn = true;
            userRole = data.role;

            // Enable "Create Offer" button for farmers and customers
            if (userRole === 'farmer' || userRole === 'customer') {
                document.getElementById('create-offer-btn').disabled = false;
            }
            // Enable "My Offers" button only for farmers
            if (userRole === 'farmer') {
                document.getElementById('my-offers-btn').disabled = false;
            }
        } else {
            // Non-registered user
            isUserLoggedIn = false;
        }
    })
    .catch(error => console.error('Error fetching user state:', error));

// Přidat event listener pro tlačítko "Create Offer"
document.getElementById('create-offer-btn').addEventListener('click', function () {
    if (this.disabled) return; // Prevent action if button is disabled

    if (!isUserLoggedIn) {
        // Pokud není uživatel přihlášen, přesměrovat na login.html
        window.location.href = '../frontend/login.html';
    } else {
        // Pokud je uživatel přihlášen, otevřít Create Offer sidebar
        document.getElementById('create-offer-sidebar').classList.add('open');
        resetCreateOfferSidebar();
        initCategorySelection();
    }
});


// Function to close the Create Offer sidebar
document.getElementById('close-create-offer-sidebar').addEventListener('click', function() {
    document.getElementById('create-offer-sidebar').classList.remove('open');
});

// Close panel when clicking outside of it
window.addEventListener('click', function(event) {
    const sidebar = document.getElementById('create-offer-sidebar');
    if (!sidebar.contains(event.target) && !event.target.matches('#create-offer-btn')) {
        sidebar.classList.remove('open');
    }
});

// Function to reset the Create Offer Sidebar
function resetCreateOfferSidebar() {
    // Clear category selection
    const categorySelectionDiv = document.getElementById('category-selection');
    categorySelectionDiv.innerHTML = ''; // Remove any existing category selection UI

    // Hide the form fields
    hideFormFields();

    // Reset form inputs
    const formFields = document.querySelectorAll('#create-offer-form input, #create-offer-form select');
    formFields.forEach(field => {
        if (field.type === 'select-one') {
            field.selectedIndex = 0; // Reset select fields
        } else if (field.type === 'number' || field.type === 'date' || field.type === 'text') {
            field.value = ''; // Reset number, date, and text fields
        }
    });
}

// Function to initialize category selection
function initCategorySelection() {
    const categorySelectionDiv = document.getElementById('category-selection');
    categorySelectionDiv.innerHTML = ''; // Clear any existing content

    // Fetch top-level categories
    fetch('../backend/categories.php')
        .then(response => response.json())
        .then(categories => {
            if (categories.length > 0) {
                // Create a select element
                const select = document.createElement('select');
                select.id = 'category-select-0';
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

                // Add event listener for change
                select.addEventListener('change', onCategoryChange);
            } else {
                console.error('No top-level categories found.');
            }
        })
        .catch(error => console.error('Error fetching categories:', error));
}

// Event handler for category change
function onCategoryChange(event) {
    const select = event.target;
    const selectedCategoryId = select.value;
    const level = parseInt(select.dataset.level);

    // Remove any subcategory selects beyond this level
    const categorySelectionDiv = document.getElementById('category-selection');
    const selects = categorySelectionDiv.querySelectorAll('select');
    selects.forEach(s => {
        if (parseInt(s.dataset.level) > level) {
            s.parentNode.removeChild(s);
        }
    });

    if (selectedCategoryId) {
        // Fetch subcategories
        fetch(`../backend/categories.php?parent_id=${selectedCategoryId}`)
            .then(response => response.json())
            .then(subcategories => {
                if (subcategories.length > 0) {
                    // Create a new select for subcategories
                    const subcategorySelect = document.createElement('select');
                    subcategorySelect.id = `category-select-${level + 1}`;
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

                    // Add event listener
                    subcategorySelect.addEventListener('change', onCategoryChange);
                }

                // Show or hide form fields based on required category selection
                if (areRequiredCategoriesSelected()) {
                    showFormFields();
                } else {
                    hideFormFields();
                }
            })
            .catch(error => console.error('Error fetching subcategories:', error));
    } else {
        // No category selected, hide form fields
        hideFormFields();
    }
}


function hideFormFields() {
    const formFields = document.getElementById('form-fields');
    formFields.style.display = 'none';

    const typeSelection = document.getElementById('type-selection');
    typeSelection.style.display = 'none';

    document.getElementById('sale-fields').style.display = 'none';
    document.getElementById('selfpick-fields').style.display = 'none';
}

function showFormFields() {
    const formFields = document.getElementById('form-fields');
    formFields.style.display = 'block';

    const typeSelection = document.getElementById('type-selection');
    typeSelection.style.display = 'block';

    // Initially hide other fields
    document.getElementById('sale-fields').style.display = 'none';
    document.getElementById('selfpick-fields').style.display = 'none';

    // Reset 'type' select
    document.getElementById('type').value = '';

    // Add event listener for 'type' selection change
    document.getElementById('type').addEventListener('change', onTypeChange);
}

// Event listener for 'type' selection change
function onTypeChange(event) {
    const type = event.target.value;
    if (type === 'sale') {
        document.getElementById('sale-fields').style.display = 'block';
        document.getElementById('selfpick-fields').style.display = 'none';
    } else if (type === 'selfpick') {
        document.getElementById('sale-fields').style.display = 'none';
        document.getElementById('selfpick-fields').style.display = 'block';
    } else {
        document.getElementById('sale-fields').style.display = 'none';
        document.getElementById('selfpick-fields').style.display = 'none';
    }
}

// Function to get the selected category ID
function getSelectedCategoryId() {
    const categorySelectionDiv = document.getElementById('category-selection');
    const selects = categorySelectionDiv.querySelectorAll('select');
    let selectedCategoryId = null;
    selects.forEach(select => {
        if (select.value) {
            selectedCategoryId = select.value;
        }
    });
    return selectedCategoryId;
}


// Handle form submission from the create offer sidebar
document.getElementById('submitOfferFormSidebar').addEventListener('click', function () {
    if (!areRequiredCategoriesSelected()) {
        alert('Please select both root category and first subcategory.');
        return;
    }

    const selectedCategoryId = getSelectedCategoryId();
    if (!selectedCategoryId) {
        alert('Please select a category.');
        return;
    }

    const formData = new FormData();

    // Append the selected category_id
    formData.append('category_id', selectedCategoryId);

    // Get the type
    const type = document.getElementById('type').value;
    if (!type) {
        alert('Please select a type.');
        return;
    }
    formData.append('type', type);

    if (type === 'sale') {
        // Get fields specific to 'sale'
        const price_kg = document.getElementById('price_kg').value;
        const quantity = document.getElementById('quantity').value;
        const origin = document.getElementById('origin').value;
        const date_of_harvest = document.getElementById('date_of_harvest').value;

        if (!price_kg || !quantity || !origin || !date_of_harvest) {
            alert('Please fill in all sale fields.');
            return;
        }

        formData.append('price_kg', price_kg);
        formData.append('quantity', quantity);
        formData.append('origin', origin);
        formData.append('date_of_harvest', date_of_harvest);
    } else if (type === 'selfpick') {
        // Get fields specific to 'selfpick'
        const location = document.getElementById('location').value;
        const start_date = document.getElementById('start_date').value;
        const end_date = document.getElementById('end_date').value;
        const price_kg = document.getElementById('selfpick_price_kg').value;
        const quantity = document.getElementById('selfpick_quantity').value;
        
        if (!location || !start_date || !end_date || !price_kg || !quantity) {
            alert('Please fill in all self-pick fields.');
            return;
        }

        formData.append('location', location);
        formData.append('start_date', start_date);
        formData.append('end_date', end_date);
        formData.append('price_kg', price_kg);
        formData.append('quantity', quantity);
    }

    fetch('../backend/create_offer.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            //alert(data.message);
            document.getElementById('create-offer-sidebar').classList.remove('open');
            formData.append('offer_id', data.offer_id); // Append the offer ID to formData
            addOfferToMarket(formData); // Add the new offer to the market

            // **Add this code to handle role change**
            if (data.roleChanged) {
                // Reload the page to update navbar and other elements
                location.reload();
            }
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

// Function to dynamically add the new offer to the market
function addOfferToMarket(formData) {
    const marketContainer = document.getElementById('market-container');
    const offerBox = document.createElement('div');
    offerBox.className = 'grid-item';

    let offerContent = '';

    const type = formData.get('type');
    const categoryId = formData.get('category_id');

    // Get category info to retrieve name and image_path
    fetch(`../backend/get_category_info.php?category_id=${categoryId}`)
        .then(response => response.json())
        .then(categoryInfo => {
            const fullCategoryName = categoryInfo.full_category_name;
            const imagePath = categoryInfo.image_path ? `/${categoryInfo.image_path}` : '/assets/images/default.png';


            if (type === 'sale') {
                offerContent = `
                    <div class="top-section">
                        <img src="${imagePath}" alt="${fullCategoryName}">
                    </div>
                    <div class="middle-section">Sale</div>
                    <div class="bottom-section">
                        <div>
                            <p><strong>${fullCategoryName}</strong></p>
                            <p>You</p>
                            <p>${formData.get('price_kg')} CZK/kg</p>
                            <p>Remains: ${formData.get('quantity')} kg</p>
                        </div>
                        <div class="actions">
                            <button class="button">More offers</button>
                        </div>
                    </div>
                `;
            } else if (type === 'selfpick') {
                offerContent = `
                    <div class="top-section">
                        <img src="${imagePath}" alt="${fullCategoryName}">
                    </div>
                    <div class="middle-section">Self-pick</div>
                    <div class="bottom-section">
                        <div>
                            <p><strong>${fullCategoryName}</strong></p>
                            <p>You</p>
                            <p>${formData.get('price_kg')} CZK/kg</p>
                            <p>Available: ${formData.get('quantity')}</p>
                        </div>
                        <div class="actions">
                            <button class="button">Follow</button>
                        </div>
                    </div>
                `;
            }

            offerBox.innerHTML = offerContent;

            // Add event listener to open offer details
            offerBox.addEventListener('click', function () {
                openOfferSidebar(formData.get('offer_id'));
            });

            // Insert the new offer at the beginning
            marketContainer.insertBefore(offerBox, marketContainer.firstChild);
        })
        .catch(error => console.error('Error:', error));
}
// Initialize Filter Category Selection
window.addEventListener('DOMContentLoaded', () => {
    initFilterCategorySelection();
});

function initFilterCategorySelection() {
    const categorySelectionDiv = document.getElementById('filter-category-selection');
    if (!categorySelectionDiv) {
        console.error('Category selection element not found');
        return;
    }

    categorySelectionDiv.innerHTML = ''; // Clear any existing content

    // Fetch top-level categories
    fetch('../backend/categories.php')
        .then(response => response.json())
        .then(categories => {
            if (categories.length > 0) {
                // Create a select element
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

                // Add event listener for change
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

    // Remove any subcategory selects beyond this level
    const categorySelectionDiv = document.getElementById('filter-category-selection');
    const selects = categorySelectionDiv.querySelectorAll('select');
    selects.forEach(s => {
        if (parseInt(s.dataset.level) > level) {
            s.parentNode.removeChild(s);
        }
    });

    if (selectedCategoryId) {
        // Check if this category has subcategories
        fetch(`../backend/categories.php?parent_id=${selectedCategoryId}`)
            .then(response => response.json())
            .then(subcategories => {
                if (subcategories.length > 0) {
                    // Create a new select for subcategories
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

                    // Add event listener
                    subcategorySelect.addEventListener('change', onFilterCategoryChange);
                }
            })
            .catch(error => console.error('Error fetching subcategories:', error));
    }
}

document.getElementById('apply-filters-button').addEventListener('click', function() {
    applyFilters();
});

function applyFilters() {
    const marketContainer = document.getElementById('market-container');
    marketContainer.innerHTML = '';
    // Get the filter values
    const type = document.getElementById('filter-type').value;
    const priceMin = document.getElementById('filter-price-min').value;
    const priceMax = document.getElementById('filter-price-max').value;

    // Get the selected category ID
    const categorySelectionDiv = document.getElementById('filter-category-selection');
    const selects = categorySelectionDiv.querySelectorAll('select');
    let selectedCategoryId = null;
    selects.forEach(select => {
        if (select.value) {
            selectedCategoryId = select.value;
        }
    });

    // Build the query parameters
    let queryParams = [];
    if (type) {
        queryParams.push(`type=${encodeURIComponent(type)}`);
    }
    if (priceMin) {
        queryParams.push(`price_min=${encodeURIComponent(priceMin)}`);
    }
    if (priceMax) {
        queryParams.push(`price_max=${encodeURIComponent(priceMax)}`);
    }
    if (selectedCategoryId) {
        queryParams.push(`category_id=${encodeURIComponent(selectedCategoryId)}`);
    }

    const queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

    // Fetch the offers with filters applied
    fetch(`../backend/get_offers.php${queryString}`)
        .then(response => response.json())
        .then(data => {
            const marketContainer = document.getElementById('market-container');
            marketContainer.innerHTML = ''; // Clear content before adding new offers

            if (data.length === 0) {
                // Handle empty results
                marketContainer.innerHTML = '<p>No offers found for the selected filters.</p>';
            } else {
                data.forEach(offer => {
                    const offerBox = document.createElement('div');
                    offerBox.className = 'grid-item';

                    let offerContent = '';

                    // Use image_path from offer data
                    const imagePath = offer.image_path ? `/${offer.image_path}` : '/assets/images/default.png';

                    if (offer.type === 'sale') {
                        offerContent = `
                            <div class="top-section">
                                <img src="${imagePath}" alt="${offer.full_category_name}">
                            </div>
                            <div class="middle-section">Sale</div>
                            <div class="bottom-section">
                                <div>
                                    <p><strong>${offer.full_category_name}</strong></p>
                                    <p>${offer.farmer_name}</p>
                                    <p>${offer.price_kg} CZK/kg</p>
                                    <p>Remains: ${offer.attribute_quantity} kg</p>
                                </div>
                                <div class="actions">
                                    <button class="button more-offers-button" data-farmer-id="${offer.farmer_id}">More offers</button>
                                </div>
                            </div>
                        `;
                    } else if (offer.type === 'selfpick') {
                        offerContent = `
                            <div class="top-section">
                                <img src="${imagePath}" alt="${offer.full_category_name}">
                            </div>
                            <div class="middle-section">Self-pick</div>
                            <div class="bottom-section">
                                <div>
                                    <p><strong>${offer.full_category_name}</strong></p>
                                    <p>${offer.farmer_name}</p>
                                    <p>${offer.price_kg} CZK/kg</p>
                                    <p>Available: ${offer.attribute_quantity}</p>
                                </div>
                                <div class="actions">
                                    <button class="button more-offers-button" data-farmer-id="${offer.farmer_id}">More offers</button>
                                </div>
                            </div>
                        `;
                    }

                    offerBox.innerHTML = offerContent;

                    // Add event listener to open offer details
                    offerBox.addEventListener('click', function () {
                        openOfferSidebar(offer.offer_id);
                    });

                    // Add event listener to the 'More offers' button
                    const moreOffersButton = offerBox.querySelector('.more-offers-button');
                    if (moreOffersButton) {
                        moreOffersButton.addEventListener('click', function(event) {
                            event.stopPropagation();
                            const farmerId = event.currentTarget.dataset.farmerId;
                            showOffersFromFarmer(farmerId);
                        });
                    }

                    marketContainer.appendChild(offerBox);
                });
            }
        })
        .catch(error => console.error('Error:', error));
}



// Load existing offers from the database
window.addEventListener('DOMContentLoaded', () => {
    fetch('../backend/get_offers.php')
        .then(response => response.json())
        .then(data => {
            const marketContainer = document.getElementById('market-container');
            marketContainer.innerHTML = ''; // Clear content before adding new offers
            data.forEach(offer => {
                const offerBox = document.createElement('div');
                offerBox.className = 'grid-item';

                // Add data attributes for search functionality
                offerBox.dataset.farmerName = offer.farmer_name;
                offerBox.dataset.categoryName = offer.full_category_name;
                offerBox.dataset.offerType = offer.type;
                offerBox.dataset.origin = offer.origin || '';

                let offerContent = '';

                // Use image_path from offer data
                const imagePath = offer.image_path ? `/${offer.image_path}` : '/assets/images/default.png';

                if (offer.type === 'sale') {
                    offerContent = `
                        <div class="top-section">
                            <img src="${imagePath}" alt="${offer.full_category_name}">
                        </div>
                        <div class="middle-section">Sale</div>
                        <div class="bottom-section">
                            <div>
                                <p><strong>${offer.full_category_name}</strong></p>
                                <p>${offer.farmer_name}</p>
                                <p>${offer.price_kg} CZK/kg</p>
                                <p>Remains: ${offer.attribute_quantity} kg</p>
                            </div>
                            <div class="actions">
                                <button class="button more-offers-button" data-farmer-id="${offer.farmer_id}">More offers</button>
                            </div>
                        </div>
                    `;
                } else if (offer.type === 'selfpick') {
                    offerContent = `
                        <div class="top-section">
                            <img src="${imagePath}" alt="${offer.full_category_name}">
                        </div>
                        <div class="middle-section">Self-pick</div>
                        <div class="bottom-section">
                            <div>
                                <p><strong>${offer.full_category_name}</strong></p>
                                <p>${offer.farmer_name}</p>
                                <p>${offer.price_kg} CZK/kg</p>
                                <p>Available: ${offer.attribute_quantity}</p>
                            </div>
                            <div class="actions">
                                <button class="button more-offers-button" data-farmer-id="${offer.farmer_id}">More offers</button>
                            </div>
                        </div>
                    `;
                }

                offerBox.innerHTML = offerContent;

                // Add event listener to open offer details
                offerBox.addEventListener('click', function () {
                    openOfferSidebar(offer.offer_id);
                });

                // Add event listener to the 'More offers' button
                const moreOffersButton = offerBox.querySelector('.more-offers-button');
                if (moreOffersButton) {
                    moreOffersButton.addEventListener('click', function(event) {
                        event.stopPropagation(); // Prevent click from opening offer details
                        const farmerId = event.currentTarget.dataset.farmerId;
                        showOffersFromFarmer(farmerId);
                    });
                }

                marketContainer.appendChild(offerBox);
            });
        })
        .catch(error => console.error('Error:', error));
});


// Search functionality
document.getElementById('search-button').addEventListener('click', performSearch);
document.getElementById('search-input').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const offers = document.querySelectorAll('.grid-item');

    offers.forEach(offer => {
        const farmerName = offer.dataset.farmerName.toLowerCase();
        const categoryName = offer.dataset.categoryName.toLowerCase();
        const offerType = offer.dataset.offerType.toLowerCase();
        const origin = offer.dataset.origin ? offer.dataset.origin.toLowerCase() : '';

        // Check if the search term matches any of the specified fields
        if (
            farmerName.includes(searchTerm) ||
            categoryName.includes(searchTerm) ||
            offerType.includes(searchTerm) ||
            origin.includes(searchTerm)
        ) {
            offer.style.display = 'grid'; // Restore original display
        } else {
            offer.style.display = 'none'; // Hide non-matching offers
        }
    });
}

let currentOfferId = null;

function openOfferSidebar(offerId) {
    currentOfferId = offerId;
    // Fetch offer details from the backend
    fetch(`../backend/get_offer_details.php?offer_id=${offerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'error') {
                const offerType = data.type;

                const sidebarContent = document.querySelector('#offer-detail-sidebar .sidebar-content');

                // Clear existing content
                sidebarContent.innerHTML = '';

                // Common fields
                let contentHtml = `
                    <p><strong>Category:</strong> ${data.category_name}</p>
                    <p><strong>Type:</strong> ${offerType}</p>
                    <p><strong>Farmer:</strong> <a href="view_reviews.html?farmer_id=${data.user_id}" class="farmer-link">${data.farmer_name}</a></p>
                `;

                if (offerType === 'selfpick') {
                    contentHtml += `
                        <p><strong>Location:</strong> ${data.location}</p>
                        <p><strong>Start Date:</strong> ${data.start_date}</p>
                        <p><strong>End Date:</strong> ${data.end_date}</p>
                        <p><strong>Price per Kg:</strong> ${data.price_kg} CZK</p>
                        <p><strong>Available spaces:</strong> ${data.attribute_quantity}</p>
                    `;

                    // Fetch registration status
                    fetch(`../backend/check_event_registration.php?offer_id=${offerId}`)
                        .then(response => response.json())
                        .then(registrationData => {
                            if (registrationData.registered) {
                                contentHtml += `<button id="follow-button" disabled>Already Registered</button>`;
                            } else if (parseInt(data.attribute_quantity) <= 0) {
                                contentHtml += `<button id="follow-button" disabled>No Available Spaces</button>`;
                            } else {
                                contentHtml += `<button id="follow-button">Add to My Events</button>`;
                            }

                            // Set the content after the button has been added
                            sidebarContent.innerHTML = contentHtml;

                            // Add event listener if not registered and there are available spaces
                            if (!registrationData.registered && parseInt(data.attribute_quantity) > 0) {
                                document.getElementById('follow-button').addEventListener('click', function() {
                                    registerForEvent();
                                });
                            }
                        })
                        .catch(error => console.error('Error:', error));
                } else if (offerType === 'sale') {
                    contentHtml += `
                        <p><strong>Origin:</strong> ${data.origin}</p>
                        <p><strong>Date of Harvest:</strong> ${data.date_of_harvest}</p>
                        <p><strong>Available Quantity:</strong> ${data.attribute_quantity} kg</p>
                        <p><strong>Price per Kg:</strong> ${data.price_kg} CZK</p>

                        <label for="order-quantity">Enter Quantity (in kilograms):</label>
                        <input type="number" id="order-quantity" name="order-quantity" placeholder="Enter quantity..">
                        <p><strong>Total Price:</strong> <span id="total-price">0</span> CZK</p>

                        <button id="place-order-button">Place Order</button>
                    `;

                    // Set the content for 'sale' offers
                    sidebarContent.innerHTML = contentHtml;

                    // Set up event listeners for 'sale' offers
                    const orderQuantityInput = document.getElementById('order-quantity');
                    updateTotalPrice(data.price_kg);

                    orderQuantityInput.addEventListener('input', function() {
                        updateTotalPrice(data.price_kg);
                    });

                    document.getElementById('place-order-button').addEventListener('click', function() {
                        placeOrder(data.attribute_quantity);
                    });
                }

                // Show the sidebar
                document.getElementById('offer-detail-sidebar').classList.add('open');
            } else {
                alert('Error fetching offer details.');
            }
        })
        .catch(error => console.error('Error:', error));
}


function updateTotalPrice(pricePerKg) {
    const quantityInput = document.getElementById('order-quantity');
    const quantity = parseInt(quantityInput.value);

    if (isNaN(quantity)) {
        document.getElementById('total-price').innerText = '0';
        return;
    }

    const totalPrice = (quantity * pricePerKg).toFixed(2);
    document.getElementById('total-price').innerText = totalPrice;
}

function placeOrder(availableQuantity) {
    if (!isUserLoggedIn) {
        // Redirect non-logged-in users to login page
        window.location.href = '../frontend/login.html';
        return;
    }

    const quantity = parseInt(document.getElementById('order-quantity').value);

    if (quantity > availableQuantity) {
        alert('Requested quantity exceeds available quantity.');
        return;
    }

    // Send order details to backend
    fetch('../backend/place_order.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: currentOfferId, quantity: quantity })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            //alert(data.message);
            // Close the sidebar
            document.getElementById('offer-detail-sidebar').classList.remove('open');
            // **Add this code to handle role change**
            if (data.roleChanged) {
                // Reload the page to update navbar and other elements
                location.reload();
            }
            // Optionally, refresh the offers or update the specific offer box
        } else {
            alert('Error placing order: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('close-sidebar').addEventListener('click', function() {
    document.getElementById('offer-detail-sidebar').classList.remove('open');
});

let isClickInsideSidebar = false;

// Detect when click starts inside the sidebar
document.getElementById('offer-detail-sidebar').addEventListener('mousedown', function () {
    isClickInsideSidebar = true;
});

// Detect when click ends
window.addEventListener('mouseup', function (event) {
    const sidebar = document.getElementById('offer-detail-sidebar');
    const marketContainer = document.getElementById('market-container');

    // If click is outside sidebar and outside offers
    if (!sidebar.contains(event.target) && !marketContainer.contains(event.target)) {
        if (!isClickInsideSidebar) {
            sidebar.classList.remove('open');
        }
    }

    // Reset indicator
    isClickInsideSidebar = false;
});

function registerForEvent() {
    if (!isUserLoggedIn) {
        // Redirect non-logged-in users to login page
        window.location.href = '../frontend/login.html';
        return;
    }
    // Send request to backend to register for the event
    fetch('../backend/register_for_event.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: currentOfferId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Response from server:', data);
        if (data.status === 'success') {
            //alert(data.message);
            document.getElementById('offer-detail-sidebar').classList.remove('open');
            const followButton = document.getElementById('follow-button');
            if (followButton) {
                followButton.innerText = 'Already Registered';
                followButton.disabled = true;
            }

            // **Add this code to handle role change**
            if (data.roleChanged) {
                // Reload the page to update navbar and other elements
                location.reload();
            }

        } else {
            alert('Error registering for event: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error occurred:', error);
        alert('Failed to register for the event. Please try again later.');
    });
}


// Event listener for "My Offers" button
document.getElementById('my-offers-btn').addEventListener('click', function() {
    if (this.disabled) return; // Prevent action if button is disabled
    displayMyOffers();
});

// Function to display farmer's own offers
function displayMyOffers() {
    fetch('../backend/get_my_offers.php')
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                //alert(data.message);
                return;
            }
            // Clear the market container
            const marketContainer = document.getElementById('market-container');
            marketContainer.innerHTML = '';

            data.forEach(offer => {
                // Create offer boxes similar to the ones in the market, but with edit and delete options
                const offerBox = document.createElement('div');
                offerBox.className = 'grid-item';

                // Add data attributes for search functionality
                offerBox.dataset.farmerName = offer.farmer_name;
                offerBox.dataset.categoryName = offer.full_category_name;
                offerBox.dataset.offerType = offer.type;
                offerBox.dataset.origin = offer.origin || '';

                let offerContent = '';
                const imagePath = offer.image_path ? `/${offer.image_path}` : '/assets/images/default.png';

                if (offer.type === 'sale') {
                    offerContent = `
                        <div class="top-section">
                            <img src="${imagePath}" alt="${offer.full_category_name}">
                        </div>
                        <div class="middle-section">Sale</div>
                        <div class="bottom-section">
                            <div>
                                <p><strong>${offer.full_category_name}</strong></p>
                                <p>${offer.farmer_name}</p>
                                <p>${offer.price_kg} CZK/kg</p>
                                <p>Remains: ${offer.attribute_quantity} kg</p>
                            </div>
                            <div class="actions">
                                <button class="edit-offer-button" data-offer-id="${offer.offer_id}">Edit</button>
                                <button class="delete-offer-button" data-offer-id="${offer.offer_id}">Delete</button>
                            </div>
                        </div>
                    `;
                } else if (offer.type === 'selfpick') {
                    offerContent = `
                        <div class="top-section">
                            <img src="${imagePath}" alt="${offer.full_category_name}">
                        </div>
                        <div class="middle-section">Self-pick</div>
                        <div class="bottom-section">
                            <div>
                                <p><strong>${offer.full_category_name}</strong></p>
                                <p>${offer.farmer_name}</p>
                                <p>${offer.price_kg} CZK/kg</p>
                                <p>Available: ${offer.attribute_quantity}</p>
                            </div>
                            <div class="actions">
                                <button class="edit-offer-button" data-offer-id="${offer.offer_id}">Edit</button>
                                <button class="delete-offer-button" data-offer-id="${offer.offer_id}">Delete</button>
                            </div>
                        </div>
                    `;
                }

                offerBox.innerHTML = offerContent;

                // Add event listeners for edit and delete buttons
                offerBox.querySelector('.edit-offer-button').addEventListener('click', function(event) {
                    event.stopPropagation();
                    const offerId = event.target.dataset.offerId;
                    openEditOfferSidebar(offerId);
                });

                offerBox.querySelector('.delete-offer-button').addEventListener('click', function(event) {
                    event.stopPropagation();
                    const offerId = event.target.dataset.offerId;
                    deleteOffer(offerId);
                });

                marketContainer.appendChild(offerBox);
            });
        })
        .catch(error => console.error('Error:', error));
}

// Function to open the Edit Offer sidebar
function openEditOfferSidebar(offerId) {
    // Fetch offer details
    fetch(`../backend/get_offer_details.php?offer_id=${offerId}`)
        .then(response => response.json())
        .then(data => {
            if (data.status !== 'error') {
                // Open the edit-offer-sidebar
                const sidebar = document.getElementById('edit-offer-sidebar');
                sidebar.classList.add('open');

                // Clear previous content
                const sidebarContent = sidebar.querySelector('.sidebar-content');
                sidebarContent.innerHTML = '';

                // Create the form dynamically, pre-filled with offer details
                const form = document.createElement('form');
                form.id = 'edit-offer-form';

                // Build the form similar to the create-offer-form, but with values pre-filled
                // Also include a hidden input for offer_id
                let formContent = '';

                // Since we have two types, sale and selfpick, we need to handle both
                formContent += `<input type="hidden" name="offer_id" value="${offerId}">`;

                formContent += `
                    <label for="type">Category:</label>
                    <input type="text" id="type" name="type" value="${data.category_name}" readonly><br><br>
                `;

                formContent += `
                    <label for="type">Type:</label>
                    <input type="text" id="type" name="type" value="${data.type}" readonly><br><br>
                `;

                if (data.type === 'sale') {
                    formContent += `
                        <label for="price_kg">Price per Kg:</label>
                        <input type="number" id="price_kg" name="price_kg" step="0.01" value="${data.price_kg}" required><br><br>
        
                        <label for="quantity">Quantity in Kgs:</label>
                        <input type="number" id="quantity" name="quantity" value="${data.attribute_quantity}" required><br><br>
        
                        <label for="origin">Origin:</label>
                        <select id="origin" name="origin" required>
                            <option value="Czech Republic" ${data.origin === 'Czech Republic' ? 'selected' : ''}>Czech Republic</option>
                            <option value="Spain" ${data.origin === 'Spain' ? 'selected' : ''}>Spain</option>
                            <option value="England" ${data.origin === 'England' ? 'selected' : ''}>England</option>
                            <option value="Portugal" ${data.origin === 'Portugal' ? 'selected' : ''}>Portugal</option>
                            <option value="USA" ${data.origin === 'USA' ? 'selected' : ''}>USA</option>
                            <option value="Germany" ${data.origin === 'Germany' ? 'selected' : ''}>Germany</option>
                            <option value="Poland" ${data.origin === 'Poland' ? 'selected' : ''}>Poland</option>
                            <option value="Belgium" ${data.origin === 'Belgium' ? 'selected' : ''}>Belgium</option>
                        </select><br><br>
        
                        <label for="date_of_harvest">Date of Harvest:</label>
                        <input type="date" id="date_of_harvest" name="date_of_harvest" value="${data.date_of_harvest}" required><br><br>
                    `;
                } else if (data.type === 'selfpick') {
                    formContent += `
                        <label for="location">Location:</label>
                        <input type="text" id="location" name="location" value="${data.location}" required><br><br>
                    
                        <label for="start_date">Start Date:</label>
                        <input type="date" id="start_date" name="start_date" value="${data.start_date}" required><br><br>
                    
                        <label for="end_date">End Date:</label>
                        <input type="date" id="end_date" name="end_date" value="${data.end_date}" required><br><br>
                    
                        <label for="price_kg">Price per Kg:</label>
                        <input type="number" id="price_kg" name="price_kg" step="0.01" value="${data.price_kg}" required><br><br>
                    
                        <label for="quantity">Maximum Number of Registrations:</label>
                        <input type="number" id="quantity" name="quantity" value="${data.attribute_quantity}" required><br><br>
                    `;
                }

                formContent += `<button type="button" id="submitEditOfferForm">Save Changes</button>`;

                form.innerHTML = formContent;
                sidebarContent.appendChild(form);

                // Add event listener to submit button
                document.getElementById('submitEditOfferForm').addEventListener('click', function() {
                    submitEditOfferForm();
                });

                // Add event listener to close button
                document.getElementById('close-edit-offer-sidebar').addEventListener('click', function() {
                    sidebar.classList.remove('open');
                });
            } else {
                alert('Error fetching offer details.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to submit the edited offer
function submitEditOfferForm() {
    const form = document.getElementById('edit-offer-form');
    const formData = new FormData(form);

    fetch('../backend/update_offer.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            //alert('Offer updated successfully!');
            // Close the sidebar
            document.getElementById('edit-offer-sidebar').classList.remove('open');
            // Refresh the My Offers view
            displayMyOffers();
        } else {
            alert('Error updating offer: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to delete an offer
function deleteOffer(offerId) {
    fetch('../backend/delete_offer.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            //alert('Offer deleted successfully!');
            // Refresh the My Offers view
            displayMyOffers();
        } else {
            alert('Error deleting offer: ' + data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

// Function to display offers from a specific farmer
function showOffersFromFarmer(farmerId) {
    fetch(`../backend/get_offers.php?farmer_id=${farmerId}`)
        .then(response => response.json())
        .then(data => {
            const marketContainer = document.getElementById('market-container');
            marketContainer.innerHTML = ''; // Clear existing offers

            if (data.length === 0) {
                marketContainer.innerHTML = '<p>No offers found for this farmer.</p>';
            } else {
                data.forEach(offer => {
                    const offerBox = document.createElement('div');
                    offerBox.className = 'grid-item';

                    let offerContent = '';

                    const imagePath = offer.image_path ? `/${offer.image_path}` : '/assets/images/default.png';

                    if (offer.type === 'sale') {
                        offerContent = `
                            <div class="top-section">
                                <img src="${imagePath}" alt="${offer.full_category_name}">
                            </div>
                            <div class="middle-section">Sale</div>
                            <div class="bottom-section">
                                <div>
                                    <p><strong>${offer.full_category_name}</strong></p>
                                    <p>${offer.farmer_name}</p>
                                    <p>${offer.price_kg} CZK/kg</p>
                                    <p>Remains: ${offer.attribute_quantity} kg</p>
                                </div>
                                <div class="actions">
                                    <button class="button more-offers-button" data-farmer-id="${offer.farmer_id}">More offers</button>
                                </div>
                            </div>
                        `;
                    } else if (offer.type === 'selfpick') {
                        offerContent = `
                            <div class="top-section">
                                <img src="${imagePath}" alt="${offer.full_category_name}">
                            </div>
                            <div class="middle-section">Self-pick</div>
                            <div class="bottom-section">
                                <div>
                                    <p><strong>${offer.full_category_name}</strong></p>
                                    <p>${offer.farmer_name}</p>
                                    <p>${offer.price_kg} CZK/kg</p>
                                    <p>Available: ${offer.attribute_quantity}</p>
                                </div>
                                <div class="actions">
                                    <button class="button more-offers-button" data-farmer-id="${offer.farmer_id}">More offers</button>
                                </div>
                            </div>
                        `;
                    }

                    offerBox.innerHTML = offerContent;

                    // Add event listener to open offer details
                    offerBox.addEventListener('click', function () {
                        openOfferSidebar(offer.offer_id);
                    });

                    // Add event listener to the 'More offers' button
                    const moreOffersButton = offerBox.querySelector('.more-offers-button');
                    if (moreOffersButton) {
                        moreOffersButton.addEventListener('click', function(event) {
                            event.stopPropagation(); // Prevent click from opening offer details
                            const farmerId = event.currentTarget.dataset.farmerId;
                            showOffersFromFarmer(farmerId);
                        });
                    }

                    marketContainer.appendChild(offerBox);
                });
            }
        })
        .catch(error => console.error('Error:', error));
}

// Function to check if root category and first subcategory are selected
function areRequiredCategoriesSelected() {
    const categorySelectionDiv = document.getElementById('category-selection');
    const selects = categorySelectionDiv.querySelectorAll('select');
    if (selects.length >= 2) {
        const rootCategorySelect = selects[0];
        const firstSubcategorySelect = selects[1];
        return rootCategorySelect.value !== '' && firstSubcategorySelect.value !== '';
    }
    return false;
}

// Přidáme event listener na změnu typu nabídky
document.getElementById('type').addEventListener('change', function () {
    const selectedType = this.value;

    // Zobrazit tlačítko pouze pokud je vybraný typ nabídky
    if (selectedType) {
        document.getElementById('submitOfferFormSidebar').style.display = 'block';
    } else {
        document.getElementById('submitOfferFormSidebar').style.display = 'none';
    }
});

