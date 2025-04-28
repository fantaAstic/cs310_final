/**
 * @fileoverview Dashboard Screen component for the application.
 * Displays a list of modules relevant to the logged-in user (saved for students,
 * taught for teachers). Allows users to view module details, remove modules,
 * toggle dark mode, and log out.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Switch,
  Platform,
  Image,
  Appearance,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../UserContext';
import { logoutUser, removeSavedModule, removeTaughtModule, getSavedModules, getTaughtModules, getAllModules } from '../api/apiService';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
// Import vector icons
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * DashboardScreen Component.
 * Renders the main dashboard view based on the user's role.
 * Fetches and displays either saved or taught modules.
 */
const DashBoardScreen = () => {
  const { user, setUser } = useUser();
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [filteredModules, setFilteredModules] = useState([]);  // State for filtered modules
  const navigation = useNavigation();

  // useFocusEffect hook: Runs the effect whenever the screen comes into focus.
  // Useful for refetching data when the user navigates back to the screen.
  // Fetch and filter the modules based on the user role
  useFocusEffect(
    useCallback(() => {
      const fetchUserModules = async () => {
        try {
          let userModules = [];

          // Fetch user-specific modules based on role
          if (user?.role === 'Student') {
            userModules = await getSavedModules();
          } else if (user?.role === 'Teacher') {
            userModules = await getTaughtModules();
          }

          console.log("Fetched user modules:", userModules);

          // If the fetched user modules are not an array, default to an empty array
          if (!Array.isArray(userModules)) {
            console.warn("userModules is not an array! Defaulting to empty array.");
            userModules = [];
          }

          // Fetch all modules from the API (replace this with your actual API call)
          const allModules = await getAllModules();

          // Filter the modules based on the user's saved or taught modules
          const updatedModules = allModules.filter((mod) => userModules.includes(mod.name));

          // Update the filtered modules state
          setFilteredModules(updatedModules);
        } catch (error) {
          console.error("Error fetching user modules:", error);
          setFilteredModules([]);  // Reset to empty array on error
        }
      };

      fetchUserModules();
    }, [user])
  );

  /** Toggles the dark mode state. */
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  /** Handles the user logout process. */
  const handleLogout = async () => {  
    setUser(null);
  };

  /**
   * Navigates to the ModulePageScreen with details of the selected module.
   * @param {object} item - The module object selected by the user.
   */
  const handleVisitModulePage = (item) => {
    navigation.navigate('ModulePage', { module: item });
    console.log(item.analysis_refs);
  };

  /**
   * Handles the removal of a module from the user's list (saved or taught).
   * @param {string} moduleName - The name of the module to remove.
   */
  const handleRemoveModule = async (moduleName) => {
    try {
      // Handle removal based on user role
      if (user?.role === 'Student') {
        await removeSavedModule(moduleName);
      } else if (user?.role === 'Teacher') {
        await removeTaughtModule(moduleName);
      }

      // Remove the module from the displayed list
      setFilteredModules((prevModules) => prevModules.filter((mod) => mod.name !== moduleName));

    } catch (error) {
      console.error('Error removing module:', error);
    }
  };

    /**
     * Renders a single module card component within the FlatList.
     * @param {object} params - The parameters passed by FlatList.
     * @param {object} params.item - The module data for the current card.
     * @returns {JSX.Element} The JSX element representing the module card.
     */
    const renderModuleCard = ({ item }) => {
      const parsedTopics = typeof item.topics === 'string' ? JSON.parse(item.topics) : item.topics;
    
      // Determine the circle color based on outlook
      let circleColor;
      if (item.outlook === 'Positive') {
          circleColor = '#28a745';  // Green for Positive
      } else if (item.outlook === 'Neutral') {
          circleColor = '#fd7e14';  // Orange for Neutral
      } else {
          circleColor = '#dc3545';  // Red for Negative
      }
    
      return (
        <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
          <View style={styles.moduleHeader}>
            {/* Module Header: Outlook Circle and Title */}
            <View style={[styles.outlookCircle, { backgroundColor: circleColor }]} />
            <Text style={[styles.moduleName, darkMode ? styles.textDark : styles.textLight]}>
              {item.name}
            </Text>
          </View>
    
          {/* Module Details Sections with Icons */}
          <View style={styles.section}>
            <Icon name="bullseye" size={20} color={darkMode ? '#fff' : '#000'} />
            <Text style={darkMode ? styles.textDark : styles.textLight}>Outlook: {item.outlook}</Text>
          </View>
    
          <View style={styles.section}>
            <Icon name="thumbs-up" size={20} color={darkMode ? '#fff' : '#000'} />
            <Text style={darkMode ? styles.textDark : styles.textLight}>Positive Reviews: {item.positive}</Text>
          </View>
    
          <View style={styles.section}>
            <Icon name="thumbs-down" size={20} color={darkMode ? '#fff' : '#000'} />
            <Text style={darkMode ? styles.textDark : styles.textLight}>Negative Reviews: {item.negative}</Text>
          </View>
    
          <View style={styles.section}>
            <Icon name="tags" size={20} color={darkMode ? '#fff' : '#000'} />
            <Text style={darkMode ? styles.textDark : styles.textLight}>Module Category: {item.categories}</Text>
          </View>
    
          <View style={styles.section}>
            <Icon name="book" size={20} color={darkMode ? '#fff' : '#000'} />
            <Text style={darkMode ? styles.textDark : styles.textLight}>
              Review Topics: {Array.isArray(parsedTopics) ? parsedTopics.join(', ') : 'No topics available'}
            </Text>
          </View>
    
          {/* Highlighted summary */}
          <View style={[styles.summaryContainer, darkMode ? styles.summaryDark : styles.summaryLight]}>
            <Icon name="clipboard" size={20} color={darkMode ? '#fff' : '#000'} />
            <Text style={[styles.summary, darkMode ? styles.textDark : styles.textLight]}>
              Feedback Summary: {item.summary}
            </Text>
          </View>
    
          <TouchableOpacity style={styles.button} onPress={() => handleVisitModulePage(item)}>
            <Text style={styles.buttonText}>Visit Module Page</Text>
          </TouchableOpacity>
    
          {/* Conditionally render "Remove" button based on role */}
          {user?.role === 'Student' && (
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveModule(item.name)}>
              <Text style={styles.buttonText}>Remove from Saved</Text>
            </TouchableOpacity>
          )}
    
          {user?.role === 'Teacher' && (
            <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveModule(item.name)}>
              <Text style={styles.buttonText}>Remove from Taught</Text>
            </TouchableOpacity>
          )}
        </View>
      );
  };
  // Render the main screen layout.
  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      <View style={styles.header}>
        <View style={styles.logoPlaceholder}>
          <Image source={require('../images/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <Text style={[styles.headerTitle, darkMode ? styles.textDark : styles.textLight]}>
          {user?.role === 'Student' ? 'Saved Modules' : 'Taught Modules'}
        </Text>

        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="arrow-circle-left" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
      <FlatList
        data={filteredModules}
        keyExtractor={(item) => item.id}
        renderItem={renderModuleCard}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

// --- Styles ---
// StyleSheet definition for the component's UI elements.
// Includes styles for both light and dark modes.
const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: '#ffffff' },
  containerDark: { backgroundColor: '#121212' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  outlookCircle: {
    width: 50,
    height: 70,
    borderRadius: 5,
    marginRight: 10,
    marginBottom: 10,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'San Francisco' : 'Roboto',  },
  logoPlaceholder: { width: 100, height: 100, marginRight: 15 },
  logo: { width: '100%', height: '100%' },
  list: { padding: 20 },
  card: { borderRadius: 10, padding: 15, marginBottom: 15 },
  cardLight: { backgroundColor: '#f9f9f9' },
  cardDark: { backgroundColor: '#1f1f1f' },
  moduleName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryContainer: {
    backgroundColor: '#FFFAE3', // Highlighted background
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  summary: { fontSize: 14, marginBottom: 15 },
  summaryLight: { backgroundColor: '#FFFAE3' },
  summaryDark: { backgroundColor: '#333' },
  button: { backgroundColor: '#007BFF', borderRadius: 5, paddingVertical: 10, alignItems: 'center', marginBottom: 5 },
  removeButton: { backgroundColor: '#FF4500', borderRadius: 5, paddingVertical: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  textLight: { color: '#000' },
  textDark: { color: '#fff' },
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
    fontSize: 20, // Icon size
    color: '#fff', // Icon color (white)
    marginRight: 10, // Space between icon and text
  },
  logoutText: {
    color: '#fff', // Text color (white)
    fontSize: 12, // Text size
    fontWeight: 'bold', // Bold text
  },
});

// Export the component for use in the application
export default DashBoardScreen;
