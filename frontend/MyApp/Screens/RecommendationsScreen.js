/**
 * @fileoverview Recommendations Screen Component.
 * Allows students to generate module recommendations based on their preferences,
 * and allows teachers to select modules they teach to get feedback-based recommendations.
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Image,
  Appearance,
  FlatList,
  ScrollView, 
  KeyboardAvoidingView, 
  Platform
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../UserContext';
import { useFocusEffect } from '@react-navigation/native';
import { getTaughtModules, addSelectedModules, saveUserPreferences, generateStudentModuleRecs, getAllModules } from '../api/apiService';

import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * RecommendationsScreen Component.
 * Conditionally renders UI based on user role (Student or Teacher).
 */
const RecommendationsScreen = () => {
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [answers, setAnswers] = useState({});
  const navigation = useNavigation();
  const [filteredModules, setFilteredModules] = useState([]);
  const { user, setUser } = useUser();

  const [openPriority, setOpenPriority] = useState(false);
  const [priority, setPriority] = useState(null);
  const [openImportance, setOpenImportance] = useState(false);
  const [importance, setImportance] = useState(null);
  const [openCategories, setOpenCategories] = useState(false);
  const [categories, setCategories] = useState(null);
  const [openTopics, setOpenTopics] = useState(false);
  const [topics, setTopics] = useState([]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);
  
  // Fetch all modules from the API (only once)
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modules = await getAllModules(); // Get all modules once
        setFilteredModules(modules); // Set all modules into the state
      } catch (error) {
        console.error('Error fetching modules:', error);
        setFilteredModules([]);
      }
    };

    fetchModules();
  }, []);
  useFocusEffect(
    useCallback(() => {
      const fetchTeacherModules = async () => {
        try {
          // Fetch all modules from the API
          const allModules = await getAllModules();
  
          // Fetch the list of taught modules for the teacher
          let userModules = user?.role === 'Teacher' ? await getTaughtModules() : [];
          if (!Array.isArray(userModules)) userModules = [];
  
          // Filter the modules to only include the ones the teacher has taught
          const filtered = allModules.filter((mod) => userModules.includes(mod.name));
          setFilteredModules(filtered);
        } catch (error) {
          console.error("Error fetching modules:", error);
          setFilteredModules([]);
        }
      };
  
      fetchTeacherModules();
    }, [user])
  );  

  /**
   * Handles the action when a module card's button is pressed.
   * For Students: Adds the module to their ??? list (API endpoint suggests 'selected').
   * For Teachers: Adds the module to their selected list for feedback generation.
   * @param {object} module - The module object that was selected.
   */
  const handleSelectModule = async (module) => {
    if (user?.role === 'Student') {
      try {
        await addSelectedModules(module.name);
        console.log(`Student added module: ${module.name}`);
      } catch (error) {
        console.error('Error adding module to saved list:', error);
      }
    } else if (user?.role === 'Teacher') {
      try {
        await addSelectedModules(module.name);
        console.log(`Teacher added module to selected list: ${module.name}`);
      } catch (error) {
        console.error('Error adding module to taught list:', error);
      }
    }
  };

  // handle logout
  const handleLogout = () => setUser(null);

   /**
   * Renders a single module card for the Teacher's list view.
   * @param {object} params - Parameters passed by FlatList renderItem.
   * @param {object} params.item - The module data object.
   * @returns {JSX.Element} The JSX for the module card.
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
      
             {/* Module card components and icons */}
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
      
             {/* Visit Module Page Button */}
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Visit Module Page</Text>
              </TouchableOpacity>

              {/* Conditional Add Module Button */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: 'green', marginTop: 10 }]}
                onPress={() => handleSelectModule(item)}
              >
                <Text style={styles.buttonText}>
                  {user?.role === 'Student' ? 'Add Module' : 'Generate Recommendations for this Module'}
                </Text>
              </TouchableOpacity>
            </View>
        );
      }; 
  
      // parsing user response
      const userPreferences = {
        user_priority: priority ? priority.split(',').map(Number) : [1, 2, 3],  // Map priorities to numbers
        selected_importance: importance ? parseInt(importance) : 1,  // Directly parse the importance value
        selected_categories: Array.isArray(categories) ? categories : [],  // Ensure categories is an array
        selected_aspects: Array.isArray(topics) ? topics : [],  // Ensure topics is an array
      };           
      
      // handle submission of student preferences
      const handleSubmit = async () => {
        alert("Button Pressed! Saving Preferences...");
        console.log("Saving User Preferences for Recommendation:", userPreferences);
      
        try {
          const response = await generateStudentModuleRecs(userPreferences);
          console.log("Preferences saved and generation submitted:", response);
        } catch (error) {
          console.error("Error saving preferences:", error);
        }
      };

      // --- Student Preference Form Content ---
      const formContent = (
        <View style={styles.form}>
          {[
            { 
              label: 'Rank what is most important to you when choosing a module: \n 1. Feelings and experiences of past cohorts (reviews, sentiment, emotion) (e.g., 1,2,3) \n 2. Subject area (What you’re interested in learning about) \n 3. Aspects of the module (e.g., workload, exams, grading, etc.)', 
              open: openPriority, 
              setOpen: setOpenPriority, 
              value: priority, 
              setValue: setPriority, 
              items: [
                { label: '1,2,3', value: '1,2,3' }, 
                { label: '1,3,2', value: '1,3,2' }, 
                { label: '2,1,3', value: '2,1,3' }, 
                { label: '2,3,1', value: '2,3,1' }, 
                { label: '3,1,2', value: '3,1,2' }, 
                { label: '3,2,1', value: '3,2,1' }
              ]
            },
            { 
              label: 'How important are the feelings/experiences of past cohorts to you?', 
              open: openImportance, 
              setOpen: setOpenImportance, 
              value: importance, 
              setValue: setImportance, 
              items: [
                { label: '1 (Very Important)', value: '1' }, 
                { label: '2 (Important)', value: '2' }, 
                { label: '3 (Neutral)', value: '3' }, 
                { label: '4 (Unimportant)', value: '4' }
              ]
            },
            { 
              label: 'What subject area(s) are you interested in learning about? (e.g., Programming, AI & Machine Learning)', 
              open: openCategories, 
              setOpen: setOpenCategories, 
              value: categories, 
              setValue: setCategories, 
              items: [
                { label: 'AI & Machine Learning', value: 'AI & Machine Learning' },
                { label: 'Python Programming', value: 'Python Programming' },
                { label: 'Programming Languages', value: 'Programming Languages' },
                { label: 'Data Science', value: 'Data Science' },
                { label: 'Databases', value: 'Databases' },
                { label: 'Algorithms', value: 'Algorithms' },
                { label: 'Cyber Security', value: 'Cyber Security' },
                { label: 'Problem Solving', value: 'Problem Solving' },
                { label: 'Programming Basics', value: 'Programming Basics' },
                { label: 'Data Visualization', value: 'Data Visualization' },
                { label: 'Big Data', value: 'Big Data' },
                { label: 'C++ Programming', value: 'C++ Programming' },
                { label: 'Financial Analysis', value: 'Financial Analysis' },
                { label: 'Data Analytics', value: 'Data Analytics' },
                { label: 'Quantum Computing', value: 'Quantum Computing' },
                { label: 'Software Engineering', value: 'Software Engineering' },
                { label: 'Data Management', value: 'Data Management' },
                { label: 'Business & Technology', value: 'Business & Technology' },
                { label: 'Python & Web Development', value: 'Python & Web Development' }
              ],
              multiple: true
            },
            { 
              label: 'What aspects of the module do you care about? (e.g., Exams, Grading, Assignments)', 
              open: openTopics, 
              setOpen: setOpenTopics, 
              value: topics, 
              setValue: setTopics, 
              items: [
                { label: 'Utility and Usefulness', value: 'Utility and Usefulness' }, 
                { label: 'Course Engagement and Course Feelings(Sentiment)', value: 'Course Engagement and Course Feelings(Sentiment)' }, 
                { label: 'Learning Outcomes', value: 'Learning Outcomes'}, 
                { label: 'Grading', value: 'Grading' }, 
                { label: 'Course Material', value: 'Course Material' },
                { label: 'Workload', value: 'Workload' },
                { label: 'Course Structure', value: 'Course Structure' },
                { label: 'Assignments', value: 'Assignments' },
                { label: 'Lectures', value: 'Lectures' },
                { label: 'Course Material and Understanding', value: 'Course Material and Understanding' },
                { label: 'Instructor', value: 'Instructor' },
                { label: 'Exams', value: 'Exams' },
              ],
              multiple: true
            }
          ].map((field, index) => (
            <View key={index} style={[styles.formGroup, { zIndex: 1000 - index }]}>
              <Text style={[styles.questionText, darkMode ? styles.textDark : styles.textLight]}>
                {field.label}
              </Text>
              <DropDownPicker
                open={field.open}
                setOpen={field.setOpen}
                value={field.value}
                setValue={field.setValue}
                items={field.items}
                multiple={field.multiple || false}
                
                // Ensure selected values are displayed in the placeholder
                placeholder={
                  Array.isArray(field.value) && field.value.length > 0 
                    ? field.value.join(", ") 
                    : "Select an option"
                }
        
                // Hide default "{x} item(s) selected" message
                showSelectedItems={false}
        
                // Makes sure selected values are still visible in the input field
                mode="BADGE"
                badgeColors={["#007BFF"]}
                badgeDotColors={["#FFF"]}
                badgeTextStyle={{ color: "#FFF" }}
                
                style={[styles.dropdown, { zIndex: 1000 - index }]}
                dropDownContainerStyle={[styles.dropdownContainer, { zIndex: 1000 - index }]}
                textStyle={darkMode ? styles.textDark : styles.textLight}
                dropDownDirection="BOTTOM"
              />
            </View>
          ))}
          <TouchableOpacity
            style={styles.button}
            onPress={handleSubmit} // Fix here: Pass the function reference without parentheses
          >
            <Text style={styles.buttonText}>Generate Module Recommendations</Text>
          </TouchableOpacity>
        </View>
      );      

  // --- Conditional Rendering of questionnaire vs. taught modules based on User Role ---
  if (user?.role === 'Student') {
    return (
      <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Image source={require('../images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={[styles.headerTitle, darkMode ? styles.textDark : styles.textLight]}>Generator</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="arrow-circle-left" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        {formContent}
      </View>
    );
  } else if (user?.role === 'Teacher') {
    return (
      <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
        <View style={styles.header}>
          <View style={styles.logoPlaceholder}>
            <Image source={require('../images/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={[styles.headerTitle, darkMode ? styles.textDark : styles.textLight]}>Generate Module Recommendations</Text>
          <Switch value={darkMode} onValueChange={toggleDarkMode} />
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Icon name="arrow-circle-left" style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        <FlatList data={filteredModules} renderItem={renderModuleCard} keyExtractor={(item) => item.id} style={styles.list} />
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  containerLight: { backgroundColor: '#ffffff' },
  containerDark: { backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderColor: '#ccc' },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  logoPlaceholder: { width: 100, height: 100, marginRight: 15 },
  logo: { width: '100%', height: '100%' },
  form: { padding: 20, flex: 1 },
  formGroup: { marginBottom: 10 },
  questionText: { fontSize: 15, marginBottom: 5 },
  dropdown: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, paddingHorizontal: 10, backgroundColor: '#f9f9f9' },
  dropdownContainer: { borderWidth: 1, borderRadius: 5, borderColor: '#ccc', marginTop: 5 },
  button: { backgroundColor: '#007BFF', borderRadius: 5, paddingVertical: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
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
  card: { padding: 15, margin: 10, borderRadius: 10, backgroundColor: '#fff', elevation: 3 },
  cardDark: { backgroundColor: '#2c2c2c' },
  cardLight: { backgroundColor: '#ffffff' },
  moduleName: { fontSize: 18, fontWeight: 'bold' },
  stats: { marginTop: 10 },
  summary: { marginTop: 10, fontStyle: 'italic' },
  removeButton: { backgroundColor: '#FF6347', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, marginTop: 20 },
  list: { paddingBottom: 20 },
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
  summaryContainer: {
    backgroundColor: '#FFFAE3', // Highlighted background
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  summary: { fontSize: 14, marginBottom: 15 },
  summaryLight: { backgroundColor: '#FFFAE3' },
  summaryDark: { backgroundColor: '#333' },
});

// Export the component
export default RecommendationsScreen;
