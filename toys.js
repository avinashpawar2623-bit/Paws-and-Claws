// Main JavaScript file for toy.html

// Function to initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Show the "All Toys" section by default
    showSection('all-toys');
    
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
                showSection('all-toys');
            } else if (category === 'dog-toys') {
                showSection('dog-toys');
            } else if (category === 'cat-toys') {
                showSection('cat-toys');
            } else if (category === 'interactive-toys') {
                showSection('interactive-toys');
            }
        });
    });
    
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
    const activePageId = activePage.id;
    
    // Get the search input for the active page
    let searchInput;
    if (activePageId === 'all-toys') {
        searchInput = document.getElementById('search-input-all');
    } else if (activePageId === 'dog-toys') {
        searchInput = document.getElementById('search-input-dog');
    } else if (activePageId === 'cat-toys') {
        searchInput = document.getElementById('search-input-cat');
    } else if (activePageId === 'interactive-toys') {
        searchInput = document.getElementById('search-input-interactive');
    }
    
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
    // Toggle the heart icon filled/unfilled
    if (button.innerHTML === '♡') {
        button.innerHTML = '♥';
        button.classList.add('wishlisted');
    } else {
        button.innerHTML = '♡';
        button.classList.remove('wishlisted');
    }
}

// Function to add to cart
function addToCart(button) {
    // Get product details
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-img').src;
    
    // Get existing cart items or initialize empty array
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
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
    showAddedToCartMessage(productName);
}

// Function to update cart count in the header
function updateCartCount() {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartCount = document.querySelector('.cart-count');
    
    // Calculate total quantity
    let totalQuantity = 0;
    cartItems.forEach(item => {
        totalQuantity += item.quantity;
    });
    
    cartCount.textContent = totalQuantity;
}

// Function to show "Added to Cart" message
function showAddedToCartMessage(productName) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'cart-message';
    messageElement.textContent = `"${productName}" added to cart!`;
    
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