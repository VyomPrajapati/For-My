// Authentication configuration
export const AUTH_CONFIG = {
  KALESHI_AURAT: {
    username: 'kaleshi aurat',
    password: 'rotihuyiadri1306',
    role: 'kaleshi_aurat'
  },
  USER: {
    username: 'boondi ka laddu',
    password: 'adrilovesyou06',
    role: 'user'
  }
};

export interface User {
  username: string;
  role: 'kaleshi_aurat' | 'user';
  isAuthenticated: boolean;
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const user = localStorage.getItem('currentUser');
  return user !== null;
};

// Get current user
export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

// Login function with role validation
export const login = (username: string, password: string): User | null => {
  if (username === AUTH_CONFIG.KALESHI_AURAT.username && password === AUTH_CONFIG.KALESHI_AURAT.password) {
    const user: User = {
      username: AUTH_CONFIG.KALESHI_AURAT.username,
      role: 'kaleshi_aurat',
      isAuthenticated: true
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  
  if (username === AUTH_CONFIG.USER.username && password === AUTH_CONFIG.USER.password) {
    const user: User = {
      username: AUTH_CONFIG.USER.username,
      role: 'user',
      isAuthenticated: true
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  }
  
  return null;
};

// Role-based login function for additional security
export const loginWithRole = (username: string, password: string, expectedRole: 'kaleshi_aurat' | 'user'): User | null => {
  // First check if credentials are valid
  const user = login(username, password);
  
  if (user && user.role === expectedRole) {
    // Credentials are valid AND role matches
    return user;
  } else if (user && user.role !== expectedRole) {
    // Credentials are valid but role doesn't match - this shouldn't happen with proper validation
    logout(); // Clear any invalid login
    return null;
  }
  
  return null;
};

// Logout function
export const logout = (): void => {
  localStorage.removeItem('currentUser');
};

// Check if user is Kaleshi aurat
export const isKaleshiAurat = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'kaleshi_aurat';
};

// Check if user is regular user
export const isRegularUser = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'user';
};
