// After Dark Systems Login Interface
const messageEl = document.getElementById('message');
const tokenDisplay = document.getElementById('tokenDisplay');
const tokenValue = document.getElementById('tokenValue');

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
}

function quickLogin(type) {
    console.log('Quick login clicked:', type);
    
    const credentials = {
        admin: {
            email: 'admin@afterdarksys.com',
            password: 'AdminPass123!',
            platform: 'aeims'
        },
        client: {
            email: 'client@testcompany.com',
            password: 'ClientPass123!',
            platform: 'aeims'
        }
    };
    
    const creds = credentials[type];
    if (!creds) {
        showMessage('Invalid account type', 'error');
        return;
    }
    
    document.getElementById('email').value = creds.email;
    document.getElementById('password').value = creds.password;
    document.getElementById('platform').value = creds.platform;
    
    login(creds);
}

async function login(credentials) {
    try {
        showMessage('Logging in...', 'success');
        console.log('Attempting login with:', credentials);
        
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });
        
        const data = await response.json();
        console.log('Login response:', data);
        
        if (response.ok) {
            showMessage(`Welcome ${data.user.username}! Login successful.`, 'success');
            tokenValue.textContent = data.token;
            tokenDisplay.style.display = 'block';
            
            // Store token for future use
            localStorage.setItem('afterdark_token', data.token);
            localStorage.setItem('afterdark_user', JSON.stringify(data.user));
            
            // Redirect based on user type
            if (data.user.username === 'administrator' || data.user.email.includes('admin')) {
                setTimeout(() => {
                    window.location.href = 'http://localhost:3003';
                }, 2000);
                showMessage(`Welcome ${data.user.username}! Redirecting to admin panel...`, 'success');
            } else {
                // Regular user - redirect to user dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
                showMessage(`Welcome ${data.user.username}! Redirecting to user dashboard...`, 'success');
            }
        } else {
            showMessage(data.error || 'Login failed', 'error');
            tokenDisplay.style.display = 'none';
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Connection error: ' + error.message, 'error');
        tokenDisplay.style.display = 'none';
    }
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Add form submit handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            const formData = new FormData(e.target);
            const credentials = {
                email: formData.get('email'),
                password: formData.get('password'),
                platform: formData.get('platform')
            };
            
            login(credentials);
        });
    }
    
    // Add quick login button handlers
    const adminBtn = document.getElementById('adminQuickLogin');
    const clientBtn = document.getElementById('clientQuickLogin');
    
    if (adminBtn) {
        adminBtn.addEventListener('click', function() { 
            console.log('Admin quick login clicked');
            quickLogin('admin'); 
        });
    }
    if (clientBtn) {
        clientBtn.addEventListener('click', function() { 
            console.log('Client quick login clicked');
            quickLogin('client'); 
        });
    }
    
    // Check if user is already logged in
    const savedToken = localStorage.getItem('afterdark_token');
    const savedUser = localStorage.getItem('afterdark_user');
    
    if (savedToken && savedUser) {
        try {
            const user = JSON.parse(savedUser);
            showMessage(`Welcome back ${user.username}!`, 'success');
            tokenValue.textContent = savedToken;
            tokenDisplay.style.display = 'block';
        } catch (e) {
            console.error('Error parsing saved user:', e);
        }
    }
});

// Make functions globally available
window.quickLogin = quickLogin;
window.login = login;