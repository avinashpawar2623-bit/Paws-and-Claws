// This code should be added to one of your existing .js files (accessoryvalid.js or acess.js)

// Get cart from localStorage or initialize it if it doesn't exist
function getCart() {
    const cart = localStorage.getItem('pawsAndClawsCart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('pawsAndClawsCart', JSON.stringify(cart));
    // Update the cart count display
    updateCartCount();
}

// Update the cart count display in the header
function updateCartCount() {
    const cart = getCart();
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cart.length;
    }
}

// Add a product to the cart
function addToCart(button) {
    // Get the product information from the product card
    const productCard = button.closest('.product-card');
    const productTitle = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImg = productCard.querySelector('.product-img').src;
    
    // Create a product object
    const product = {
        id: Date.now(), // Generate a unique ID based on timestamp
        title: productTitle,
        price: productPrice,
        image: productImg,
        quantity: 1
    };
    
    // Get the current cart
    const cart = getCart();
    
    // Check if the product is already in the cart
    const existingProductIndex = cart.findIndex(item => item.title === product.title);
    
    if (existingProductIndex !== -1) {
        // If the product is already in the cart, increase the quantity
        cart[existingProductIndex].quantity += 1;
        showNotification(`Increased quantity of ${productTitle}!`);
    } else {
        // Otherwise, add the new product to the cart
        cart.push(product);
        showNotification(`${productTitle} added to cart!`);
    }
    
    // Save the updated cart
    saveCart(cart);
}

// Display a notification when a product is added to cart
function showNotification(message) {
    // Check if a notification container already exists, create one if not
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        // Add some basic styling for the notification container
        notificationContainer.style.position = 'fixed';
        notificationContainer.style.bottom = '20px';
        notificationContainer.style.right = '20px';
        notificationContainer.style.zIndex = '1000';
    }
    
    // Create the notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.marginTop = '10px';
    notification.style.borderRadius = '5px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    
    // Add the notification to the container
    notificationContainer.appendChild(notification);
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

// Initialize the cart count when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.btn-primary');
    addToCartButtons.forEach(button => {
        button.onclick = function() {
            addToCart(this);
        };
    });
});

// Function to toggle wishlist (you can implement this later)
function toggleWishlist(button) {
    const productCard = button.closest('.product-card');
    const productTitle = productCard.querySelector('.product-title').textContent;
    
    // Toggle the button appearance
    if (button.textContent === '♡') {
        button.textContent = '♥';
        button.style.color = 'red';
        showNotification(`${productTitle} added to wishlist!`);
    } else {
        button.textContent = '♡';
        button.style.color = '';
        showNotification(`${productTitle} removed from wishlist!`);
    }
    
    // You can add localStorage functionality for wishlist similar to cart
}