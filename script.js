// User state
let isLoggedIn = false;
let currentSection = 'home';
let previousSection = 'home'; // Track previous section for back button
let currentUser = null; // Store logged-in user info

// Function to show a specific section and hide others
function showSection(sectionName, skipHistory = false) {
    // Store previous section for back button (unless we're going back)
    if (!skipHistory && currentSection !== sectionName) {
        previousSection = currentSection;
    }
    
    // Hide all sections
    document.getElementById('homeSection').style.display = 'none';
    document.getElementById('registerSection').style.display = 'none';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('verifySection').style.display = 'none';
    document.getElementById('verifiedSection').style.display = 'none';
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('employeesSection').style.display = 'none';
    document.getElementById('departmentsSection').style.display = 'none';
    document.getElementById('accountsSection').style.display = 'none';
    document.getElementById('requestsSection').style.display = 'none';
    
    // Show the requested section
    if (sectionName === 'home') {
        document.getElementById('homeSection').style.display = 'block';
    } else if (sectionName === 'register') {
        document.getElementById('registerSection').style.display = 'block';
    } else if (sectionName === 'login') {
        document.getElementById('loginSection').style.display = 'block';
    } else if (sectionName === 'verify') {
        document.getElementById('verifySection').style.display = 'block';
    } else if (sectionName === 'verified') {
        document.getElementById('verifiedSection').style.display = 'block';
    } else if (sectionName === 'profile') {
        document.getElementById('profileSection').style.display = 'block';
    } else if (sectionName === 'employees') {
        document.getElementById('employeesSection').style.display = 'block';
    } else if (sectionName === 'departments') {
        document.getElementById('departmentsSection').style.display = 'block';
    } else if (sectionName === 'accounts') {
        document.getElementById('accountsSection').style.display = 'block';
    } else if (sectionName === 'requests') {
        document.getElementById('requestsSection').style.display = 'block';
    }
    
    currentSection = sectionName;
}

// Function to go back to previous section
function goBack() {
    showSection(previousSection, true);
}

// Function to update navigation based on login status
function updateNavigation() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (isLoggedIn) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';
        
        // Update username in nav
        if (currentUser) {
            document.getElementById('navUsername').textContent = currentUser.firstName;
        }
    } else {
        authButtons.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

// Function to handle login
function loginUser(email, password) {
    // For demo: accept any email/password
    // In real app, you'd verify credentials from localStorage
    
    currentUser = {
        firstName: 'Admin',
        lastName: 'User',
        email: email,
        role: 'Admin'
    };
    
    isLoggedIn = true;
    
    // Update profile display
    document.getElementById('profileName').textContent = currentUser.firstName + ' ' + currentUser.lastName;
    document.getElementById('profileEmail').textContent = currentUser.email;
    document.getElementById('profileRole').textContent = currentUser.role;
    
    // Update navigation and show profile
    updateNavigation();
    showSection('profile');
}

// Function to handle logout
function logoutUser() {
    currentUser = null;
    isLoggedIn = false;
    updateNavigation();
    showSection('home');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    showSection('home');
    updateNavigation();
    
    // Brand link -> go to home (or profile if logged in)
    document.getElementById('brandLink').addEventListener('click', function(e) {
        e.preventDefault();
        if (isLoggedIn) {
            showSection('profile');
        } else {
            showSection('home');
        }
    });
    
    // Navigation buttons
    document.getElementById('getStartedBtn').addEventListener('click', function() {
        showSection('register');
    });
    
    document.getElementById('registerBtn').addEventListener('click', function() {
        showSection('register');
    });
    
    document.getElementById('loginBtn').addEventListener('click', function() {
        showSection('login');
    });
    
    // Cancel buttons
    document.getElementById('cancelRegisterBtn').addEventListener('click', function() {
        showSection('home');
    });
    
    document.getElementById('cancelLoginBtn').addEventListener('click', function() {
        showSection('home');
    });
    
    document.getElementById('cancelVerifiedLoginBtn').addEventListener('click', function() {
        showSection('home');
    });
    
    // Register form submission
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('regEmail').value;
        
        // Display the email in verification section
        document.getElementById('verifyEmailDisplay').textContent = email;
        
        // Show verify section
        showSection('verify');
    });
    
    // Simulate email verification button
    document.getElementById('simulateVerifyBtn').addEventListener('click', function() {
        showSection('verified');
    });
    
    // Go to Login button (from verify page)
    document.getElementById('goToLoginBtn').addEventListener('click', function() {
        showSection('login');
    });
    
    // Login form submission (main login)
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        loginUser(email, password);
    });
    
    // Login form submission (after verification)
    document.getElementById('verifiedLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('verifiedLoginEmail').value;
        const password = document.getElementById('verifiedLoginPassword').value;
        
        loginUser(email, password);
    });
    
    // Logout buttons
    document.getElementById('dropdownLogoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });
    
    // Dropdown menu navigation
    document.getElementById('dropdownProfileBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('profile');
    });
    
    document.getElementById('dropdownEmployeesBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('employees');
    });
    
    document.getElementById('dropdownDepartmentsBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('departments');
    });
    
    document.getElementById('dropdownAccountsBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('accounts');
    });
    
    document.getElementById('dropdownRequestsBtn').addEventListener('click', function(e) {
        e.preventDefault();
        showSection('requests');
    });
    
    // Back buttons for admin sections
    const backButtons = document.querySelectorAll('.backBtn');
    backButtons.forEach(function(btn) {
        btn.addEventListener('click', goBack);
    });
});