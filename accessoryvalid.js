// Validation script for Paws and Claws Pet Accessories page

function validatePawsAndClawsPage() {
  console.log("Starting page validation...");
  const validationResults = {
    structureValidation: validatePageStructure(),
    navigationValidation: validateNavigation(),
    productCardsValidation: validateProductCards(),
    buttonsValidation: validateButtons(),
    searchValidation: validateSearch(),
    filterValidation: validateFilters(),
    inconsistenciesValidation: checkForInconsistencies()
  };
  
  console.log("Validation complete:", validationResults);
  return validationResults;
}

function validatePageStructure() {
  console.log("Validating page structure...");
  const issues = [];
  
  // Check for required sections
  if (!document.querySelector('header')) issues.push("Missing header section");
  if (!document.querySelector('main')) issues.push("Missing main content section");
  if (!document.querySelector('footer')) issues.push("Missing footer section");
  
  // Check for pages
  const requiredPages = [
    '#all-accessories', 
    '#dog-accessories', 
    '#cat-accessories', 
    '#collars-leashes'
  ];
  
  requiredPages.forEach(pageId => {
    if (!document.querySelector(pageId)) {
      issues.push(`Missing page section: ${pageId}`);
    }
  });
  
  // Check for logo
  if (!document.querySelector('.logo')) {
    issues.push("Missing site logo");
  }
  
  // Check for cart functionality
  if (!document.querySelector('.cart-icon')) {
    issues.push("Missing shopping cart icon");
  }
  
  return {
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues: issues
  };
}

function validateNavigation() {
  console.log("Validating navigation...");
  const issues = [];
  
  // Check navigation links
  const navLinks = document.querySelectorAll('.nav-links a');
  if (navLinks.length === 0) {
    issues.push("No navigation links found");
  }
  
  // Check if home link exists
  const homeLink = Array.from(navLinks).find(link => link.textContent.toLowerCase().includes('home'));
  if (!homeLink) {
    issues.push("Missing home navigation link");
  }
  
  // Check category buttons
  const categoryButtons = document.querySelectorAll('.category-btn');
  if (categoryButtons.length === 0) {
    issues.push("No category filter buttons found");
  } else {
    // Check for required category buttons
    const requiredCategories = ['all', 'dog-accessories', 'cat-accessories', 'collars-leashes'];
    const foundCategories = Array.from(categoryButtons).map(btn => btn.getAttribute('data-category'));
    
    requiredCategories.forEach(category => {
      if (!foundCategories.includes(category)) {
        issues.push(`Missing category button for: ${category}`);
      }
    });
  }
  
  return {
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues: issues
  };
}

function validateProductCards() {
  console.log("Validating product cards...");
  const issues = [];
  
  // Check if product cards exist
  const productCards = document.querySelectorAll('.product-card');
  if (productCards.length === 0) {
    issues.push("No product cards found");
    return {
      status: "FAIL",
      issues: issues
    };
  }
  
  // Sample validation on a few cards
  const samplesToCheck = Math.min(5, productCards.length);
  
  for (let i = 0; i < samplesToCheck; i++) {
    const card = productCards[i];
    const cardIndex = i + 1;
    
    // Check for required elements in each card
    if (!card.querySelector('.product-img')) {
      issues.push(`Product card #${cardIndex} missing product image`);
    }
    
    if (!card.querySelector('.product-title')) {
      issues.push(`Product card #${cardIndex} missing product title`);
    }
    
    if (!card.querySelector('.product-description')) {
      issues.push(`Product card #${cardIndex} missing product description`);
    }
    
    if (!card.querySelector('.product-price')) {
      issues.push(`Product card #${cardIndex} missing product price`);
    }
    
    if (!card.querySelector('.product-rating')) {
      issues.push(`Product card #${cardIndex} missing product rating`);
    }
    
    // Check for buttons
    if (!card.querySelector('.btn-primary')) {
      issues.push(`Product card #${cardIndex} missing 'Add to Cart' button`);
    }
    
    if (!card.querySelector('.btn-secondary')) {
      issues.push(`Product card #${cardIndex} missing wishlist button`);
    }
  }
  
  // Count total products per category
  const dogProducts = document.querySelectorAll('#dog-accessories .product-card').length;
  const catProducts = document.querySelectorAll('#cat-accessories .product-card').length;
  const collarsProducts = document.querySelectorAll('#collars-leashes .product-card').length;
  
  console.log(`Product count by category: Dog (${dogProducts}), Cat (${catProducts}), Collars/Leashes (${collarsProducts})`);
  
  return {
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues: issues,
    productCounts: {
      total: productCards.length,
      dogProducts,
      catProducts,
      collarsProducts
    }
  };
}

function validateButtons() {
  console.log("Validating buttons functionality...");
  const issues = [];
  
  // Check if Add to Cart buttons have onclick handler
  const addToCartButtons = document.querySelectorAll('.btn-primary');
  
  if (addToCartButtons.length === 0) {
    issues.push("No 'Add to Cart' buttons found");
  } else {
    const sampleButton = addToCartButtons[0];
    if (!sampleButton.getAttribute('onclick') || !sampleButton.getAttribute('onclick').includes('addToCart')) {
      issues.push("'Add to Cart' buttons missing proper onclick handler");
    }
  }
  
  // Check if Wishlist buttons have onclick handler
  const wishlistButtons = document.querySelectorAll('.btn-secondary');
  
  if (wishlistButtons.length === 0) {
    issues.push("No wishlist buttons found");
  } else {
    const sampleButton = wishlistButtons[0];
    if (!sampleButton.getAttribute('onclick') || !sampleButton.getAttribute('onclick').includes('toggleWishlist')) {
      issues.push("Wishlist buttons missing proper onclick handler");
    }
  }
  
  // Check search buttons
  const searchButtons = document.querySelectorAll('.search-bar button');
  
  if (searchButtons.length === 0) {
    issues.push("No search buttons found");
  } else {
    const sampleButton = searchButtons[0];
    if (!sampleButton.getAttribute('onclick') || !sampleButton.getAttribute('onclick').includes('searchProducts')) {
      issues.push("Search buttons missing proper onclick handler");
    }
  }
  
  return {
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues: issues
  };
}

function validateSearch() {
  console.log("Validating search functionality...");
  const issues = [];
  
  // Check if search inputs exist
  const searchInputs = [
    '#search-input-all',
    '#search-input-dog',
    '#search-input-cat',
    '#search-input-collars'
  ];
  
  searchInputs.forEach(inputId => {
    const input = document.querySelector(inputId);
    if (!input) {
      issues.push(`Missing search input: ${inputId}`);
    } else if (!input.getAttribute('placeholder') || !input.getAttribute('placeholder').includes('Search')) {
      issues.push(`Search input ${inputId} missing appropriate placeholder`);
    }
  });
  
  // Check if search function exists in JS (can't actually check this without loading the script)
  // This is just a placeholder to remind that it should be checked
  issues.push("Note: Cannot validate if searchProducts() function exists and works correctly");
  
  return {
    status: issues.length === 0 ? "PASS" : "WARN",
    issues: issues
  };
}

function validateFilters() {
  console.log("Validating filter functionality...");
  const issues = [];
  
  // Check if filter buttons exist and have data attributes
  const filterButtons = document.querySelectorAll('.category-btn');
  
  if (filterButtons.length === 0) {
    issues.push("No filter buttons found");
    return {
      status: "FAIL",
      issues: issues
    };
  }
  
  // Check if at least one button has 'active' class
  const activeButtons = document.querySelectorAll('.category-btn.active');
  if (activeButtons.length === 0) {
    issues.push("No filter button is marked as active");
  } else if (activeButtons.length > 4) {
    // We have 4 pages, so there should be at most 4 active buttons (one per page)
    issues.push(`Too many active filter buttons: ${activeButtons.length}`);
  }
  
  // Check for data-category attributes
  filterButtons.forEach((btn, index) => {
    if (!btn.getAttribute('data-category')) {
      issues.push(`Filter button #${index + 1} missing data-category attribute`);
    }
  });
  
  // Note that we can't verify filter functionality without JS execution
  issues.push("Note: Cannot validate if filter buttons work correctly without executing JS");
  
  return {
    status: issues.length === 0 ? "PASS" : "WARN",
    issues: issues
  };
}

function checkForInconsistencies() {
  console.log("Checking for inconsistencies...");
  const issues = [];
  
  // Check for consistent product information format
  const productPrices = document.querySelectorAll('.product-price');
  productPrices.forEach((price, index) => {
    if (!price.textContent.includes('Rs.')) {
      issues.push(`Product price #${index + 1} missing currency symbol (Rs.)`);
    }
  });
  
  // Check for consistent rating format
  const productRatings = document.querySelectorAll('.product-rating');
  productRatings.forEach((rating, index) => {
    if (!rating.textContent.includes('★') || !rating.textContent.includes('(')) {
      issues.push(`Product rating #${index + 1} has inconsistent format`);
    }
  });
  
  // Check for potential duplicated products (same title in same category)
  const pageIds = ['#all-accessories', '#dog-accessories', '#cat-accessories', '#collars-leashes'];
  
  pageIds.forEach(pageId => {
    const productTitles = Array.from(
      document.querySelectorAll(`${pageId} .product-title`)
    ).map(title => title.textContent.trim());
    
    const uniqueTitles = new Set(productTitles);
    
    if (uniqueTitles.size < productTitles.length) {
      issues.push(`Possible duplicate product titles found in ${pageId} section`);
    }
  });
  
  // Check for missing scripts
  if (!document.querySelector('script[src="acess.js"]')) {
    issues.push("Missing reference to acess.js script");
  }
  
  return {
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues: issues
  };
}

// Verify external script reference
function validateExternalScripts() {
  console.log("Validating external script references...");
  const issues = [];
  
  // Check for acess.js
  const scriptTags = document.querySelectorAll('script');
  let foundAccessJS = false;
  
  scriptTags.forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.includes('acess.js')) {
      foundAccessJS = true;
    }
  });
  
  if (!foundAccessJS) {
    issues.push("Missing reference to acess.js script file");
  }
  
  // Check for CSS
  const linkTags = document.querySelectorAll('link[rel="stylesheet"]');
  let foundAccessCSS = false;
  
  linkTags.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes('acces.css')) {
      foundAccessCSS = true;
    }
  });
  
  if (!foundAccessCSS) {
    issues.push("Missing reference to acces.css stylesheet");
  }
  
  return {
    status: issues.length === 0 ? "PASS" : "FAIL",
    issues: issues
  };
}

// Run all validations and report
function runFullValidation() {
  const validationSummary = {
    pageStructure: validatePageStructure(),
    navigation: validateNavigation(),
    productCards: validateProductCards(),
    buttons: validateButtons(),
    search: validateSearch(),
    filters: validateFilters(),
    inconsistencies: checkForInconsistencies(),
    externalScripts: validateExternalScripts(),
  };
  
  // Count total issues
  const totalIssues = Object.values(validationSummary)
    .reduce((total, result) => total + result.issues.length, 0);
  
  const overallStatus = totalIssues === 0 ? "PASS" : "FAIL";
  
  // Final report
  return {
    overallStatus,
    totalIssues,
    detailed: validationSummary
  };
}

// Execute the validation
runFullValidation();