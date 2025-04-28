/**
 * @fileoverview Dashboard Screen component for the application.
 * Displays a list of modules relevant to the logged-in user (saved for students,
 * taught for teachers). Allows users to view module details, remove modules,
 * toggle dark mode, and log out.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,          // Component for rendering lists efficiently
  TouchableOpacity,  // Component for making views respond properly to touches
  Switch,            // Component for rendering a boolean input (toggle)
  Platform,          // Module for accessing platform-specific constants and APIs
  Image,             // Component for displaying images
  Appearance,        // Module for accessing the user's preferred color scheme (light/dark)
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Hooks for navigation access and screen focus events
import { useUser } from '../UserContext'; // Custom hook to access user context (state and setter)
import {
  logoutUser,             // API function to log out the user (potentially clearing session on backend)
  removeSavedModule,      // API function to remove a module from the student's saved list
  removeTaughtModule,     // API function to remove a module from the teacher's taught list
  getSavedModules,        // API function to fetch the student's saved modules
  getTaughtModules,       // API function to fetch the teacher's taught modules
  getAllModules,          // API function to fetch all available modules
} from '../api/apiService'; // Import API service functions

// Import vector icons for UI elements
import Icon from 'react-native-vector-icons/FontAwesome'; // Using FontAwesome icon set

/**
 * DashboardScreen Component.
 * Renders the main dashboard view based on the user's role.
 * Fetches and displays either saved or taught modules.
 */
const DashBoardScreen = () => {
  // Get user state and setter from UserContext
  const { user, setUser } = useUser();
  // State for managing dark mode, initialized based on system preference
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  // State to hold the list of modules to be displayed (filtered based on user role)
  const [filteredModules, setFilteredModules] = useState([]);
  // Hook to get the navigation object for navigating between screens
  const navigation = useNavigation();

  // useFocusEffect hook: Runs the effect whenever the screen comes into focus.
  // Useful for refetching data when the user navigates back to the screen.
  useFocusEffect(
    // useCallback ensures the fetch function is memoized and doesn't change on every render
    // unless its dependencies (like `user`) change.
    useCallback(() => {
      /** Fetches all modules and filters them based on the user's role and saved/taught lists. */
      const fetchUserModules = async () => {
        // Guard clause: If no user is logged in, do nothing.
        if (!user) {
          setFilteredModules([]); // Clear modules if user logs out while on screen
          return;
        }

        try {
          let userModuleNames = []; // Initialize list to store names of user's modules

          // Fetch the list of module *names* relevant to the user's role.
          if (user.role === 'Student') {
            userModuleNames = await getSavedModules(); // Fetch saved module names
          } else if (user.role === 'Teacher') {
            userModuleNames = await getTaughtModules(); // Fetch taught module names
          }

          console.log(`Fetched ${user.role}'s module names:`, userModuleNames);

          // Validate that the fetched module names form an array.
          if (!Array.isArray(userModuleNames)) {
            console.warn("Fetched user module names is not an array! Defaulting to empty array.");
            userModuleNames = [];
          }

          // Fetch the detailed data for *all* modules available in the system.
          const allModules = await getAllModules(); // This returns full module objects
          console.log(`Fetched all ${allModules.length} modules.`);

          // Filter the list of all modules to include only those whose names
          // are present in the user's specific list (saved or taught).
          const updatedModules = allModules.filter((mod) => userModuleNames.includes(mod.name));
          console.log(`Filtered modules to display: ${updatedModules.length} modules.`);

          // Update the component's state with the filtered list of module objects.
          setFilteredModules(updatedModules);
        } catch (error) {
          // Log any errors during the fetching or filtering process.
          console.error("Error fetching or filtering user modules:", error);
          // Reset the filtered modules list to empty in case of an error.
          setFilteredModules([]);
        }
      };

      // Execute the fetch function when the screen focuses or the user changes.
      fetchUserModules();
    }, [user]) // Dependency array: Re-run effect if the `user` object changes.
  );

  /** Toggles the dark mode state. */
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev); // Update state based on the previous value
  };

  /** Handles the user logout process. */
  const handleLogout = async () => {
    // try {
    //   await logoutUser(); // Call backend API to invalidate session (optional but recommended)
    // } catch (error) {
    //   console.error("Error calling logout API:", error); // Log API error but proceed with local logout
    // } finally {
    // Clear the user state in the context, triggering navigation back to login screen.
    setUser(null);
    // Optionally clear AsyncStorage user data here as well
    // await AsyncStorage.removeItem('user');
    // }
    console.log("Logging out user locally.");
    setUser(null); // Simply clear local user state for now
  };

  /**
   * Navigates to the ModulePageScreen with details of the selected module.
   * @param {object} item - The module object selected by the user.
   */
  const handleVisitModulePage = (item) => {
    console.log(`Navigating to Module Page for: ${item.name}`);
    console.log("Analysis Refs:", item.analysis_refs); // Log analysis references
    // Navigate to the 'ModulePage' route, passing the module object as a parameter.
    navigation.navigate('ModulePage', { module: item });
  };

  /**
   * Handles the removal of a module from the user's list (saved or taught).
   * @param {string} moduleName - The name of the module to remove.
   */
  const handleRemoveModule = async (moduleName) => {
    console.log(`Attempting to remove module: ${moduleName} for user role: ${user?.role}`);
    try {
      // Call the appropriate API function based on the user's role.
      if (user?.role === 'Student') {
        await removeSavedModule(moduleName); // API call for students
      } else if (user?.role === 'Teacher') {
        await removeTaughtModule(moduleName); // API call for teachers
      }

      // Update the local state to remove the module from the displayed list immediately.
      setFilteredModules((prevModules) =>
        prevModules.filter((mod) => mod.name !== moduleName)
      );
      console.log(`Module ${moduleName} removed successfully from UI.`);

    } catch (error) {
      // Log any errors that occur during the removal process.
      console.error(`Error removing module '${moduleName}':`, error);
      // Optionally show an error message to the user here.
    }
  };

  /**
   * Renders a single module card component within the FlatList.
   * @param {object} params - The parameters passed by FlatList.
   * @param {object} params.item - The module data for the current card.
   * @returns {JSX.Element} The JSX element representing the module card.
   */
  const renderModuleCard = ({ item }) => {
    // Parse the 'topics' string (assumed JSON) into an array if it's a string.
    // Provides fallback if 'topics' is already an array or invalid.
    let parsedTopics = [];
    try {
      parsedTopics = typeof item.topics === 'string' ? JSON.parse(item.topics) : (item.topics || []);
      if (!Array.isArray(parsedTopics)) parsedTopics = []; // Ensure it's an array
    } catch (e) {
      console.error(`Failed to parse topics for module ${item.name}:`, e);
      parsedTopics = []; // Default to empty array on parse error
    }


    // Determine the color for the outlook indicator circle based on the 'outlook' value.
    let circleColor;
    switch (item.outlook?.toLowerCase()) { // Use lowercase for case-insensitive matching
      case 'positive':
        circleColor = '#28a745'; // Green
        break;
      case 'neutral':
        circleColor = '#fd7e14'; // Orange
        break;
      case 'negative':
        circleColor = '#dc3545'; // Red
        break;
      default:
        circleColor = '#6c757d'; // Gray for unknown/default
    }

    // Return the JSX structure for the module card.
    return (
      <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        {/* Module Header: Outlook Circle and Title */}
        <View style={styles.moduleHeader}>
          <View style={[styles.outlookCircle, { backgroundColor: circleColor }]} />
          <Text style={[styles.moduleName, darkMode ? styles.textDark : styles.textLight]}>
            {item.name}
          </Text>
        </View>

        {/* Module Details Sections with Icons */}
        <View style={styles.section}>
          <Icon name="bullseye" size={18} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Outlook: {item.outlook || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Icon name="thumbs-up" size={18} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Positive Reviews: {item.positive || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Icon name="thumbs-down" size={18} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Negative Reviews: {item.negative || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Icon name="tags" size={18} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Category: {item.categories || 'N/A'}</Text>
        </View>

        <View style={styles.section}>
          <Icon name="book" size={18} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]} numberOfLines={2} ellipsizeMode="tail">
            Topics: {parsedTopics.length > 0 ? parsedTopics.join(', ') : 'No topics listed'}
          </Text>
        </View>

        {/* Highlighted Summary Section */}
        <View style={[styles.summaryContainer, darkMode ? styles.summaryDark : styles.summaryLight]}>
          <Icon name="clipboard" size={18} color={darkMode ? '#ccc' : '#333'} style={styles.iconStyle} />
          <Text style={[styles.summary, darkMode ? styles.textDark : styles.textLight]}>
            Summary: {item.summary || 'No summary available.'}
          </Text>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity style={styles.button} onPress={() => handleVisitModulePage(item)}>
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>

        {/* Conditional Remove Button based on User Role */}
        {user?.role === 'Student' && (
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveModule(item.name)}>
             <Icon name="trash" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Remove Saved</Text>
          </TouchableOpacity>
        )}
        {user?.role === 'Teacher' && (
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveModule(item.name)}>
             <Icon name="trash" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Remove Taught</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Render the main screen layout.
  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      {/* Header Section: Logo, Title, Dark Mode Toggle */}
      <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
        <View style={styles.logoPlaceholder}>
          {/* Display the application logo */}
          <Image source={require('../images/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>
        {/* Display title based on user role */}
        <Text style={[styles.headerTitle, darkMode ? styles.textDark : styles.textLight]}>
          {user?.role === 'Student' ? 'Saved Modules' : 'Taught Modules'}
        </Text>
        {/* Dark mode toggle switch */}
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'} // Color of the switch knob
          trackColor={{ false: '#767577', true: '#81b0ff' }} // Color of the switch track
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="sign-out" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* List of Module Cards */}
      <FlatList
        data={filteredModules} // Data source for the list
        keyExtractor={(item) => item.id.toString()} // Unique key for each item (using module ID)
        renderItem={renderModuleCard} // Function to render each item (module card)
        contentContainerStyle={styles.list} // Styles for the list container
        ListEmptyComponent={ // Component to show when the list is empty
            <View style={styles.emptyListContainer}>
                <Text style={[styles.emptyListText, darkMode ? styles.textDark : styles.textLight]}>
                    No {user?.role === 'Student' ? 'saved' : 'taught'} modules found.
                </Text>
                <Text style={[styles.emptyListSubText, darkMode ? styles.textDark : styles.textLight]}>
                    {user?.role === 'Student' ? 'Try searching for modules and saving them.' : 'Add modules you teach via your profile.'}
                </Text>
            </View>
        }
      />
    </View>
  );
};

// --- Styles ---
// StyleSheet definition for the component's UI elements.
// Includes styles for both light and dark modes.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up all available space
  },
  containerLight: {
    backgroundColor: '#f8f9fa', // Light background color
  },
  containerDark: {
    backgroundColor: '#121212', // Dark background color
  },
  header: {
    flexDirection: 'row', // Arrange items horizontally
    justifyContent: 'space-between', // Space items evenly
    alignItems: 'center', // Align items vertically
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? 30 : 10, // Add padding top for status bar
    borderBottomWidth: 1,
  },
  headerLight: {
     borderColor: '#e0e0e0',
     backgroundColor: '#ffffff',
  },
  headerDark: {
     borderColor: '#333',
     backgroundColor: '#1f1f1f',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Add space below header
  },
  outlookCircle: {
    width: 12, // Smaller circle
    height: 12,
    borderRadius: 6, // Make it a circle
    marginRight: 8, // Space between circle and text
  },
  headerTitle: {
    fontSize: 18, // Slightly smaller title
    fontWeight: '600', // Semi-bold
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto', // Use system fonts
    flex: 1, // Allow title to take available space
    textAlign: 'center', // Center the title
    marginHorizontal: 10, // Add horizontal margin
  },
  logoPlaceholder: {
    width: 40, // Smaller logo
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  list: {
    padding: 15, // Consistent padding
  },
  card: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000', // Add shadow for depth
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3, // Elevation for Android
  },
  cardLight: {
    backgroundColor: '#ffffff', // White card background
  },
  cardDark: {
    backgroundColor: '#1f1f1f', // Dark card background
    borderColor: '#333',
    borderWidth: 1,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1, // Allow text to shrink if needed
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8, // Consistent spacing
  },
  iconStyle: {
      marginRight: 10, // Space between icon and text
  },
  detailText: {
      fontSize: 14,
      flexShrink: 1, // Allow text to wrap or shrink
  },
  summaryContainer: {
    padding: 12,
    borderRadius: 5,
    marginTop: 5, // Space above summary
    marginBottom: 15, // Space below summary
  },
  summary: {
    fontSize: 14,
    fontStyle: 'italic', // Italicize summary
  },
  summaryLight: {
    backgroundColor: '#eef', // Light blueish background for summary
  },
  summaryDark: {
    backgroundColor: '#2a2a3a', // Darker blueish background for summary
  },
  button: {
    backgroundColor: '#007BFF', // Primary button color
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 8, // Space between buttons
    flexDirection: 'row', // Align icon and text
    justifyContent: 'center',
  },
  removeButton: {
    backgroundColor: '#dc3545', // Danger color for remove button
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row', // Align icon and text
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  buttonIcon: {
    marginRight: 8, // Space between icon and text in buttons
  },
  textLight: {
    color: '#212529', // Dark text for light mode
  },
  textDark: {
    color: '#e0e0e0', // Light gray text for dark mode
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c757d', // Neutral gray color
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    margin: 15, // Add margin around the button
    alignSelf: 'flex-start', // Align button to the start
  },
  logoutIcon: {
    fontSize: 16,
    color: '#fff',
    marginRight: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyListContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
      paddingHorizontal: 20,
  },
  emptyListText: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
  },
  emptyListSubText: {
      fontSize: 14,
      textAlign: 'center',
      color: '#6c757d', // Secondary text color
  }
});

// Export the component for use in the application
export default DashBoardScreen;