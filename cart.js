// Handle cart functionality
document.addEventListener('DOMContentLoaded', function() {
    // Display cart items when the page loads
    displayCartItems();
    
    // Add event listener for checkout button
    document.getElementById('checkout-btn').addEventListener('click', function() {
        alert('Thank you for your order! This would proceed to checkout in a complete implementation.');
    });
});

// Function to display cart items
function displayCartItems() {
    // Get cart items from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Update cart count in navigation
    document.getElementById('nav-cart-count').textContent = cartItems.length;
    
    // Get DOM elements
    const cartItemsTable = document.getElementById('cart-items-table');
    const cartItemsBody = document.getElementById('cart-items-body');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummary = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    // Clear previous content
    cartItemsBody.innerHTML = '';
    
    // If cart is empty, show message and hide other elements
    if (cartItems.length === 0) {
        emptyCartMessage.style.display = 'block';
        cartItemsTable.style.display = 'none';
        cartSummary.style.display = 'none';
        checkoutBtn.style.display = 'none';
        return;
    }
    
    // If cart has items, hide empty message and show other elements
    emptyCartMessage.style.display = 'none';
    cartItemsTable.style.display = 'table';
    cartSummary.style.display = 'block';
    checkoutBtn.style.display = 'block';
    
    // Calculate totals
    let subtotal = 0;
    
    // Add each item to the cart table
    cartItems.forEach((item, index) => {
        // Create new row
        const row = document.createElement('tr');
        
        // Calculate item total
        const itemPrice = parseFloat(item.price.replace('Rs. ', ''));
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;
        
        // Set row HTML
        row.innerHTML = `
            <td>
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            </td>
            <td>${item.name}</td>
            <td>${item.price}</td>
            <td>
                <div class="quantity-control">
                    <button class="quantity-btn decrease-btn" data-index="${index}">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-index="${index}">
                    <button class="quantity-btn increase-btn" data-index="${index}">+</button>
                </div>
            </td>
            <td>Rs. ${itemTotal.toFixed(2)}</td>
            <td>
                <button class="remove-btn" data-index="${index}">Remove</button>
            </td>
        `;
        
        // Add row to table
        cartItemsBody.appendChild(row);
    });
    
    // Add event listeners for quantity controls and remove buttons
    addCartEventListeners();
    
    // Calculate shipping (free over Rs. 2000, otherwise Rs. 150)
    const shipping = subtotal > 2000 ? 0 : 150;
    const total = subtotal + shipping;
    
    // Update summary values
    document.getElementById('cart-subtotal').textContent = `Rs. ${subtotal.toFixed(2)}`;
    document.getElementById('cart-shipping').textContent = shipping === 0 ? 'Free' : `Rs. ${shipping.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `Rs. ${total.toFixed(2)}`;
}

// Function to add event listeners for cart interactions
function addCartEventListeners() {
    // Get cart items from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Add event listeners for quantity decrease buttons
    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            if (cartItems[index].quantity > 1) {
                cartItems[index].quantity--;
                updateCart(cartItems);
            }
        });
    });
    
    // Add event listeners for quantity increase buttons
    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            cartItems[index].quantity++;
            updateCart(cartItems);
        });
    });
    
    // Add event listeners for quantity input changes
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const index = this.getAttribute('data-index');
            const value = parseInt(this.value);
            if (value >= 1) {
                cartItems[index].quantity = value;
                updateCart(cartItems);
            } else {
                this.value = 1;
                cartItems[index].quantity = 1;
                updateCart(cartItems);
            }
        });
    });
    
    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.getAttribute('data-index');
            cartItems.splice(index, 1);
            updateCart(cartItems);
        });
    });
}

// Function to update cart in localStorage and refresh display
function updateCart(cartItems) {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    displayCartItems();
}