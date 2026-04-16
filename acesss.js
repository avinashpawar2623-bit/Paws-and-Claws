// Main JavaScript file for accessories.html

// Global variables
let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

// Function to initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Show the "All Accessories" section by default
    showSection('all-accessories');
    
    // Set up category button click handlers
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.category-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to the clicked button
            this.classList.add('active');
            
            // Get the category from the button's data attribute
            const category = this.getAttribute('data-category');
            
            // Show the corresponding section
            if (category === 'all') {
                showSection('all-accessories');
            } else if (category === 'dog-accessories') {
                showSection('dog-accessories');
            } else if (category === 'cat-accessories') {
                showSection('cat-accessories');
            } else if (category === 'collars-leashes') {
                showSection('collars-leashes');
            }
        });
    });
    
    // Set up search button click handlers
    document.querySelectorAll('.search-bar button').forEach(button => {
        button.addEventListener('click', searchProducts);
    });
    
    // Set up search input enter key handlers
    document.querySelectorAll('.search-bar input').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    });
    
    // Initialize wishlist buttons state
    initializeWishlistButtons();
    
    // Update cart count from localStorage
    updateCartCount();
});

// Function to show a section and hide others
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.page').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
}

// Function to search products
function searchProducts() {
    // Get the active page (the one that's currently displayed)
    const activePage = document.querySelector('.page[style*="display: block"]');
    
    // Get the search input for the active page
    const searchInput = activePage.querySelector('.search-bar input');
    const searchTerm = searchInput.value.toLowerCase();
    
    // Get all product cards in the active page
    const products = activePage.querySelectorAll('.product-card');
    
    // Loop through products and show/hide based on search term
    products.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        const description = product.querySelector('.product-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
}

// Function to toggle wishlist
function toggleWishlist(button) {
    // Get product info
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('.product-title').textContent;
    
    // Get existing wishlist items or initialize empty array
    let wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    
    // Check if this product is already in the wishlist
    const existingProductIndex = wishlistItems.findIndex(item => item.name === productName);
    
    if (existingProductIndex !== -1) {
        // If product exists, remove it
        wishlistItems.splice(existingProductIndex, 1);
        button.innerHTML = '♡';
        button.classList.remove('wishlisted');
        showMessage(`"${productName}" removed from wishlist!`);
    } else {
        // If product doesn't exist, add it
        const productPrice = productCard.querySelector('.product-price').textContent;
        const productImage = productCard.querySelector('.product-img').src;
        
        wishlistItems.push({
            name: productName,
            price: productPrice,
            image: productImage
        });
        
        button.innerHTML = '♥';
        button.classList.add('wishlisted');
        showMessage(`"${productName}" added to wishlist!`);
    }
    
    // Save to localStorage
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
}

// Function to add to cart
function addToCart(button) {
    // Get product details
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-img').src;
    
    // Check if this product is already in the cart
    const existingProductIndex = cartItems.findIndex(item => item.name === productName);
    
    if (existingProductIndex !== -1) {
        // If product already exists, increase quantity
        cartItems[existingProductIndex].quantity += 1;
    } else {
        // If product doesn't exist, add it
        cartItems.push({
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    
    // Update cart count
    updateCartCount();
    
    // Show feedback to user
    showMessage(`"${productName}" added to cart!`);
}

// Function to update cart count in the header
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    
    // Calculate total quantity
    let totalQuantity = 0;
    cartItems.forEach(item => {
        totalQuantity += item.quantity;
    });
    
    cartCount.textContent = totalQuantity;
}

// Function to initialize wishlist buttons state
function initializeWishlistButtons() {
    // Get existing wishlist items
    const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    
    // Get all wishlist buttons
    const wishlistButtons = document.querySelectorAll('.btn-secondary');
    
    // Update button state based on wishlist
    wishlistButtons.forEach(button => {
        const productCard = button.closest('.product-card');
        const productName = productCard.querySelector('.product-title').textContent;
        
        // Check if product is in wishlist
        const inWishlist = wishlistItems.some(item => item.name === productName);
        
        // Update button text and class
        if (inWishlist) {
            button.innerHTML = '♥';
            button.classList.add('wishlisted');
        } else {
            button.innerHTML = '♡';
            button.classList.remove('wishlisted');
        }
    });
}

// Function to show message (for cart additions or wishlist updates)
function showMessage(message) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'notification';
    messageElement.textContent = message;
    
    // Style the message
    messageElement.style.position = 'fixed';
    messageElement.style.bottom = '20px';
    messageElement.style.right = '20px';
    messageElement.style.backgroundColor = '#4CAF50';
    messageElement.style.color = 'white';
    messageElement.style.padding = '10px 20px';
    messageElement.style.borderRadius = '4px';
    messageElement.style.zIndex = '1000';
    messageElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // Add message to the document
    document.body.appendChild(messageElement);
    
    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        messageElement.style.transition = 'opacity 0.5s';
        
        // Remove element after fade out
        setTimeout(() => {
            document.body.removeChild(messageElement);
        }, 500);
    }, 3000);
}