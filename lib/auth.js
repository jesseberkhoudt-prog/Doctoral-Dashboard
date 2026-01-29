// Simple authentication for client-side app
export class AuthManager {
  constructor() {
    this.storageKey = 'doctoral_dashboard_auth';
  }

  // Check if user is authenticated
  isAuthenticated() {
    if (typeof window === 'undefined') return false;
    const auth = localStorage.getItem(this.storageKey);
    if (!auth) return false;
    
    try {
      const { token, expiry } = JSON.parse(auth);
      if (Date.now() > expiry) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  // Login with password
  login(password) {
    // In production, this should verify against a backend
    // For demo: password is 'doctoral2026'
    if (password === 'doctoral2026') {
      const auth = {
        token: 'demo_token_' + Date.now(),
        expiry: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
        user: 'admin'
      };
      localStorage.setItem(this.storageKey, JSON.stringify(auth));
      return true;
    }
    return false;
  }

  // Logout
  logout() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.storageKey);
  }

  // Get current user
  getCurrentUser() {
    if (!this.isAuthenticated()) return null;
    try {
      const auth = JSON.parse(localStorage.getItem(this.storageKey));
      return auth.user;
    } catch {
      return null;
    }
  }
}

export const auth = new AuthManager();
