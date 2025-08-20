// API Configuration
const API_CONFIG = {
  // Base URLs
  BASE_URL: 'https://letsrevitup.com',
  
  // API Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    OUTLOOK_API: '/api/outlook.php',
    
    // Entity endpoints
    GET_RECORD_DETAILS: '/OutlookAddin/getRecordDetails.php',
    SAVE_ENTITY: '/OutlookAddin/save_entity.php',
    
    GET_REFERENCE_RECORDS: '/OutlookAddin/getReferenceRecords.php',
    
    // Related records endpoints
    GET_RELATED_RECORDS: '/OutlookAddin/getRelatedRecords.php',
    GET_UPCOMING_ACTIVITIES: '/OutlookAddin/getUpcomingActivities.php',
    
    // Comment endpoints
    SAVE_COMMENT: '/OutlookAddin/save_comment.php',
    
    // Email endpoints
    ARCHIVE_EMAIL: '/api/outlook.php',
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint, baseUrl = API_CONFIG.BASE_URL) => {
  return `${baseUrl}${endpoint}`;
};

// Helper function to get endpoint
export const getEndpoint = (endpointKey) => {
  return API_CONFIG.ENDPOINTS[endpointKey];
};

// Export the full config
export default API_CONFIG;