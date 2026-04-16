// Signup Validation Script

document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.querySelector("form");
    
    // Function to validate the signup form
    function validateSignupForm() {
        let isValid = true;
        
        // Get form fields
        const fullname = document.getElementById("fullname").value;
        const phone = document.getElementById("phone").value;
        const email = document.getElementById("email").value;
        const address = document.getElementById("address").value;
        const street = document.querySelector('input[name="street"]').value;
        const pincode = document.getElementById("pincode").value;
        const town = document.getElementById("town").value;
        const state = document.getElementById("state").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;
        const terms = document.getElementById("terms").checked;
        
        // Clear previous error messages
        const errorElements = document.querySelectorAll(".error");
        errorElements.forEach(element => element.remove());
        
        // Validate fullname
        if (!fullname) {
            displayError("fullname", "Full name is required");
            isValid = false;
        } else if (fullname.length < 3) {
            displayError("fullname", "Full name must be at least 3 characters");
            isValid = false;
        }
        
        // Validate phone
        if (!phone) {
            displayError("phone", "Phone number is required");
            isValid = false;
        } else if (!/^\d{10}$/.test(phone)) {
            displayError("phone", "Please enter a valid 10-digit phone number");
            isValid = false;
        }
        
        // Validate email
        if (!email) {
            displayError("email", "Email is required");
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            displayError("email", "Please enter a valid email address");
            isValid = false;
        }
        
        // Validate address
        if (!address) {
            displayError("address", "Address is required");
            isValid = false;
        }
        
        if (!street) {
            displayError("street", "Street/Area is required");
            isValid = false;
        }
        
        // Validate pincode
        if (!pincode) {
            displayError("pincode", "Pin code is required");
            isValid = false;
        } else if (!/^\d{6}$/.test(pincode)) {
            displayError("pincode", "Please enter a valid 6-digit pin code");
            isValid = false;
        }
        
        // Validate town/city
        if (!town) {
            displayError("town", "Town/City is required");
            isValid = false;
        }
        
        // Validate state
        if (!state) {
            displayError("state", "Please select a state");
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            displayError("password", "Password is required");
            isValid = false;
        } else if (password.length < 8) {
            displayError("password", "Password must be at least 8 characters");
            isValid = false;
        } else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(password)) {
            displayError("password", "Password must contain at least one letter and one number");
            isValid = false;
        }
        
        // Validate confirm password
        if (!confirmPassword) {
            displayError("confirm-password", "Please confirm your password");
            isValid = false;
        } else if (password !== confirmPassword) {
            displayError("confirm-password", "Passwords do not match");
            isValid = false;
        }
        
        // Validate terms checkbox
        if (!terms) {
            displayError("terms", "You must agree to the terms and conditions");
            isValid = false;
        }
        
        return isValid;
    }
    
    // Function to display error message
    function displayError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorSpan = document.createElement("span");
        errorSpan.className = "error";
        errorSpan.style.color = "#ef4444";
        errorSpan.style.fontSize = "13px";
        errorSpan.style.marginTop = "5px";
        errorSpan.style.display = "block";
        errorSpan.textContent = message;
        field.parentNode.appendChild(errorSpan);
    }
    
    // Handle form submission
    signupForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        if (validateSignupForm()) {
            // Form is valid, proceed with submission
            const formData = {
                fullname: document.getElementById("fullname").value,
                phone: document.getElementById("phone").value,
                email: document.getElementById("email").value,
                address: document.getElementById("address").value,
                street: document.querySelector('input[name="street"]').value,
                pincode: document.getElementById("pincode").value,
                town: document.getElementById("town").value,
                state: document.getElementById("state").value,
                password: document.getElementById("password").value,
            };
            
            // Store in localStorage
            saveUserData(formData);
            
            // Show success and redirect
            alert("Account created successfully! Redirecting to login page...");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 1000);
        }
    });
});