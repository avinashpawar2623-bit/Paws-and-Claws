document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing navigation...");

    // Get all pages
    const pages = document.querySelectorAll('.page');

    console.log(`Found ${pages.length} pages`);

    // Hide all pages initially
    pages.forEach(page => {
        page.style.display = 'none';
    });

    // Show the All Accessories page by default
    const defaultPage = document.getElementById('all-accessories');
    if (defaultPage) {
        defaultPage.style.display = 'block';
        defaultPage.classList.add('active');
    } else if (pages.length > 0) {
        // Fallback to first page
        pages[0].style.display = 'block';
        pages[0].classList.add('active');
    }

    // Add event listeners to all category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    console.log(`Found ${categoryButtons.length} category buttons`);

    categoryButtons.forEach(button => {
        const category = button.getAttribute('data-category');

        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log(`Button clicked for category: ${category}`);

            if (category === 'all') {
                switchToPage('all-accessories');
            } else if (category === 'dog-accessories') {
                switchToPage('dog-accessories');
            } else if (category === 'cat-accessories') {
                switchToPage('cat-accessories');
            } else if (category === 'collars-leashes') {
                switchToPage('collars-leashes');
            } else {
                // For subcategories, filter the current page
                filterCurrentPage(category);
            }

            // Mark this button as active
            makeButtonActive(button);
        });
    });

    // Simple page switching function
    function switchToPage(pageId) {
        const allPages = document.querySelectorAll('.page');
        const targetPage = document.getElementById(pageId);

        if (!targetPage) {
            console.error(`Target page ${pageId} not found!`);
            return;
        }

        // Hide all pages first
        allPages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });

        // Show target page
        targetPage.style.display = 'block';
        targetPage.classList.add('active');
        console.log(`Switched to page: ${pageId}`);

        // Set active button state
        makeButtonActive(document.querySelector(`.category-btn[data-category="${getPageCategory(pageId)}"]`));
    }

    // Function to get the category of a page
    function getPageCategory(pageId) {
        switch (pageId) {
            case 'all-accessories':
                return 'all';
            case 'dog-accessories':
                return 'dog-accessories';
            case 'cat-accessories':
                return 'cat-accessories';
            case 'collars-leashes':
                return 'collars-leashes';
            default:
                return null;
        }
    }

    // Function to set active button state
    function makeButtonActive(activeButton) {
        const allButtons = document.querySelectorAll('.category-btn');

        // Remove active class from all buttons
        allButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Add active class to the clicked button
        activeButton.classList.add('active');
    }

    // Filter products on the current page
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
});
// Add this function to your existing JavaScript file (access.js)
function setupBackButton() {
    // Find all back buttons
    const backButtons = document.querySelectorAll('.back-btn');
    
    backButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Navigate to the All Accessories page
            showPage('all-accessories');
            
            // Optional: Scroll to the top of the page
            window.scrollTo(0, 0);
            
            console.log("Back button clicked - returning to All Accessories");
        });
    });
}

// Update your DOMContentLoaded event listener to include this function call
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded, initializing accessories navigation...");
    
    // Hide all pages initially except the default page
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show the All Accessories page by default
    const defaultPage = document.getElementById('all-accessories');
    if (defaultPage) {
        defaultPage.classList.add('active');
    } else if (pages.length > 0) {
        // Fallback to first page
        pages[0].classList.add('active');
    }
    
    const categoryButtons = document.querySelectorAll('.category-btn');
    console.log(`Found ${categoryButtons.length} category buttons`);
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Use the same text transformation as in showPage function
            const category = this.getAttribute('data-category') || 
                             this.textContent.trim().toLowerCase().replace(/\s+/g, '-');
            
            // Map categories to page IDs
            const categoryToPage = {
                'all': 'all-accessories',
                'dog-accessories': 'dog-accessories',
                'cat-accessories': 'cat-accessories',
                'collars-leashes': 'collars-leashes',
                'beds-furniture': 'beds-furniture',
                'toys': 'toys'
            };
            
            const pageId = categoryToPage[category];
            if (pageId) {
                showPage(pageId);
            } else {
                console.error('Unknown category:', category);
                
                // For subcategories, filter the current page
                filterCurrentPage(category);
            }
        });
    });
    
    // Setup back button functionality
    setupBackButton();
    
    // Filter products on the current page
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
});