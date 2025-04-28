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
  FlatList,
  TouchableOpacity,
  Switch,
  Image,
  Appearance,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserProvider, useUser } from '../UserContext'; // Import the context
import { addSavedModule, addTaughtModule, getAllModules } from '../api/apiService'; // Import the new functions

// Import vector icons
import Icon from 'react-native-vector-icons/FontAwesome';

/**
 * SearchScreen Component.
 * Renders a search bar and a list of modules, allowing users to filter and interact.
 */
const SearchScreen = () => {
  const [darkMode, setDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [modules, setModules] = useState([]);
  const navigation = useNavigation();
  const { user, setUser } = useUser(); // Access user and setUser from context

  // Fetch all modules from the API
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const modulesData = await getAllModules(); // Fetch modules
        setModules(modulesData);  // Set the modules state
      } catch (error) {
        console.error("Failed to fetch modules", error);
      }
    };

    fetchModules();
  }, []);

  // handles dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

   /**
   * Navigates to the ModulePageScreen with details of the selected module.
   * @param {object} item - The module object selected by the user.
   */
  const handleVisitModulePage = (item) => {
    navigation.navigate('ModulePage', { module: item });
    console.log(item.analysis_refs);
  };

  const handleLogout = () => {
    setUser(null);  // This will trigger the logout and navigate to Login screen
  };

  // Filter modules based on the search query
  const filteredModules = modules.filter((module) =>
    module.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle adding module logic based on user role
  const handleAddModule = async (module) => {
    if (user?.role === 'Student') {
      try {
        await addSavedModule(module.name); // Add to student's saved list
        console.log(`Student added module: ${module.name}`);
      } catch (error) {
        console.error('Error adding module to saved list:', error);
      }
    } else if (user?.role === 'Teacher') {
      try {
        await addTaughtModule(module.name); // Add to teacher's taught list
        console.log(`Teacher added module to teaching list: ${module.name}`);
      } catch (error) {
        console.error('Error adding module to taught list:', error);
      }
    }
  };

  /**
   * Renders a single module card component within the FlatList.
   * @param {object} params - Parameters passed by FlatList renderItem.
   * @param {object} params.item - The module data object for the current card.
   * @returns {JSX.Element} The JSX element representing the module card.
   */
  const renderModuleCard = ({ item }) => {
        // Parse item.topics if it's a string, otherwise use it as-is (assuming it's already an array)
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
            <TouchableOpacity style={styles.button} onPress={() => handleVisitModulePage(item)}>
              <Text style={styles.buttonText}>Visit Module Page</Text>
            </TouchableOpacity>
        
            {/* Conditional Add Module Button */}
            <TouchableOpacity 
              style={[styles.button, { backgroundColor: 'green', marginTop: 10 }]} 
              onPress={() => handleAddModule(item)}
            >
              <Text style={styles.buttonText}>
                {user?.role === 'Student' ? 'Add Module' : 'Add to Teaching'}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }; 

  // --- Render Main Screen UI ---
  return (
    <View style={[styles.container, darkMode ? styles.containerDark : styles.containerLight]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Logo */}
        <View style={styles.logoPlaceholder}>
          <Image 
            source={require('../images/logo.png')}
            style={styles.logo}
            resizeMode="contain" 
          />
        </View>
        {/* Search Bar */}
        <TextInput
          style={[styles.searchInput, darkMode ? styles.textDark : styles.textLight]}
          placeholder="Search by module code or name"
          placeholderTextColor={darkMode ? '#bbb' : '#666'}
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
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
        <Icon name="arrow-circle-left" style={styles.logoutIcon} />
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

      {/* Title */}
      <Text style={[styles.headerTitle, darkMode ? styles.textDark : styles.textLight]}>
        Explore Modules 
        {user?.role === 'Student' ? ' (Add them to your Saved Modules if you are interested in them!)' : 'Taught Modules (Add them to your Taught Modules if you teach them!)'}
      </Text>


      {/* Saved Modules */}
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
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  logoPlaceholder: { width: 100, height: 100, marginRight: 15 },
  logo: {
    width: '100%',
    height: '100%',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 15,
    backgroundColor: '#f0f0f0',
    color: '#000',
    marginRight: 10,
  },
  list: {
    padding: 10,
  },
  card: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  cardLight: {
    backgroundColor: '#f9f9f9',
  },
  cardDark: {
    backgroundColor: '#1f1f1f',
  },
  moduleName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  stats: {
    marginBottom: 10,
  },
  summary: {
    fontSize: 14,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  textLight: {
    color: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  textDark: {
    color: '#fff',
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
export default SearchScreen;
