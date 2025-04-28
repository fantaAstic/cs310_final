/**
 * @fileoverview Login/Register Screen component for the application.
 * Allows users to either log in with existing credentials or sign up for a new account.
 * Handles form input, validation, API calls for login/registration,
 * and updates the global user state via UserContext upon success.
 */

import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { registerUser, loginUser } from '../api/apiService';
import { useNavigation } from '@react-navigation/native'; // Importing useNavigation hook
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider, useUser } from '../UserContext'; // Import the context

/**
 * LoginRegisterScreen Component.
 * Renders the UI for login and registration forms.
 */
const LoginRegisterScreen = () => {
  // Collect userData from the register form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isStudent, setIsStudent] = useState(true);
  const [yearOfStudy, setYearOfStudy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLogin, setIsLogin] = useState(false);
  const [open, setOpen] = useState(false);  // Initialise 'open' state for DropDownPicker
  

  // --- Context and Navigation ---
  // Access user state and the function to update it from UserContext
  const { user, setUser } = useUser(); // Access user and setUser from context
  const navigation = useNavigation(); // Use navigation hook to navigate

  /**
   * Handles the form submission for both login and registration.
   * Validates input, calls the appropriate API function, handles the response,
   * updates user state and AsyncStorage on success, and manages loading/error states.
   */
  const handleSubmit = async () => {
    if (!email || !password || (!isLogin && !name)) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setLoading(true);

    try {
      let response;
      // Log user data before making the request
      console.log('Collected user data:', {
        name,
        email,
        password,
        role: isStudent ? 'Student' : 'Teacher',
        year: isStudent ? yearOfStudy : null,
      });

      if (isLogin) {
        // Log login attempt
        console.log('Attempting login with email:', email);
        response = await loginUser({ email, password });
      } else {
        const userData = {
          name,
          email,
          password,
          role: isStudent ? 'Student' : 'Teacher',
          year: isStudent ? yearOfStudy : null,
        };
        // Log registration attempt
        console.log('Attempting registration with data:', userData);
        response = await registerUser(userData);
      }

      // Log the response after the request
      console.log('Response from API:', response);

      setLoading(false);

      // Check if the response is successful and handle accordingly
      if (response.success) {
        console.log("Login/Registration successful! Navigating to Dashboard.");

        // Update the user state with the response data
        // Update the user state with the response data, including the year
        const userData = {
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
          year: response.user.year,  // Include the 'year' here
        };

        // Save the user data to AsyncStorage
        await AsyncStorage.setItem('user', JSON.stringify(userData));

        // Set the user in the state (using the context)
        setUser(userData);

        // Navigate to the dashboard (or wherever you need) automatically
        // navigation.navigate('Dashboard');
      } else {
        // Log the failure message
        console.log("Login/Registration failed:", response.message);
        setErrorMessage(response.message || 'Something went wrong.');
      }
    } catch (error) {
      setLoading(false);
      // Log error
      console.error('Request failed:', error);
      setErrorMessage('Network error. Please try again later.');
    }
  };

  // --- Render Component UI ---
  return (
    <View style={styles.container}>
      {/* Title changes based on whether it's Login or Sign Up mode */}
      <Text style={styles.title}>{isLogin ? 'Login' : 'Sign Up'}</Text>

      {/* Display error messages if any */}
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}

      {/* Email Input */}
      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      {/* Password Input */}
      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      {/* Conditional Rendering for Registration Fields */}
      {!isLogin && (
        <>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={(text) => setName(text)}
          />
        </>
      )}

      {!isLogin && (
        <>
          {/* Teacher Fields */}
          <Text style={styles.label}>Are you a student or a teacher?</Text> {/* Role Selection (Student/Teacher) */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, isStudent ? styles.activeToggle : styles.inactiveToggle]}
              onPress={() => setIsStudent(true)}
            >
              <Text style={isStudent ? styles.activeToggleText : styles.inactiveToggleText}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, !isStudent ? styles.activeToggle : styles.inactiveToggle]}
              onPress={() => setIsStudent(false)}
            >
              <Text style={!isStudent ? styles.activeToggleText : styles.inactiveToggleText}>Teacher</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {!isLogin && isStudent && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Year of Study:</Text> 
          {/* Student Fields */}
          <DropDownPicker
            open={open}  // Bind the 'open' state here
            setOpen={setOpen}  // Use the 'setOpen' function to change 'open' state
            value={yearOfStudy}
            setValue={setYearOfStudy}
            items={[
              { label: 'First', value: 'First' },
              { label: 'Second', value: 'Second' },
              { label: 'Third', value: 'Third' },
              { label: 'Final', value: 'Final' },
            ]}
            placeholder="Select your year"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
          />
        </View>
      )}

      {/* Submit Buttons */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitButtonText}>
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Register'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
        <Text style={styles.toggleText}>
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Login'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeToggle: {
    backgroundColor: '#007BFF',
  },
  inactiveToggle: {
    backgroundColor: '#f0f0f0',
  },
  activeToggleText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inactiveToggleText: {
    color: '#000',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  dropdownContainer: {
    borderColor: '#ccc',
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleText: {
    color: '#0078d4',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
});

// Export the component
export default LoginRegisterScreen;
