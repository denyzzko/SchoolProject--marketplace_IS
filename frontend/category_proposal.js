let currentParentCategory = null;
const categoryStack = [];

// Display message on error or success
function displayMessage(element, message, type) {
    element.textContent = message;
    element.style.color = type === "success" ? "green" : "red";
}

// Fetch and render root categories
function fetchCategories(parentId = null) {
    fetch(`../backend/categories.php?parent_id=${parentId || ''}`)
        .then(response => response.json())
        .then(data => renderCategories(data, parentId))
        .catch(error => console.error('Error fetching categories:', error));
}

// Render categories as buttons
function renderCategories(categories, parentId) {
    const categoriesList = document.getElementById('categories-list');
    const backButton = document.getElementById('back-button');
    const addCategoryContainer = document.getElementById('add-category-container');

    categoriesList.innerHTML = '';
    addCategoryContainer.style.display = 'none';

    if (parentId !== null) {
        backButton.style.display = 'block';
    } else {
        backButton.style.display = 'none';
    }

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.name;
        button.className = 'category-button';
        button.onclick = () => {
            categoryStack.push(parentId);
            currentParentCategory = category.category_id;
            fetchCategories(category.category_id);
        };
        categoriesList.appendChild(button);
    });

    const addButton = document.createElement('button');
    addButton.textContent = 'I want new category here';
    addButton.className = 'add-category-button';
    addButton.onclick = showAddCategoryForm;
    categoriesList.appendChild(addButton);
}

// Go back to the previous category
function goBack() {
    const previousParentId = categoryStack.pop();
    currentParentCategory = previousParentId || null;
    fetchCategories(previousParentId);
}

// Show the add category form
function showAddCategoryForm() {
    document.getElementById('add-category-container').style.display = 'block';
}

// Cancel adding a new category
function cancelAddCategory() {
    document.getElementById('add-category-container').style.display = 'none';
    document.getElementById('new-category-name').value = '';
}

// Submit a new category proposal
function submitCategoryProposal() {
    const name = document.getElementById('new-category-name').value;
    const errorMessageElement = document.getElementById('error-message');
    const successMessageElement = document.getElementById('success-message');

    if (!name.trim()) {
        document.getElementById('error-message').textContent = 'Category name is required.';
        return;
    }

    fetch('../backend/propose_category.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ parent_category: currentParentCategory, name }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayMessage(successMessageElement, data.message, "success");
                cancelAddCategory();
                currentParentCategory = null;
                categoryStack.length = 0;
                fetchCategories();
            } else {
                displayMessage(errorMessageElement, data.message, "error");
            }
        })
        .catch(error => {
            console.error('Error submitting proposal:', error);
            displayMessage(errorMessageElement, 'An error occurred. Please try again.', "error");
        });
}
document.addEventListener('DOMContentLoaded', () => fetchCategories());
