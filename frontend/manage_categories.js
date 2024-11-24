let currentParentCategory = null;
const categoryStack = [];

// Display message on error or success
function displayMessage(element, message, type) {
    element.textContent = message;
    element.style.color = type === "success" ? "green" : "red";
}

// Fetch and render categories for moderators
function fetchModeratorCategories(parentId = null) {
    fetch(`../backend/categories.php?parent_id=${parentId || ''}`)
        .then(response => response.json())
        .then(data => renderModeratorCategories(data, parentId))
        .catch(error => console.error('Error fetching categories:', error));
}

// Render categories for moderators with delete button
function renderModeratorCategories(categories, parentId) {
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
        const categoryContainer = document.createElement('div');
        categoryContainer.className = 'category-container-item';

        const button = document.createElement('button');
        button.textContent = category.name;
        button.className = 'category-button';
        button.onclick = () => {
            categoryStack.push(parentId);
            currentParentCategory = category.category_id;
            fetchModeratorCategories(category.category_id);
        };

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-category-button';
        deleteButton.onclick = () => deleteCategory(category.category_id);

        categoryContainer.appendChild(button);
        categoryContainer.appendChild(deleteButton);
        categoriesList.appendChild(categoryContainer);
    });

    const addButton = document.createElement('button');
    addButton.textContent = 'Add new category here';
    addButton.className = 'add-category-button';
    addButton.onclick = showAddCategoryForm;
    categoriesList.appendChild(addButton);
}

// Go back to the previous category
function goBack() {
    const previousParentId = categoryStack.pop();
    currentParentCategory = previousParentId || null;
    fetchModeratorCategories(previousParentId);
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

// Add a new category
function addCategory() {
    const name = document.getElementById('new-category-name').value;
    const errorMessageElement = document.getElementById('error-message');
    const successMessageElement = document.getElementById('success-message');

    if (!name.trim()) {
        displayMessage(errorMessageElement, 'Category name is required.', "error");
        return;
    }

    fetch('../backend/manage_categories.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'add', parent_category: currentParentCategory, name }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayMessage(successMessageElement, data.message, "success");
                cancelAddCategory();
                fetchModeratorCategories(currentParentCategory);
            } else {
                displayMessage(errorMessageElement, data.message, "error");
            }
        })
        .catch(error => console.error('Error adding category:', error));
}

// Delete a category
function deleteCategory(categoryId) {
    const errorMessageElement = document.getElementById('error-message');
    const successMessageElement = document.getElementById('success-message');

    fetch('../backend/manage_categories.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'delete', category_id: categoryId }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                displayMessage(successMessageElement, data.message, "success");
                fetchModeratorCategories(currentParentCategory);
            } else {
                displayMessage(errorMessageElement, data.message, "error");
            }
        })
        .catch(error => console.error('Error deleting category:', error));
}

document.addEventListener('DOMContentLoaded', () => fetchModeratorCategories());
