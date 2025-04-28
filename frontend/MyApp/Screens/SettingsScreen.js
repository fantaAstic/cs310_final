/**
 * @fileoverview Settings Screen Component.
 * Allows the logged-in user to view and update their profile details,
 * including name, role (Student/Teacher), year of study (if student),
 * and institution email. Also provides a logout button.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,         // Component for text input
  TouchableOpacity,  // Component for touch interactions
  Alert,             // API for showing native alert dialogs
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // Dropdown component
import { useUser } from '../UserContext'; // Custom hook for accessing user context
import { updateUserDetails } from '../api/apiService'; // API function to update user details
import Icon from 'react-native-vector-icons/FontAwesome'; // Icon library

/**
 * SettingsScreen Component.
 * Renders the form for updating user profile information.
 *
 * @param {object} props - Component props provided by React Navigation.
 * @param {object} props.navigation - Navigation object (currently unused but available).
 * @returns {JSX.Element} The settings screen UI.
 */
const SettingsScreen = ({ navigation }) => {
  // Access user state and setter function from UserContext
  const { user, setUser } = useUser();

  // --- State Variables ---
  // Initialize form fields with current user data from context, providing fallbacks.
  const [name, setName] = useState(user?.name || ''); // User's name
  // Determine initial student status based on user role or default to true.
  // Note: Backend might use 'role' instead of 'is_student'. Adjust logic if needed.
  const [isStudent, setIsStudent] = useState(user?.role === 'Student' ?? true);
  // Initialize year of study from user context or null.
  const [yearOfStudy, setYearOfStudy] = useState(user?.year || null); // Use 'year' from context
  // Initialize email from user context or empty string.
  // Note: Backend identifies user by this email for updates. Ensure it's correct.
  const [institutionEmail, setInstitutionEmail] = useState(user?.email || ''); // Use 'email' from context
  // State to control the dropdown picker's open/closed status.
  const [open, setOpen] = useState(false);

  /** Handles the user logout process by clearing the user context state. */
  const handleLogout = () => {
    console.log("Logging out user locally.");
    setUser(null); // Clear context state, triggering navigation to Login screen
  };

  /**
   * Handles the submission of updated user details.
   * Validates input, calls the API service to update details,
   * shows success/error alerts, and optionally updates the user context.
   */
  const handleUpdateDetails = async () => {
    // Basic validation: ensure the identifying email is present.
    if (!institutionEmail) {
      console.error("Institution email is missing. Cannot update details.");
      Alert.alert('Error', 'Institution email is required to update details.');
      return; // Stop the update process
    }

    try {
      // Log the data being sent for debugging.
      console.log('Updating user details with:', {
          institutionEmail, // Identifier sent to backend
          name,
          // The backend expects role, not is_student flag based on API call structure
          role: isStudent ? 'Student' : 'Teacher',
          year_of_study: isStudent ? yearOfStudy : null, // Send year only if student
      });

      // Call the API function to update user details.
      // Note: The API function `updateUserDetails` needs adjustment if it expects role/year differently.
      // The current call signature seems slightly different from the form state.
      const updateResponse = await updateUserDetails(
        institutionEmail, // Identifying email
        name,             // New name
        isStudent,        // Current component state (boolean) - Needs mapping to 'role' if backend expects that
        yearOfStudy       // Current component state
        // The original call had `institutionEmail` passed again here, which might be redundant.
      );

      // Check if the update was successful (based on API response structure).
      // Assuming `updateResponse` indicates success somehow (e.g., `.success` flag or status code handled by Axios).
      // This example assumes a simple success message is returned.
      console.log("Update details response:", updateResponse);
      Alert.alert('Success', updateResponse.message || 'Your details have been updated.');

      // --- Update User Context (Optional but recommended) ---
      // Update the global user state with the newly saved details.
      setUser({
        ...user, // Keep existing user data (like ID)
        name: name,
        role: isStudent ? 'Student' : 'Teacher', // Update role based on selection
        year: isStudent ? yearOfStudy : null, // Update year
        email: institutionEmail, // Update email if it was changed (though unlikely here)
      });
      console.log("User context updated with new details.");

    } catch (error) {
      // Handle errors during the API call.
      console.error('Error updating details:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Failed to update details. Please try again later.');
    }
  };

  // --- Render Component UI ---
  return (
    <View style={styles.container}>
      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="sign-out" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Screen Title */}
      <Text style={styles.title}>Edit Your Details</Text>

      {/* Name Input Field */}
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name} // Controlled component: value linked to state
        onChangeText={(text) => setName(text)} // Update state on text change
      />

      {/* Role Selection (Student/Teacher) */}
      <Text style={styles.label}>Are you a student or a teacher?</Text>
      <View style={styles.toggleContainer}>
        {/* Student Button */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isStudent ? styles.activeToggle : styles.inactiveToggle, // Apply active/inactive styles
          ]}
          onPress={() => setIsStudent(true)} // Set role to Student
        >
          <Text style={isStudent ? styles.activeToggleText : styles.inactiveToggleText}>
            Student
          </Text>
        </TouchableOpacity>
        {/* Teacher Button */}
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isStudent ? styles.activeToggle : styles.inactiveToggle, // Apply active/inactive styles
          ]}
          onPress={() => setIsStudent(false)} // Set role to Teacher
        >
          <Text style={!isStudent ? styles.activeToggleText : styles.inactiveToggleText}>
            Teacher
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Rendering for Student-Specific Fields */}
      {isStudent && ( // Only show Year of Study dropdown if user is a student
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Year of Study:</Text>
          <DropDownPicker
            open={open} // Control dropdown visibility
            setOpen={setOpen} // Function to toggle dropdown visibility
            value={yearOfStudy} // Currently selected value from state
            setValue={setYearOfStudy} // Function to update state on selection
            items={[ // List of available options
              { label: 'First', value: 'First' },
              { label: 'Second', value: 'Second' },
              { label: 'Third', value: 'Third' },
              { label: 'Final', value: 'Final' },
            ]}
            placeholder="Select your year" // Placeholder text when nothing is selected
            style={styles.dropdown} // Style for the dropdown input itself
            dropDownContainerStyle={styles.dropdownContainer} // Style for the options container
            zIndex={1000} // Ensure dropdown appears above other elements
            listMode="SCROLLVIEW" // Use ScrollView if list is long
          />
        </View>
      )}

      {/* Institution Email Input Field */}
      {/* if users should not change their identifying email via this form. */}
      <Text style={styles.label}>Institution Email:</Text>
      <TextInput
        style={[styles.input, styles.emailInput]} // Add specific style if needed
        placeholder="Enter your institutional email"
        keyboardType="email-address" // Set appropriate keyboard type
        autoCapitalize="none"
        value={institutionEmail} // Controlled component
        onChangeText={(text) => setInstitutionEmail(text)} // Update state
        // editable={false} // Uncomment to make the email read-only
      />

      {/* Update Details Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateDetails}>
        <Text style={styles.updateButtonText}>Update Details</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---
// StyleSheet definition for the component's UI elements.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up full screen height
    padding: 20, // Padding around the content
    backgroundColor: '#fff', // Default white background
  },
  title: {
    fontSize: 24, // Large title size
    fontWeight: 'bold',
    marginBottom: 30, // Increased space below title
    textAlign: 'center',
    color: '#333', // Darker title color
  },
  label: {
    fontSize: 14, // Standard label size
    fontWeight: '600', // Semi-bold
    marginBottom: 8, // Space below label
    color: '#555', // Medium gray text color
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc', // Light gray border
    borderRadius: 8, // Rounded corners
    paddingVertical: 12, // Vertical padding
    paddingHorizontal: 15, // Horizontal padding
    marginBottom: 18, // Space below input fields
    fontSize: 16,
    backgroundColor: '#f9f9f9', // Light background for input
  },
  emailInput: { // Specific style for email input if needed (e.g., if read-only)
     // backgroundColor: '#e9ecef', // Example: gray background if read-only
     // color: '#495057',
  },
  inputContainer: { // Container specifically for the dropdown to manage spacing
    marginBottom: 18, // Match spacing of other inputs
  },
  toggleContainer: {
    flexDirection: 'row', // Arrange Student/Teacher buttons horizontally
    marginBottom: 20, // Space below the toggle buttons
  },
  toggleButton: {
    flex: 1, // Make buttons share space equally
    paddingVertical: 12, // Button padding
    alignItems: 'center',
    borderRadius: 8, // Rounded corners
    borderWidth: 1, // Add border for definition
    marginHorizontal: 5, // Space between buttons
  },
  activeToggle: {
    backgroundColor: '#007BFF', // Blue background for the active button
    borderColor: '#007BFF',
  },
  inactiveToggle: {
    backgroundColor: '#f0f0f0', // Light gray background for the inactive button
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
  dropdown: { // Style for the dropdown picker input box
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
    minHeight: 50, // Ensure consistent height with TextInput
  },
  dropdownContainer: { // Style for the container holding dropdown options
    borderColor: '#ccc',
    borderRadius: 8,
  },
  updateButton: {
    marginTop: 25, // More space above update button
    backgroundColor: '#28a745', // Green color for update button
    paddingVertical: 14, // Button padding
    borderRadius: 8, // Rounded corners
    alignItems: 'center',
    shadowColor: '#000', // Subtle shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  updateButtonText: {
    color: '#fff', // White text on button
    fontSize: 16, // Button text size
    fontWeight: 'bold',
  },
  logoutButton: {
    position: 'absolute', // Position absolutely
    top: Platform.OS === 'android' ? 15 : 40, // Adjust based on platform status bar height
    left: 15,
    zIndex: 10, // Ensure it's above other elements if necessary
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 117, 125, 0.8)', // Semi-transparent gray
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15, // Rounded button
  },
  logoutIcon: {
    fontSize: 14, // Icon size
    color: '#fff', // Icon color
    marginRight: 5, // Space between icon and text
  },
  logoutText: {
    color: '#fff', // Text color
    fontSize: 12, // Text size
    fontWeight: 'bold',
  },
});

// Export the component for use in navigation
export default SettingsScreen;