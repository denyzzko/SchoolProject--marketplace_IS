// Dynamically check role and show "Create Offer" section for farmers
fetch('../backend/index.php')
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn && data.role === 'farmer') {
            document.getElementById('create-offer-section').style.display = 'block';
        }
    })
    .catch(error => console.error('Error:', error));

// Function to open the Create Offer sidebar
document.getElementById('create-offer-btn').addEventListener('click', function() {
    document.getElementById('create-offer-sidebar').classList.add('open');
    resetCreateOfferSidebar(); // Reset the sidebar to its initial state
    initCategorySelection(); // Initialize category selection
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
    fetch('../backend/get_categories.php')
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
        // Check if this category has subcategories
        fetch(`../backend/get_categories.php?parent_category_id=${selectedCategoryId}`)
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

                    // Hide the rest of the form until a leaf category is selected
                    hideFormFields();
                } else {
                    // No more subcategories, proceed to show form fields
                    showFormFields();
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

        if (!location || !start_date || !end_date) {
            alert('Please fill in all self-pick fields.');
            return;
        }

        formData.append('location', location);
        formData.append('start_date', start_date);
        formData.append('end_date', end_date);
    }

    fetch('../backend/create_offer.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert(data.message);
            document.getElementById('create-offer-sidebar').classList.remove('open');
            formData.append('offer_id', data.offer_id); // Append the offer ID to formData
            addOfferToMarket(formData); // Add the new offer to the market
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
});

// Funkce pro dynamické přidání nabídky na tržiště
function addOfferToMarket(formData) {
    const marketContainer = document.getElementById('market-container');
    const offerBox = document.createElement('div');
    offerBox.className = 'grid-item';

    let offerContent = '';

    const type = formData.get('type');
    const categoryId = formData.get('category_id');

    // Získání informací o kategorii pro získání názvu a image_path
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
                            <button class="button">Compare Price</button>
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
                        </div>
                        <div class="actions">
                            <button class="button">Follow</button>
                        </div>
                    </div>
                `;
            }

            offerBox.innerHTML = offerContent;

            // Přidání event listeneru pro otevření detailů nabídky
            offerBox.addEventListener('click', function () {
                openOfferSidebar(formData.get('offer_id'));
            });

            // Vložit novou nabídku na začátek
            marketContainer.insertBefore(offerBox, marketContainer.firstChild);
        })
        .catch(error => console.error('Error:', error));
}


// Načtení existujících nabídek z databáze
window.addEventListener('DOMContentLoaded', () => {
    fetch('../backend/get_offers.php')
        .then(response => response.json())
        .then(data => {
            const marketContainer = document.getElementById('market-container');
            marketContainer.innerHTML = ''; // Vyčistíme obsah před přidáním nových nabídek
            data.forEach(offer => {
                const offerBox = document.createElement('div');
                offerBox.className = 'grid-item';

                let offerContent = '';

                // Použijeme image_path z dat nabídky
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
                                <button class="button">Compare Price</button>
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
                            </div>
                            <div class="actions">
                                <button class="button">Details</button>
                            </div>
                        </div>
                    `;
                }

                offerBox.innerHTML = offerContent;

                // Přidání event listeneru pro otevření detailů nabídky
                offerBox.addEventListener('click', function () {
                    openOfferSidebar(offer.offer_id);
                });

                marketContainer.appendChild(offerBox);
            });
        })
        .catch(error => console.error('Error:', error));
});




// Search button click event
document.getElementById('search-button').addEventListener('click', function () {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const offers = document.querySelectorAll('.grid-item');

    offers.forEach(offer => {
        const offerText = offer.textContent.toLowerCase();
        if (offerText.includes(searchTerm)) {
            offer.style.display = 'grid'; // Restore original display
        } else {
            offer.style.display = 'none'; // Hide non-matching offers
        }
    });
});

// Search when the Enter key is pressed
document.getElementById('search-input').addEventListener('keyup', function (event) {
    if (event.key === 'Enter') {
        const searchTerm = this.value.toLowerCase();
        const offers = document.querySelectorAll('.grid-item');

        offers.forEach(offer => {
            const offerText = offer.textContent.toLowerCase();
            if (offerText.includes(searchTerm)) {
                offer.style.display = 'grid'; // Restore original display
            } else {
                offer.style.display = 'none'; // Hide non-matching offers
            }
        });
    }
});

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
                    <p><strong>Farmer:</strong> ${data.farmer_name}</p>
                `;

                if (offerType === 'selfpick') {
                    contentHtml += `
                        <p><strong>Location:</strong> ${data.location}</p>
                        <p><strong>Start Date:</strong> ${data.start_date}</p>
                        <p><strong>End Date:</strong> ${data.end_date}</p>
                    `;

                    // Fetch registration status
                    fetch(`../backend/check_event_registration.php?offer_id=${offerId}`)
                        .then(response => response.json())
                        .then(registrationData => {
                            if (registrationData.registered) {
                                contentHtml += `<button id="follow-button" disabled>Already Registered</button>`;
                            } else {
                                contentHtml += `<button id="follow-button">Add to My Events</button>`;
                            }

                            // Set the content after the button has been added
                            sidebarContent.innerHTML = contentHtml;

                            // Add event listener if not registered
                            if (!registrationData.registered) {
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
                        <p><strong>Available Quantity:</strong> ${data.attribute_quantity}</p>
                        <p><strong>Price per Kg:</strong> ${data.price_kg} CZK</p>

                        <label for="order-quantity">Enter Quantity:</label>
                        <input type="number" id="order-quantity" name="order-quantity" min="1" value="1">
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

    if (isNaN(quantity) || quantity <= 0) {
        quantityInput.value = 1; // Reset to default valid value
        return;
    }

    const totalPrice = (quantity * pricePerKg).toFixed(2);
    document.getElementById('total-price').innerText = totalPrice;
}

function placeOrder(availableQuantity) {
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
            alert('Order placed successfully!');
            // Close the sidebar
            document.getElementById('offer-detail-sidebar').classList.remove('open');
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
            alert('Successfully registered for the event!');
            document.getElementById('offer-detail-sidebar').classList.remove('open');
            const followButton = document.getElementById('follow-button');
            if (followButton) {
                followButton.innerText = 'Already Registered';
                followButton.disabled = true;
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


