// Get cart from localStorage or initialize it if it doesn't exist
function getCart() {
    const cart = localStorage.getItem('cartItems');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cartItems', JSON.stringify(cart));
    // Update the cart count display
    updateCartCount();
}

// Function to display cart items
function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart');
    const cartItems = getCart();

    // Update cart count
    updateCartCount();

    if (cartItems.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsContainer.innerHTML = '';
        return;
    }

    emptyCartMessage.style.display = 'none';
    cartItemsContainer.innerHTML = '';

    cartItems.forEach(item => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="product-img">
            <div class="product-info">
                <h3 class="product-title">${item.name}</h3>
                <p class="product-price">${item.price}</p>
                <p class="product-quantity">Quantity: ${item.quantity}</p>
                <div class="cart-item-actions">
                    <button class="btn-remove" onclick="removeFromCart(${item.id})">Remove</button>
                    <div class="quantity-controls">
                        <button class="btn-decrease" onclick="decreaseQuantity(${item.id})">-</button>
                        <button class="btn-increase" onclick="increaseQuantity(${item.id})">+</button>
                    </div>
                </div>
            </div>
        `;
        cartItemsContainer.appendChild(productCard);
    });
}

// Function to update cart count in the navbar
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = getCart();
    
    // Calculate total quantity (similar to toys.js)
    let totalQuantity = 0;
    cartItems.forEach(item => {
        totalQuantity += item.quantity;
    });
    
    if (cartCount) {
        cartCount.textContent = totalQuantity;
    }
}

// Add a product to the cart
function addToCart(button) {
    // Get the product information from the product card
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    const productImage = productCard.querySelector('.product-img').src;
    
    // Get the current cart
    const cart = getCart();
    
    // Check if the product is already in the cart
    const existingProductIndex = cart.findIndex(item => item.name === productName);
    
    if (existingProductIndex !== -1) {
        // If the product is already in the cart, increase the quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // Otherwise, add the new product to the cart
        cart.push({
            id: Date.now(), // Generate a unique ID based on timestamp
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    // Save the updated cart
    saveCart(cart);
    
    // Show feedback to user (similar to toys.js)
    showAddedToCartMessage(productName);
}

// Remove a product from the cart
function removeFromCart(productId) {
    let cart = getCart();
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        const productName = cart[productIndex].name;
        cart.splice(productIndex, 1);
        saveCart(cart);
        showAddedToCartMessage(`${productName} removed from cart!`);
        displayCartItems(); // Refresh the cart display
    }
}

// Increase product quantity in cart
function increaseQuantity(productId) {
    let cart = getCart();
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        cart[productIndex].quantity += 1;
        saveCart(cart);
        displayCartItems(); // Refresh the cart display
    }
}

// Decrease product quantity in cart
function decreaseQuantity(productId) {
    let cart = getCart();
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex !== -1) {
        if (cart[productIndex].quantity > 1) {
            cart[productIndex].quantity -= 1;
            saveCart(cart);
        } else {
            // If quantity would go below 1, remove the item
            removeFromCart(productId);
            return;
        }
        displayCartItems(); // Refresh the cart display
    }
}

// Show message when a product is added to or removed from cart
function showAddedToCartMessage(productName) {
    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = 'cart-message';
    messageElement.textContent = productName;
    
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

// Function to toggle wishlist
function toggleWishlist(button) {
    const productCard = button.closest('.product-card');
    const productName = productCard.querySelector('.product-title').textContent;
    
    // Toggle the button appearance (like in toys.js)
    if (button.innerHTML === '♡') {
        button.innerHTML = '♥';
        button.classList.add('wishlisted');
        showAddedToCartMessage(`${productName} added to wishlist!`);
    } else {
        button.innerHTML = '♡';
        button.classList.remove('wishlisted');
        showAddedToCartMessage(`${productName} removed from wishlist!`);
    }
    
    // Get wishlist from localStorage or initialize if it doesn't exist
    const wishlist = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    const productInfo = {
        name: productName,
        image: productCard.querySelector('.product-img').src,
        price: productCard.querySelector('.product-price').textContent
    };
    
    // Check if product is already in wishlist
    const existingIndex = wishlist.findIndex(item => item.name === productName);
    
    if (existingIndex === -1) {
        // Add to wishlist
        wishlist.push(productInfo);
    } else {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
    }
    
    // Save updated wishlist to localStorage
    localStorage.setItem('wishlistItems', JSON.stringify(wishlist));
}

// Load cart items when the page loads
document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
    
    // Add event listeners to all "Add to Cart" buttons
    const addToCartButtons = document.querySelectorAll('.btn-primary');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            addToCart(this);
        });
    });
    
    // Add event listeners to all wishlist buttons
    const wishlistButtons = document.querySelectorAll('.btn-wishlist');
    wishlistButtons.forEach(button => {
        button.addEventListener('click', function() {
            toggleWishlist(this);
        });
    });
    
    // Update cart count from localStorage
    updateCartCount();
});