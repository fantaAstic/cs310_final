/**
 * @fileoverview Personal Screen Component.
 * Displays user information (name, role, stats) and a list of modules relevant
 * to the user's role: Recommended modules for Students, Selected modules for Teachers.
 * Also provides options to toggle dark mode, log out, and remove modules from the displayed list.
 * Additionally, for Students, it shows a separate list of their explicitly "Saved" modules.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, // Component for making views respond to touches
  Switch,           // Toggle switch component
  Image,            // Component for displaying images
  FlatList,         // Component for rendering lists efficiently
  Appearance,       // API for getting the device's color scheme preference
} from 'react-native';
// Import Markdown component for rendering teacher feedback
import Markdown from 'react-native-markdown-display';
// Import navigation hooks
import { useNavigation, useFocusEffect } from '@react-navigation/native';
// Import user context and API service functions
import { useUser } from '../UserContext';
import {
  getTaughtModules,     // API: Fetch modules taught by a teacher
  getSavedModules,      // API: Fetch modules saved by a student
  getSelectedModules,   // API: Fetch modules selected by a teacher for feedback
  removeSelectedModule, // API: Remove a selected module (for teacher)
  getRecommendedModules,// API: Fetch modules recommended to a student
  removeRecommendedModule, // API: Remove a recommended module (for student)
  getAllModules,        // API: Fetch details of all available modules
} from '../api/apiService';

// Import icon library
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * PersonalScreen Component.
 * Renders the user's profile information and relevant module lists.
 */
const PersonalScreen = () => {
  // --- State Variables ---
  const { user, setUser } = useUser(); // Access user state and setter from context
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark'); // Dark mode state
  // const [modules, setModules] = useState([]); // State for potentially holding module data (currently unused)
  const [savedModulesCount, setSavedModulesCount] = useState(0); // Count of saved modules (for student header)
  const [savedModules, setSavedModules] = useState([]); // Holds full data of saved modules (for student list)
  const [taughtModulesCount, setTaughtModulesCount] = useState(0); // Count of taught modules (for teacher header)
  const [filteredModules, setFilteredModules] = useState([]); // Holds Recommended (student) or Selected (teacher) modules for the main list
  const [showSavedModules, setShowSavedModules] = useState(true); // State to toggle visibility of the explicit "Saved Modules" list for students
  const navigation = useNavigation(); // Navigation object

  // State to manage showing long/short form teacher recommendations
  const [showLongformRecommendations, setShowLongformRecommendations] = useState({});

  // --- Effects for Data Fetching ---

  // Effect 1: Fetch Recommended (Student) or Selected (Teacher) modules for the *main* list display.
  useFocusEffect(
    useCallback(() => {
      /** Fetches and filters modules based on user role for the primary list */
      const fetchPrimaryModules = async () => {
        if (!user) { // Guard clause if no user
            setFilteredModules([]);
            return;
        }
        try {
          let userModuleNames = []; // List of module names (Recommended or Selected)
          // Fetch all module details needed for display later
          let allModules = await getAllModules();

          // Fetch the relevant list of module *names* based on user role
          if (user.role === 'Student') {
            userModuleNames = await getRecommendedModules();
            console.log("Fetched Recommended module names:", userModuleNames);
          } else if (user.role === 'Teacher') {
            userModuleNames = await getSelectedModules();
            console.log("Fetched Selected module names:", userModuleNames);
          }

          // Validate the fetched names list
          if (!Array.isArray(userModuleNames)) {
            console.warn("Fetched primary user module names is not an array! Defaulting to empty array.");
            userModuleNames = [];
          }

          // Filter the `allModules` details list to include only those whose names match the fetched list.
          const updatedModules = allModules.filter((mod) => userModuleNames.includes(mod.name));
          console.log(`Filtered primary modules: ${updatedModules.length}`);

          // Update state for the main FlatList
          setFilteredModules(updatedModules);
        } catch (error) {
          console.error("Error fetching primary user modules:", error);
          setFilteredModules([]); // Reset on error
        }
      };

      fetchPrimaryModules();
    }, [user]) // Re-run if user changes
  );

  // Effect 2: Fetch counts for the header display (Saved count for Student, Taught count for Teacher)
  useFocusEffect(
    useCallback(() => {
      /** Fetches module counts for the header display */
      const fetchHeaderCounts = async () => {
         if (!user) { // Guard clause
            setSavedModulesCount(0);
            setTaughtModulesCount(0);
            return;
         }
        try {
          // Fetch counts based on role
          if (user.role === 'Student') {
            const fetchedSavedNames = await getSavedModules();
            const count = Array.isArray(fetchedSavedNames) ? fetchedSavedNames.length : 0;
            setSavedModulesCount(count);
            console.log("Fetched saved modules count for header:", count);
          } else if (user.role === 'Teacher') {
            const fetchedTaughtNames = await getTaughtModules();
            const count = Array.isArray(fetchedTaughtNames) ? fetchedTaughtNames.length : 0;
            setTaughtModulesCount(count);
            console.log("Fetched taught modules count for header:", count);
          }
        } catch (error) {
          console.error('Error fetching module counts for header:', error);
          // Reset counts on error
          setSavedModulesCount(0);
          setTaughtModulesCount(0);
        }
      };

      fetchHeaderCounts();
    }, [user]) // Re-run if user changes
  );

  // Effect 3: Fetch full details for the *explicitly Saved* modules (only for Students)
  useFocusEffect(
    useCallback(() => {
      /** Fetches full details for Saved modules (Student only) */
      const fetchSavedModuleDetails = async () => {
        // Only run this fetch if the user is a Student
        if (user?.role !== 'Student') {
          setSavedModules([]); // Clear saved modules if user is not a student
          return;
        }
        try {
          // Fetch the list of saved module *names*.
          const savedModuleNames = await getSavedModules();
          console.log("Fetched Saved module names (for details list):", savedModuleNames);

          // Validate the fetched names list.
          if (!Array.isArray(savedModuleNames)) {
            console.warn("Fetched saved module names is not an array! Defaulting to empty array.");
            setSavedModules([]);
            return;
          }

          // Fetch details for all modules.
          const allModules = await getAllModules();

          // Filter `allModules` to get full details for the saved modules.
          const updatedSavedModules = allModules.filter((mod) => savedModuleNames.includes(mod.name));
          console.log(`Filtered saved modules details: ${updatedSavedModules.length}`);

          // Update the state holding the list of saved module objects.
          setSavedModules(updatedSavedModules);
        } catch (error) {
          console.error("Error fetching saved module details:", error);
          setSavedModules([]); // Reset on error
        }
      };

      fetchSavedModuleDetails();
    }, [user]) // Re-run if user changes
  );

  // --- Event Handlers ---

  /**
   * Handles the removal of a module from the main displayed list
   * (Recommended for Students, Selected for Teachers).
   * @param {string} moduleName - The name of the module to remove.
   */
  const handleRemoveSelectedModule = async (moduleName) => {
    console.log(`Attempting to remove module: ${moduleName} from primary list for role: ${user?.role}`);
    try {
      // Call the appropriate API removal function based on role.
      if (user?.role === 'Student') {
        await removeRecommendedModule(moduleName); // Student removes from Recommended
      } else if (user?.role === 'Teacher') {
        await removeSelectedModule(moduleName); // Teacher removes from Selected
      }

      // Update the local state to remove the module from the main list immediately.
      setFilteredModules((prevModules) => prevModules.filter((mod) => mod.name !== moduleName));
      console.log(`Module ${moduleName} removed successfully from UI main list.`);

    } catch (error) {
      console.error(`Error removing module '${moduleName}' from primary list:`, error);
      // Optionally show an error message to the user.
    }
  };

  /** Toggles the dark mode state. */
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  /** Toggles the visibility of the explicit "Saved Modules" list for students. */
  const toggleSavedModules = () => {
    setShowSavedModules((prev) => !prev);
  };

  /** Handles user logout. */
  const handleLogout = () => {
    console.log("Logging out user locally.");
    setUser(null); // Clear user context state
  };

  /**
   * Toggles the display between shortform and longform teacher feedback for a specific module.
   * @param {string} moduleName - The name of the module whose feedback display to toggle.
   */
  const toggleRecommendation = (moduleName) => {
    setShowLongformRecommendations((prev) => ({
      ...prev, // Keep existing states for other modules
      [moduleName]: !prev[moduleName], // Toggle the state for the specific moduleName
    }));
  };

  // --- Markdown Styles ---
  // Define styles for the Markdown component, adapting to dark mode.
  const markdownStyles = {
    body: { color: darkMode ? '#e0e0e0' : '#212529', fontSize: 14, lineHeight: 20 },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    bullet_list: { marginLeft: 15 }, // Indent bullet points
    list_item: { marginBottom: 8 }, // Space between list items
    heading1: { fontSize: 18, fontWeight: 'bold', marginTop: 10, marginBottom: 5, borderBottomWidth: 1, borderColor: darkMode ? '#444' : '#ccc' },
    heading2: { fontSize: 16, fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
    // Add other styles as needed
  };

  // --- Render Functions ---

  /**
   * Renders a single module card component.
   * This function is used by both FlatLists (Saved and Recommended/Selected).
   * @param {object} params - Parameters passed by FlatList's renderItem.
   * @param {object} params.item - The module data object for the current card.
   * @returns {JSX.Element} The JSX element representing the module card.
   */
  const renderModuleCard = ({ item }) => {
    // Safely parse topics string into an array
    let parsedTopics = [];
    try {
      parsedTopics = typeof item.topics === 'string' ? JSON.parse(item.topics) : (item.topics || []);
      if (!Array.isArray(parsedTopics)) parsedTopics = [];
    } catch (e) { parsedTopics = []; }

    // Determine outlook circle color
    let circleColor;
    switch (item.outlook?.toLowerCase()) {
      case 'positive': circleColor = '#28a745'; break; // Green
      case 'neutral': circleColor = '#fd7e14'; break; // Orange
      case 'negative': circleColor = '#dc3545'; break; // Red
      default: circleColor = '#6c757d'; // Gray
    }

    // Determine if longform feedback should be shown for this card
    const showLongform = showLongformRecommendations[item.name];

    return (
      <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        {/* Module Header */}
        <View style={styles.moduleHeader}>
          <View style={[styles.outlookCircle, { backgroundColor: circleColor }]} />
          <Text style={[styles.moduleName, darkMode ? styles.textDark : styles.textLight]} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
        </View>

        {/* Module Details */}
        <View style={styles.section}>
          <Icon name="bullseye" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Outlook: {item.outlook || 'N/A'}</Text>
        </View>
        <View style={styles.section}>
          <Icon name="thumbs-up" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Positive Reviews: {item.positive || 'N/A'}</Text>
        </View>
        <View style={styles.section}>
          <Icon name="thumbs-down" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Negative Reviews: {item.negative || 'N/A'}</Text>
        </View>
        <View style={styles.section}>
          <Icon name="tags" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle} />
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Category: {item.categories || 'N/A'}</Text>
        </View>

        {/* Teacher Feedback Section (Conditional) */}
        {user?.role === 'Teacher' && item.teacher_feedback_recommendation && (
          <View style={[styles.feedbackContainer, darkMode ? styles.feedbackContainerDark : styles.feedbackContainerLight]}>
            <Text style={[styles.feedbackTitle, darkMode? styles.textDark : styles.textLight]}>
              Feedback Recommendations:
            </Text>
            {/* Render Markdown content */}
            <Markdown style={markdownStyles}>
              {showLongform
                ? item.teacher_feedback_recommendation // Show longform
                : item.teacher_feedback_recommendation_shortform // Show shortform
              }
            </Markdown>
            {/* Button to toggle between long/short form */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={() => toggleRecommendation(item.name)}
            >
              <Text style={styles.toggleButtonText}>
                {showLongform ? 'Show Less' : 'Show More'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Remove Button (Conditional based on role) */}
        {user?.role === 'Teacher' && (
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveSelectedModule(item.name)}>
             <Icon name="trash" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Remove Feedback</Text>
          </TouchableOpacity>
        )}
        {user?.role === 'Student' && (
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveSelectedModule(item.name)}>
             <Icon name="trash" size={16} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Remove Recommendation</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };


  // --- Render Main Screen ---
  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      {/* Header Section */}
      <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
        {/* Logo */}
        <Image
          source={require('../images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* User Info Container */}
        <View style={styles.moduleInfoContainer}>
          {/* User Name and Role */}
          <View style={styles.outlookContainer}>
            <Text style={[styles.outlook, darkMode ? styles.textDark : styles.textLight]} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.outlookLabel, darkMode ? styles.textDark : styles.textLight]}>
              {user?.role || 'Role'}
            </Text>
          </View>
          {/* Year of Study (Student Only) */}
          {user?.role === 'Student' && (
            <View style={styles.statsContainer}>
              <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
                {user?.year || 'N/A'}
              </Text>
              <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
                Year
              </Text>
            </View>
          )}
          {/* Module Counts */}
          <View style={styles.statsContainer}>
            <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
              {user?.role === 'Student' ? savedModulesCount : taughtModulesCount}
            </Text>
            <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
              {user?.role === 'Student' ? 'Saved' : 'Taught'}
            </Text>
          </View>
        </View>
        {/* Dark Mode Switch */}
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'}
          trackColor={{ false: '#767577', true: '#81b0ff' }}
        />
      </View>

      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="sign-out" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

       {/* Toggle Button for Saved Modules (Student only) */}
      {user?.role === 'Student' && savedModules.length > 0 && (
        <TouchableOpacity
          onPress={toggleSavedModules}
          style={styles.SavedtoggleButton}
        >
          <Text style={styles.buttonText}>
            {showSavedModules ? 'Show Recommended Only' : 'Show Saved & Recommended'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Conditional Rendering for Saved Modules List (Student only) */}
      {showSavedModules && user?.role === 'Student' && savedModules.length > 0 && (
        <>
          {/* Divider */}
          <View style={[styles.divider, darkMode? styles.dividerDark : styles.dividerLight]} />
          {/* Title for Saved Modules section */}
          <Text style={[styles.sectionTitle, darkMode ? styles.textDark : styles.textLight]}>
            Your Saved Modules
          </Text>
          {/* FlatList for Saved Modules */}
          <FlatList
            data={savedModules}
            keyExtractor={(item, index) => `saved-${item.id ?? index}`} // Use ID or index as key
            renderItem={renderModuleCard} // Use the same card renderer
            contentContainerStyle={styles.list}
            style={styles.savedList} // Add style for potential height control
          />
          {/* Divider */}
           <View style={[styles.divider, darkMode? styles.dividerDark : styles.dividerLight]} />
        </>
      )}

      {/* Title for the main list (Recommended/Selected) */}
      <Text style={[styles.title, darkMode ? styles.textDark : styles.textLight]}>
          {user?.role === 'Student' ? 'Your Recommended Modules' : `Feedback for Your Selected Modules`}
      </Text>
      <Text style={[styles.subTitle, darkMode ? styles.textDark : styles.textLight]}>
          {user?.role === 'Student'
              ? 'Based on your preferences (or default saved modules if preferences not set).'
              : `Generated summaries and recommendations for modules you selected.`}
      </Text>


      {/* Main FlatList for Recommended/Selected Modules */}
      <FlatList
        data={filteredModules} // Data source is the filtered list
        keyExtractor={(item, index) => `filtered-${item.id ?? index}`} // Unique key
        renderItem={renderModuleCard} // Use the card renderer
        contentContainerStyle={styles.list} // Styles for list container
        style={styles.mainList} // Style for the main list container
        ListEmptyComponent={ // Component shown if the main list is empty
            <View style={styles.emptyListContainer}>
                <Text style={[styles.emptyListText, darkMode ? styles.textDark : styles.textLight]}>
                     No {user?.role === 'Student' ? 'recommended' : 'selected'} modules found.
                </Text>
                 <Text style={[styles.emptyListSubText, darkMode ? styles.textDark : styles.textLight]}>
                    {user?.role === 'Student' ? 'Go to Recommendations to generate some!' : 'Go to Search to select modules for feedback.'}
                </Text>
            </View>
        }
      />

    </View>
  );
};

// --- Styles ---
// StyleSheet definition for the component's UI elements.
const styles = StyleSheet.create({
  container: {
    flex: 1, // Occupy full screen
  },
  containerLight: {
    backgroundColor: '#f8f9fa', // Light background
  },
  containerDark: {
    backgroundColor: '#121212', // Dark background
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Space items horizontally
    alignItems: 'center', // Align items vertically
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? 30 : 10, // Adjust for status bar
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
  logo: {
    width: 40, // Smaller logo
    height: 40,
    marginRight: 10,
  },
  moduleInfoContainer: {
    flexDirection: 'row', // Arrange user info horizontally
    alignItems: 'center', // Align vertically
    flex: 1, // Allow container to take available space
    marginLeft: 5,
    flexWrap: 'wrap', // Allow items to wrap if needed
  },
  outlookContainer: { // Container for Name/Role
    alignItems: 'flex-start', // Align text left
    marginRight: 15, // Space between info blocks
    marginBottom: 5, // Space if wrapping occurs
  },
  outlook: { // Style for User Name
    fontSize: 16,
    fontWeight: 'bold',
  },
  outlookLabel: { // Style for Role/Year Label
    fontSize: 12,
    color: '#6c757d', // Secondary text color
  },
  statsContainer: { // Container for Year/Saved/Taught stats
    alignItems: 'center', // Center number and label
    marginRight: 15, // Space between info blocks
    marginBottom: 5, // Space if wrapping occurs
  },
  statNumber: { // Style for the count/year number
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: { // Style for the label below the number
    fontSize: 12,
    color: '#6c757d',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5, // Reduced bottom margin
    marginHorizontal: 20, // Horizontal margin
  },
  subTitle: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 15, // Space below subtitle
    marginHorizontal: 20,
  },
  logoutButton: {
    position: 'absolute', // Position absolutely
    top: Platform.OS === 'android' ? 35 : 50, // Adjust top positioning
    left: 15,
    zIndex: 10, // Ensure it's above header content
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 117, 125, 0.8)', // Semi-transparent gray
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  logoutIcon: {
    fontSize: 14,
    color: '#fff',
    marginRight: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: { // Style for FlatList content container
    paddingHorizontal: 15,
    paddingBottom: 20, // Add padding at the bottom
  },
  mainList: { // Style for the main FlatList component itself
    flex: 1, // Allow it to take remaining space
  },
  savedList: { // Style for the saved list FlatList
    maxHeight: 250, // Limit height if needed, or remove if full scroll desired
    marginBottom: 10, // Space below the saved list
  },
  card: {
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  cardDark: {
    backgroundColor: '#1f1f1f',
    borderColor: '#333',
    borderWidth: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  outlookCircle: {
    width: 12, // Small circle indicator
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1, // Allow text to shrink if needed
  },
  section: { // Style for each detail row (icon + text)
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconStyle: {
      marginRight: 10, // Space between icon and text
  },
  detailText: {
      fontSize: 14,
      flexShrink: 1, // Allow text to wrap or shrink
  },
  feedbackContainer: { // Container for Markdown feedback
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
  },
  feedbackContainerLight: {
     backgroundColor: '#e9ecef', // Light background for feedback
  },
  feedbackContainerDark: {
      backgroundColor: '#2a2a2a', // Dark background for feedback
  },
  feedbackTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
  },
  toggleButton: { // Button to toggle long/short feedback
    backgroundColor: '#6c757d', // Neutral button color
    borderRadius: 5,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10, // Space above toggle button
  },
  toggleButtonText: { // Text specific to the toggle button
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 12,
  },
  SavedtoggleButton: { // Button to toggle saved list visibility
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignItems: 'center',
    alignSelf: 'flex-start', // Align button to the left
    marginHorizontal: 20,
    marginBottom: 15, // Space below the toggle button
  },
  removeButton: { // Style for the remove button
    backgroundColor: '#dc3545', // Danger color
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10, // Space above remove button
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
      marginRight: 8, // Space between icon and text
  },
  textLight: {
    color: '#212529', // Dark text for light mode
  },
  textDark: {
    color: '#e0e0e0', // Light text for dark mode
  },
  divider: { // Style for the divider line
    height: 1,
    marginVertical: 15, // Space above and below divider
    marginHorizontal: 20,
  },
  dividerLight:{
     backgroundColor: '#e0e0e0',
  },
   dividerDark:{
     backgroundColor: '#444',
  },
  sectionTitle: { // Title for the "Saved Modules" section
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginHorizontal: 20,
  },
  emptyListContainer: { // Container for empty list message
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      marginTop: 30, // Add some top margin
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
      color: '#6c757d',
  }
});

// Export the component
export default PersonalScreen;