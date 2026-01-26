// Client-side Authentication and User Management
const AuthManager = {
  token: null,
  currentUser: null,
  
  init() {
    this.token = localStorage.getItem('pridebot_token');
    if (this.token) {
      this.loadCurrentUser();
    }
  },
  
  async loadCurrentUser() {
    try {
      const base64Url = this.token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      
      if (decoded.userId) {
        const response = await fetch(`${window.location.origin}/getUser/${decoded.userId}`);
        if (response.ok) {
          this.currentUser = await response.json();
          this.updateUI();
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
      this.clearAuth();
    }
  },
  
  updateUI() {
    const loginBtn = document.getElementById('login-btn');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (this.currentUser && loginBtn && userDropdown) {
      loginBtn.style.display = 'none';
      userDropdown.style.display = 'flex';
      
      const userAvatar = document.getElementById('user-avatar');
      const userName = document.getElementById('user-name');
      
      if (userAvatar) {
        userAvatar.src = this.currentUser.displayAvatarURL;
      }
      if (userName) {
        userName.textContent = this.currentUser.username;
      }
    }
  },
  
  login() {
    // Redirect to Discord OAuth
    window.location.href = '/login';
  },
  
  logout() {
    this.clearAuth();
    window.location.href = '/';
  },
  
  clearAuth() {
    localStorage.removeItem('pridebot_token');
    this.token = null;
    this.currentUser = null;
  },
  
  isLoggedIn() {
    return this.token !== null && this.currentUser !== null;
  },
  
  getToken() {
    return this.token;
  },
  
  getCurrentUser() {
    return this.currentUser;
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  AuthManager.init();
});

// Toggle dropdown
function toggleUserDropdown(event) {
  event.stopPropagation();
  const menu = document.getElementById('user-dropdown-menu');
  if (menu) {
    menu.classList.toggle('show');
  }
}

// Close dropdown when clicking outside
document.addEventListener('click', (event) => {
  const dropdown = document.getElementById('user-dropdown');
  const menu = document.getElementById('user-dropdown-menu');
  if (menu && dropdown && !dropdown.contains(event.target)) {
    menu.classList.remove('show');
  }
});
