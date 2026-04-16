
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing toys navigation...");
    
    const pages = document.querySelectorAll('.page');
    
    console.log(`Found ${pages.length} pages`);
    
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const defaultPage = document.getElementById('all-toys');
    if (defaultPage) {
        defaultPage.classList.add('active');
    } else if (pages.length > 0) {
        pages[0].classList.add('active');
    }
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    console.log(`Found ${categoryButtons.length} category buttons`);
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category') || 
                             this.textContent.trim().toLowerCase().replace(/\s+/g, '-');
            
            const categoryToPage = {
                'all': 'all-toys',
                'dog-toys': 'dog-toys',
                'cat-toys': 'cat-toys',
                'interactive-toys': 'interactive-toys'
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
    
    setupBackButton();
    
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
        case 'all-toys':
            return 'all';
        case 'dog-toys':
            return 'dog-toys';
        case 'cat-toys':
            return 'cat-toys';
        case 'interactive-toys':
            return 'interactive-toys';
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

function setupBackButton() {
    const backButtons = document.querySelectorAll('.back-btn');
    
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            showPage('all-toys');
            
            window.scrollTo(0, 0);
            
            console.log("Back button clicked - returning to All Toys");
        });
    });
}

function setupSearch() {
    const searchInputs = document.querySelectorAll('.search-input');
    
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
    
    const searchInput = activePage.querySelector('.search-input');
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
    
    button.classList.add('added-to-cart');
    setTimeout(() => {
        button.classList.remove('added-to-cart');
    }, 500);
    
    let cart = JSON.parse(localStorage.getItem('pawsAndClawsCart')) || [];
    
    cart.push({
        title: productTitle,
        price: productPrice,
        quantity: 1
    });
    
    localStorage.setItem('pawsAndClawsCart', JSON.stringify(cart));
    
    updateCartCount();
    
    showNotification(`${productTitle} added to cart!`);
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('pawsAndClawsCart')) || [];
    const cartCount = document.querySelector('.cart-count');
    
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

function setupWishlist() {
    const wishlistButtons = document.querySelectorAll('.btn-secondary');
    
    const wishlist = JSON.parse(localStorage.getItem('pawsAndClawsWishlist')) || [];
    
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
        wishlist.push(productTitle);
        button.classList.add('wishlisted');
        button.textContent = '♥';
        showNotification(`${productTitle} added to wishlist!`);
    } else {
        wishlist.splice(index, 1);
        button.classList.remove('wishlisted');
        button.textContent = '♡';
        showNotification(`${productTitle} removed from wishlist!`);
    }
    
    localStorage.setItem('pawsAndClawsWishlist', JSON.stringify(wishlist));
}

function showNotification(message) {
    let notificationContainer = document.querySelector('.notification-container');
    
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
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}s