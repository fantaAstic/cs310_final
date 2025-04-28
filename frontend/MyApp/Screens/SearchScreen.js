/**
 * @fileoverview Search Screen Component.
 * Allows users to search through all available modules and view their details.
 * Provides functionality to add modules to the user's relevant list
 * (Saved for Students, Taught for Teachers).
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,         // Component for rendering lists efficiently
  TouchableOpacity, // Component for touch interactions
  Switch,           // Toggle switch component
  Image,            // Component for displaying images
  Appearance,       // API for getting device color scheme preference
  TextInput,        // Component for text input (search bar)
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Hook for navigation
import { useUser } from '../UserContext'; // Custom hook for user context access
import {
  addSavedModule,   // API: Add module to student's saved list
  addTaughtModule,  // API: Add module to teacher's taught list
  getAllModules     // API: Fetch details for all modules
} from '../api/apiService'; // Import relevant API functions

// Import icon library
import Icon from 'react-native-vector-icons/FontAwesome'; // Using FontAwesome icons

/**
 * SearchScreen Component.
 * Renders a search bar and a list of modules, allowing users to filter and interact.
 */
const SearchScreen = () => {
  // --- State Variables ---
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark'); // Dark mode state
  const [searchQuery, setSearchQuery] = useState(''); // State for the search input text
  const [modules, setModules] = useState([]); // State to hold all fetched module data
  const navigation = useNavigation(); // Navigation object
  const { user, setUser } = useUser(); // Access user context

  // --- Effect for Initial Data Fetch ---
  // Fetches all modules when the component mounts.
  useEffect(() => {
    /** Fetches all module data from the API. */
    const fetchModules = async () => {
      try {
        console.log("Fetching all modules for SearchScreen...");
        const modulesData = await getAllModules(); // Call API function
        setModules(modulesData); // Store fetched data in state
        console.log(`Fetched ${modulesData.length} modules.`);
      } catch (error) {
        console.error("Failed to fetch modules:", error);
        setModules([]); // Set to empty array on error
      }
    };

    fetchModules();
  }, []); // Empty dependency array ensures this runs only once on mount

  // --- Event Handlers ---

  /** Toggles the dark mode state. */
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  /**
   * Navigates to the ModulePageScreen with details of the selected module.
   * @param {object} item - The module object selected by the user.
   */
  const handleVisitModulePage = (item) => {
    console.log(`Navigating to Module Page for: ${item.name}`);
    console.log("Analysis Refs:", item.analysis_refs); // Log analysis references if needed
    navigation.navigate('ModulePage', { module: item }); // Navigate with module data
  };

  /** Handles user logout. */
  const handleLogout = () => {
    console.log("Logging out user locally.");
    setUser(null); // Clear user state in context
  };

  /**
   * Handles adding a module to the appropriate user list (Saved or Taught).
   * Calls the relevant API function based on the user's role.
   * @param {object} module - The module object to add.
   */
  const handleAddModule = async (module) => {
     // Guard clause: ensure module and module.name exist
    if (!module || !module.name) {
      console.error("Module data is invalid.");
      return;
    }
    console.log(`Handling add module: ${module.name} for role: ${user?.role}`);

    if (user?.role === 'Student') {
      try {
        await addSavedModule(module.name); // Call API for student
        console.log(`Student saved module: ${module.name}`);
        alert(`"${module.name}" added to your Saved Modules!`); // User feedback
      } catch (error) {
        console.error('Error adding module to saved list:', error.response ? error.response.data : error.message);
         alert(`Failed to add "${module.name}" to saved list.`); // Error feedback
      }
    } else if (user?.role === 'Teacher') {
      try {
        await addTaughtModule(module.name); // Call API for teacher
        console.log(`Teacher added module to taught list: ${module.name}`);
         alert(`"${module.name}" added to your Taught Modules!`); // User feedback
      } catch (error) {
        console.error('Error adding module to taught list:', error.response ? error.response.data : error.message);
         alert(`Failed to add "${module.name}" to taught list.`); // Error feedback
      }
    } else {
        console.warn("User role not recognized or user not logged in. Cannot add module.");
        alert("You must be logged in as a Student or Teacher to add modules.");
    }
  };

  // --- Filtering Logic ---
  // Filter the `modules` state based on the current `searchQuery`.
  // Matches module names case-insensitively.
  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Render Function for Module Cards ---

  /**
   * Renders a single module card component within the FlatList.
   * @param {object} params - Parameters passed by FlatList renderItem.
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

    return (
      <View style={[styles.card, darkMode ? styles.cardDark : styles.cardLight]}>
        {/* Card Header */}
        <View style={styles.moduleHeader}>
          <View style={[styles.outlookCircle, { backgroundColor: circleColor }]} />
          <Text style={[styles.moduleName, darkMode ? styles.textDark : styles.textLight]} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
        </View>

        {/* Card Details Sections */}
        <View style={styles.section}>
          <Icon name="bullseye" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle}/>
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Outlook: {item.outlook || 'N/A'}</Text>
        </View>
        <View style={styles.section}>
          <Icon name="thumbs-up" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle}/>
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Positive: {item.positive || 'N/A'}</Text>
        </View>
        <View style={styles.section}>
          <Icon name="thumbs-down" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle}/>
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Negative: {item.negative || 'N/A'}</Text>
        </View>
        <View style={styles.section}>
          <Icon name="tags" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle}/>
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]}>Category: {item.categories || 'N/A'}</Text>
        </View>
        <View style={styles.section}>
          <Icon name="book" size={16} color={darkMode ? '#aaa' : '#555'} style={styles.iconStyle}/>
          <Text style={[styles.detailText, darkMode ? styles.textDark : styles.textLight]} numberOfLines={2}>
             Topics: {parsedTopics.length > 0 ? parsedTopics.join(', ') : 'No topics listed'}
          </Text>
        </View>

        {/* Highlighted Summary Section */}
        <View style={[styles.summaryContainer, darkMode ? styles.summaryDark : styles.summaryLight]}>
          <Icon name="clipboard" size={16} color={darkMode ? '#ccc' : '#333'} style={styles.iconStyle}/>
          <Text style={[styles.summary, darkMode ? styles.textDark : styles.textLight]}>
             Summary: {item.summary || 'No summary available.'}
          </Text>
        </View>

        {/* Visit Module Page Button */}
        <TouchableOpacity style={styles.button} onPress={() => handleVisitModulePage(item)}>
           <Icon name="info-circle" size={16} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>View Details</Text>
        </TouchableOpacity>

        {/* Conditional Add Module Button */}
        <TouchableOpacity
          style={[styles.addButton, darkMode ? styles.addButtonDark : styles.addButtonLight]}
          onPress={() => handleAddModule(item)}
        >
           <Icon name="plus-circle" size={16} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {/* Button text depends on user role */}
            {user?.role === 'Student' ? 'Save Module' : 'Add Taught Module'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // --- Render Main Screen UI ---
  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      {/* Header Section */}
      <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
        {/* Logo */}
        <View style={styles.logoPlaceholder}>
          <Image
            source={require('../images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        {/* Search Input */}
        <TextInput
          style={[styles.searchInput, darkMode ? styles.searchInputDark : styles.searchInputLight]}
          placeholder="Search modules..."
          placeholderTextColor={darkMode ? '#bbb' : '#888'} // Placeholder color based on mode
          value={searchQuery} // Bind value to state
          onChangeText={(text) => setSearchQuery(text)} // Update state on text change
        />
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

      {/* Informational Title */}
      <Text style={[styles.screenTitle, darkMode ? styles.textDark : styles.textLight]}>
        Explore Modules
      </Text>
       <Text style={[styles.screenSubtitle, darkMode ? styles.textDark : styles.textLight]}>
         {user?.role === 'Student' ? 'Add modules to your Saved list for quick access.' : 'Add modules you teach to your Taught list.'}
      </Text>

      {/* List of Modules (Filtered) */}
      <FlatList
        data={filteredModules} // Use the filtered list based on search query
        keyExtractor={(item) => `search-mod-${item.id}`} // Unique key for each item
        renderItem={renderModuleCard} // Function to render each card
        contentContainerStyle={styles.list} // Style for the list container
        ListEmptyComponent={ // Component shown if search yields no results or no modules loaded
            <View style={styles.emptyListContainer}>
                <Text style={[styles.emptyListText, darkMode ? styles.textDark : styles.textLight]}>
                     {modules.length === 0 ? "Loading modules..." : "No modules match your search."}
                </Text>
                 <Text style={[styles.emptyListSubText, darkMode ? styles.textDark : styles.textLight]}>
                    {modules.length > 0 && "Try searching for a different module name or code."}
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
    alignItems: 'center', // Align vertically
    paddingHorizontal: 10,
    paddingVertical: 8,
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
  logoPlaceholder: {
      width: 40, // Smaller logo in search bar header
      height: 40,
      marginRight: 10, // Space between logo and search bar
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  searchInput: {
    flex: 1, // Allow search bar to take available space
    height: 40,
    borderRadius: 20, // Rounded search bar
    paddingHorizontal: 15,
    fontSize: 15,
    marginRight: 10, // Space between search bar and switch
    borderWidth: 1, // Add border for visibility
  },
  searchInputLight: {
      backgroundColor: '#f0f0f0',
      color: '#000',
      borderColor: '#ccc',
  },
  searchInputDark: {
      backgroundColor: '#333',
      color: '#fff',
      borderColor: '#555',
  },
  list: {
    padding: 15, // Padding around the list content
  },
  card: { // Style for each module card
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
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  moduleName: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  section: { // Style for each detail row
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
   iconStyle: {
      marginRight: 10,
  },
   detailText: {
      fontSize: 14,
      flexShrink: 1,
  },
  summaryContainer: {
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  summary: {
    fontSize: 14,
  },
  summaryLight: {
    backgroundColor: '#eef', // Light summary background
  },
  summaryDark: {
    backgroundColor: '#2a2a3a', // Dark summary background
  },
  button: { // Style for 'View Details' button
    backgroundColor: '#007BFF', // Primary blue
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  addButton: { // Style for 'Add Module / Add Taught' button
    backgroundColor: '#28a745', // Green color
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10, // Space above add button
    flexDirection: 'row',
    justifyContent: 'center',
  },
   addButtonLight: {
      backgroundColor: '#28a745',
   },
    addButtonDark: {
       backgroundColor: '#218838', // Slightly darker green
    },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
   buttonIcon: {
      marginRight: 8,
  },
  textLight: {
    color: '#212529', // Dark text for light mode
  },
  textDark: {
    color: '#e0e0e0', // Light text for dark mode
  },
  screenTitle: { // Style for the "Explore Modules" title
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
    textAlign: 'center',
  },
   screenSubtitle: { // Style for the subtitle below the main title
    fontSize: 13,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 15,
     marginHorizontal: 20,
  },
  logoutButton: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 35 : 50, // Adjust top positioning
    left: 15,
    zIndex: 10, // Ensure it's above other header elements if necessary
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
   emptyListContainer: { // Container for empty list message
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      marginTop: 50, // Add some top margin
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
export default SearchScreen;