/**
 * @fileoverview Login/Register Screen component for the application.
 * Allows users to either log in with existing credentials or sign up for a new account.
 * Handles form input, validation, API calls for login/registration,
 * and updates the global user state via UserContext upon success.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator, // Used to show loading state
  Platform // Although imported, not directly used in this snippet
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // Component for dropdown selection
import { registerUser, loginUser } from '../api/apiService'; // API functions for authentication
import { useNavigation } from '@react-navigation/native'; // Hook for accessing navigation actions
import AsyncStorage from '@react-native-async-storage/async-storage'; // For storing user data locally
import { useUser } from '../UserContext'; // Custom hook to access user context

/**
 * LoginRegisterScreen Component.
 * Renders the UI for login and registration forms.
 */
const LoginRegisterScreen = () => {
  // --- State Variables ---
  // State for user input fields in the registration form
  const [name, setName] = useState(''); // User's full name
  const [email, setEmail] = useState(''); // User's email address
  const [password, setPassword] = useState(''); // User's password
  const [isStudent, setIsStudent] = useState(true); // Toggle between Student/Teacher role (true = Student)
  const [yearOfStudy, setYearOfStudy] = useState(null); // Selected year of study (for students)
  // State for managing component behavior
  const [loading, setLoading] = useState(false); // Indicates if an API request is in progress
  const [errorMessage, setErrorMessage] = useState(''); // Stores error messages to display to the user
  const [isLogin, setIsLogin] = useState(false); // Toggles between Login and Sign Up modes (false = Sign Up)
  const [open, setOpen] = useState(false); // State for controlling the DropDownPicker's open/closed status

  // --- Context and Navigation ---
  // Access user state and the function to update it from UserContext
  const { setUser } = useUser();
  // Get navigation object to navigate to other screens upon successful login/registration
  const navigation = useNavigation(); // Note: Navigation isn't explicitly used after login/signup in handleSubmit anymore

  /**
   * Handles the form submission for both login and registration.
   * Validates input, calls the appropriate API function, handles the response,
   * updates user state and AsyncStorage on success, and manages loading/error states.
   */
  const handleSubmit = async () => {
    // Basic input validation
    if (!email || !password || (!isLogin && !name)) {
      setErrorMessage('Please fill out all required fields.');
      return; // Stop submission if validation fails
    }

    setErrorMessage(''); // Clear previous error messages
    setLoading(true); // Set loading state to true

    try {
      let response; // Variable to store the API response

      // Log user data before making the API request for debugging
      console.log('Submitting form data:', {
        name: isLogin ? undefined : name, // Only include name for registration
        email,
        password,
        role: isLogin ? undefined : (isStudent ? 'Student' : 'Teacher'), // Only include role for registration
        year: isLogin ? undefined : (isStudent ? yearOfStudy : null), // Only include year for registration
      });

      // Determine whether to call login or register API based on `isLogin` state
      if (isLogin) {
        // Log the login attempt
        console.log('Attempting login with email:', email);
        // Call the login API function
        response = await loginUser({ email, password });
      } else {
        // Prepare user data object for registration
        const userData = {
          name,
          email,
          password,
          role: isStudent ? 'Student' : 'Teacher', // Determine role based on state
          year: isStudent ? yearOfStudy : null, // Include year only if student
        };
        // Log the registration attempt
        console.log('Attempting registration with data:', userData);
        // Call the register API function
        response = await registerUser(userData);
      }

      // Log the received API response for debugging
      console.log('Response from API:', response);

      setLoading(false); // Set loading state back to false

      // --- Handle API Response ---
      // Check if the API call was successful (based on `response.success` flag)
      if (response && response.success && response.user) {
        console.log("Login/Registration successful!");

        // Prepare the user data object to be stored and set in context
        const userDataToStore = {
          id: response.user.id, // Assuming backend returns id
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          year: response.user.year, // Include year if provided by backend
        };

        // Persist user data in AsyncStorage for session persistence
        await AsyncStorage.setItem('user', JSON.stringify(userDataToStore));
        console.log('User data saved to AsyncStorage.');

        // Update the global user state using the context's setUser function
        setUser(userDataToStore);
        console.log('User state updated in context.');

        // Navigation logic is now handled by the root App component based on the user state change.
        // navigation.navigate('Dashboard'); // No longer needed here directly

      } else {
        // If the API response indicates failure, display the error message
        console.log("Login/Registration failed:", response?.message || 'Unknown error');
        setErrorMessage(response?.message || 'Login/Registration failed. Please check your details.');
      }
    } catch (error) {
      // Handle network errors or other exceptions during the API call
      setLoading(false); // Ensure loading is turned off on error
      console.error('API request failed:', error.response ? error.response.data : error.message); // Log detailed error
      setErrorMessage('An error occurred. Please check your network connection and try again.'); // Set a user-friendly error message
    }
  };

  // --- Render Component UI ---
  return (
    <View style={styles.container}>
      {/* Title changes based on whether it's Login or Sign Up mode */}
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

      {/* Display error messages if any */}
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      {/* Email Input */}
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address" // Set keyboard type for email
        autoCapitalize="none" // Prevent auto-capitalization
        value={email}
        onChangeText={(text) => setEmail(text)} // Update email state on change
      />

      {/* Password Input */}
      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry // Hide password characters
        value={password}
        onChangeText={(text) => setPassword(text)} // Update password state on change
      />

      {/* Conditional Rendering for Registration Fields */}
      {!isLogin && ( // Show these fields only when in Sign Up mode
        <>
          {/* Name Input */}
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={(text) => setName(text)} // Update name state on change
          />

          {/* Role Selection (Student/Teacher) */}
          <Text style={styles.label}>Are you a student or a teacher?</Text>
          <View style={styles.toggleContainer}>
            {/* Student Button */}
            <TouchableOpacity
              style={[styles.toggleButton, isStudent ? styles.activeToggle : styles.inactiveToggle]}
              onPress={() => setIsStudent(true)} // Set role to Student
            >
              <Text style={isStudent ? styles.activeToggleText : styles.inactiveToggleText}>Student</Text>
            </TouchableOpacity>
            {/* Teacher Button */}
            <TouchableOpacity
              style={[styles.toggleButton, !isStudent ? styles.activeToggle : styles.inactiveToggle]}
              onPress={() => setIsStudent(false)} // Set role to Teacher
            >
              <Text style={!isStudent ? styles.activeToggleText : styles.inactiveToggleText}>Teacher</Text>
            </TouchableOpacity>
          </View>

          {/* Year of Study Dropdown (only for Students) */}
          {isStudent && (
            <View style={styles.inputContainer} /* Use inputContainer for consistent spacing */ >
              <Text style={styles.label}>Year of Study:</Text>
              <DropDownPicker
                open={open} // Control dropdown visibility
                setOpen={setOpen} // Function to toggle dropdown visibility
                value={yearOfStudy} // Currently selected value
                setValue={setYearOfStudy} // Function to update selected value state
                items={[ // Options available in the dropdown
                  { label: 'First', value: 'First' },
                  { label: 'Second', value: 'Second' },
                  { label: 'Third', value: 'Third' },
                  { label: 'Final', value: 'Final' },
                ]}
                placeholder="Select your year"
                style={styles.dropdown} // Style for the dropdown input itself
                dropDownContainerStyle={styles.dropdownContainer} // Style for the dropdown options container
                zIndex={1000} // Ensure dropdown appears above other elements
                listMode="SCROLLVIEW" // Use ScrollView for dropdown items if needed
              />
            </View>
          )}
        </>
      )}

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.submitButton, loading ? styles.submitButtonDisabled : null]} // Change style when loading
        onPress={handleSubmit}
        disabled={loading} // Disable button while loading
      >
        {loading ? (
          // Show loading indicator if loading
          <ActivityIndicator color="#fff" />
        ) : (
          // Show button text based on mode (Login/Register)
          <Text style={styles.submitButtonText}>
            {isLogin ? 'Login' : 'Register'}
          </Text>
        )}
      </TouchableOpacity>

      {/* Toggle between Login and Sign Up modes */}
      <TouchableOpacity onPress={() => {
          setIsLogin(!isLogin); // Toggle the mode
          setErrorMessage(''); // Clear errors when switching modes
        }}>
        <Text style={styles.toggleText}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---
// StyleSheet definition for the component's UI elements.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up full screen height
    padding: 25, // Add padding around the content
    justifyContent: 'center', // Center content vertically
    backgroundColor: '#ffffff', // White background
  },
  title: {
    fontSize: 28, // Larger title
    fontWeight: 'bold',
    marginBottom: 30, // More space below title
    textAlign: 'center',
    color: '#333', // Darker text color
  },
  label: {
    fontSize: 14, // Slightly smaller label
    fontWeight: '600', // Semi-bold label
    marginBottom: 8, // Space below label
    color: '#555', // Medium gray text color
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc', // Light gray border
    borderRadius: 8, // More rounded corners
    paddingVertical: 12, // More vertical padding
    paddingHorizontal: 15, // More horizontal padding
    marginBottom: 18, // Consistent spacing below inputs
    fontSize: 16,
    backgroundColor: '#f9f9f9', // Light background for input
  },
  inputContainer: { // Added style for consistent margin below dropdown
    marginBottom: 18,
  },
  toggleContainer: {
    flexDirection: 'row', // Arrange buttons horizontally
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1, // Make buttons share space equally
    paddingVertical: 12, // Consistent padding
    alignItems: 'center',
    borderRadius: 8, // Match input border radius
    borderWidth: 1, // Add border for clarity
    borderColor: '#ccc',
  },
  activeToggle: {
    backgroundColor: '#007BFF', // Blue for active state
    borderColor: '#007BFF',
  },
  inactiveToggle: {
    backgroundColor: '#f0f0f0', // Light gray for inactive state
    borderColor: '#ccc',
  },
  activeToggleText: {
    color: '#fff', // White text for active button
    fontWeight: 'bold',
    fontSize: 14,
  },
  inactiveToggleText: {
    color: '#555', // Gray text for inactive button
    fontWeight: '600',
    fontSize: 14,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8, // Match input style
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9', // Match input background
    minHeight: 50, // Ensure consistent height
  },
  dropdownContainer: {
    borderColor: '#ccc', // Border for the dropdown options list
    borderRadius: 8,
  },
  submitButton: {
    marginTop: 15, // Space above submit button
    backgroundColor: '#28a745', // Green color for submit button
    paddingVertical: 14, // Button padding
    borderRadius: 8, // Match input radius
    alignItems: 'center',
    shadowColor: '#000', // Add subtle shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#a5d6a7', // Lighter green when disabled
  },
  submitButtonText: {
    color: '#fff', // White text on button
    fontSize: 16, // Button text size
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#007BFF', // Blue color for the toggle link
    marginTop: 15, // Space above toggle link
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#dc3545', // Red color for error messages
    fontSize: 14,
    marginBottom: 15, // Space below error message
    textAlign: 'center',
    fontWeight: '600',
  },
});

// Export the component for use in the application's navigation structure
export default LoginRegisterScreen;