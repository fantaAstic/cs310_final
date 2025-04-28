/**
 * @fileoverview Module Page Screen Component.
 * Displays detailed information about a specific module passed via navigation parameters.
 * Includes tabs for Summary, Analysis (with zoomable images), and Categories (topics).
 * Allows users to navigate to category-specific views, toggle dark mode, and log out.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity, // Component for touch interactions
  Switch,           // Toggle switch component
  Image,            // Component for displaying images
  ScrollView,       // Component for scrollable content
  Appearance,       // API for getting the device's color scheme preference
  Modal,            // Component for displaying modal views
  FlatList,         // Component for rendering lists efficiently
  Button,           // Basic button component
  Dimensions,       // API for getting screen dimensions
} from 'react-native';

import { useUser } from '../UserContext'; // Custom hook to access user context
import { useRoute } from '@react-navigation/native'; // Hook to access route parameters
import ImageViewer from 'react-native-image-zoom-viewer'; // Library for image zoom (imported but replaced by ImageZoom)
import Icon from 'react-native-vector-icons/FontAwesome'; // Icon library
import ImageZoom from 'react-native-image-pan-zoom'; // Library for pan and zoom functionality on images

/**
 * ZoomableImage Component.
 * Renders an image with a button to open a modal for pan/zoom functionality.
 *
 * @param {object} props - Component props.
 * @param {object} props.imageSource - The source object for the image (e.g., require('../path/to/image.png')).
 * @returns {JSX.Element} A fragment containing the image and zoom controls.
 */
const ZoomableImage = ({ imageSource }) => {
  // State to control the visibility of the zoom modal
  const [zoomVisible, setZoomVisible] = useState(false);

  /** Opens the image zoom modal. */
  const handleOpenZoom = () => {
    setZoomVisible(true); // Show the zoom modal
  };

  /** Closes the image zoom modal. */
  const handleCloseZoom = () => {
    setZoomVisible(false); // Close the zoom modal
  };

  // Get the screen dimensions to configure the zoom viewer size.
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <>
      {/* Button to trigger the zoom modal */}
      <Button title="View Zoomed Image" onPress={handleOpenZoom} />
      {/* The standard image display on the page */}
      <Image
        source={imageSource}
        style={styles.analysisImage} // Style for the non-zoomed image
        resizeMode="contain" // Ensure the image scales correctly
        onLoad={() => console.log('Analysis image displayed')} // Log when image loads
      />

      {/* Modal component for the full-screen zoom view */}
      <Modal visible={zoomVisible} transparent={true}>
        {/* Container for the modal content */}
        <View style={styles.modalContainer}>
          {/* ImageZoom component enabling pan and zoom gestures */}
          <ImageZoom
            cropWidth={screenWidth} // Width of the zoomable viewport
            cropHeight={screenHeight} // Height of the zoomable viewport
            imageWidth={screenWidth} // Initial width of the image within the viewport
            imageHeight={screenHeight} // Initial height of the image within the viewport
          >
            {/* The Image component rendered inside the zoom component */}
            <Image
              source={imageSource}
              style={{ width: screenWidth, height: screenHeight }} // Make image fill the zoom area
              resizeMode="contain" // Ensure the entire image is visible within the zoom area
            />
          </ImageZoom>
          {/* Container for the close button, positioned absolutely */}
          <View style={styles.closeButtonContainer}>
            <Button title="Close" onPress={handleCloseZoom} />
          </View>
        </View>
      </Modal>
    </>
  );
};

/**
 * Mapping of topic names to corresponding FontAwesome icon names.
 * Used for displaying icons next to topic buttons in the 'Categories' tab.
 */
const topicIcons = {
  'Grading': 'check-circle',
  'Utility and Usefulness': 'star',
  'Course Engagement and Course Feelings(Sentiment)': 'heart', // Key might need sanitization if spaces/parentheses cause issues
  'Learning Outcomes': 'graduation-cap',
  'Course Material': 'book',
  'Workload': 'thermometer-full', // Using thermometer as a proxy for workload/intensity
  'Course Structure': 'sitemap',
  'Assignments': 'tasks',
  'Lectures': 'university', // Using university icon as a proxy for lectures
  'Course Material and Understanding': 'binoculars', // Using binoculars as a proxy for understanding/insight
  'Instructor': 'user',
  'Exams': 'pencil-square-o', // Using pencil-square for exams/quizzes
};

/**
 * ModulePageScreen Component.
 * Displays detailed information for a module, including summary, analysis plots,
 * and a list of topics (categories) associated with the module.
 *
 * @param {object} props - Component props provided by React Navigation.
 * @param {object} props.navigation - Navigation object for screen transitions.
 * @returns {JSX.Element} The main screen component.
 */
const ModulePageScreen = ({ navigation }) => {
  // State for managing dark mode, initialized based on system preference
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  // State to track the currently active tab ('Summary', 'Analysis', 'Categories')
  const [activeTab, setActiveTab] = useState('Summary');
  // Access user context (for logout primarily)
  const { user, setUser } = useUser();
  // Hook to access route parameters passed during navigation
  const route = useRoute();

  // Extract the module object passed from the previous screen
  const { module } = route.params; // Assumes `module` object is passed in route.params

  // --- Topic Parsing ---
  // Parse the comma-separated topics string from the module object into an array.
  // Includes cleaning steps to remove brackets, quotes, and extra whitespace.
  const parsedTopics = module?.topics // Check if module and topics exist
    ? (typeof module.topics === 'string' ? module.topics : '[]') // Ensure it's a string before splitting
        .split(',') // Split the string by commas
        .map(topic => topic.replace(/[[\]"'.]/g, '').trim()) // Remove unwanted characters and trim whitespace
        .filter(topic => topic) // Filter out any empty strings resulting from cleaning
    : []; // Default to an empty array if module or topics are missing
  console.log("Parsed Topics:", parsedTopics); // Log the resulting array for debugging

  /** Toggles the dark mode state. */
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev); // Update state based on the previous value
  };

  /** Handles user logout by clearing the user context. */
  const handleLogout = () => {
    console.log("Logging out user locally.");
    setUser(null); // Clear user state, triggering navigation back to login
  };

  // --- Image Mapping ---
  // Hardcoded mapping of sanitized module names to their corresponding analysis image assets.
  // Keys are module names with spaces replaced by hyphens and special characters removed.
  const imageMapping = {
    'Computational-Thinking-for-Problem-Solving': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Computational-Thinking-for-Problem-Solving.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Computational-Thinking-for-Problem-Solving.png'),
    },
    'Machine-Learning': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Machine-Learning.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Machine-Learning.png'),
    },
    'Programming-for-Everybody-Getting-Started-with-Python': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Programming-for-Everybody-Getting-Started-with-Python.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Programming-for-Everybody-Getting-Started-with-Python.png'),
    },
      'Programming-Languages-Part-A': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Programming-Languages-Part-A.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Programming-Languages-Part-A.png'),
    },
    'The-Data-Scientists-Toolbox': {
      emotion: require('../images/analysis_plots/emotion_timeseries_The-Data-Scientists-Toolbox.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_The-Data-Scientists-Toolbox.png'),
    },
    'Using-Databases-with-Python': {
    emotion: require('../images/analysis_plots/emotion_timeseries_Using-Databases-with-Python.png'),
    sentiment: require('../images/analysis_plots/sentiment_timeseries_Using-Databases-with-Python.png'),
    },
    'Using-Python-to-Access-Web-Data': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Using-Python-to-Access-Web-Data.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Using-Python-to-Access-Web-Data.png'),
    },
    'Introduction-to-Data-Science-in-Python': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Introduction-to-Data-Science-in-Python.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Introduction-to-Data-Science-in-Python.png'),
    },
    'Python-Basics': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Python-Basics.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Python-Basics.png'),
    },
    'Algorithmic-Toolbox': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Algorithmic-Toolbox.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Algorithmic-Toolbox.png'),
    },
    'Information-Security-Context-and-Introduction': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Information-Security-Context-and-Introduction.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Information-Security-Context-and-Introduction.png'),
    },
    'SQL-for-Data-Science': {
      emotion: require('../images/analysis_plots/emotion_timeseries_SQL-for-Data-Science.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_SQL-for-Data-Science.png'),
    },
    'Fundamentals-of-Visualization-with-Tableau': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Fundamentals-of-Visualization-with-Tableau.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Fundamentals-of-Visualization-with-Tableau.png'),
    },
    'Computational-Thinking-for-Problem-Solving': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Computational-Thinking-for-Problem-Solving.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Computational-Thinking-for-Problem-Solving.png'),
    },
    'Programming-Fundamentals': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Programming-Fundamentals.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Programming-Fundamentals.png'),
    },
    'Applied-Plotting-Charting-Data-Representation-in-Python': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Applied-Plotting-Charting-Data-Representation-in-Python.png'),
    },
    'Introduction-to-Big-Data': {
    emotion: require('../images/analysis_plots/emotion_timeseries_Introduction-to-Big-Data.png'),
    sentiment: require('../images/analysis_plots/sentiment_timeseries_Introduction-to-Big-Data.png'),
    },
    'Applied-Machine-Learning-in-Python': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Applied-Machine-Learning-in-Python.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Applied-Machine-Learning-in-Python.png'),
    },
    'Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Capstone-Retrieving-Processing-and-Visualizing-Data-with-Python.png'),
    },
    'Python-Functions-Files-and-Dictionaries': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Python-Functions-Files-and-Dictionaries.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Python-Functions-Files-and-Dictionaries.png'),
    },
    'Object-Oriented-Data-Structures-in-C': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Object-Oriented-Data-Structures-in-C.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Object-Oriented-Data-Structures-in-C.png'),
    },
    'Python-and-Statistics-for-Financial-Analysis': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Python-and-Statistics-for-Financial-Analysis.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Python-and-Statistics-for-Financial-Analysis.png'),
    },
    'Data-Analytics-for-Lean-Six-Sigma': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Data-Analytics-for-Lean-Six-Sigma.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Data-Analytics-for-Lean-Six-Sigma.png'),
    },
    'Python-Programming-A-Concise-Introduction': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Python-Programming-A-Concise-Introduction.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Python-Programming-A-Concise-Introduction.png'),
    },
    'Machine-Learning-for-All': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Machine-Learning-for-All.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Machine-Learning-for-All.png'),
    },
    'The-Introduction-to-Quantum-Computing': {
      emotion: require('../images/analysis_plots/emotion_timeseries_The-Introduction-to-Quantum-Computing.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_The-Introduction-to-Quantum-Computing.png'),
    },
    'Object-Oriented-Design': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Object-Oriented-Design.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Object-Oriented-Design.png'),
    },
    'Introduction-to-Computer-Programming': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Introduction-to-Computer-Programming.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Introduction-to-Computer-Programming.png'),
    },
    'Research-Data-Management-and-Sharing': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Research-Data-Management-and-Sharing.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Research-Data-Management-and-Sharing.png'),
    },
    'Digital-Business-Models': {
      emotion: require('../images/analysis_plots/emotion_timeseries_Digital-Business-Models.png'),
      sentiment: require('../images/analysis_plots/sentiment_timeseries_Digital-Business-Models.png'),
    },
  };

  /**
   * Renders the content based on the currently active tab.
   * @returns {JSX.Element|null} The JSX content for the selected tab, or null.
   */
  const renderContent = () => {
    switch (activeTab) {
      // --- Summary Tab ---
      case 'Summary':
        return (
          <ScrollView>
            <Text style={[styles.pageContent, darkMode ? styles.textDark : styles.textLight]}>
              {module?.summary || 'No summary available for this module.'}
            </Text>
          </ScrollView>
        );

      // --- Analysis Tab ---
      case 'Analysis':
        // Sanitize the current module's name to create a key for the imageMapping.
        const moduleNameKey = module?.name
          ?.trim() // Use optional chaining and trim whitespace
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/[^\w-]/g, ''); // Remove non-word characters except hyphens

        // Retrieve the emotion and sentiment image sources from the mapping.
        const emotionImage = moduleNameKey ? imageMapping[moduleNameKey]?.emotion : null;
        const sentimentImage = moduleNameKey ? imageMapping[moduleNameKey]?.sentiment : null;
        console.log(`Image key for Analysis: ${moduleNameKey}`); // Log key for debugging

        return (
          // Use ScrollView in case images are tall
          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            <View style={styles.analysisContainer}>
              {/* Emotion Timeseries Image */}
              <Text style={[styles.imageTitle, darkMode ? styles.textDark : styles.textLight]}>Emotion Timeseries</Text>
              {emotionImage ? (
                // Render the ZoomableImage component if an image source is found
                <ZoomableImage
                  imageSource={emotionImage}
                />
              ) : (
                // Display fallback text if no image is found
                <Text style={[styles.fallbackText, darkMode ? styles.textDark : styles.textLight]}>Emotion Timeseries plot unavailable.</Text>
              )}

              {/* Sentiment Timeseries Image */}
              <Text style={[styles.imageTitle, darkMode ? styles.textDark : styles.textLight]}>Sentiment Timeseries</Text>
              {sentimentImage ? (
                 // Render the ZoomableImage component
                <ZoomableImage
                  imageSource={sentimentImage}
                />
              ) : (
                // Display fallback text
                <Text style={[styles.fallbackText, darkMode ? styles.textDark : styles.textLight]}>Sentiment Timeseries plot unavailable.</Text>
              )}
            </View>
          </ScrollView>
        );

      // --- Categories Tab ---
      case 'Categories':
        return (
          <View style={styles.categoriesContainer}>
            {/* Informational text */}
            <Text style={[styles.infoText, darkMode ? styles.textDark : styles.textLight]}>
              Select a topic below to view detailed insights for that aspect of the module.
            </Text>
            {/* Grid layout for topic buttons */}
            <FlatList
              data={parsedTopics} // Use the cleaned array of topic names
              numColumns={3} // Arrange buttons in a 3-column grid
              keyExtractor={(item, index) => `${item}-${index}`} // Generate unique key for each topic button
              renderItem={({ item: topicName }) => ( // Render each topic as a button
                <TouchableOpacity
                  style={[
                    styles.categoryButton, // Basic button style
                    darkMode ? styles.buttonDark : styles.buttonLight, // Style based on dark mode
                  ]}
                  onPress={() => {
                    // Log navigation parameters for debugging
                    console.log('Navigating to ModuleCategory with:', { topic: topicName, moduleName: module.name });
                    // Navigate to the ModuleCategory screen, passing the topic and module name
                    navigation.navigate('ModuleCategory', {
                      topic: topicName,
                      moduleName: module.name // Pass the original module name
                    });
                  }}
                >
                  {/* Display icon based on topic name using the topicIcons map */}
                  <Icon
                    name={topicIcons[topicName] || 'question-circle'} // Use mapped icon or default
                    size={20} // Icon size
                    color={darkMode ? '#fff' : '#333'} // Icon color based on dark mode
                    style={styles.iconStyle} // Icon specific styles
                  />
                  {/* Display the topic name */}
                  <Text
                    style={[
                      styles.buttonText,
                      darkMode ? styles.textDark : styles.textLight,
                    ]}
                    numberOfLines={2} // Allow text to wrap up to 2 lines
                    ellipsizeMode='tail'
                  >
                    {topicName}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.grid} // Style for the grid container
              ListEmptyComponent={ // Component shown if parsedTopics is empty
                <Text style={[styles.fallbackText, darkMode ? styles.textDark: styles.textLight]}>
                  No topics available for this module.
                </Text>
              }
            />
          </View>
        );
      // Default case if no tab matches (shouldn't happen with current setup)
      default:
        return null;
    }
  };

  // --- Render Main Screen Layout ---
  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      {/* Logout Button positioned at the top-left */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="sign-out" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* Header Section */}
      <View style={[styles.header, darkMode ? styles.headerDark : styles.headerLight]}>
        {/* Logo */}
        <Image
          source={require('../images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        {/* Module Info Container (Title and Stats) */}
        <View style={styles.moduleInfoContainer}>
          {/* Module Title */}
          <Text style={[styles.moduleTitle, darkMode ? styles.textDark : styles.textLight]} numberOfLines={1} ellipsizeMode="tail">
            {module?.name || 'Module Details'} {/* Display module name or fallback */}
          </Text>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            {/* Outlook Stat */}
            <View style={styles.statsContainer}>
              <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
                {module?.outlook || 'N/A'}
              </Text>
              <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
                Outlook
              </Text>
            </View>
            {/* Positive Reviews Stat */}
            <View style={styles.statsContainer}>
              <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
                {module?.positive || 'N/A'}
              </Text>
              <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
                Positive
              </Text>
            </View>
            {/* Negative Reviews Stat */}
            <View style={styles.statsContainer}>
              <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
                {module?.negative || 'N/A'}
              </Text>
              <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
                Negative
              </Text>
            </View>
            {/* Categories (Topics) Count Stat */}
            <View style={styles.statsContainer}>
              <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
                {parsedTopics.length} {/* Display the count of parsed topics */}
              </Text>
              <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
                Topics
              </Text>
            </View>
          </View>
        </View>
        {/* Dark Mode Switch */}
        <Switch
          value={darkMode}
          onValueChange={toggleDarkMode}
          thumbColor={darkMode ? '#f4f3f4' : '#f4f3f4'} // Knob color
          trackColor={{ false: '#767577', true: '#81b0ff' }} // Track color
        />
      </View>

      {/* Optional Link Section (currently commented out) */}
      {/* <TouchableOpacity style={styles.linkContainer}>
        <Text style={[styles.linkText, darkMode ? styles.textDark : styles.textLight]}>
          Find out more about this module
        </Text>
      </TouchableOpacity> */}

      {/* Tab Bar (Summary, Analysis, Categories) */}
      <View style={styles.menuBar}>
        {['Summary', 'Analysis', 'Categories'].map((tab) => (
          <TouchableOpacity
            key={tab}
            // Apply active style if the tab matches the activeTab state
            style={[styles.menuItem, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)} // Set the active tab on press
          >
            <Text
              style={[
                styles.menuText, // Basic text style
                darkMode ? styles.textDark : styles.textLight, // Dark/light mode text color
                activeTab === tab && styles.activeTabText, // Style for active tab text
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Area - renders content based on the active tab */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
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
    backgroundColor: '#f8f9fa', // Light mode background
  },
  containerDark: {
    backgroundColor: '#121212', // Dark mode background
  },
  header: {
    flexDirection: 'row', // Arrange items horizontally
    alignItems: 'center', // Align items vertically
    paddingHorizontal: 15,
    paddingVertical: 10,
    paddingTop: Platform.OS === 'android' ? 30 : 10, // Adjust top padding for status bar
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
    width: 40,
    height: 40,
    marginRight: 10,
  },
  moduleInfoContainer: {
    flex: 1, // Allow this container to take up remaining space
    marginLeft: 10,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5, // Space below title
  },
  statsRow: { // Container for the stats (Outlook, Positive, etc.)
    flexDirection: 'row',
    justifyContent: 'space-between', // Distribute stats
    marginTop: 5, // Space above stats row
  },
  statsContainer: {
    alignItems: 'center', // Center stat number and label
    marginHorizontal: 5, // Add some horizontal spacing between stats
    minWidth: 60, // Ensure minimum width for each stat block
  },
  statNumber: {
    fontSize: 14, // Size for the stat value
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 10, // Smaller size for the label
    color: '#6c757d', // Secondary text color
    marginTop: 2,
  },
  // Outlook styles (if different layout needed, otherwise use statsContainer)
  outlookContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
    minWidth: 60,
  },
  outlook: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  outlookLabel: {
    fontSize: 10,
    color: '#6c757d',
    marginTop: 2,
  },
  // Link styles (currently unused)
  linkContainer: {
    marginTop: 15,
    alignSelf: 'center',
    marginBottom: 15,
  },
  linkText: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: '600',
  },
  // Menu Bar / Tabs styles
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'transparent', // Keep background clear
  },
  menuItem: {
    paddingVertical: 12, // Vertical padding for touch area
    paddingHorizontal: 15, // Horizontal padding
    borderBottomWidth: 3, // Indicator line thickness
    borderBottomColor: 'transparent', // Default to transparent
  },
  activeTab: {
    borderBottomColor: '#007BFF', // Blue indicator for active tab
  },
  menuText: {
    fontSize: 16,
    fontWeight: '600', // Semi-bold tab text
  },
  activeTabText: {
    // Styles specific to the active tab text (already handled by color logic generally)
    // Could add specific color here if needed: color: '#007BFF',
  },
  // Content area styles
  contentContainer: {
    flex: 1, // Take remaining space
    padding: 15, // Padding for content
  },
  pageContent: {
    fontSize: 15,
    lineHeight: 22, // Improve readability
  },
  // Dark/Light mode text colors
  textLight: {
    color: '#212529', // Dark text for light mode
  },
  textDark: {
    color: '#e0e0e0', // Light gray text for dark mode
  },
  // Categories tab specific styles
  categoriesContainer: {
    flex: 1,
    // Padding is inherited from contentContainer
  },
  infoText: { // Style for the instruction text in Categories tab
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 15,
      color: '#6c757d',
  },
  grid: {
    // Styles for the FlatList content container (the grid itself)
    // justifyContent: 'space-between', // Removed as numColumns handles spacing
  },
  categoryButton: {
    flex: 1 / 3, // Make each button take roughly 1/3rd of the width
    margin: 4, // Small margin between buttons
    aspectRatio: 1.2, // Adjust aspect ratio for button shape (taller than wide)
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8, // Rounded corners
    borderWidth: 1,
    padding: 5, // Internal padding
  },
  buttonLight: {
    backgroundColor: '#f9f9f9', // Light background for buttons
    borderColor: '#ccc',
  },
  buttonDark: {
    backgroundColor: '#2a2a2a', // Dark background for buttons
    borderColor: '#444',
  },
  buttonText: {
    fontSize: 12, // Smaller text for buttons to fit
    textAlign: 'center',
    marginTop: 5, // Space between icon and text
  },
  // Logout button styles
  logoutButton: {
    position: 'absolute', // Position absolutely for overlay effect
    top: Platform.OS === 'android' ? 35 : 50, // Adjust top based on platform status bar
    left: 15,
    zIndex: 10, // Ensure it's above header content
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 117, 125, 0.8)', // Semi-transparent gray
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15, // Make it more rounded
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
  iconStyle: {
    marginBottom: 5, // Space below icon in category button
  },
  // Analysis tab styles
  scrollContainer: {
    flex: 1, // Ensure ScrollView takes available space
  },
  scrollContent: {
    alignItems: 'center', // Center content horizontally
    paddingBottom: 20, // Padding at the bottom
  },
  analysisContainer: {
    width: '100%', // Ensure container uses full width
    alignItems: 'center', // Center images/text within
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 10, // Space around title
    textAlign: 'center',
  },
  analysisImage: {
    width: '95%', // Use slightly less than full width
    height: 350, // Adjust height as needed
    resizeMode: 'contain',
    marginBottom: 10, // Space below non-zoomed image
    borderWidth: 1,
    borderColor: '#ddd', // Light border for image frame
  },
  fallbackText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    paddingVertical: 30, // Padding when image is missing
    marginBottom: 10,
  },
  // Modal and Zoom styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.9)', // Darker background for modal
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 50, // Adjust top positioning
    right: 20,
    zIndex: 10, // Ensure button is clickable over the zoom view
  },
});

// Export the component for use in the app's navigation
export default ModulePageScreen;