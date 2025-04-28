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
  TouchableOpacity,
  Switch,
  Image,
  ScrollView,
  Appearance,
  Modal,
  FlatList,
  Button,
  Dimensions,
} from 'react-native';

import { useUser } from '../UserContext'; // Import the context
import { useRoute } from '@react-navigation/native'; // To get module data passed during navigation
import ImageViewer from 'react-native-image-zoom-viewer';
import Icon from 'react-native-vector-icons/FontAwesome';
import ImageZoom from 'react-native-image-pan-zoom';

/**
 * ZoomableImage Component.
 * Renders an image with a button to open a modal for pan/zoom functionality.
 *
 * @param {object} props - Component props.
 * @param {object} props.imageSource - The source object for the image (e.g., require('../path/to/image.png')).
 * @returns {JSX.Element} A fragment containing the image and zoom controls.
 */
const ZoomableImage = ({ imageSource }) => {
  const [zoomVisible, setZoomVisible] = useState(false);

  const handleOpenZoom = () => {
    setZoomVisible(true); // Show the zoom modal
  };

  const handleCloseZoom = () => {
    setZoomVisible(false); // Close the zoom modal
  };

  // Get the screen dimensions
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  return (
    <>
      {/* Zoom Button */}
      <Button title="View Zoomed Image" onPress={handleOpenZoom} />
      {/* Image Display */}
      <Image
        source={imageSource}
        style={styles.analysisImage}
        resizeMode="contain"
        onLoad={() => console.log('Image is displayed')}
      />

      {/* Modal with Image Viewer */}
      <Modal visible={zoomVisible} transparent={true}>
        <View style={styles.modalContainer}>
          <ImageZoom
            cropWidth={screenWidth} // Set crop width to screen width
            cropHeight={screenHeight} // Set crop height to screen height
            imageWidth={screenWidth} // Set image width to screen width
            imageHeight={screenHeight} // Set image height to screen height
          >
            <Image
              source={imageSource}
              style={{ width: screenWidth, height: screenHeight }} // Make image fill the screen
              resizeMode="contain"
            />
          </ImageZoom>
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
  'Course Engagement and Course Feelings(Sentiment)': 'heart',
  'Learning Outcomes': 'graduation-cap',
  'Course Material': 'book',
  'Workload': 'thermometer-full',
  'Course Structure': 'sitemap',
  'Assignments': 'tasks',
  'Lectures': 'university',
  'Course Material and Understanding': 'binoculars',
  'Instructor': 'user',
  'Exams': 'pencil-square',
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
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [activeTab, setActiveTab] = useState('Summary');
  const { user, setUser } = useUser(); 
  const route = useRoute();
  
  const { module } = route.params; // Assuming the module is passed as a parameter

  // Parse the topics (categories) and handle them correctly
  const parsedTopics = module?.topics
  ? module.topics
      .split(',')
      .map(topic => topic.replace(/[[\]"'.]/g, '').trim()) // Remove unwanted characters
  : [];

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Handle Logout
  const handleLogout = () => {
    setUser(null); // Trigger the logout and navigate
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
    // Add more modules as needed
    
  };

  // Render different content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Summary':
        return (
          <Text style={[styles.pageContent, darkMode ? styles.textDark : styles.textLight]}>
            {module?.summary || 'No summary available'} {/* Render actual summary or a fallback message */}
          </Text>
        );
        case 'Analysis':
          // Get the module name and sanitize it to match the image mapping keys
          const moduleName = module?.name
          .trim()
          .replace(/\s+/g, '-')  // Convert spaces to hyphens
          .replace(/[^\w-]/g, ''); // Remove special characters except hyphens

          // Get the image paths from the mapping
          const emotionImage = imageMapping[moduleName]?.emotion;
          const sentimentImage = imageMapping[moduleName]?.sentiment;
          return (
            <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
              <View style={styles.analysisContainer}>
                
                {/* Emotion Timeseries */}
                <Text style={styles.imageTitle}>Emotion Timeseries</Text>
                {emotionImage ? (
                  <ZoomableImage 
                  imageSource={emotionImage} 
                  />
                ) : (
                  <Text style={styles.fallbackText}>Image for Emotion Timeseries is unavailable</Text>
                )}


                {/* Sentiment Timeseries */}
                <Text style={styles.imageTitle}>Sentiment Timeseries</Text>
                {sentimentImage ? (
                  <ZoomableImage 
                  imageSource={sentimentImage} 
                  />
                ) : (
                  <Text style={styles.fallbackText}>Image for Sentiment Timeseries is unavailable</Text>
                )}

              </View>
            </ScrollView>
          );
        case 'Categories':
        return (
          <View style={styles.categoriesContainer}>
            <Text
              style={[styles.pageContent, darkMode ? styles.textDark : styles.textLight]}
            >
              Choose a button to see the module in the perspective of different categories that you care about
            </Text>
            <FlatList
              data={parsedTopics} // Use parsed topics here
              numColumns={3} // 3 columns for the grid
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    darkMode ? styles.buttonDark : styles.buttonLight,
                  ]}
                  onPress={() => {
                    console.log('Navigating with:', { topic: item, moduleName: module.name });
                    navigation.navigate('ModuleCategory', { 
                      topic: item, 
                      moduleName: module.name 
                    });
                  }}                  
                >
                  <Icon 
                    name={topicIcons[item] || 'question-circle'} 
                    size={24} 
                    color={darkMode ? '#fff' : '#000'} 
                    style={{ marginRight: 10 }} 
                  />
                  <Text
                    style={[
                      styles.buttonText,
                      darkMode ? styles.textDark : styles.textLight,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}              
              contentContainerStyle={styles.grid}
            />
          </View>
        );
      default:
        return null;
    }
  };
  // --- Render Main Screen Layout ---
  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      {/* Logout Button */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="arrow-circle-left" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../images/logo.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
        
        <View style={styles.moduleInfoContainer}>
          {/* Module Title */}
          <Text style={[styles.moduleTitle, darkMode ? styles.textDark : styles.textLight]}>
            {module?.name}
          </Text>

          {/* Outlook Section */}
          <View style={styles.outlookContainer}>
            <Text style={[styles.outlook, darkMode ? styles.textDark : styles.textLight]}>
              {module?.outlook || 'N/A'}
            </Text>
            <Text style={[styles.outlookLabel, darkMode ? styles.textDark : styles.textLight]}>
              Outlook
            </Text>
          </View>

          {/* Positive Section */}
          <View style={styles.statsContainer}>
            <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
              {module?.positive || 'N/A'}
            </Text>
            <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
              Positive
            </Text>
          </View>

          {/* Negative Section */}
          <View style={styles.statsContainer}>
            <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
              {module?.negative || 'N/A'}
            </Text>
            <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
              Negative
            </Text>
          </View>

          {/* Categories Section */}
          <View style={styles.statsContainer}>
            <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
              {parsedTopics.length}
            </Text>
            <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
              Categories
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

      {/* Link Section Below Header */}
      <TouchableOpacity style={styles.linkContainer}>
        <Text style={[styles.linkText, darkMode ? styles.textDark : styles.textLight]}>
          Find out more about this module
        </Text>
      </TouchableOpacity>

      {/* Menu Bar */}
      <View style={styles.menuBar}>
        {['Summary', 'Analysis', 'Categories'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.menuItem, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.menuText,
                darkMode ? styles.textDark : styles.textLight,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Page Content */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  logo: {
    width: 50,
    height: 50,
  },
  moduleInfoContainer: {
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 20,
    alignSelf: 'center',
  },
  outlookContainer: {
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  analysisContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  analysisImage: {
    width: '90%',
    height: 250, // Adjust the height based on your preference
    marginVertical: 10,
  },
  outlook: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  analysisContainer: {
    width: '100%', // Make sure the container takes up full width
    alignItems: 'center',
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  analysisImage: {
    width: '100%',  // Take up 90% of the screen width
    height: 700,  // Adjust height to make images larger
    resizeMode: 'contain',
    marginBottom: 20,
  },
  fallbackText: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)', // Semi-transparent background for modal
  },
  outlookLabel: {
    fontSize: 12,
  },
  statsContainer: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  linkContainer: {
    marginTop: 20,
    alignSelf: 'center',
    marginBottom: 20,
  },
  linkText: {
    fontSize: 14,
    color: '#007BFF',
    fontWeight: 'bold',
  },
  menuBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
  },
  menuItem: {
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: '#007BFF',
  },
  menuText: {
    fontSize: 16,
  },
  activeTabText: {
    fontWeight: 'bold',
    color: '#007BFF',
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  pageContent: {
    fontSize: 16,
  },
  textLight: {
    color: '#000',
  },
  textDark: {
    color: '#fff',
  },
  categoriesContainer: {
    flex: 1,
    padding: 20,
  },
  
  grid: {
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  
  categoryButton: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  
  buttonLight: {
    backgroundColor: '#f9f9f9',
  },
  
  buttonDark: {
    backgroundColor: '#333',
  },
  
  buttonText: {
    fontSize: 14,
    textAlign: 'center',
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
    fontSize: 20, // Icon size
    color: '#fff', // Icon color (white)
    marginRight: 10, // Space between icon and text
  },
  logoutText: {
    color: '#fff', // Text color (white)
    fontSize: 12, // Text size
    fontWeight: 'bold', // Bold text
  },  
  iconStyle: {
    marginRight: 10,
  },
  closeButtonContainer: {
    position: 'absolute', // Position the button absolutely
    top: 40, // Distance from the top of the screen
    right: 20, // Distance from the right of the screen
  },
});

export default ModulePageScreen;
