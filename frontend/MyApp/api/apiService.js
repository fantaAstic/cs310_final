/**
 * @fileoverview API Service Module for interacting with the backend API.
 * Provides functions for authentication, module management, recommendations,
 * and user preferences using Axios for HTTP requests.
 * Handles platform-specific API URL configuration for Web and Mobile.
 */

import axios from 'axios';
import { Platform } from 'react-native'; // Import Platform API from React Native

/**
 * Base URL for the backend API.
 * Dynamically set based on the runtime platform (Web or Mobile).
 * @type {string}
 */
let API_URL;

// Check the current platform using React Native's Platform API
if (Platform.OS === 'web') {
  // Set the API URL for Web environments (e.g., development server)
  // Use `process.env.REACT_APP_API_URL || 'http://localhost:5000'` for more flexibility
  API_URL = 'http://localhost:5000'; // Use your backend URL for the web proxy or direct connection
  console.log('API_URL (Web):', API_URL); // Log the determined URL for web
} else {
  // Set the API URL for Mobile environments (iOS/Android)
  // Use the host machine's local network IP address for emulator/device access
  // Ensure the mobile device/emulator can reach this IP and port.
  API_URL = 'http://192.168.0.74:5000'; // Replace with your machine's local IP if different
  console.log('API_URL (Mobile):', API_URL); // Log the determined URL for mobile
}

// Log platform and final API URL for debugging
console.log('Platform:', Platform.OS);
console.log('Final API_URL:', API_URL);

// Configure Axios to automatically send credentials (like cookies) with requests.
// This is essential for session-based authentication to work correctly.
axios.defaults.withCredentials = true;

// --- Authentication Endpoints ---

/**
 * Registers a new user.
 * Sends user registration data (email, password, name, role, year) to the backend.
 * @param {object} userData - The user registration data.
 * @param {string} userData.email - User's email address.
 * @param {string} userData.password - User's password.
 * @param {string} userData.name - User's full name.
 * @param {string} userData.role - User's role (e.g., 'Student', 'Teacher').
 * @param {string} [userData.year] - User's year of study (optional, for students).
 * @returns {Promise<object>} A promise that resolves with the response data from the backend (e.g., success message, user details).
 * @throws {Error} Throws an error if the request fails.
 */
export const registerUser = async (userData) => {
  console.log('Sending user data to register:', userData);
  // Send a POST request to the registration endpoint with user data.
  const response = await axios.post(`${API_URL}/auth/register`, userData, { withCredentials: true });
  console.log('Response from backend (register):', response);
  // Return the data part of the Axios response.
  return response.data;
};

/**
 * Logs in an existing user.
 * Sends user credentials (email, password) to the backend for verification.
 * @param {object} credentials - The user login credentials.
 * @param {string} credentials.email - User's email address.
 * @param {string} credentials.password - User's password.
 * @returns {Promise<object>} A promise that resolves with the response data (e.g., success message, user details).
 * @throws {Error} Throws an error if the request fails (e.g., invalid credentials).
 */
export const loginUser = async (credentials) => {
  // Send a POST request to the login endpoint.
  const response = await axios.post(`${API_URL}/auth/login`, credentials, { withCredentials: true });
  console.log('Response from backend (login):', response.data); // Log successful login data
  return response.data;
};

/**
 * Logs out the currently authenticated user.
 * Sends a request to the backend to clear the user's session.
 * @returns {Promise<object>} A promise that resolves with the response data (e.g., success message).
 * @throws {Error} Throws an error if the request fails.
 */
export const logoutUser = async () => {
  // Send a POST request to the logout endpoint. The body is empty ({}) but the session cookie is sent.
  const response = await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
  console.log('Response from backend (logout):', response.data);
  return response.data;
};

/**
 * Updates user details.
 * Sends updated information (name, student status, year) identified by the user's email.
 * @param {string} institutionEmail - The email address of the user to update.
 * @param {string} name - The new name for the user.
 * @param {boolean} isStudent - Flag indicating if the user is a student. // Note: Backend seems to expect 'role', adjust if needed
 * @param {string} yearOfStudy - The new year of study for the user.
 * @returns {Promise<object>} A promise that resolves with the response data (e.g., success message).
 * @throws {Error} Throws an error if the request fails or user is not found.
 */
export const updateUserDetails = async (institutionEmail, name, isStudent, yearOfStudy) => {
  try {
    // Send a POST request to the update user endpoint.
    const response = await axios.post(`${API_URL}/auth/update_user`,
      {
        // Map frontend variable names to backend expected keys.
        institution_email: institutionEmail,
        name: name,
        is_student: isStudent, // Adjust key if backend expects 'role'
        year_of_study: yearOfStudy,
      },
      {
        headers: {
          // Ensure the server knows we're sending JSON data.
          'Content-Type': 'application/json',
        },
        // Ensure credentials (cookies) are sent for authentication if needed by the backend.
        withCredentials: true,
      }
    );
    console.log('Response from backend (update user):', response.data);
    return response.data;
  } catch (error) {
    // Log detailed error information if the request fails.
    console.error("Error updating user details:", error.response ? error.response.data : error.message);
    // Rethrow the error so the calling component can handle it (e.g., show a message to the user).
    throw error;
  }
};

// --- Saved Modules Endpoints ---

/**
 * Fetches the list of saved module names for the currently logged-in user.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of saved module names. Returns an empty array on error or if no modules are saved.
 */
export const getSavedModules = async () => {
  try {
    // Send a GET request to fetch saved modules.
    const response = await axios.get(`${API_URL}/modules/saved_modules`, { withCredentials: true });
    console.log("Fetched saved modules:", response.data);
    // Safely access the nested array and ensure it's an array, return empty array otherwise.
    return Array.isArray(response.data?.saved_modules) ? response.data.saved_modules : [];
  } catch (error) {
    console.error("Error fetching saved modules:", error.response ? error.response.data : error.message);
    // Return an empty array in case of error to prevent downstream crashes.
    return [];
  }
};

/**
 * Adds a module to the logged-in user's saved modules list.
 * @param {string} moduleName - The name of the module to save.
 * @returns {Promise<object>} A promise that resolves with the response data (e.g., confirmation message, updated list).
 * @throws {Error} Throws an error if the request fails.
 */
export const addSavedModule = async (moduleName) => {
  console.log(`Adding saved module: ${moduleName}`);
  // Send a POST request to add the specified module.
  const response = await axios.post(
    `${API_URL}/modules/saved_modules/add`,
    { module_name: moduleName }, // Request body contains the module name.
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Removes a module from the logged-in user's saved modules list.
 * @param {string} moduleName - The name of the module to remove.
 * @returns {Promise<object>} A promise that resolves with the response data (e.g., confirmation message, updated list).
 * @throws {Error} Throws an error if the request fails.
 */
export const removeSavedModule = async (moduleName) => {
  console.log(`Removing saved module: ${moduleName}`);
  // Send a DELETE request to remove the specified module.
  // For DELETE requests with Axios, the data payload goes in the `data` property of the config object.
  const response = await axios.delete(
    `${API_URL}/modules/saved_modules/remove`,
    {
      data: { module_name: moduleName }, // Request body for DELETE.
      withCredentials: true
    }
  );
  return response.data;
};

// --- Taught Modules Endpoints ---

/**
 * Fetches the list of taught module names for the currently logged-in user.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of taught module names. Returns an empty array on error.
 */
export const getTaughtModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/taught_modules`, { withCredentials: true });
    console.log("Fetched taught modules:", response.data);
    // Ensure the response contains an array, default to empty array.
    return Array.isArray(response.data?.taught_modules) ? response.data.taught_modules : [];
  } catch (error) {
    console.error("Error fetching taught modules:", error.response ? error.response.data : error.message);
    return [];
  }
};

/**
 * Adds a module to the logged-in user's taught modules list.
 * @param {string} moduleName - The name of the module to add.
 * @returns {Promise<object>} A promise that resolves with the response data.
 * @throws {Error} Throws an error if the request fails.
 */
export const addTaughtModule = async (moduleName) => {
  console.log(`Adding taught module: ${moduleName}`);
  const response = await axios.post(
    `${API_URL}/modules/taught_modules/add`, // Correct endpoint for taught modules.
    { module_name: moduleName },
    { withCredentials: true }
  );
  return response.data;
};

/**
 * Removes a module from the logged-in user's taught modules list.
 * @param {string} moduleName - The name of the module to remove.
 * @returns {Promise<object>} A promise that resolves with the response data.
 * @throws {Error} Throws an error if the request fails.
 */
export const removeTaughtModule = async (moduleName) => {
  console.log(`Removing taught module: ${moduleName}`);
  const response = await axios.delete(
    `${API_URL}/modules/taught_modules/remove`, // Correct endpoint for taught modules.
    {
      data: { module_name: moduleName },
      withCredentials: true
    }
  );
  return response.data;
};

// --- Module Count Endpoints ---

/**
 * Fetches the count of saved modules for the logged-in user.
 * @returns {Promise<number>} A promise that resolves with the number of saved modules. Returns 0 on error.
 */
export const getSavedModulesCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/saved_modules/count`, { withCredentials: true });
    console.log("Fetched saved modules count:", response.data);
    // Convert the response data (expected to be a string representation of a number) to a number.
    return Number(response.data) || 0; // Fallback to 0 if conversion fails
  } catch (error) {
    console.error("Error fetching saved modules count:", error.response ? error.response.data : error.message);
    return 0; // Return 0 in case of error.
  }
};

/**
 * Fetches the count of taught modules for the logged-in user.
 * @returns {Promise<number>} A promise that resolves with the number of taught modules. Returns 0 on error.
 */
export const getTaughtModulesCount = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/taught_modules/count`, { withCredentials: true });
    console.log("Fetched taught modules count:", response.data);
    // Convert response data to a number.
    return Number(response.data) || 0;
  } catch (error) {
    console.error("Error fetching taught modules count:", error.response ? error.response.data : error.message);
    return 0;
  }
};

// --- General Module Data Endpoints ---
// These fetch aggregated data across all modules.

/** Fetches a list of all module titles. */
export const getModuleTitles = async () => {
  const response = await axios.get(`${API_URL}/modules/modules/titles`); // Adjusted endpoint path
  return response.data;
};

/** Fetches a list of all module outlooks. */
export const getModuleOutlooks = async () => {
  const response = await axios.get(`${API_URL}/modules/modules/outlooks`); // Adjusted endpoint path
  return response.data;
};

/** Fetches a list of all module positive review scores. */
export const getPositiveReviews = async () => {
  const response = await axios.get(`${API_URL}/modules/modules/positive_reviews`); // Adjusted endpoint path
  return response.data;
};

/** Fetches a list of all module negative review scores. */
export const getNegativeReviews = async () => {
  const response = await axios.get(`${API_URL}/modules/modules/negative_reviews`); // Adjusted endpoint path
  return response.data;
};

/** Fetches a list of all module categories. */
export const getCategory = async () => {
  const response = await axios.get(`${API_URL}/modules/modules/categories`); // Adjusted endpoint path
  return response.data;
};

/** Fetches a list of all module teacher feedback recommendations. */
export const getTeacherFeedback = async () => {
  const response = await axios.get(`${API_URL}/modules/modules/teacher_feedback`); // Adjusted endpoint path
  return response.data;
};

/** Fetches a list of all module similar modules lists. */
export const getSimilarModules = async () => {
  const response = await axios.get(`${API_URL}/modules/modules/similar_modules`); // Adjusted endpoint path
  return response.data;
};

/** Fetches a list of all module topic lists. */
export const getTopics = async () => {
  const response = await axios.get(`${API_URL}/modules/modules/topics`); // Adjusted endpoint path
  return response.data;
};

/**
 * Fetches details for all modules, potentially filtered by name.
 * @param {string} [moduleNameFilter=''] - Optional substring to filter module names by.
 * @returns {Promise<Array<object>>} A promise resolving with a list of module details.
 * @throws {Error} Throws an error if the request fails.
 */
export const getAllModules = async (moduleNameFilter = '') => {
    try {
      // Construct the URL, adding the filter parameter if provided.
      const url = `${API_URL}/modules/modules_all${moduleNameFilter ? `?module_name=${encodeURIComponent(moduleNameFilter)}` : ''}`;
      const response = await axios.get(url, {
        withCredentials: true, // Send cookies if needed for authentication/session.
      });
      console.log(`Fetched all modules (filter: '${moduleNameFilter}'):`, response.data.length);
      return response.data; // Assuming the data is the array of modules.
    } catch (error) {
      console.error("Error fetching all modules:", error.response ? error.response.data : error.message);
      throw error; // Re-throw the error for handling by the caller.
    }
  };


// --- Selected and Recommended Modules ---

/**
 * Clears all modules from the logged-in user's selected modules list.
 * @returns {Promise<object>} A promise resolving with the response data (e.g., confirmation message).
 * @throws {Error} Throws an error if the request fails.
 */
export const clearSelectedModules = async () => {
  try {
    console.log("Clearing selected modules...");
    const response = await axios.delete(`${API_URL}/modules/selected/clear`, { withCredentials: true });
    console.log("Clear selected modules response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error clearing selected modules:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Clears all modules from the logged-in user's recommended modules list.
 * @returns {Promise<object>} A promise resolving with the response data (e.g., confirmation message).
 * @throws {Error} Throws an error if the request fails.
 */
export const clearRecommendedModules = async () => {
  try {
    console.log("Clearing recommended modules...");
    const response = await axios.delete(`${API_URL}/modules/recommended/clear`, { withCredentials: true });
    console.log("Clear recommended modules response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error clearing recommended modules:", error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Adds a list of modules to the logged-in user's recommended modules list.
 * Note: The backend endpoint might expect adding one at a time or handle lists differently.
 * Adjust based on backend implementation. This assumes backend handles a list under 'modules' key.
 * @param {Array<string>} modules - An array of module names to recommend.
 * @returns {Promise<object>} A promise resolving with the response data.
 * @throws {Error} Throws an error if the request fails.
 */
export const addRecommendedModules = async (modules) => {
    console.log("Adding recommended modules:", modules);
    // Assuming endpoint '/recommendations/recommended_add' can handle a list
    const response = await axios.post(
      `${API_URL}/recommendations/recommended_add`, // Verify this endpoint in the backend
      { modules: modules }, // Sending the list under the 'modules' key
      { withCredentials: true }
    );
    return response.data;
};

/**
 * Adds a single module to the logged-in user's selected modules list.
 * @param {string} moduleName - The name of the module to add to the selected list.
 * @returns {Promise<object>} A promise resolving with the response data.
 * @throws {Error} Throws an error if the request fails.
 */
export const addSelectedModules = async (moduleName) => {
    console.log(`Adding selected module: ${moduleName}`);
    // Sends a POST request to add the module to the user's selected list.
    const response = await axios.post(
      `${API_URL}/modules/selected_add`,
      { module_name: moduleName },
      { withCredentials: true }
    );
    return response.data;
};

/**
 * Fetches the list of selected module names for the currently logged-in user.
 * @returns {Promise<Array<string>>} A promise resolving with an array of selected module names. Returns empty array on error.
 */
export const getSelectedModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/selected_retrieve`, { withCredentials: true });
    console.log("Fetched selected modules:", response.data);
    // Ensure return value is an array.
    return Array.isArray(response.data?.selected_modules) ? response.data.selected_modules : [];
  } catch (error) {
    console.error("Error fetching selected modules:", error.response ? error.response.data : error.message);
    return [];
  }
};

/**
 * Fetches the list of recommended module names for the currently logged-in user.
 * @returns {Promise<Array<string>>} A promise resolving with an array of recommended module names. Returns empty array on error.
 */
export const getRecommendedModules = async () => {
  try {
    const response = await axios.get(`${API_URL}/modules/recommended_retrieve`, { withCredentials: true });
    console.log("Fetched recommended modules:", response.data);
    // Ensure return value is an array.
    return Array.isArray(response.data?.recommended_modules) ? response.data.recommended_modules : [];
  } catch (error) {
    console.error("Error fetching recommended modules:", error.response ? error.response.data : error.message);
    return [];
  }
};

/**
 * Removes a module from the logged-in user's selected modules list.
 * @param {string} moduleName - The name of the module to remove.
 * @returns {Promise<object>} A promise resolving with the response data.
 * @throws {Error} Throws an error if the request fails.
 */
export const removeSelectedModule = async (moduleName) => {
  console.log(`Removing selected module: ${moduleName}`);
  const response = await axios.delete(
    `${API_URL}/modules/selected_modules/remove`,
    {
      data: { module_name: moduleName },
      withCredentials: true
    }
  );
  return response.data;
};

/**
 * Removes a module from the logged-in user's recommended modules list.
 * @param {string} moduleName - The name of the module to remove.
 * @returns {Promise<object>} A promise resolving with the response data.
 * @throws {Error} Throws an error if the request fails.
 */
export const removeRecommendedModule = async (moduleName) => {
  console.log(`Removing recommended module: ${moduleName}`);
  const response = await axios.delete(
    `${API_URL}/modules/recommended_modules/remove`,
    {
      data: { module_name: moduleName },
      withCredentials: true
    }
  );
  return response.data;
};


// --- Recommendation Generation ---

/**
 * Sends user preferences to the backend to generate module recommendations for students.
 * @param {object} userPreferences - An object containing the user's preferences (e.g., priorities, selected categories, aspects, importance).
 * @returns {Promise<object>} A promise resolving with the recommendation results (e.g., list of recommended module names).
 * @throws {Error} Throws an error if the request fails.
 */
export const generateStudentModuleRecs = async (userPreferences) => {
  try {
    console.log("Sending request to generate student recommendations with preferences:", userPreferences);
    // Send user preferences in the POST request body.
    const response = await axios.post(
      `${API_URL}/recommendations/generate_recommendations_student`,
      userPreferences,
      { withCredentials: true }
    );
    console.log("Recommendation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error generating student recommendations:", error.response ? error.response.data : error.message);
    throw error; // Re-throw for caller handling.
  }
};


// --- Topic Data ---

/**
 * Fetches details for a specific topic within a specific module.
 * Uses the Fetch API instead of Axios for this specific function.
 * @param {string} moduleName - The name of the module.
 * @param {string} topic - The name of the topic within the module.
 * @returns {Promise<object|null>} A promise resolving with the topic details object, or null if an error occurs or topic not found.
 */
export const getTopicsByModule = async (moduleName, topic) => {
    try {
      // Construct the URL with query parameters for module name and topic.
      const url = `${API_URL}/modules/topics_modules?name=${encodeURIComponent(moduleName)}&topic=${encodeURIComponent(topic)}`;
      console.log(`Fetching topic details from: ${url}`);
      // Use Fetch API for this request.
      const response = await fetch(url, {
          // Add credentials option if cookies/sessions are needed via fetch
          // credentials: 'include'
      });

      // Check if the HTTP response status is OK (e.g., 200).
      if (!response.ok) {
        // Throw an error with the status text if response is not ok.
        throw new Error(`HTTP error! Status: ${response.status} - ${response.statusText}`);
      }
      // Parse the JSON response body.
      const data = await response.json();
      console.log("Fetched topic details:", data);
      return data;
    } catch (error) {
      // Log any errors that occur during the fetch process.
      console.error(`Error fetching topics for module "${moduleName}", topic "${topic}":`, error);
      // Return null to indicate failure.
      return null;
    }
  };

// --- User Preferences ---

/**
 * Saves user preferences to the backend.
 * @param {object} userPreferences - The preferences object to save.
 * @returns {Promise<object>} A promise resolving with the response data from the backend.
 * @throws {Error} Throws an error if the request fails.
 */
export const saveUserPreferences = async (userPreferences) => {
    try {
      console.log("Saving user preferences:", userPreferences);
      // Endpoint '/user/preferences/save' needs to exist on the backend.
      const response = await axios.post(`${API_URL}/user/preferences/save`, userPreferences, { withCredentials: true });
      console.log("Save preferences response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error saving preferences:", error.response ? error.response.data : error.message);
      throw error;
    }
  };

/**
 * Fetches user preferences from the backend.
 * @returns {Promise<object>} A promise resolving with the user preferences object.
 * @throws {Error} Throws an error if the request fails or preferences not found.
 */
export const fetchUserPreferences = async () => {
    try {
      console.log("Fetching user preferences...");
      // Endpoint '/user/preferences' needs to exist on the backend.
      const response = await axios.get(`${API_URL}/user/preferences`, { withCredentials: true });
      console.log("Retrieved User Preferences:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching preferences:", error.response ? error.response.data : error.message);
      throw error;
    }
  };