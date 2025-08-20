import { toast } from 'react-toastify';
import API_CONFIG from '../config/apiConfig';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
    this.isInitialized = false;
    this.isCheckingAuth = false; // Prevent multiple simultaneous auth checks
  }

  // Subscribe to auth state changes
  subscribe(callback) {
    console.log('AuthService: New subscriber added. Current user:', !!this.currentUser);
    this.listeners.push(callback);
    
    // If we already have a user and are initialized, call the callback immediately
    if (this.isInitialized) {
      console.log('AuthService: Calling callback immediately with current user:', !!this.currentUser);
      setTimeout(() => callback(this.currentUser), 0);
    }
    
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Notify all listeners of auth state changes
  notifyListeners() {
    console.log('AuthService: Notifying', this.listeners.length, 'listeners with user:', !!this.currentUser);
    this.listeners.forEach((callback, index) => {
      console.log(`AuthService: Calling listener ${index + 1}`);
      try {
        callback(this.currentUser);
      } catch (error) {
        console.error(`AuthService: Error calling listener ${index + 1}:`, error);
      }
    });
  }

  async checkAuthStatus() {
    // Prevent multiple simultaneous auth checks
    if (this.isCheckingAuth) {
      console.log('AuthService: Auth check already in progress, waiting...');
      return this.currentUser;
    }

    this.isCheckingAuth = true;

    try {
      console.log('AuthService: Starting auth status check...');
      
      // First check if we already have a current user in memory
      if (this.currentUser && this.isInitialized) {
        console.log('AuthService: Current user already exists in memory');
        this.isCheckingAuth = false;
        return this.currentUser;
      }

      // Check storage for user data with retry logic
      console.log('AuthService: Checking IndexedDB for stored user...');
      let user = null;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries && !user) {
        try {
          user = await storageService.getUser();
          if (user) {
            console.log('AuthService: Successfully retrieved user from storage on attempt', retryCount + 1);
            break;
          } else {
            console.log('AuthService: No user found in storage on attempt', retryCount + 1);
          }
        } catch (error) {
          console.error(`AuthService: Storage error on attempt ${retryCount + 1}:`, error);
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
          console.log(`AuthService: Retrying storage access in ${retryCount * 100}ms...`);
          await new Promise(resolve => setTimeout(resolve, retryCount * 100));
        }
      }
      
      console.log('AuthService: Final user from storage:', !!user);
      
      if (user?.token) {
        console.log('AuthService: Found stored token, verifying with API...');
        console.log('AuthService: Token preview:', user.token.substring(0, 20) + '...');
        console.log('AuthService: CRM URL:', user.crm_url);
        
        try {
          // Verify token by trying to get metadata
          const result = await apiService.getModulesAndFields(user.token, user.crm_url);
          console.log('AuthService: Token verification via metadata result:', result.success);
          
          if (result.success) {
            console.log('AuthService: Token is valid, updating user data with fresh metadata');
            
            // Update user data with fresh metadata - handle modified response structure
            const metadataResult = result.data.result || result.data;
            
            const updatedUserData = {
              ...user,
              enabledModules: metadataResult?.enabled_modules || metadataResult?.enabledModules || user.enabledModules || [],
              moduleFields: metadataResult?.module_fields || metadataResult?.moduleFields || user.moduleFields || {},
              relatedTabs: metadataResult?.related_tabs || metadataResult?.relatedTabs || user.relatedTabs || {},
            };
            
            console.log('AuthService: Updated enabled modules:', updatedUserData.enabledModules);
            console.log('AuthService: Updated related tabs keys:', Object.keys(updatedUserData.relatedTabs));
            
            // Save updated data and set current user
            await storageService.saveUser(updatedUserData);
            this.currentUser = updatedUserData;
            this.isInitialized = true;
            
            this.isCheckingAuth = false;
            this.notifyListeners();
            return this.currentUser;
          } else if (result.needsLogout) {
            // Token is invalid (session expired) - clear storage and set to null
            console.log('AuthService: Session expired, clearing storage');
            await storageService.deleteUser();
            this.currentUser = null;
            this.isInitialized = true;
            
            this.isCheckingAuth = false;
            this.notifyListeners();
            return null;
          } else {
            // Other error - keep user but log the issue
            console.log('AuthService: Metadata fetch failed but token might be valid:', result.error);
            this.currentUser = user;
            this.isInitialized = true;
            
            this.isCheckingAuth = false;
            this.notifyListeners();
            return this.currentUser;
          }
        } catch (metadataError) {
          console.error('AuthService: Metadata fetch failed with error:', metadataError);
          // Clear invalid token
          await storageService.deleteUser();
          this.currentUser = null;
          this.isInitialized = true;
          
          this.isCheckingAuth = false;
          this.notifyListeners();
          return null;
        }
      } else {
        // No token found
        console.log('AuthService: No token found in storage');
        this.currentUser = null;
        this.isInitialized = true;
        
        this.isCheckingAuth = false;
        this.notifyListeners();
        return null;
      }
      
    } catch (error) {
      console.error('AuthService: Auth check failed with exception:', error);
      
      // Clear any invalid data
      try {
        await storageService.deleteUser();
      } catch (clearError) {
        console.error('AuthService: Error clearing storage:', clearError);
      }
      
      this.currentUser = null;
      this.isInitialized = true;
      
      this.isCheckingAuth = false;
      this.notifyListeners();
      return null;
    }
  }

  async login(username, password) {
    try {
      console.log('AuthService: Attempting login for:', username);
      
      // Step 1: Get token from login API
      const loginResult = await apiService.login(username, password);
      console.log('AuthService: Login API result:', loginResult.success);
      
      if (!loginResult.success) {
        console.log('AuthService: Login failed:', loginResult.error);
        return { 
          success: false, 
          error: loginResult.error || loginResult.data?.message || 'Login failed' 
        };
      }

      const token = loginResult.data.token;
      if (!token) {
        console.log('AuthService: No token received from login');
        return { success: false, error: 'No token received from login' };
      }

      console.log('AuthService: Login successful, token received. Processing user data...');

      // Step 2: Extract user data from login response
      const userData = loginResult.data.user_data;
      if (!userData) {
        console.log('AuthService: No user_data in login response');
        return { success: false, error: 'No user data received from login' };
      }

      console.log('AuthService: Getting modules and fields...');
      
      // Step 3: Get modules and fields using the token and CRM URL
      // Use base URL since crm_url is not provided from login webservice
      const crmUrl = API_CONFIG.BASE_URL;
      const modulesResult = await apiService.getModulesAndFields(token, crmUrl);
      console.log('AuthService: Metadata result:', modulesResult.success);
      
      if (!modulesResult.success) {
        console.log('AuthService: Failed to get metadata:', modulesResult.error);
        return { 
          success: false, 
          error: modulesResult.error || 'Failed to get metadata' 
        };
      }

      // Step 4: Combine all data and save
      // Handle the modified metadata response structure
      const metadataResult = modulesResult.data.result || modulesResult.data;
      
      const completeUserData = {
        token: token,
        userid: userData.id,
        crm_url: crmUrl,
        username: `${userData.firstname} ${userData.lastname}`,
        // Store data from metadata API response with proper fallbacks
        enabledModules: metadataResult?.enabled_modules || metadataResult?.enabledModules || [],
        moduleFields: metadataResult?.module_fields || metadataResult?.moduleFields || {},
        relatedTabs: metadataResult?.related_tabs || metadataResult?.relatedTabs || {},
        ...userData
      };
      
      console.log('AuthService: Saving complete user data');
      console.log('AuthService: Enabled modules:', Object.keys(completeUserData.enabledModules));
      console.log('AuthService: Related tabs keys:', Object.keys(completeUserData.relatedTabs));
      
      await storageService.saveUser(completeUserData);
      console.log('AuthService: User data saved to storage successfully');
      
      this.currentUser = completeUserData;
      this.isInitialized = true;
      console.log('AuthService: Login successful, user set');
      
      // Notify listeners immediately after successful login
      console.log('AuthService: About to notify listeners after login...');
      this.notifyListeners();
      
      return { success: true };
      
    } catch (error) {
      console.error('AuthService: Login failed with exception:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      console.log('AuthService: Logging out...');
      await storageService.deleteUser();
      this.currentUser = null;
      this.isInitialized = true;
      console.log('AuthService: Logout complete, notifying listeners...');
      this.notifyListeners();
    } catch (error) {
      console.error('AuthService: Logout failed:', error);
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  isAuthenticated() {
    const isAuth = !!this.currentUser;
    return isAuth;
  }

  // Get enabled modules from stored user data
  getEnabledModules() {
    const modules = this.currentUser?.enabledModules || {};
    console.log('AuthService: getEnabledModules called, returning:', modules);
    return modules;
  }

  // Get module fields from stored user data
  getModuleFields(module) {
    const moduleFields = this.currentUser?.moduleFields || {};
    const fields = moduleFields[module] || [];
    console.log(`AuthService: getModuleFields called for ${module}, returning:`, fields.length, 'fields');
    return fields;
  }

  // Get all module fields
  getAllModuleFields() {
    const moduleFields = this.currentUser?.moduleFields || {};
    return moduleFields;
  }

  // Get related tabs for a specific module from stored user data
  getRelatedTabs(module) {
    const relatedTabs = this.currentUser?.relatedTabs || {};
    const tabs = relatedTabs[module] || relatedTabs[module.toLowerCase()] || [];
    console.log(`AuthService: getRelatedTabs called for ${module}, available modules:`, Object.keys(relatedTabs));
    console.log(`AuthService: getRelatedTabs returning for ${module}:`, tabs.length, 'tabs', tabs);
    return tabs;
  }

  // Get all related tabs
  getAllRelatedTabs() {
    const relatedTabs = this.currentUser?.relatedTabs || {};
    console.log('AuthService: getAllRelatedTabs returning:', Object.keys(relatedTabs).length, 'modules');
    return relatedTabs;
  }
}

// Create singleton instance
const authService = new AuthService();

// Import services
import storageService from './storageService';
import apiService from './apiService';

export default authService;