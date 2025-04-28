/**
 * @fileoverview Recommendations Screen Component.
 * Allows students to generate module recommendations based on their preferences,
 * and allows teachers to select modules they teach to get feedback-based recommendations.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, // Component for touch interactions
  Switch,           // Toggle switch component
  Image,            // Component for displaying images
  Appearance,       // API for getting device color scheme preference
  FlatList,         // Component for rendering lists efficiently
  ScrollView,       // Component for scrollable content (used for the form)
  KeyboardAvoidingView, // Component to adjust view when keyboard appears
  Platform          // Module for platform-specific code/styles
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker'; // Dropdown component
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Navigation hooks
import { useUser } from '../UserContext'; // User context hook
import {
  getTaughtModules,       // API: Fetch modules taught by teacher
  addSelectedModules,   // API: Add a module to the selected list (teacher) or potentially saved (student - check usage)
  saveUserPreferences,  // API: Save user's recommendation preferences (currently unused)
  generateStudentModuleRecs, // API: Generate recommendations based on student preferences
  getAllModules,        // API: Fetch details for all modules
} from '../api/apiService'; // Import API functions

import Icon from 'react-native-vector-icons/FontAwesome'; // Icon library

/**
 * RecommendationsScreen Component.
 * Conditionally renders UI based on user role (Student or Teacher).
 */
const RecommendationsScreen = () => {
  // --- State Variables ---
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark'); // Dark mode state
  const [answers, setAnswers] = useState({}); // State for potentially holding form answers (currently unused)
  const navigation = useNavigation(); // Navigation object
  const [filteredModules, setFilteredModules] = useState([]); // Holds modules to display (all for student, taught for teacher)
  const { user, setUser } = useUser(); // User context state and setter

  // State for Student Preference Form Dropdowns
  const [openPriority, setOpenPriority] = useState(false); // Priority dropdown open state
  const [priority, setPriority] = useState(null); // Selected priority order
  const [openImportance, setOpenImportance] = useState(false); // Importance dropdown open state
  const [importance, setImportance] = useState(null); // Selected importance level
  const [openCategories, setOpenCategories] = useState(false); // Categories dropdown open state
  const [categories, setCategories] = useState(null); // Selected categories (array)
  const [openTopics, setOpenTopics] = useState(false); // Topics dropdown open state
  const [topics, setTopics] = useState([]); // Selected topics/aspects (array)

  /** Toggles the dark mode state. */
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // --- Effects for Fetching Module Data ---

  // Effect 1: Fetch *all* modules once when the component mounts (used by Student form indirectly, and Teacher list initially).
  useEffect(() => {
    /** Fetches all available modules from the API. */
    const fetchModules = async () => {
      try {
        console.log("Fetching all modules for RecommendationsScreen...");
        const modules = await getAllModules(); // Get all modules
        // Initially, set filteredModules to all modules. Teacher's list will be refined by the next effect.
        setFilteredModules(modules);
        console.log(`Fetched ${modules.length} total modules.`);
      } catch (error) {
        console.error('Error fetching all modules:', error);
        setFilteredModules([]); // Reset on error
      }
    };

    fetchModules();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Effect 2: Refine `filteredModules` for Teachers based on their taught modules list. Runs on focus and when user changes.
  useFocusEffect(
    useCallback(() => {
      /** Fetches taught modules for Teachers and updates the filtered list. */
      const fetchTeacherModules = async () => {
        // Only proceed if the user is a Teacher
        if (user?.role !== 'Teacher') {
          return; // Do nothing if not a teacher
        }
        try {
          console.log("Fetching taught modules for Teacher...");
          // Fetch the list of module *names* the teacher teaches.
          let taughtModuleNames = await getTaughtModules();
          if (!Array.isArray(taughtModuleNames)) taughtModuleNames = []; // Ensure it's an array
          console.log("Fetched taught module names:", taughtModuleNames);

          // Fetch details for all modules again (or use cached version if available and appropriate)
          const allModules = await getAllModules();

          // Filter the list of all modules to include only those taught by the teacher.
          const teacherFiltered = allModules.filter((mod) => taughtModuleNames.includes(mod.name));
          console.log(`Filtered modules for teacher: ${teacherFiltered.length}`);

          // Update the state to display only the teacher's modules.
          setFilteredModules(teacherFiltered);
        } catch (error) {
          console.error("Error fetching or filtering teacher's modules:", error);
          setFilteredModules([]); // Reset on error
        }
      };

      fetchTeacherModules();
    }, [user]) // Re-run if the user object changes (e.g., login/logout)
  );

  // --- Event Handlers ---

  /**
   * Handles the action when a module card's button is pressed.
   * For Students: Adds the module to their ??? list (API endpoint suggests 'selected').
   * For Teachers: Adds the module to their selected list for feedback generation.
   * @param {object} module - The module object that was selected.
   */
  const handleSelectModule = async (module) => {
     // Guard clause: ensure module and module.name exist
     if (!module || !module.name) {
      console.error("Module data is invalid.");
      return;
    }

    console.log(`Handling selection for module: ${module.name}, Role: ${user?.role}`);

    // Use the same API endpoint `addSelectedModules` for both roles based on current code.
    // The backend might differentiate based on the logged-in user's role.
    try {
      await addSelectedModules(module.name); // Call API to add to selected list
      // Provide user feedback (e.g., alert, toast message)
      if (user?.role === 'Student') {
        alert(`Module "${module.name}" added to your list!`); // Adjust message if needed
        console.log(`Student added module: ${module.name} to selected list`);
      } else if (user?.role === 'Teacher') {
         alert(`Module "${module.name}" selected for feedback generation!`);
        console.log(`Teacher added module: ${module.name} to selected list`);
      }
    } catch (error) {
      console.error(`Error adding module "${module.name}" to selected list:`, error.response ? error.response.data : error.message);
      alert(`Failed to add module "${module.name}". Please try again.`); // Inform user of failure
    }
  };

  /** Handles user logout. */
  const handleLogout = () => {
    console.log("Logging out user locally.");
    setUser(null); // Clear user state in context
  };

  /**
   * Handles submission of the student preferences form.
   * Packages preferences and sends them to the backend API to generate recommendations.
   */
  const handleSubmit = async () => {
    // Construct the preferences object from the current state values.
    // Provide defaults if values are null/undefined.
    const userPreferences = {
      // Map priority string '1,2,3' to an array of numbers [1, 2, 3]
      user_priority: priority ? priority.split(',').map(Number) : [1, 2, 3],
      // Parse importance string '1' to number 1
      selected_importance: importance ? parseInt(importance, 10) : 1,
      // Ensure categories is an array, default to empty if null
      selected_categories: Array.isArray(categories) ? categories : (categories ? [categories] : []), // Handle single or multiple selections
      // Ensure topics is an array, default to empty if null
      selected_aspects: Array.isArray(topics) ? topics : [],
    };

    alert("Generating recommendations based on your preferences..."); // Inform user
    console.log("Submitting Student Preferences:", userPreferences);

    try {
      // Call the API function to generate recommendations
      const response = await generateStudentModuleRecs(userPreferences);
      console.log("Recommendation generation response:", response);
      alert("Recommendations generated! Check the 'Personal' screen to view them."); // Inform user of success
      // Optionally navigate user after submission, e.g., to Personal screen
      // navigation.navigate('Personal');
    } catch (error) {
      console.error("Error generating recommendations:", error.response ? error.response.data : error.message);
      alert("Failed to generate recommendations. Please try again."); // Inform user of failure
    }
  };


  // --- Render Functions ---

  /**
   * Renders a single module card for the Teacher's list view.
   * @param {object} params - Parameters passed by FlatList renderItem.
   * @param {object} params.item - The module data object.
   * @returns {JSX.Element} The JSX for the module card.
   */
  const renderModuleCard = ({ item }) => {
    // Safely parse topics string
    let parsedTopics = [];
    try {
      parsedTopics = typeof item.topics === 'string' ? JSON.parse(item.topics) : (item.topics || []);
      if (!Array.isArray(parsedTopics)) parsedTopics = [];
    } catch (e) { parsedTopics = []; }

    // Determine outlook circle color
    let circleColor;
    switch (item.outlook?.toLowerCase()) {
      case 'positive': circleColor = '#28a745'; break;
      case 'neutral': circleColor = '#fd7e14'; break;
      case 'negative': circleColor = '#dc3545'; break;
      default: circleColor = '#6c757d';
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

        {/* Card Details */}
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
            Topics: {parsedTopics.length > 0 ? parsedTopics.join(', ') : 'None listed'}
          </Text>
        </View>

        {/* Summary Section */}
        <View style={[styles.summaryContainer, darkMode ? styles.summaryDark : styles.summaryLight]}>
          <Icon name="clipboard" size={16} color={darkMode ? '#ccc' : '#333'} style={styles.iconStyle}/>
          <Text style={[styles.summary, darkMode ? styles.textDark : styles.textLight]}>
            Summary: {item.summary || 'No summary.'}
          </Text>
        </View>

        {/* Visit Module Page Button (Could navigate to ModulePageScreen) */}
        {/* <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Visit Module Page</Text>
        </TouchableOpacity> */}

        {/* Add/Select Module Button */}
        <TouchableOpacity
          style={[styles.selectButton, darkMode ? styles.selectButtonDark : styles.selectButtonLight]}
          onPress={() => handleSelectModule(item)}
        >
           <Icon name="plus-circle" size={16} color="#fff" style={styles.buttonIcon} />
          <Text style={styles.buttonText}>
            {/* Text depends on role */}
            {user?.role === 'Student' ? 'Add to ???' : 'Select for Feedback'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // --- Student Preference Form Content ---
  // JSX for the student recommendation preference form.
  const formContent = (
    // Use ScrollView to ensure form is scrollable on smaller screens
    // Use KeyboardAvoidingView to prevent keyboard from covering inputs
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }} // Ensure it takes available space
    >
    <ScrollView contentContainerStyle={styles.formScrollView}>
        {/* Map through form field configurations */}
        {[
          // Priority Ranking Field
          {
            label: 'Rank what is most important to you when choosing a module:\n1. Feelings/Experiences (Reviews, Sentiment)\n2. Subject Area (Interests)\n3. Module Aspects (Workload, Exams etc.)',
            open: openPriority,
            setOpen: setOpenPriority,
            value: priority,
            setValue: setPriority,
            items: [
              { label: '1 > 2 > 3', value: '1,2,3' }, { label: '1 > 3 > 2', value: '1,3,2' },
              { label: '2 > 1 > 3', value: '2,1,3' }, { label: '2 > 3 > 1', value: '2,3,1' },
              { label: '3 > 1 > 2', value: '3,1,2' }, { label: '3 > 2 > 1', value: '3,2,1' }
            ],
            zIndex: 4000 // High zIndex for the first dropdown
          },
          // Importance of Feelings Field
          {
            label: 'How important are the feelings/experiences of past cohorts to you?',
            open: openImportance,
            setOpen: setOpenImportance,
            value: importance,
            setValue: setImportance,
            items: [
              { label: '1 (Very Important)', value: '1' }, { label: '2 (Important)', value: '2' },
              { label: '3 (Neutral)', value: '3' },      { label: '4 (Unimportant)', value: '4' }
            ],
             zIndex: 3000 // Lower zIndex
          },
          // Subject Area Categories Field (Multiple Choice)
          {
            label: 'What subject area(s) are you interested in? (Select multiple)',
            open: openCategories,
            setOpen: setOpenCategories,
            value: categories,
            setValue: setCategories,
            items: [ // List all available categories
              { label: 'AI & Machine Learning', value: 'AI & Machine Learning' },
              { label: 'Python Programming', value: 'Python Programming' },
              // ... (add all other categories here) ...
              { label: 'Python & Web Development', value: 'Python & Web Development' }
            ],
            multiple: true, // Allow multiple selections
            mode: "BADGE", // Display selections as badges
             zIndex: 2000 // Lower zIndex
          },
          // Module Aspects/Topics Field (Multiple Choice)
          {
            label: 'What specific aspects of a module do you care about? (Select multiple)',
            open: openTopics,
            setOpen: setOpenTopics,
            value: topics,
            setValue: setTopics,
            items: [ // List all available aspects/topics
              { label: 'Utility and Usefulness', value: 'Utility and Usefulness' },
              { label: 'Course Engagement/Feelings', value: 'Course Engagement and Course Feelings(Sentiment)' }, // Simplified label
              // ... (add all other topics here) ...
              { label: 'Exams', value: 'Exams' },
            ],
            multiple: true, // Allow multiple selections
            mode: "BADGE", // Display selections as badges
             zIndex: 1000 // Lowest zIndex for the last dropdown
          }
          // Map each field configuration to a DropDownPicker component
        ].map((field, index) => (
          <View key={index} style={[styles.formGroup, { zIndex: field.zIndex }]}>
            {/* Label for the dropdown */}
            <Text style={[styles.questionText, darkMode ? styles.textDark : styles.textLight]}>
              {field.label}
            </Text>
            {/* DropDownPicker component */}
            <DropDownPicker
              open={field.open} // Controls if the dropdown is open
              setOpen={field.setOpen} // Function to toggle open state
              value={field.value} // Currently selected value(s)
              setValue={field.setValue} // Function to update the selected value state
              items={field.items} // List of options
              multiple={field.multiple || false} // Enable/disable multiple selection
              placeholder="Select..." // Placeholder text
              // Style properties
              style={[styles.dropdown, darkMode ? styles.dropdownDark : styles.dropdownLight]}
              dropDownContainerStyle={[styles.dropdownContainer, darkMode ? styles.dropdownContainerDark : styles.dropdownContainerLight]}
              textStyle={[styles.dropdownText, darkMode ? styles.textDark : styles.textLight]}
              // Configuration for multiple selection display
              mode={field.multiple ? "BADGE" : "SIMPLE"} // Use BADGE for multi-select
              badgeDotColors={["#e76f51"]} // Optional badge styling
              badgeColors={["#007BFF"]}
              badgeTextStyle={styles.badgeText}
              // Dropdown direction and behavior
              listMode="SCROLLVIEW" // Use ScrollView for long lists
              dropDownDirection="AUTO" // Automatically determine direction (TOP/BOTTOM)
              closeAfterSelecting={!field.multiple} // Close dropdown after selection for single-choice
            />
          </View>
        ))}
        {/* Submit Button for the form */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit} // Call handleSubmit when pressed
        >
          <Text style={styles.buttonText}>Generate Recommendations</Text>
        </TouchableOpacity>
      </ScrollView>
     </KeyboardAvoidingView>
  );

  // --- Conditional Rendering based on User Role ---

  // If user is a Student, show the preference form
  if (user?.role === 'Student') {
    return (
      <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
        {/* Header */}
        <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
          <View style={styles.logoPlaceholder}>
            <Image source={require('../images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={[styles.headerTitle, darkMode ? styles.textDark : styles.textLight]}>Generate Recommendations</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'} trackColor={{ false: '#767577', true: '#81b0ff' }}/>
        </View>
        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="sign-out" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        {/* Render the student preference form */}
        {formContent}
      </View>
    );
  }
  // If user is a Teacher, show the list of taught modules to select from
  else if (user?.role === 'Teacher') {
    return (
      <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
        {/* Header */}
        <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
           <View style={styles.logoPlaceholder}>
             <Image source={require('../images/logo.png')} style={styles.logo} resizeMode="contain" />
           </View>
          <Text style={[styles.headerTitle, darkMode ? styles.textDark : styles.textLight]}>Select Modules for Feedback</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'} trackColor={{ false: '#767577', true: '#81b0ff' }}/>
        </View>
        {/* Logout Button */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="sign-out" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        {/* Instructions for Teacher */}
         <Text style={[styles.teacherInstruction, darkMode? styles.textDark: styles.textLight]}>
            Select modules you teach to generate feedback summaries and recommendations on the Personal screen.
         </Text>
        {/* List of Teacher's Modules */}
        <FlatList
          data={filteredModules} // Display modules taught by the teacher
          renderItem={renderModuleCard} // Use the card renderer
          keyExtractor={(item) => `teacher-mod-${item.id}`} // Unique key
          style={styles.list} // Style for the list container
           ListEmptyComponent={ // Component shown if the list is empty
            <View style={styles.emptyListContainer}>
                <Text style={[styles.emptyListText, darkMode ? styles.textDark : styles.textLight]}>
                     No taught modules found.
                </Text>
                 <Text style={[styles.emptyListSubText, darkMode ? styles.textDark : styles.textLight]}>
                    Add modules you teach via your profile or settings.
                </Text>
            </View>
          }
        />
      </View>
    );
  }

  // Fallback if user role is not determined or not logged in (though App.js should handle this)
  return (
      <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
           <Text style={[styles.fallbackText, darkMode ? styles.textDark : styles.textLight]}>Loading user data or user role not recognized.</Text>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1, // Allow title to take space
    textAlign: 'center',
    marginHorizontal: 10,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  formScrollView:{ // Styles for the ScrollView containing the form
    paddingHorizontal: 20,
    paddingBottom: 40, // Ensure space at the bottom
  },
  form: { // Styles for the form container (used if not ScrollView)
    padding: 20,
    flex: 1,
  },
  formGroup: {
    marginBottom: 15, // Space between form fields
  },
  questionText: {
    fontSize: 15, // Size for question labels
    marginBottom: 8, // Space below label
    fontWeight: '500', // Medium weight
    lineHeight: 20, // Improve readability for multi-line labels
  },
  dropdown: { // Base style for dropdown picker
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 50, // Ensure consistent height
  },
  dropdownLight:{
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },
   dropdownDark:{
    borderColor: '#555',
    backgroundColor: '#2a2a2a',
  },
  dropdownContainer: { // Style for the dropdown options list
    borderWidth: 1,
    borderRadius: 8,
  },
   dropdownContainerLight:{
     borderColor: '#ccc',
     backgroundColor: '#ffffff',
   },
    dropdownContainerDark:{
     borderColor: '#555',
      backgroundColor: '#2a2a2a',
   },
  dropdownText: { // Style for text inside dropdown picker
     fontSize: 14,
  },
   badgeText:{ // Style for text inside multi-select badges
      color: '#ffffff',
      fontSize: 12,
   },
  submitButton: { // Style for the 'Generate Recommendations' button
    backgroundColor: '#28a745', // Green color
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20, // Space above the button
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textLight: {
    color: '#212529', // Dark text for light mode
  },
  textDark: {
    color: '#e0e0e0', // Light text for dark mode
  },
  logoutButton: {
    position: 'absolute', // Position over content
    top: Platform.OS === 'android' ? 35 : 50, // Adjust top for status bar
    left: 15,
    zIndex: 10, // Ensure it's clickable
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
  teacherInstruction: { // Style for the instruction text for teachers
      fontSize: 14,
      textAlign: 'center',
      marginHorizontal: 20,
      marginVertical: 15,
      fontStyle: 'italic',
      color: '#6c757d',
  },
  list: { // Style for the FlatList container
    paddingBottom: 20, // Padding at the bottom of the list
    paddingHorizontal: 10,
  },
  card: { // Style for module cards (used in teacher view)
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#1f1f1f',
    borderColor: '#333',
    borderWidth: 1,
  },
  cardLight: {
    backgroundColor: '#ffffff',
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
  section: {
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
    backgroundColor: '#eef', // Light background for summary
  },
  summaryDark: {
    backgroundColor: '#2a2a3a', // Dark background for summary
  },
  selectButton: { // Style for the "Select for Feedback" button
    backgroundColor: '#17a2b8', // Info color (teal)
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selectButtonDark: {
       backgroundColor: '#275a63', // Darker teal
  },
   selectButtonLight: {
       backgroundColor: '#17a2b8', // Standard teal
  },
  buttonIcon: {
      marginRight: 8,
  },
  fallbackText: { // Text shown when user role not determined
      flex: 1,
      textAlign: 'center',
      marginTop: 50,
      fontSize: 16,
  },
   emptyListContainer: { // Container for empty list message
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      marginTop: 30,
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
export default RecommendationsScreen;