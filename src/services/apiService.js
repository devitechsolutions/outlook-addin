import axios from 'axios';
import { toast } from 'react-toastify';
import storageService from './storageService';
import API_CONFIG, { buildApiUrl, getEndpoint } from '../config/apiConfig';

class ApiService {
  constructor() {
    this.setupInterceptors();
  }

  setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      async (config) => {
        const token = await this.getStoredToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers.Accept = 'application/json';
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 404 && !error.config._retry) {
          error.config._retry = true;
          // Handle token refresh logic here if needed
        }
        return Promise.reject(error);
      }
    );
  }

  async getStoredToken() {
    try {
      // Try to get from authService first (in-memory), then fallback to storage
      const authService = require('./authService').default;
      const currentUser = authService.getCurrentUser();
      
      if (currentUser?.token) {
        console.log('API Service: Got token from authService:', currentUser.token.substring(0, 20) + '...');
        return currentUser.token;
      }
      
      console.log('API Service: No user in authService, checking storage...');
      const user = await storageService.getUser();
      const token = user?.token;
      console.log('API Service: Token from storage:', token ? token.substring(0, 20) + '...' : 'null');
      return token;
    } catch (error) {
      console.error('API Service: Error getting stored token:', error);
      return null;
    }
  }

  async getStoredUser() {
    try {
      // Try to get from authService first (in-memory), then fallback to storage
      const authService = require('./authService').default;
      const currentUser = authService.getCurrentUser();
      
      if (currentUser) {
        console.log('API Service: Got user from authService:', currentUser);
        return currentUser;
      }
      
      console.log('API Service: No user in authService, checking storage...');
      const user = await storageService.getUser();
      console.log('API Service: User from storage:', user);
      return user;
    } catch (error) {
      console.error('API Service: Error getting stored user:', error);
      return null;
    }
  }

  async makeRequest(config) {
    try {
      console.log('Making API request:', config);
      const response = await axios(config);
      console.log('API response:', response.data);
      return this.handleResponse(response);
    } catch (error) {
      console.error('API request failed:', error);
      return this.handleError(error);
    }
  }

  handleResponse(response) {
    console.log('Handling response:', response.data);
    
    if (response.data.success === false) {
      if (response.data.error === 'Invalid Token' || response.data.code === 100) {
        // Show session expired message
        toast.error(response.data.message, {
          closeOnClick: true,
          pauseOnHover: true,
          theme: 'colored',
          autoClose: 7000,
        });
        // Trigger logout
        return { success: false, needsLogout: true, data: response.data };
      } else if (response.data.error === 'Invalid Token') {
        // Handle Invalid Token error specifically
        toast.error('Session Expired. Please login again.', {
          closeOnClick: true,
          pauseOnHover: true,
          theme: 'colored',
          autoClose: 7000,
        });
        return { success: false, needsLogout: true, data: response.data };
      } else {
        // Don't show toast here for login failures - let the component handle it
        return { success: false, data: response.data, error: response.data.message };
      }
    }
    return { success: true, data: response.data };
  }

  handleError(error) {
    console.error('API Error:', error);
    
    let errorMessage = 'Something went wrong. Please try again later.';
    
    if (error.response) {
      // Server responded with error status
      errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
    } else if (error.request) {
      // Request was made but no response received
      errorMessage = 'Network error. Please check your connection.';
    }
    
    toast.error(errorMessage, {
      closeOnClick: true,
      pauseOnHover: true,
      theme: 'colored',
      autoClose: 7000,
    });
    
    return { success: false, error: errorMessage };
  }

  // Authentication APIs
  async login(username, password) {
    console.log('API Service: Making login request with POST data');
    
    // Create FormData for POST request
    const formData = new FormData();
    formData.append('operation', 'OutlookLogin');
    formData.append('username', username);
    formData.append('password', password);

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('OUTLOOK_API')),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getModulesAndFields(token, crmUrl) {
    console.log('API Service: Getting metadata with operation parameter');
    console.log('API Service: Using CRM URL:', crmUrl);
    
    const formData = new FormData();
    formData.append('operation', 'GetMetaData');

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('OUTLOOK_API'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Entity APIs
  async getRecordDetailFromEmail(email) {
    console.log('API Service: Searching for email record:', email);
    
    const user = await this.getStoredUser();
    console.log('API Service: Retrieved user for email search:', user);
    
    if (!user) {
      console.error('API Service: No user data found');
      throw new Error('User not authenticated');
    }
    
    // Use base URL since crm_url might not be provided
    const crmUrl = user.crm_url || API_CONFIG.BASE_URL;
    console.log('API Service: Using CRM URL for email search:', crmUrl);

    if (!user.token) {
      console.error('API Service: Token not found in user data:', user);
      throw new Error('Authentication token not found - please login again');
    }

    const formData = new FormData();
    formData.append('operation', 'SearchEmail');
    formData.append('email', email);

    const apiUrl = buildApiUrl(getEndpoint('OUTLOOK_API'), crmUrl);
    console.log('API Service: Making SearchEmail request to:', apiUrl);
    console.log('API Service: With email:', email);
    console.log('API Service: Using CRM URL:', crmUrl);
    console.log('API Service: Using token:', user.token.substring(0, 20) + '...');

    return this.makeRequest({
      method: 'POST',
      url: apiUrl,
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${user.token}`,
      },
    });
  }

  async getRecordDetails(recordId, module = null) {
    console.log('API Service: Getting record details for recordId:', recordId);
    
    const user = await this.getStoredUser();
    const crmUrl = user?.crm_url || API_CONFIG.BASE_URL;

    const formData = new FormData();
    formData.append('operation', 'GetRecordDetails');
    formData.append('recordid', recordId);

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('OUTLOOK_API'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async saveEntity(formDataObj) {
    const user = await this.getStoredUser();
    const crmUrl = user?.crm_url || API_CONFIG.BASE_URL;

    const formData = new FormData();
    Object.keys(formDataObj).forEach(key => {
      formData.append(key, formDataObj[key]);
    });

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('SAVE_ENTITY'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Field APIs - Now uses cached data from authService instead of API call
  async getOutlookEnabledFields(module, mode = null) {
    console.log(`API Service: Getting fields for module ${module} from cached user data`);
    
    // Get fields from authService instead of making API call
    const authService = require('./authService').default;
    const fields = authService.getModuleFields(module);
    
    console.log(`API Service: Retrieved ${fields.length} fields for ${module} from cache:`, fields);
    
    // Return in the same format as the API would
    return {
      success: true,
      data: {
        fields: fields
      }
    };
  }

  async getReferenceRecords(referenceModule, searchValue) {
    const user = await this.getStoredUser();
    const crmUrl = user?.crm_url || API_CONFIG.BASE_URL;

    const formData = new FormData();
    formData.append('referenceModule', referenceModule);
    formData.append('search_value', searchValue);

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('GET_REFERENCE_RECORDS'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Module APIs - Now uses cached data from authService instead of API call
  async getRelatedTabModules(module, record) {
    console.log(`API Service: Getting related tabs for module ${module} from cached user data`);
    
    // Get related tabs from authService instead of making API call
    const authService = require('./authService').default;
    const relatedTabs = authService.getRelatedTabs(module);
    
    console.log(`API Service: Retrieved related tabs for ${module} from cache:`, relatedTabs);
    
    // Return in the same format as the API would
    return {
      success: true,
      data: {
        data: relatedTabs
      }
    };
  }

  // Related Records APIs
  async getRelatedRecords(record, relModule, module = null) {
    const user = await this.getStoredUser();
    const crmUrl = user?.crm_url || API_CONFIG.BASE_URL;

    const formData = new FormData();
    formData.append('record', record);
    formData.append('relModule', relModule);
    if (module) formData.append('module', module);

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('GET_RELATED_RECORDS'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Activity APIs
  async getUpcomingActivities(record) {
    const user = await this.getStoredUser();
    const crmUrl = user?.crm_url || API_CONFIG.BASE_URL;

    const formData = new FormData();
    formData.append('record', record);

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('GET_UPCOMING_ACTIVITIES'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Comment APIs
  async saveComment(formDataObj) {
    const user = await this.getStoredUser();
    const crmUrl = user?.crm_url || API_CONFIG.BASE_URL;

    const formData = new FormData();
    Object.keys(formDataObj).forEach(key => {
      formData.append(key, formDataObj[key]);
    });

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('SAVE_COMMENT'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Email APIs
  async archiveEmail(emailData) {
    const user = await this.getStoredUser();
    const crmUrl = user?.crm_url || API_CONFIG.BASE_URL;

    console.log('API Service: Archiving email with complete data:', {
      subject: emailData.subject,
      messageId: emailData.messageId,
      fromEmail: emailData.from?.emailAddress,
      dateTimeCreated: emailData.dateTimeCreated,
      dateTimeType: typeof emailData.dateTimeCreated,
      toCount: emailData.to?.length || 0,
      ccCount: emailData.cc?.length || 0,
      attachmentCount: emailData.attachments?.length || 0,
      hasHtmlBody: !!emailData.bodyHtml,
      hasTextBody: !!emailData.bodyText,
      parentId: emailData.parent_id,
      hasCallbackToken: !!emailData.callbackToken,
      hasUserIdentityToken: !!emailData.userIdentityToken,
      ewsUrl: emailData.ewsUrl,
      restUrl: emailData.restUrl
    });

    // Validate datetime format
    if (emailData.dateTimeCreated && typeof emailData.dateTimeCreated === 'object') {
      console.warn('API Service: DateTime is still an object, attempting to convert:', emailData.dateTimeCreated);
      
      // Try to convert object to string
      if (emailData.dateTimeCreated instanceof Date) {
        emailData.dateTimeCreated = emailData.dateTimeCreated.toISOString().replace('T', ' ').substring(0, 19);
      } else if (emailData.dateTimeCreated.toString) {
        emailData.dateTimeCreated = emailData.dateTimeCreated.toString();
      }
    }

    // Validate required data for attachment processing
    if (emailData.attachments && emailData.attachments.length > 0) {
      if (!emailData.callbackToken) {
        console.error('API Service: Missing callback token for attachment processing');
        throw new Error('Missing authentication token for attachment processing');
      }
      
      console.log('API Service: Email has', emailData.attachments.length, 'attachments, tokens validated');
    }

    // Clean up any remaining object-type datetime fields
    const cleanedEmailData = this.cleanDateTimeFields(emailData);
    
    const formData = new FormData();
    formData.append('operation', 'ArchiveEmail');
    formData.append('emailData', JSON.stringify(cleanedEmailData));

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('ARCHIVE_EMAIL'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // Search Records API for linking emails
  async searchRecords(module, searchValue) {
    console.log('API Service: Searching records in module:', module, 'for value:', searchValue);
    
    const user = await this.getStoredUser();
    const crmUrl = user?.crm_url || API_CONFIG.BASE_URL;

    const formData = new FormData();
    formData.append('operation', 'SearchRecord');
    formData.append('module', module);
    formData.append('search_value', searchValue);

    console.log('API Service: Making search request to:', `${crmUrl}/api/outlook.php`);
    console.log('API Service: Search parameters:', { module, searchValue });

    return this.makeRequest({
      method: 'POST',
      url: buildApiUrl(getEndpoint('OUTLOOK_API'), crmUrl),
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  cleanDateTimeFields(emailData) {
    const cleaned = { ...emailData };
    
    // List of fields that might contain datetime objects
    const dateTimeFields = [
      'dateTimeCreated',
      'dateTimeCreatedRaw',
      'createdDate',
      'createdTime'
    ];
    
    dateTimeFields.forEach(field => {
      if (cleaned[field] && typeof cleaned[field] === 'object') {
        console.log(`API Service: Converting ${field} from object to string:`, cleaned[field]);
        
        if (cleaned[field] instanceof Date) {
          // Convert Date object to string
          cleaned[field] = cleaned[field].toISOString().replace('T', ' ').substring(0, 19);
        } else if (cleaned[field].toString) {
          // Try toString method
          cleaned[field] = cleaned[field].toString();
        } else {
          // Fallback to JSON stringify and clean up
          cleaned[field] = JSON.stringify(cleaned[field]).replace(/["\[\]]/g, '');
        }
        
        console.log(`API Service: Converted ${field} to:`, cleaned[field]);
      }
    });
    
    return cleaned;
  }
}

export default new ApiService();