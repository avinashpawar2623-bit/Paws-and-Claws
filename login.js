function validateForm() {
    // Get DOM elements
    const elements = {
        emailOrPhone: document.getElementById("emailorphone"),
        password: document.getElementById("password"),
        emailOrPhoneError: document.getElementById("emailOrPhoneError"),
        passwordError: document.getElementById("passwordError"),
        successMessage: document.getElementById("successMessage"),
        loginButton: document.querySelector('.login-button')
    };
    
    // Reset UI state
    resetFormState(elements);
    
    // Validate inputs
    const validation = {
        emailOrPhone: validateEmailOrPhone(elements.emailOrPhone.value.trim()),
        password: validatePassword(elements.password.value.trim())
    };
    
    // Display error messages if any
    if (!validation.emailOrPhone.isValid) {
        elements.emailOrPhoneError.innerText = validation.emailOrPhone.message;
    }
    
    if (!validation.password.isValid) {
        elements.passwordError.innerText = validation.password.message;
    }
    
    // Handle form submission
    const isFormValid = validation.emailOrPhone.isValid && validation.password.isValid;
    if (isFormValid) {
        handleSuccessfulLogin(elements);
    }
    
    return false; // Prevent form submission
}

// Helper functions
function resetFormState(elements) {
    elements.emailOrPhoneError.innerText = "";
    elements.passwordError.innerText = "";
    elements.successMessage.style.display = "none";
}

function validateEmailOrPhone(value) {
    if (!value) {
        return { isValid: false, message: "Please enter your email or phone number" };
    }
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const phoneRegex = /^\d{10}$/;
    
    if (!emailRegex.test(value) && !phoneRegex.test(value)) {
        return { isValid: false, message: "Please enter a valid email or 10-digit phone number" };
    }
    
    return { isValid: true };
}

function validatePassword(value) {
    if (!value) {
        return { isValid: false, message: "Please enter your password" };
    }
    
    if (value.length < 6) {
        return { isValid: false, message: "Password must be at least 6 characters long" };
    }
    
    return { isValid: true };
}

function handleSuccessfulLogin(elements) {
    // Display success message
    elements.successMessage.innerText = "Login successful! Redirecting...";
    elements.successMessage.style.display = "block";
    
    // Update button state
    if (elements.loginButton) {
        elements.loginButton.innerHTML = 'Logging in...';
        elements.loginButton.style.opacity = '0.8';
        elements.loginButton.disabled = true;
    }
    
    // Redirect after delay
    setTimeout(() => {
        if (elements.loginButton) {
            elements.loginButton.innerHTML = 'Login';
            elements.loginButton.style.opacity = '1';
            elements.loginButton.disabled = false;
        }
        
        // Redirect to home page
        window.location.href = 'home.html';
    }, 2000);
}