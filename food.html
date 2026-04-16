document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing food navigation...");
    
    const pages = document.querySelectorAll('.page');
    
    console.log(`Found ${pages.length} pages`);
    
    // Initially hide all pages except the main one
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    // Show the default page (main page)
    const defaultPage = document.getElementById('main-page');
    if (defaultPage) {
        defaultPage.classList.add('active');
        defaultPage.style.display = 'block';
    } else if (pages.length > 0) {
        pages[0].classList.add('active');
        pages[0].style.display = 'block';
    }
    
    // Set up category button click handlers
    const categoryButtons = document.querySelectorAll('.category-btn');
    console.log(`Found ${categoryButtons.length} category buttons`);
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            const categoryToPage = {
                'all': 'main-page',
                'dog-food': 'dog-food-page',
                'cat-food': 'cat-food-page',
                'dry-food': 'dry-food-page',
                'wet-food': 'wet-food-page',
                'treats': 'treats-page'
            };
            
            const pageId = categoryToPage[category];
            if (pageId) {
                showPage(pageId);
            } else {
                console.error('Unknown category:', category);
                filterCurrentPage(category);
            }
            
            makeButtonActive(this);
        });
    });
    
    // Initialize cart and wishlist functionality
    setupCart();
    setupWishlist();
    setupSearch();
});

function showPage(pageId) {
    const allPages = document.querySelectorAll('.page');
    const targetPage = document.getElementById(pageId);
    
    if (!targetPage) {
        console.error(`Target page ${pageId} not found!`);
        return;
    }
    
    allPages.forEach(page => {
        page.style.display = 'none';
        page.classList.remove('active');
    });
    
    targetPage.style.display = 'block';
    targetPage.classList.add('active');
    console.log(`Switched to page: ${pageId}`);
    
    makeButtonActive(document.querySelector(`.category-btn[data-category="${getPageCategory(pageId)}"]`));
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function getPageCategory(pageId) {
    switch (pageId) {
        case 'main-page':
            return 'all';
        case 'dog-food-page':
            return 'dog-food';
        case 'cat-food-page':
            return 'cat-food';
        case 'dry-food-page':
            return 'dry-food';
        case 'wet-food-page':
            return 'wet-food';
        case 'treats-page':
            return 'treats';
        default:
            return null;
    }
}

function makeButtonActive(activeButton) {
    const allButtons = document.querySelectorAll('.category-btn');
    
    allButtons.forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (activeButton) {
        activeButton.classList.add('active');
    }
}

function filterCurrentPage(category) {
    const activePage = document.querySelector('.page.active');
    
    if (!activePage) return;
    
    const products = activePage.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const productCategory = product.getAttribute('data-category');
        
        if (category === 'all' || productCategory === category) {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
    
    console.log(`Filtered current page by: ${category}`);
}

function setupSearch() {
    const searchButtons = document.querySelectorAll('.search-bar button');
    const searchInputs = document.querySelectorAll('.search-bar input');
    
    // Set up event listeners for search buttons
    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            searchProducts();
        });
    });
    
    // Set up event listeners for Enter key in search inputs
    searchInputs.forEach(input => {
        if (input) {
            input.addEventListener('keyup', function(event) {
                if (event.key === 'Enter') {
                    searchProducts();
                }
            });
        }
    });
}

function searchProducts() {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    
    const searchInput = activePage.querySelector('.search-bar input');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    const products = activePage.querySelectorAll('.product-card');
    
    products.forEach(product => {
        const title = product.querySelector('.product-title').textContent.toLowerCase();
        const description = product.querySelector('.product-description').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm) || searchTerm === '') {
            product.style.display = 'block';
        } else {
            product.style.display = 'none';
        }
    });
    
    console.log(`Searched for: "${searchTerm}"`);
}

function setupCart() {
    updateCartCount();
}

function addToCart(button) {
    const productCard = button.closest('.product-card');
    const productTitle = productCard.querySelector('.product-title').textContent;
    const productPrice = productCard.querySelector('.product-price').textContent;
    
    // Visual feedback for adding to cart
    button.classList.add('added-to-cart');
    setTimeout(() => {
        button.classList.remove('added-to-cart');
    }, 500);
    
    // Get existing cart or create new one
    let cart = JSON.parse(localStorage.getItem('pawsAndClawsCart')) || [];
    
    // Check if product already exists in cart
    const existingProductIndex = cart.findIndex(item => item.title === productTitle);
    
    if (existingProductIndex !== -1) {
        // Increment quantity if product already in cart
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product to cart
        cart.push({
            title: productTitle,
            price: productPrice,
            quantity: 1
        });
    }
    
    localStorage.setItem('pawsAndClawsCart', JSON.stringify(cart));
    
    updateCartCount();
    
    showNotification(`${productTitle} added to cart!`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('pawsAndClawsCart')) || [];
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
        // Calculate total quantity of all items in cart
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
}

function setupWishlist() {
    const wishlistButtons = document.querySelectorAll('.btn-secondary');
    
    const wishlist = JSON.parse(localStorage.getItem('pawsAndClawsWishlist')) || [];
    
    // Update wishlist button states based on local storage
    wishlistButtons.forEach(button => {
        const productCard = button.closest('.product-card');
        const productTitle = productCard.querySelector('.product-title').textContent;
        
        if (wishlist.includes(productTitle)) {
            button.classList.add('wishlisted');
            button.textContent = '♥';
        }
    });
}

function toggleWishlist(button) {
    const productCard = button.closest('.product-card');
    const productTitle = productCard.querySelector('.product-title').textContent;
    
    let wishlist = JSON.parse(localStorage.getItem('pawsAndClawsWishlist')) || [];
    
    const index = wishlist.indexOf(productTitle);
    
    if (index === -1) {
        // Add to wishlist
        wishlist.push(productTitle);
        button.classList.add('wishlisted');
        button.textContent = '♥';
        showNotification(`${productTitle} added to wishlist!`);
    } else {
        // Remove from wishlist
        wishlist.splice(index, 1);
        button.classList.remove('wishlisted');
        button.textContent = '♡';
        showNotification(`${productTitle} removed from wishlist!`);
    }
    
    localStorage.setItem('pawsAndClawsWishlist', JSON.stringify(wishlist));
}

function showNotification(message) {
    let notificationContainer = document.querySelector('.notification-container');
    
    // Create notification container if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
        
        Object.assign(notificationContainer.style, {
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: '1000'
        });
    }
    
    // Create a new notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    Object.assign(notification.style, {
        backgroundColor: '#ff6b6b',
        color: 'white',
        padding: '12px 20px',
        borderRadius: '4px',
        marginTop: '10px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        opacity: '0',
        transform: 'translateY(20px)',
        transition: 'all 0.3s ease'
    });
    
    notificationContainer.appendChild(notification);
    
    // Animate the notification in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove the notification after a delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}