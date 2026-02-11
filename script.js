// ===== STORAGE CONFIGURATION =====
const STORAGE_KEY = 'fullstack_app_data';

// ===== GLOBAL STATE =====
let isLoggedIn = false;
let currentSection = 'home';
let previousSection = 'home';
let currentUser = null;
let requestItems = [];

// Database structure
let db = {
    accounts: [],
    employees: [],
    departments: [],
    requests: []
};

// ===== STORAGE FUNCTIONS =====
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function loadFromStorage() {
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
        try {
            db = JSON.parse(stored);
        } catch (e) {
            console.error('Error loading data:', e);
            seedDatabase();
        }
    } else {
        seedDatabase();
    }
}

function seedDatabase() {
    db = {
        accounts: [
            {
                id: 'acc_1',
                firstName: 'Admin',
                lastName: 'User',
                email: 'admin@example.com',
                password: 'admin123',
                role: 'Admin',
                verified: true
            }
        ],
        employees: [],
        departments: [
            { id: 'dept_1', name: 'Engineering', description: 'Software team' },
            { id: 'dept_2', name: 'HR', description: 'Human Resources' }
        ],
        requests: []
    };
    saveToStorage();
}

// ===== AUTHENTICATION FUNCTIONS =====
function checkAuthentication() {
    const authToken = localStorage.getItem('auth_token');
    
    if (authToken) {
        const user = db.accounts.find(acc => acc.email === authToken && acc.verified);
        if (user) {
            loginUser(user.email, user.password, true);
        }
    }
}

function registerUser(firstName, lastName, email, password) {
    // Check if email already exists
    const existingUser = db.accounts.find(acc => acc.email === email);
    
    if (existingUser) {
        showError('registerError', 'Email already registered!');
        return false;
    }
    
    // Create new account
    const newAccount = {
        id: 'acc_' + Date.now(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: password,
        role: 'User',
        verified: false
    };
    
    db.accounts.push(newAccount);
    saveToStorage();
    
    // Store email for verification
    localStorage.setItem('unverified_email', email);
    
    return true;
}

function verifyEmail() {
    const email = localStorage.getItem('unverified_email');
    
    if (email) {
        const account = db.accounts.find(acc => acc.email === email);
        
        if (account) {
            account.verified = true;
            saveToStorage();
            localStorage.removeItem('unverified_email');
            return true;
        }
    }
    
    return false;
}

function attemptLogin(email, password) {
    const account = db.accounts.find(acc => 
        acc.email === email && 
        acc.password === password && 
        acc.verified === true
    );
    
    if (account) {
        // Save auth token
        localStorage.setItem('auth_token', account.email);
        
        currentUser = account;
        isLoggedIn = true;
        
        // Update profile display
        document.getElementById('profileName').textContent = account.firstName + ' ' + account.lastName;
        document.getElementById('profileEmail').textContent = account.email;
        document.getElementById('profileRole').textContent = account.role;
        
        updateNavigation();
        showSection('profile');
        
        return true;
    }
    
    return false;
}

function loginUser(email, password, skipValidation = false) {
    if (skipValidation || attemptLogin(email, password)) {
        return true;
    }
    return false;
}

function logoutUser() {
    currentUser = null;
    isLoggedIn = false;
    localStorage.removeItem('auth_token');
    updateNavigation();
    showSection('home');
}

// ===== UI HELPER FUNCTIONS =====
function showError(elementId, message) {
    const errorDiv = document.getElementById(elementId);
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
}

function showSection(sectionName, skipHistory = false) {
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
        renderEmployeesTable();
    } else if (sectionName === 'departments') {
        document.getElementById('departmentsSection').style.display = 'block';
    } else if (sectionName === 'accounts') {
        document.getElementById('accountsSection').style.display = 'block';
        renderAccountsTable();
    } else if (sectionName === 'requests') {
        document.getElementById('requestsSection').style.display = 'block';
        renderRequestsTable();
    }
    
    currentSection = sectionName;
}

function goBack() {
    showSection(previousSection, true);
}

function updateNavigation() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    
    if (isLoggedIn) {
        authButtons.style.display = 'none';
        userMenu.style.display = 'block';
        
        if (currentUser) {
            document.getElementById('navUsername').textContent = currentUser.firstName;
        }
    } else {
        authButtons.style.display = 'block';
        userMenu.style.display = 'none';
    }
}

// ===== RENDER FUNCTIONS =====
function renderEmployeesTable() {
    const tableBody = document.getElementById('employeesTableBody');
    const noEmployeesMsg = document.getElementById('noEmployeesMsg');
    const employeesTable = document.getElementById('employeesTable');
    
    if (db.employees.length === 0) {
        noEmployeesMsg.style.display = 'block';
        employeesTable.style.display = 'none';
    } else {
        noEmployeesMsg.style.display = 'none';
        employeesTable.style.display = 'block';
        
        tableBody.innerHTML = '';
        
        db.employees.forEach((emp, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${emp.id}</td>
                <td>${emp.email}</td>
                <td>${emp.position || '-'}</td>
                <td>${emp.department || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary edit-emp-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-sm btn-danger delete-emp-btn" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        document.querySelectorAll('.edit-emp-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                editEmployee(index);
            });
        });
        
        document.querySelectorAll('.delete-emp-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                deleteEmployee(index);
            });
        });
    }
}

function renderAccountsTable() {
    const tableBody = document.getElementById('accountsTableBody');
    tableBody.innerHTML = '';
    
    db.accounts.forEach((acc, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${acc.firstName} ${acc.lastName}</td>
            <td>${acc.email}</td>
            <td>${acc.role}</td>
            <td><span class="badge bg-${acc.verified ? 'success' : 'warning'}">${acc.verified ? 'Yes' : 'No'}</span></td>
            <td>
                <button class="btn btn-sm btn-primary">Edit</button>
                <button class="btn btn-sm btn-danger">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function renderRequestItems() {
    const itemsList = document.getElementById('itemsList');
    itemsList.innerHTML = '';
    
    requestItems.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'input-group mb-2';
        itemDiv.innerHTML = `
            <input type="text" class="form-control" value="${item.name}" readonly>
            <input type="number" class="form-control" style="max-width: 80px;" value="${item.quantity}" readonly>
            <button class="btn btn-outline-danger" type="button" data-index="${index}">×</button>
        `;
        itemsList.appendChild(itemDiv);
        
        itemDiv.querySelector('button').addEventListener('click', function() {
            const idx = this.getAttribute('data-index');
            requestItems.splice(idx, 1);
            renderRequestItems();
        });
    });
}

function renderRequestsTable() {
    const tableBody = document.getElementById('requestsTableBody');
    const noRequestsMsg = document.getElementById('noRequestsMsg');
    const requestsTable = document.getElementById('requestsTable');
    const createFirstBtn = document.getElementById('createFirstRequestBtn');
    
    // Filter requests for current user
    const userRequests = db.requests.filter(req => req.employeeEmail === currentUser.email);
    
    if (userRequests.length === 0) {
        noRequestsMsg.style.display = 'block';
        createFirstBtn.style.display = 'inline-block';
        requestsTable.style.display = 'none';
    } else {
        noRequestsMsg.style.display = 'none';
        createFirstBtn.style.display = 'none';
        requestsTable.style.display = 'block';
        
        tableBody.innerHTML = '';
        
        userRequests.forEach((req, index) => {
            const itemsText = req.items.map(item => `${item.name} (${item.quantity})`).join(', ');
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${req.id}</td>
                <td>${req.type}</td>
                <td>${itemsText}</td>
                <td><span class="badge bg-warning">${req.status}</span></td>
                <td>${req.date}</td>
                <td>
                    <button class="btn btn-sm btn-info">View</button>
                    <button class="btn btn-sm btn-danger delete-req-btn" data-index="${index}">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
        
        document.querySelectorAll('.delete-req-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                if (confirm('Are you sure you want to delete this request?')) {
                    db.requests.splice(index, 1);
                    saveToStorage();
                    renderRequestsTable();
                }
            });
        });
    }
}

// ===== EMPLOYEE MANAGEMENT =====
function saveEmployee() {
    const id = document.getElementById('employeeId').value;
    const email = document.getElementById('employeeEmail').value;
    const position = document.getElementById('employeePosition').value;
    const department = document.getElementById('employeeDept').value;
    const hireDate = document.getElementById('employeeHireDate').value;
    
    const employee = {
        id: id,
        email: email,
        position: position,
        department: department,
        hireDate: hireDate
    };
    
    db.employees.push(employee);
    saveToStorage();
    
    document.getElementById('employeeForm').reset();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
    modal.hide();
    
    renderEmployeesTable();
}

function editEmployee(index) {
    const emp = db.employees[index];
    
    document.getElementById('employeeId').value = emp.id;
    document.getElementById('employeeEmail').value = emp.email;
    document.getElementById('employeePosition').value = emp.position || '';
    document.getElementById('employeeDept').value = emp.department || '';
    document.getElementById('employeeHireDate').value = emp.hireDate || '';
    
    const modal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));
    modal.show();
    
    db.employees.splice(index, 1);
    saveToStorage();
}

function deleteEmployee(index) {
    if (confirm('Are you sure you want to delete this employee?')) {
        db.employees.splice(index, 1);
        saveToStorage();
        renderEmployeesTable();
    }
}

// ===== REQUEST MANAGEMENT =====
function addRequestItem() {
    const itemName = prompt('Item name:');
    const itemQuantity = prompt('Quantity:', '1');
    
    if (itemName && itemQuantity) {
        requestItems.push({
            name: itemName,
            quantity: parseInt(itemQuantity)
        });
        renderRequestItems();
    }
}

function submitRequest() {
    const type = document.getElementById('requestType').value;
    
    if (!type) {
        alert('Please select a request type');
        return;
    }
    
    if (requestItems.length === 0) {
        alert('Please add at least one item');
        return;
    }
    
    const request = {
        id: 'REQ-' + (db.requests.length + 1).toString().padStart(3, '0'),
        type: type,
        items: [...requestItems],
        status: 'Pending',
        date: new Date().toLocaleDateString(),
        employeeEmail: currentUser.email
    };
    
    db.requests.push(request);
    saveToStorage();
    
    document.getElementById('requestForm').reset();
    requestItems = [];
    renderRequestItems();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('newRequestModal'));
    modal.hide();
    
    renderRequestsTable();
}

// ===== EVENT LISTENERS =====
document.addEventListener('DOMContentLoaded', function() {
    // Load data from storage
    loadFromStorage();
    
    // Check if user is already authenticated
    checkAuthentication();
    
    // Show home section by default
    showSection('home');
    updateNavigation();
    
    // Brand link
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
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const firstName = document.getElementById('regFirstName').value;
        const lastName = document.getElementById('regLastName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        
        if (registerUser(firstName, lastName, email, password)) {
            document.getElementById('verifyEmailDisplay').textContent = email;
            showSection('verify');
        }
    });
    
    // Verification
    document.getElementById('simulateVerifyBtn').addEventListener('click', function() {
        if (verifyEmail()) {
            showSection('verified');
        }
    });
    
    document.getElementById('goToLoginBtn').addEventListener('click', function() {
        showSection('login');
    });
    
    // Login forms
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!loginUser(email, password)) {
            showError('loginError', 'Invalid email, password, or account not verified');
        }
    });
    
    document.getElementById('verifiedLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('verifiedLoginEmail').value;
        const password = document.getElementById('verifiedLoginPassword').value;
        
        if (!loginUser(email, password)) {
            showError('verifiedLoginError', 'Invalid email or password');
        }
    });
    
    // Logout
    document.getElementById('dropdownLogoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        logoutUser();
    });
    
    // Dropdown navigation
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
    
    // Back buttons
    const backButtons = document.querySelectorAll('.backBtn');
    backButtons.forEach(function(btn) {
        btn.addEventListener('click', goBack);
    });
    
    // Employee management
    document.getElementById('saveEmployeeBtn').addEventListener('click', saveEmployee);
    
    // Request management
    document.getElementById('addItemBtn').addEventListener('click', addRequestItem);
    document.getElementById('submitRequestBtn').addEventListener('click', submitRequest);
    
    document.getElementById('newRequestModal').addEventListener('show.bs.modal', function() {
        requestItems = [];
        renderRequestItems();
    });
});