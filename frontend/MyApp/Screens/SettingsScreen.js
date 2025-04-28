/**
 * @fileoverview Settings Screen Component.
 * Allows the logged-in user to view and update their profile details,
 * including name, role (Student/Teacher), year of study (if student),
 * and institution email. Also provides a logout button.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useUser } from '../UserContext';  // Import the user context
import { updateUserDetails } from '../api/apiService'; // Import the update function
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * SettingsScreen Component.
 * Renders the form for updating user profile information.
 *
 * @param {object} props - Component props provided by React Navigation.
 * @param {object} props.navigation - Navigation object (currently unused but available).
 * @returns {JSX.Element} The settings screen UI.
 */
const SettingsScreen = ({ navigation }) => {
  const { user, setUser } = useUser(); // Access user and setUser from context

  const [name, setName] = useState(user?.name || ''); // Initialize with current user name
  const [isStudent, setIsStudent] = useState(user?.is_student ?? true); // Default to student
  const [yearOfStudy, setYearOfStudy] = useState(user?.year_of_study || null); // Initialize year of study
  const [institutionEmail, setInstitutionEmail] = useState(user?.institution_email || ''); // Initialize email
  const [open, setOpen] = useState(false); // Dropdown state

  const handleLogout = () => {
    setUser(null); // Log out and clear user data
  };

  const handleUpdateDetails = async () => {
    if (!institutionEmail) {
      console.error("Institution email is missing");
      return;
    }

    try {
      console.log(user);  // Check if user object contains id
      const updateResponse = await updateUserDetails(
      institutionEmail,   // Use institutionEmail instead of user.id
      name,
      isStudent,
      yearOfStudy,
      institutionEmail
      );
      Alert.alert('Success', 'Your details have been updated.');

      // Optionally update the user context with the new details
      setUser({
        ...user,
        name,
        is_student: isStudent,
        year_of_study: yearOfStudy,
        institution_email: institutionEmail,
      });
    } catch (error) {
      console.error('Error updating details:', error);
      Alert.alert('Error', 'Failed to update details. Please try again later.');
    }
  };

  // --- Render Component UI ---
  return (
    <View style={styles.container}>
      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="arrow-circle-left" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={styles.title}>Edit Your Details</Text>

      {/* Name Input */}
      <Text style={styles.label}>Name:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        onChangeText={(text) => setName(text)}
      />

      {/* Student/Teacher Toggle */}
      <Text style={styles.label}>Are you a student or a teacher?</Text>
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            isStudent ? styles.activeToggle : styles.inactiveToggle,
          ]}
          onPress={() => setIsStudent(true)}
        >
          <Text style={isStudent ? styles.activeToggleText : styles.inactiveToggleText}>
            Student
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !isStudent ? styles.activeToggle : styles.inactiveToggle,
          ]}
          onPress={() => setIsStudent(false)}
        >
          <Text style={!isStudent ? styles.activeToggleText : styles.inactiveToggleText}>
            Teacher
          </Text>
        </TouchableOpacity>
      </View>

      {/* Conditional Inputs for Students */}
      {isStudent ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Year of Study:</Text>
          <DropDownPicker
            open={open}
            setOpen={setOpen}
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
      ) : null}

      {/* Institution Email Input */}
      <Text style={styles.label}>Institution Email:</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your institutional email"
        keyboardType="email-address"
        value={institutionEmail}
        onChangeText={(text) => setInstitutionEmail(text)}
      />

      {/* Update Details Button */}
      <TouchableOpacity style={styles.updateButton} onPress={handleUpdateDetails}>
        <Text style={styles.updateButtonText}>Update Details</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  inputContainer: {
    marginBottom: 20,
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
  updateButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row', // Align icon and text horizontally
    alignItems: 'center', // Center the icon and text vertically
    backgroundColor: '#FF6347', // Button color (red or orange)
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 100,
  },
  logoutIcon: {
    fontSize: 20,
    color: '#fff',
    marginRight: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

// export component
export default SettingsScreen;
