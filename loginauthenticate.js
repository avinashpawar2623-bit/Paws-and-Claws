// Enhanced Login Authentication Script

document.addEventListener("DOMContentLoaded", function() {
    const loginForm = document.getElementById("loginForm");
    
    // Function to validate the form
    function validateForm() {
        let isValid = true;
        const emailOrPhone = document.getElementById("emailorphone").value;
        const password = document.getElementById("password").value;
        
        // Reset error messages
        document.getElementById("emailOrPhoneError").textContent = "";
        document.getElementById("passwordError").textContent = "";
        
        // Validate email/phone
        if (!emailOrPhone) {
            document.getElementById("emailOrPhoneError").textContent = "Please enter your email or phone number";
            isValid = false;
        } else if (!isValidEmailOrPhone(emailOrPhone)) {
            document.getElementById("emailOrPhoneError").textContent = "Please enter a valid email or phone number";
            isValid = false;
        }
        
        // Validate password
        if (!password) {
            document.getElementById("passwordError").textContent = "Please enter your password";
            isValid = false;
        } else if (password.length < 8) {
            document.getElementById("passwordError").textContent = "Password must be at least 8 characters";
            isValid = false;
        }
        
        return isValid;
    }
    
    // Function to check if input is valid email or phone
    function isValidEmailOrPhone(input) {
        // Email regex pattern
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Phone number pattern (basic validation for numbers)
        const phonePattern = /^\d{10}$/;
        
        return emailPattern.test(input) || phonePattern.test(input);
    }
    
    // Function to show notifications instead of alerts
    function showNotification(message, isError = false) {
        // Look for notification element or create it if it doesn't exist
        let notification = document.getElementById("notification");
        
        if (!notification) {
            notification = document.createElement("div");
            notification.id = "notification";
            notification.style.position = "fixed";
            notification.style.top = "20px";
            notification.style.right = "20px";
            notification.style.padding = "15px 25px";
            notification.style.borderRadius = "5px";
            notification.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
            notification.style.zIndex = "1000";
            notification.style.transition = "all 0.3s ease";
            document.body.appendChild(notification);
        }
        
        // Set style based on notification type
        if (isError) {
            notification.style.backgroundColor = "#f8d7da";
            notification.style.color = "#721c24";
            notification.style.borderLeft = "4px solid #f5c6cb";
        } else {
            notification.style.backgroundColor = "#d4edda";
            notification.style.color = "#155724";
            notification.style.borderLeft = "4px solid #c3e6cb";
        }
        
        notification.textContent = message;
        notification.style.display = "block";
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = "0";
            setTimeout(() => {
                notification.style.display = "none";
                notification.style.opacity = "1";
            }, 300);
        }, 3000);
    }
    
    // Handle form submission
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        if (validateForm()) {
            const emailOrPhone = document.getElementById("emailorphone").value;
            const password = document.getElementById("password").value;
            
            // Check user credentials from localStorage
            const users = JSON.parse(localStorage.getItem("users")) || [];
            const user = users.find(user => 
                (user.email === emailOrPhone || user.phone === emailOrPhone) && 
                user.password === password
            );
            
            if (user) {
                // Store logged in user
                localStorage.setItem("currentUser", JSON.stringify(user));
                
                // Show success message with notification instead of success element
                showNotification(`Login successful! Welcome back, ${user.fullname}`, false);
                
                // Redirect to home.html
                setTimeout(() => {
                    window.location.href = "home.html";
                }, 1500);
            } else {
                // Show error for invalid credentials using notification
                showNotification("Invalid email/phone or password", true);
                document.getElementById("passwordError").textContent = "Invalid email/phone or password";
            }
        }
    });
});