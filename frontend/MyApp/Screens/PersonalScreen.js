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
  TouchableOpacity,
  Switch,
  Image,
  FlatList,
  Appearance,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { getTaughtModules, getSavedModules, getSelectedModules, removeSelectedModule, getRecommendedModules, removeRecommendedModule, getAllModules } from '../api/apiService';

import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * PersonalScreen Component.
 * Renders the user's profile information and relevant module lists.
 */
const PersonalScreen = () => {
  const { user, setUser } = useUser();
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [modules, setModules] = useState([]);
  const [savedModulesCount, setSavedModulesCount] = useState(0);
  const [savedModules, setSavedModules] = useState([]);
  const [taughtModulesCount, setTaughtModulesCount] = useState(0);
  const [filteredModules, setFilteredModules] = useState([]);  // State for filtered modules
  const [showSavedModules, setShowSavedModules] = useState(true);  // New state to toggle saved modules
  const navigation = useNavigation();

  // for the display of modules
  useFocusEffect(
    useCallback(() => {
      const fetchSelectedModules = async () => {
        try {
          let userModules = [];
          let allModules = await getAllModules(); // Replace this with API call if needed
  
          if (user?.role === 'Student') {
            userModules = await getRecommendedModules();
          } else if (user?.role === 'Teacher') {
            userModules = await getSelectedModules();
          }
  
          if (!Array.isArray(userModules)) {
            console.warn("userModules is not an array! Defaulting to empty array.");
            userModules = [];
          }
  
          // Filter only the modules the user is involved with
          const updatedModules = allModules.filter((mod) => userModules.includes(mod.name));
  
          setFilteredModules(updatedModules);
        } catch (error) {
          console.error("Error fetching selected user modules:", error);
          setFilteredModules([]);
        }
      };
  
      fetchSelectedModules();
    }, [user])
  );
  
  // for the header
  useFocusEffect(
    useCallback(() => {
      const fetchModules = async () => {
        console.log(user);
        try {
          let fetchedModules = [];

          if (user?.role === 'Student') {
            fetchedModules = await getSavedModules();
            setSavedModulesCount(fetchedModules.length)
            setSavedModules(fetchedModules);
            // setSavedModulesCount(fetchedModules.length);
          } else if (user?.role === 'Teacher') {
            fetchedModules = await getTaughtModules();
            setTaughtModulesCount(fetchedModules.length);
          }
        } catch (error) {
          console.error('Error fetching modules:', error);
        }
      };

      fetchModules();
    }, [user])
  );

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
            // userModules = await getTaughtModules();
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
          setSavedModules(updatedModules);
        } catch (error) {
          console.error("Error fetching user modules:", error);
          setSavedModules([]);  // Reset to empty array on error
        }
      };

      fetchUserModules();
    }, [user])
  );

  /**
   * Handles the removal of a module from the main displayed list
   * (Recommended for Students, Selected for Teachers).
   * @param {string} moduleName - The name of the module to remove.
   */
  const handleRemoveSelectedModule = async (moduleName) => {
    try {
      // Handle removal based on user role
      if (user?.role === 'Student') {
        await removeRecommendedModule(moduleName);
      } else if (user?.role === 'Teacher') {
        await removeSelectedModule(moduleName);
      }

      // Remove the module from the displayed list
      setFilteredModules((prevModules) => prevModules.filter((mod) => mod.name !== moduleName));

    } catch (error) {
      console.error('Error removing module:', error);
    }
  };

  // toggles dark mode view
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Toggle saved modules visibility
  const toggleSavedModules = () => {
    setShowSavedModules((prev) => !prev);
  };

  const handleLogout = () => {
    setUser(null);
  };

   // Define markdown styles inside the component
  const markdownStyles = {
    body: { color: darkMode ? '#fff' : '#000', fontSize: 14 },
    strong: { fontWeight: 'bold' },
    em: { fontStyle: 'italic' },
    bullet_list: { marginLeft: 10 },
    list_item: { marginBottom: 5 },
  };

   /** Toggles the visibility of the shortform and longform recommendations. */
  const [showLongformRecommendations, setShowLongformRecommendations] = useState({});

  /**
   * Toggles the display between shortform and longform teacher feedback for a specific module.
   * @param {string} moduleName - The name of the module whose feedback display to toggle.
   */
  const toggleRecommendation = (moduleName) => {
    setShowLongformRecommendations((prev) => ({
      ...prev,
      [moduleName]: !prev[moduleName],
    }));
  };  
       /**
       * Renders a single module card component.
       * This function is used by both FlatLists (Saved and Recommended/Selected).
       * @param {object} params - Parameters passed by FlatList's renderItem.
       * @param {object} params.item - The module data object for the current card.
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
              {/* Circle next to the module title */}
              <View style={[styles.outlookCircle, { backgroundColor: circleColor }]} />
              <Text style={[styles.moduleName, darkMode ? styles.textDark : styles.textLight]}>
                {item.name}
              </Text>
            </View>
      
            {/* Card components and icons */}
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
  
        {/* Show Shortform or Longform Recommendation */}
        {user?.role === 'Teacher' && item.teacher_feedback_recommendation && (
          <View style={styles.feedbackContainer}>
            <Markdown style={markdownStyles}>
              {`**Hello ${user?.name || 'User'}! Here are your Recommendations based on the Student Feedback on ${item.name}:**\n\n${
                showLongformRecommendations[item.name]
                  ? item.teacher_feedback_recommendation
                  : item.teacher_feedback_recommendation_shortform
              }`}
            </Markdown>
            <TouchableOpacity 
              style={styles.toggleButton} 
              onPress={() => toggleRecommendation(item.name)}
            >
              
              <Text style={styles.buttonText}>
                {showLongformRecommendations[item.name] ? 'Show Shortform' : 'Show Longform'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
  
        {/* Remove Recommendation Button */}
        {user?.role === 'Teacher' && (
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveSelectedModule(item.name)}>
            <Text style={styles.buttonText}>Remove Feedback Summary</Text>
          </TouchableOpacity>
        )}
  
        {user?.role === 'Student' && (
          <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveSelectedModule(item.name)}>
            <Text style={styles.buttonText}>Remove Recommendation</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
   
  // --- Render Main Screen ---
  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require('../images/logo.png')} 
          style={styles.logo}
          resizeMode="contain" 
        />
        
        <View style={styles.moduleInfoContainer}>
          {/* Student/Teacher Name */}
          <View style={styles.outlookContainer}>
            <Text style={[styles.outlook, darkMode ? styles.textDark : styles.textLight]}>
              {user?.name || 'User'}
            </Text>
            <Text style={[styles.outlookLabel, darkMode ? styles.textDark : styles.textLight]}>
              {user?.role === 'Student' ? 'Student' : 'Teacher'}
            </Text>
          </View>

          {/* Year of Study (Only for Students) */}
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

          {/* Number of Modules Saved/Taught */}
          <View style={styles.statsContainer}>
            <Text style={[styles.statNumber, darkMode ? styles.textDark : styles.textLight]}>
              {user?.role === 'Student' ? savedModulesCount : taughtModulesCount}
            </Text>
            <Text style={[styles.statLabel, darkMode ? styles.textDark : styles.textLight]}>
              {user?.role === 'Student' ? 'Saved' : 'Taught Modules'}
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
        <Icon name="arrow-circle-left" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Title */}
      {user ? (
      user.role === 'Student' ? (
        <Text style={[styles.title, darkMode ? styles.textDark : styles.textLight]}>
          View Your Recommendations (Generate a completely new set by going to the recommendations page)
        </Text>
      ) : (
        <Text style={[styles.title, darkMode ? styles.textDark : styles.textLight]}>
          View Your Recommendations to improve Selected Modules that you teach, {user.name}
        </Text>
      )
    ) : (
      <Text style={[styles.title, darkMode ? styles.textDark : styles.textLight]}>
        Please log in to view your recommendations.
      </Text>
    )}


      {savedModules.length > 0 && (
        <TouchableOpacity 
          onPress={toggleSavedModules} 
          style={styles.SavedtoggleButton}
        >
          <Text style={styles.buttonText}>
            {showSavedModules ? 'Show Positive Matches Only' : 'Show Saved Modules (Default Recommendations)'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Render saved modules for students */}
      {showSavedModules && user?.role === 'Student' && savedModules.length > 0 && (
        <>
          <Text style={[styles.title, darkMode ? styles.textDark : styles.textLight]}>
            Your Saved Modules (These are recommended to you by default)
          </Text>
          <FlatList
            data={savedModules}
            keyExtractor={(item, index) => `saved-${item.id ?? index}`}
            renderItem={renderModuleCard}
            contentContainerStyle={styles.list}
          />
        </>
      )}

      {showSavedModules && user?.role === 'Student' && (
              <>
              <Text style={[styles.title, darkMode ? styles.textDark : styles.textLight]}>
              Your Recommended Modules (These are recommended to you based on your preferences)
            </Text>
              </>
      )}

      {/* Render modules in FlatList */}
      <FlatList
        data={filteredModules}
        keyExtractor={(item, index) => `recommended-${item.id ?? index}`}
        renderItem={({ item }) => 
          renderModuleCard({ 
            item, 
            showLongformRecommendation: showLongformRecommendations[item.name], 
            toggleRecommendation 
          })
        }
        contentContainerStyle={styles.list}
      />
      
    </View>
  );
};

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
  moduleInfoContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginLeft: 10,
  },
  outlookContainer: { 
    marginRight: 90, 
    alignItems: 'flex-start', // Align text to the left
  },
  outlook: { 
    fontSize: 16, // Consistent font size
    fontWeight: 'bold',
  },
  outlookLabel: { 
    fontSize: 14, // Consistent font size
    fontStyle: 'italic',
  },
  statsContainer: { 
    marginRight: 90, 
    alignItems: 'center', // Center align year and saved fields
  },
  statNumber: { 
    fontSize: 16, // Consistent font size
    fontWeight: 'bold',
  },
  statLabel: { 
    fontSize: 14, // Consistent font size
  },
  title: { fontSize: 18, fontWeight: 'bold', margin: 20 },
  logo: { width: 100, height: 100, marginRight: 15 },
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
  buttonText: { color: '#fff', fontWeight: 'bold' },
  card: { borderRadius: 10, padding: 15, marginBottom: 15 },
  cardLight: { backgroundColor: '#f9f9f9' },
  cardDark: { backgroundColor: '#1f1f1f' },
  moduleName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  stats: { marginBottom: 10 },
  summary: { fontSize: 14, marginBottom: 15 },
  feedbackContainer: { backgroundColor: '#e9e9e9', padding: 10, marginTop: 10, borderRadius: 5 },
  feedbackText: { fontSize: 14, fontStyle: 'italic' },
  button: { backgroundColor: '#007BFF', borderRadius: 5, paddingVertical: 10, alignItems: 'center', marginBottom: 5 },
  removeButton: { backgroundColor: '#FF4500', borderRadius: 5, paddingVertical: 10, alignItems: 'center' },
  toggleButton: { backgroundColor: '#D8B4F8', borderRadius: 3, paddingVertical: 10, alignItems: 'center' },
  SavedtoggleButton: {
    backgroundColor: '#007BFF',  // Green for positive action
    borderRadius: 3,
    paddingVertical: 10,
    alignItems: 'center',
    width: 200,
    marginLeft: 20,
  },  
  textLight: { color: '#000' },
  textDark: { color: '#fff' },
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
moduleName: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
  },  
});

// Export the component
export default PersonalScreen;