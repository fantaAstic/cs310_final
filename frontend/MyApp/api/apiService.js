import axios from 'axios';
import { Platform } from 'react-native';

let API_URL;

if (Platform.OS === 'web') {
  // Set API URL for Web
  API_URL = 'http://localhost:8081'; // Or your desired URL for the web
  console.log('API_URL:', API_URL); // You can log to check if it's set correctly
} else {
  // Set API URL for mobile
  API_URL = 'http://172.16.0.228:5000'; // Or your desired URL for mobile
} 

console.log('Platform:', Platform.OS);  // Log the platform
console.log('API_URL:', API_URL);  // Log the API URL
// Enable credentials (cookies) to persist session
axios.defaults.withCredentials = true; 

// Register endpoint
export const registerUser = async (userData) => {
  console.log('Sending user data to register:', userData);
  const response = await axios.post(`${API_URL}/auth/register`, userData, { withCredentials: true });
  console.log('Response from backend:', response);
  return response.data;
};

// Login endpoint
export const loginUser = async (credentials) => { 
  const response = await axios.post(`${API_URL}/auth/login`, credentials, { withCredentials: true });
  return response.data;
};

// Logout endpoint
export const logoutUser = async () => {
  const response = await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
  return response.data;
};

export const updateUserDetails = async (institutionEmail, name, isStudent, yearOfStudy) => {
  try {
    const response = await axios.post(`${API_URL}/auth/update_user`, {
        institution_email: institutionEmail,  // Pass the email here instead of user_id
        name: name,
        is_student: isStudent,
        year_of_study: yearOfStudy,
      }, 
      {
        headers: {
          'Content-Type': 'application/json', // Make sure the content type is set to JSON
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user details", error);
    throw error; // Handle the error appropriately
  }
};

// Get saved modules (GET request)
export const getSavedModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/saved_modules`, { withCredentials: true });

    console.log("Fetched saved modules:", response.data);

    // Ensure response is an array
    return Array.isArray(response.data?.saved_modules) ? response.data.saved_modules : [];
  } catch (error) {
    console.error("Error fetching saved modules:", error);
    return []; // Return an empty array to prevent crashes
  }
};

// Add a saved module (POST request)
export const addSavedModule = async (moduleName) => {
  const response = await axios.post(
    `${API_URL}/modules/saved_modules/add`, 
    { module_name: moduleName }, 
    { withCredentials: true }
  );
  return response.data;
};

// Remove a saved module (DELETE request)
export const removeSavedModule = async (moduleName) => {
  const response = await axios.delete(
    `${API_URL}/modules/saved_modules/remove`, 
    { 
      data: { module_name: moduleName }, 
      withCredentials: true 
    }
  );
  return response.data;
};

// Get taught modules (GET request)
export const getTaughtModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/taught_modules`, { withCredentials: true });

    console.log("Fetched taught modules:", response.data);

    // Ensure response is an array
    return Array.isArray(response.data?.taught_modules) ? response.data.taught_modules : [];
  } catch (error) {
    console.error("Error fetching taught modules:", error);
    return [];
  }
};

// Add a taught module (POST request)
export const addTaughtModule = async (moduleName) => {
  const response = await axios.post(
    `${API_URL}/modules/taught_modules/add`,  // Change to correct endpoint for taught modules
    { module_name: moduleName }, 
    { withCredentials: true }
  );
  return response.data;
};

// Remove a taught module (DELETE request)
export const removeTaughtModule = async (moduleName) => {
  const response = await axios.delete(
    `${API_URL}/modules/taught_modules/remove`,  // Change to correct endpoint for taught modules
    { 
      data: { module_name: moduleName }, 
      withCredentials: true 
    }
  );
  return response.data;
};

// Get saved modules count (GET request)
export const getSavedModulesCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/saved_modules/count`, { withCredentials: true });

    console.log("Fetched saved modules count:", response.data);

    return Number(response.data); // Convert response to a number
  } catch (error) {
    console.error("Error fetching saved modules count:", error);
    return 0;
  }
};

// Get taught modules count (GET request)
export const getTaughtModulesCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/taught_modules/count`, { withCredentials: true });

    console.log("Fetched taught modules count:", response.data);

    return Number(response.data); // Convert response to a number
  } catch (error) {
    console.error("Error fetching taught modules count:", error);
    return 0;
  }
};

// Fetch Module Titles
export const getModuleTitles = async () => {
  const response = await axios.get(`${API_URL}/modules/titles`);
  return response.data;
};

// Fetch Module Outlooks
export const getModuleOutlooks = async () => {
  const response = await axios.get(`${API_URL}/modules/outlooks`);
  return response.data;
};

// Fetch Positive Reviews
export const getPositiveReviews = async () => {
  const response = await axios.get(`${API_URL}/modules/positive_reviews`);
  return response.data;
};

// Fetch Negative Reviews
export const getNegativeReviews = async () => {
  const response = await axios.get(`${API_URL}/modules/negative_reviews`);
  return response.data;
};

// Fetch Categories
export const getCategory = async () => {
  const response = await axios.get(`${API_URL}/modules/categories`);
  return response.data;
};

// Fetch Teacher Feedback
export const getTeacherFeedback = async () => {
  const response = await axios.get(`${API_URL}/modules/teacher_feedback`);
  return response.data;
};

// Fetch Similar Modules
export const getSimilarModules = async () => {
  const response = await axios.get(`${API_URL}/modules/similar_modules`);
  return response.data;
};

// Fetch Topics
export const getTopics = async () => {
  const response = await axios.get(`${API_URL}/modules/topics`);
  return response.data;
};

// Clear Selected Modules (DELETE request)
export const clearSelectedModules = async () => {
  try {
    const response = await axios.delete(`${API_URL}/modules/selected/clear`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error clearing selected modules:", error);
    throw error;
  }
};

// Clear Recommended Modules (DELETE request)
export const clearRecommendedModules = async () => {
  try {
    const response = await axios.delete(`${API_URL}/modules/recommended/clear`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error clearing recommended modules:", error);
    throw error;
  }
};

// Add Recommended Modules (POST request)
export const addRecommendedModules = async (modules) => {
  const response = await axios.post(
    `${API_URL}/recommendations/recommended_add`, 
    { modules: modules },
    { withCredentials: true }
  );
  return response.data;  // Return the response data if successful
};

export const addSelectedModules = async (moduleName) => {
  // try {
    const response = await axios.post(
      `${API_URL}/modules/selected_add`, 
      { module_name: moduleName }, 
      { withCredentials: true }
    );
    return response.data;  // Return the response data if successful
/*
  } catch (error) {
    // Check if the error message matches the specific one to handle
    if (error.response && error.response.data && error.response.data.message === "All selected modules are already in the recommended list.") {
      return { message: "All selected modules are already in the recommended list." }; // Return the message as is
    }
    
    console.error("Error adding selected modules:", error);
    throw error;  // Rethrow the error if it's not the one we're handling
  }
*/
  };

/*
const response = await axios.post(
    `${API_URL}/modules/saved_modules/add`, 
    { module_name: moduleName }, 
    { withCredentials: true }
  );
  return response.data;
*/


// Get Recommended Modules (GET request)
export const getSelectedModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/selected_retrieve`, { withCredentials: true });

    console.log("Fetched selected modules:", response.data);

    // Ensure response is an array
    return Array.isArray(response.data?.selected_modules) ? response.data.selected_modules : [];
  } catch (error) {
    console.error("Error fetching selected modules:", error);
    return []; // Return an empty array to prevent crashes
  }
};

// Get Recommended Modules (GET request)
export const getRecommendedModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/recommended_retrieve`, { withCredentials: true });

    console.log("Fetched recommended modules:", response.data);

    // Ensure response is an array
    return Array.isArray(response.data?.recommended_modules) ? response.data.recommended_modules : [];
  } catch (error) {
    console.error("Error fetching recommended modules:", error);
    return []; // Return an empty array to prevent crashes
  }
};

// Modified function to send POST request with user preferences
export const generateStudentModuleRecs = async (userPreferences) => {
  try {
    const response = await axios.post(
      `${API_URL}/recommendations/generate_recommendations_student`, 
      userPreferences,  // send user preferences as POST data
      { withCredentials: true }
    );
    console.log("request to generate recommendations");
    return response.data;  // return the API response
  } catch (error) {
    console.error("Error retrieving selected modules:", error);
    throw error;
  }
};

// Remove a selected module (DELETE request)
export const removeSelectedModule = async (moduleName) => {
  const response = await axios.delete(
    `${API_URL}/modules/selected_modules/remove`, 
    { 
      data: { module_name: moduleName }, 
      withCredentials: true 
    }
  );
  return response.data;
};

export const removeRecommendedModule = async (moduleName) => {
  const response = await axios.delete(
    `${API_URL}/modules/recommended_modules/remove`, 
    { 
      data: { module_name: moduleName }, 
      withCredentials: true 
    }
  );
  return response.data;
};

export const getAllModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/modules_all`, {
      withCredentials: true,  // Use this if you need to handle sessions or cookies
    });
    return response.data;  // Assuming the data comes in the desired format
  } catch (error) {
    console.error("Error fetching modules:", error);
    throw error;
  }
};

export const getTopicsByModule = async (moduleName, topic) => {
  try {
    const response = await fetch(
      `${API_URL}/modules/topics_modules?name=${encodeURIComponent(moduleName)}&topic=${encodeURIComponent(topic)}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching topics:', error);
    return null;
  }
};

export const saveUserPreferences = async (userPreferences) => {
  try {
    const response = await axios.post(`${API_URL}/user/preferences/save`, userPreferences, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
};

const fetchUserPreferences = async () => {
  try {
    const response = await axios.get(`${API_URL}/user/preferences`, { withCredentials: true });
    console.log("Retrieved User Preferences:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching preferences:", error);
    throw error;
  }
};

