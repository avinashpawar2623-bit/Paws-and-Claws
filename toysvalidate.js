// toy.js - External JavaScript for the Paws and Claws pet toy website

// Global cart array to store added items
let cart = [];
let wishlist = [];
let currentPage = 'all-toys'; // Default page

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();
    
    // Add event listeners to category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            switchCategory(category);
        });
    });
    
    // Add event listeners to search buttons
    const searchButtons = document.querySelectorAll('.search-bar button');
    searchButtons.forEach(button => {
        button.addEventListener('click', searchProducts);
    });
    
    // Add event listeners for search input (pressing Enter)
    const searchInputs = document.querySelectorAll('.search-bar input');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    });
});

// Initialize the page
function initializePage() {
    // Show the default page and hide others
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    document.getElementById('all-toys').style.display = 'block';
    
    // Update cart count from localStorage if available
    if (localStorage.getItem('cart')) {
        try {
            cart = JSON.parse(localStorage.getItem('cart'));
            updateCartCount();
        } catch (e) {
            console.error('Error loading cart from localStorage:', e);
            localStorage.removeItem('cart');
        }
    }
    
    // Load wishlist from localStorage if available
    if (localStorage.getItem('wishlist')) {
        try {
            wishlist = JSON.parse(localStorage.getItem('wishlist'));
            updateWishlistIcons();
        } catch (e) {
            console.error('Error loading wishlist from localStorage:', e);
            localStorage.removeItem('wishlist');
        }
    }
}

// Switch between categories
function switchCategory(category) {
    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.style.display = 'none';
    });
    
    // Show selected page
    if (category === 'all') {
        document.getElementById('all-toys').style.display = 'block';
        currentPage = 'all-toys';
    } else if (category === 'dog-toys') {
        document.getElementById('dog-toys').style.display = 'block';
        currentPage = 'dog-toys';
    } else if (category === 'cat-toys') {
        document.getElementById('cat-toys').style.display = 'block';
        currentPage = 'cat-toys';
    } else if (category === 'interactive-toys') {
        document.getElementById('interactive-toys').style.display = 'block';
        currentPage = 'interactive-toys';
    }
}

// Search functionality
function searchProducts() {
    // Get the current visible page
    const currentPageElement = document.getElementById(currentPage);
    
    // Get search input based on current page
    let searchInput;
    if (currentPage === 'all-toys') {
        searchInput = document.getElementById('search-input-all');
    } else if (currentPage === 'dog-toys') {
        searchInput = document.getElementById('search-input-dog');
    } else if (currentPage === 'cat-toys') {
        searchInput = document.getElementById('search-input-cat');
    } else if (currentPage === 'interactive-toys') {
        searchInput = document.getElementById('search-input-interactive');
    }
    
    const searchValue = searchInput.value.toLowerCase().trim();
    
    // Get all product cards on the current page
    const productCards = currentPageElement.querySelectorAll('.product-card');
    
    // If search is empty, show all products
    if (searchValue === '') {
        productCards.forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    // Filter products based on search term
    productCards.forEach(card => {
        const title = card.querySelector('.product-title').textContent.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();
        
        if (title.includes(searchValue) || description.includes(searchValue)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Show no results message if all cards are hidden
    let allHidden = true;
    productCards.forEach(card => {
        if (card.style.display !== 'none') {
            allHidden = false;
        }
    });
    
    if (allHidden) {
        // Check if message already exists
        let noResultsMsg = currentPageElement.querySelector('.no-results-message');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('p');
            noResultsMsg.classList.add('no-results-message');
            noResultsMsg.textContent = 'No products match your search. Try a different term.';
            currentPageElement.querySelector('.product-grid').appendChild(noResultsMsg);
        }
    } else {
        // Remove any existing no results message
        const noResultsMsg = currentPageElement.querySelector('.no-results-message');
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

// Add item to cart
function addToCart(button) {
    const productCard = button.closest('.product-card');
    const productTitle = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-img').src;
    
    // Parse price (remove "Rs. " and convert to number)
    const price = parseFloat(productPrice.replace('Rs. ', ''));
    
    // Check if product is already in cart
    const existingItem = cart.find(item => item.title === productTitle);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            title: productTitle,
            price: price,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show confirmation message
    showToast(`${productTitle} added to cart!`);
}

// Toggle wishlist item
function toggleWishlist(button) {
    const productCard = button.closest('.product-card');
    const productTitle = productCard.querySelector('.product-title').textContent;
    
    // Check if product is already in wishlist
    const existingIndex = wishlist.findIndex(item => item.title === productTitle);
    
    if (existingIndex > -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        button.textContent = '♡';
        button.classList.remove('in-wishlist');
        showToast(`${productTitle} removed from wishlist`);
    } else {
        // Add to wishlist
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productImage = productCard.querySelector('.product-img').src;
        const price = parseFloat(productPrice.replace('Rs. ', ''));
        
        wishlist.push({
            title: productTitle,
            price: price,
            image: productImage
        });
        
        button.textContent = '♥';
        button.classList.add('in-wishlist');
        showToast(`${productTitle} added to wishlist!`);
    }
    
    // Save wishlist to localStorage
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Update cart count in the header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    
    if (cart.length === 0) {
        cartCount.textContent = '0';
    } else {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems.toString();
    }
}

// Update wishlist icons
function updateWishlistIcons() {
    const wishlistButtons = document.querySelectorAll('.btn-secondary');
    
    wishlistButtons.forEach(button => {
        const productCard = button.closest('.product-card');
        const productTitle = productCard.querySelector('.product-title').textContent;
        
        if (wishlist.some(item => item.title === productTitle)) {
            button.textContent = '♥';
            button.classList.add('in-wishlist');
        } else {
            button.textContent = '♡';
            button.classList.remove('in-wishlist');
        }
    });
}

// Show a toast message
function showToast(message) {
    // Check if a toast container already exists
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        // Create toast container
        toastContainer = document.createElement('div');
        toastContainer.classList.add('toast-container');
        document.body.appendChild(toastContainer);
        
        // Add styles to toast container
        toastContainer.style.position = 'fixed';
        toastContainer.style.bottom = '20px';
        toastContainer.style.right = '20px';
        toastContainer.style.zIndex = '1000';
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    
    // Add styles to toast
    toast.style.backgroundColor = '#333';
    toast.style.color = 'white';
    toast.style.padding = '10px 15px';
    toast.style.borderRadius = '4px';
    toast.style.marginTop = '10px';
    toast.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    
    // Add toast to container
    toastContainer.appendChild(toast);
    
    // Fade in
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// Form validation for checkout process (to be implemented)
function validateCheckoutForm() {
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const address = document.getElementById('address').value;
    
    // Simple validation
    if (!name || name.length < 2) {
        showToast('Please enter a valid name');
        return false;
    }
    
    if (!email || !isValidEmail(email)) {
        showToast('Please enter a valid email address');
        return false;
    }
    
    if (!phone || !isValidPhone(phone)) {
        showToast('Please enter a valid phone number');
        return false;
    }
    
    if (!address || address.length < 10) {
        showToast('Please enter a complete address');
        return false;
    }
    
    return true;
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Phone validation
function isValidPhone(phone) {
    // Allow formats like +91 1234567890, 1234567890, 123-456-7890
    const phoneRegex = /^(\+\d{1,3}\s?)?\d{10}$|^\d{3}[-\s]?\d{3}[-\s]?\d{4}$/;
    return phoneRegex.test(phone);
}

// Validate price range (for future filter implementation)
function validatePriceRange(min, max) {
    // Convert to numbers
    min = parseFloat(min);
    max = parseFloat(max);
    
    // Validate
    if (isNaN(min) || isNaN(max)) {
        showToast('Please enter valid price values');
        return false;
    }
    
    if (min < 0 || max < 0) {
        showToast('Price values cannot be negative');
        return false;
    }
    
    if (min > max) {
        showToast('Minimum price cannot be greater than maximum price');
        return false;
    }
    
    return true;
}

// Clear form fields
function clearForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.value = '';
        });
    }
}

// Handle checkout process
function processCheckout() {
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }
    
    if (validateCheckoutForm()) {
        // Simulate order processing
        showToast('Order placed successfully!');
        
        // Clear cart
        cart = [];
        localStorage.removeItem('cart');
        updateCartCount();
        
        // Redirect to confirmation page (to be implemented)
        // window.location.href = 'confirmation.html';
    }
}

// Fix for footer display
function adjustFooterPosition() {
    const footer = document.querySelector('footer');
    const body = document.body;
    const html = document.documentElement;
    
    const height = Math.max(
        body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight
    );
    
    if (height <= window.innerHeight) {
        footer.style.position = 'fixed';
        footer.style.bottom = '0';
        footer.style.width = '100%';
    } else {
        footer.style.position = 'relative';
    }
}

// Call footer adjustment on page load and resize
window.addEventListener('load', adjustFooterPosition);
window.addEventListener('resize', adjustFooterPosition);