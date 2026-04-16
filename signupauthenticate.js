// Signup Authentication Script

document.addEventListener("DOMContentLoaded", function() {
    // Initialize file upload preview
    const fileUpload = document.getElementById("file-upload");
    const uploadLabel = document.querySelector(".upload");
    const signupForm = document.querySelector("form");
    
    if (fileUpload) {
        fileUpload.addEventListener("change", function() {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    // Remove existing image
                    const existingImg = uploadLabel.querySelector("img");
                    if (existingImg) {
                        existingImg.remove();
                    }
                    
                    // Create new image with uploaded file
                    const img = document.createElement("img");
                    img.src = e.target.result;
                    img.style.width = "100%";
                    img.style.height = "100%";
                    img.style.objectFit = "cover";
                    img.style.borderRadius = "50%";
                    
                    uploadLabel.appendChild(img);
                };
                
                reader.readAsDataURL(this.files[0]);
            }
        });
    }
    
    // Handle form submission and save data
    if (signupForm) {
        signupForm.addEventListener("submit", function(event) {
            event.preventDefault();
            
            // Get all form data
            const userData = {
                fullname: document.getElementById("fullname").value,
                phone: document.getElementById("phone").value,
                email: document.getElementById("email").value,
                address: document.getElementById("address").value,
                street: document.querySelector('input[name="street"]').value,
                pincode: document.getElementById("pincode").value,
                town: document.getElementById("town").value,
                state: document.getElementById("state").value,
                password: document.getElementById("password").value
            };
            
            // Save the data
            if (saveUserData(userData)) {
                // Create notification popup
                showNotification("Account created successfully!", "Your account has been created and your data has been saved. You will be redirected to the login page shortly.");
                
                // Redirect to login page after a delay
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 3000);
            }
        });
    }
    
    // Check if user is already logged in
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        // User is already logged in
        console.log("User already logged in:", JSON.parse(currentUser));
    }
});

// Function to save user data
function saveUserData(userData) {
    // Get existing users from localStorage or initialize empty array
    const users = JSON.parse(localStorage.getItem("users")) || [];
    
    // Check if email or phone is already registered
    const emailExists = users.some(user => user.email === userData.email);
    const phoneExists = users.some(user => user.phone === userData.phone);
    
    if (emailExists) {
        showNotification("Registration Error", "This email is already registered. Please use a different email or try logging in.", "error");
        return false;
    }
    
    if (phoneExists) {
        showNotification("Registration Error", "This phone number is already registered. Please use a different number or try logging in.", "error");
        return false;
    }
    
    // Add new user to array
    users.push(userData);
    
    // Save updated users array back to localStorage
    localStorage.setItem("users", JSON.stringify(users));
    
    console.log("User data saved:", userData);
    return true;
}

// Function to create and show notification popup
function showNotification(title, message, type = "success") {
    // Create notification container
    const notification = document.createElement("div");
    notification.style.position = "fixed";
    notification.style.top = "20px";
    notification.style.right = "20px";
    notification.style.maxWidth = "350px";
    notification.style.padding = "20px";
    notification.style.borderRadius = "10px";
    notification.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
    notification.style.zIndex = "9999";
    notification.style.animation = "fadeInRight 0.5s forwards";
    
    // Set background color based on type
    if (type === "success") {
        notification.style.backgroundColor = "#e6f7ef";
        notification.style.borderLeft = "5px solid #34d399";
    } else if (type === "error") {
        notification.style.backgroundColor = "#fee2e2";
        notification.style.borderLeft = "5px solid #ef4444";
    }
    
    // Create title element
    const titleElement = document.createElement("h3");
    titleElement.textContent = title;
    titleElement.style.margin = "0 0 10px 0";
    titleElement.style.fontSize = "18px";
    titleElement.style.fontWeight = "600";
    titleElement.style.color = type === "success" ? "#10b981" : "#ef4444";
    
    // Create message element
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.style.margin = "0";
    messageElement.style.fontSize = "14px";
    messageElement.style.color = "#4b5563";
    
    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "×";
    closeButton.style.position = "absolute";
    closeButton.style.top = "10px";
    closeButton.style.right = "10px";
    closeButton.style.background = "none";
    closeButton.style.border = "none";
    closeButton.style.fontSize = "20px";
    closeButton.style.cursor = "pointer";
    closeButton.style.color = "#9ca3af";
    
    // Add event listener to close button
    closeButton.addEventListener("click", function() {
        document.body.removeChild(notification);
    });
    
    // Add elements to notification
    notification.appendChild(titleElement);
    notification.appendChild(messageElement);
    notification.appendChild(closeButton);
    
    // Add notification to body
    document.body.appendChild(notification);
    
    // Add keyframe animation for fadeIn
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
        @keyframes fadeInRight {
            from {
                opacity: 0;
                transform: translateX(30px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(styleSheet);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = "fadeOut 0.5s forwards";
        setTimeout(() => {
            if (notification.parentNode === document.body) {
                document.body.removeChild(notification);
            }
        }, 500);
    }, 5000);
}