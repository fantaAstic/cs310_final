/**
 * @fileoverview Main application file setting up navigation and authentication flow.
 * Uses React Navigation for handling different navigation patterns (Stack, Bottom Tabs)
 * and React Context API (`UserContext`) for managing global user authentication state.
 * It provides platform-specific navigation layouts for Web and Mobile.
 */

import React, { useState, useEffect, createContext } from 'react';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native'; // Import React Native core components
import { NavigationContainer } from '@react-navigation/native'; // Root navigation container
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Bottom tab navigator
// import { createDrawerNavigator } from '@react-navigation/drawer'; // Drawer navigator (imported but not used in final structure)
import { createStackNavigator } from '@react-navigation/stack'; // Stack navigator for nested screens
import AsyncStorage from '@react-native-async-storage/async-storage'; // Asynchronous storage for persisting user data

// Import screen components
import DashboardScreen from './Screens/DashboardScreen';
import SearchScreen from './Screens/SearchScreen';
import PersonalScreen from './Screens/PersonalScreen';
import SettingsScreen from './Screens/SettingsScreen';
import RecommendationsScreen from './Screens/RecommendationsScreen';
import ModuleCategoryScreen from './Screens/ModuleCategoryScreen';
import ModulePageScreen from './Screens/ModulePageScreen';
import LoginRegisterScreen from './Screens/LoginRegisterScreen';

// Import User Context for managing user state
import { UserProvider, useUser } from './UserContext';

// Import icon library for tab bar icons
import Icon from 'react-native-vector-icons/FontAwesome';

// --- Create Navigator Instances ---
// These instances are used to define navigation structures.
// const Drawer = createDrawerNavigator(); // Drawer navigator instance (not used in current setup)
const Tab = createBottomTabNavigator(); // Bottom Tab navigator instance
const Stack = createStackNavigator(); // Stack navigator instance

// --- Context ---
/**
 * Authentication Context (unused in this snippet).
 * Could potentially be used for more fine-grained auth state management if needed.
 * @deprecated Currently unused; user state is managed via UserContext.
 */
export const AuthContext = createContext();

// --- Stack Navigator Configurations ---
// Define reusable Stack Navigators for flows within specific sections of the app.
// This allows navigating to detail screens (like ModulePage) from multiple tabs.

/**
 * Stack Navigator for the Dashboard tab flow.
 * Allows navigating from Dashboard -> ModulePage -> ModuleCategory.
 */
const DashboardToModule = () => (
  <Stack.Navigator initialRouteName="DashboardMain">
    {/* Main screen within the Dashboard stack */}
    <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    {/* Detail screen for a specific module */}
    <Stack.Screen name="ModulePage" component={ModulePageScreen} options={{ title: 'Module Page' }} />
    {/* Screen to show modules within a category */}
    <Stack.Screen name="ModuleCategory" component={ModuleCategoryScreen} options={{ title: 'Module Categories' }} />
  </Stack.Navigator>
);

/**
 * Stack Navigator for the Search tab flow.
 * Allows navigating from Search -> ModulePage -> ModuleCategory.
 */
const SearchToModule = () => (
  <Stack.Navigator initialRouteName="SearchMain">
    {/* Main screen within the Search stack */}
    <Stack.Screen
      name="SearchMain"
      component={SearchScreen}
      options={{ title: 'Search' }}
    />
    {/* Detail screen for a specific module */}
    <Stack.Screen name="ModulePage" component={ModulePageScreen} options={{ title: 'Module Page' }} />
    {/* Screen to show modules within a category */}
    <Stack.Screen name="ModuleCategory" component={ModuleCategoryScreen} options={{ title: 'Module Categories' }} />
  </Stack.Navigator>
);

/**
 * Stack Navigator for the Recommendations tab flow.
 * Allows navigating from Recommendations -> Personal.
 */
const RecommendationsToPersonal = () => (
  <Stack.Navigator initialRouteName="RecommendationsMain">
    {/* Main screen within the Recommendations stack */}
    <Stack.Screen
      name="RecommendationsMain"
      component={RecommendationsScreen}
      options={{ title: 'Recommendations' }}
    />
    {/* Screen showing personal details (potentially related to recommendations) */}
    <Stack.Screen name="Personal" component={PersonalScreen} options={{ title: 'Personal' }} />
  </Stack.Navigator>
);

/**
 * Stack Navigator for the Personal tab flow.
 * Currently only contains the main Personal screen. Could be expanded.
 */
const PersonalToTeacher = () => ( // Renaming suggestion: `PersonalStack` or similar if not teacher-specific
  <Stack.Navigator initialRouteName="PersonalMain">
    {/* Main screen within the Personal stack */}
    <Stack.Screen
      name="PersonalMain"
      component={PersonalScreen}
      options={{ title: 'Personal' }}
    />
    {/* Add more screens here if needed, e.g., Edit Profile */}
  </Stack.Navigator>
);

/**
 * Stack Navigator for the Settings tab flow.
 * Currently only contains the main Settings screen.
 */
const StudentToTeacherSettings = () => ( // Renaming suggestion: `SettingsStack`
  <Stack.Navigator initialRouteName="SettingsMain">
    {/* Main screen within the Settings stack */}
    <Stack.Screen
      name="SettingsMain"
      component={SettingsScreen}
      options={{ title: 'Settings' }}
    />
  </Stack.Navigator>
);

/**
 * Stack Navigator for the initial Login/Register flow.
 * Leads from Login/Register screen to the main Dashboard upon successful authentication.
 * @deprecated This stack seems redundant given the main App component's logic. The App component directly switches between LoginRegisterScreen and the main navigators.
 */
// const LoginToDashboard = () => (
//     <Stack.Navigator initialRouteName="LoginRegister">
//       <Stack.Screen
//         name="LoginRegister"
//         component={LoginRegisterScreen}
//         options={{ title: 'Login/Register' }}
//       />
//       <Stack.Screen
//         name="Dashboard"
//         component={DashboardScreen} // Should likely navigate to WebNavigation or MobileNavigation instead
//         options={{ title: 'Dashboard' }}
//       />
//     </Stack.Navigator>
// );

// --- Platform-Specific Main Navigation ---

/**
 * Main navigation structure for Web platforms.
 * Uses a simple Bottom Tab Navigator without icons (standard for web).
 * Each tab renders one of the pre-defined Stack Navigators.
 */
const WebNavigation = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }} // Hide header for the tab navigator itself
    initialRouteName="Dashboard" // Start on the Dashboard tab
  >
    {/* Define tabs for the web interface */}
    <Tab.Screen name="Dashboard" component={DashboardToModule} />
    <Tab.Screen name="Search" component={SearchToModule} />
    <Tab.Screen name="Personal" component={PersonalToTeacher} />
    <Tab.Screen name="Recommendations" component={RecommendationsToPersonal} />
    <Tab.Screen name="Settings" component={StudentToTeacherSettings} />
  </Tab.Navigator>
);

/**
 * Main navigation structure for Mobile platforms (iOS/Android).
 * Uses a Bottom Tab Navigator with icons.
 * Each tab renders one of the pre-defined Stack Navigators.
 */
const MobileNavigation = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({ // Function to configure options dynamically per route
      headerShown: false, // Hide header for the tab navigator itself
      tabBarIcon: ({ focused, color, size }) => { // Function to render tab icons
        let iconName; // Variable to hold the icon name based on the route

        // Determine the icon name based on the current route's name
        if (route.name === 'Dashboard') {
          iconName = 'home';
        } else if (route.name === 'Search') {
          iconName = 'search';
        } else if (route.name === 'Personal') {
          iconName = 'user';
        } else if (route.name === 'Recommendations') {
          iconName = 'star';
        } else if (route.name === 'Settings') {
          iconName = 'cog';
        }

        // Return the Icon component with appropriate props
        return <Icon name={iconName} size={size} color={color} />;
      },
      // Styling for the active and inactive tab icons/labels
      tabBarActiveTintColor: '#007bff', // Color for the active tab
      tabBarInactiveTintColor: 'gray', // Color for inactive tabs
    })}
    initialRouteName="Dashboard" // Start on the Dashboard tab
  >
    {/* Define tabs for the mobile interface */}
    <Tab.Screen name="Dashboard" component={DashboardToModule} />
    <Tab.Screen name="Search" component={SearchToModule} />
    <Tab.Screen name="Personal" component={PersonalToTeacher} />
    <Tab.Screen name="Recommendations" component={RecommendationsToPersonal} />
    <Tab.Screen name="Settings" component={StudentToTeacherSettings} />
  </Tab.Navigator>
);

// --- Root Application Component ---

/**
 * The main App component.
 * Handles initial loading state and checks for persisted user sessions using AsyncStorage.
 * Conditionally renders either the Login/Register screen or the main application navigation
 * based on the user's authentication state (managed by UserContext) and the current platform.
 */
const App = () => {
  // Access user state and setter function from the UserContext
  const { user, setUser } = useUser();
  // State to manage the initial loading process (checking AsyncStorage)
  const [loading, setLoading] = useState(true);

  // useEffect hook to check for persisted user session on component mount
  useEffect(() => {
    /** Fetches user data from AsyncStorage and updates the user state. */
    const checkUser = async () => {
      try {
        // Clear any potentially invalid or outdated user data from previous sessions.
        // This forces a fresh login check if the app was closed unexpectedly.
        // await AsyncStorage.removeItem('user'); 

        // Attempt to retrieve user data stored in AsyncStorage.
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          // If user data is found, parse it and update the global user state.
          setUser(JSON.parse(storedUser));
          console.log('User loaded from AsyncStorage:', JSON.parse(storedUser));
        } else {
          console.log('No user found in AsyncStorage.');
        }
      } catch (error) {
        // Log any errors during the AsyncStorage retrieval process.
        console.error('Failed to load user from AsyncStorage:', error);
      } finally {
        // Set loading to false once the check is complete (whether successful or not).
        setLoading(false);
      }
    };

    // Run the checkUser function when the component mounts.
    checkUser();
    // Dependency array includes `setUser` to satisfy the linter, although it's stable.
  }, [setUser]);

  // Display a loading indicator while checking for the user session.
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  // Render the main navigation structure within the NavigationContainer.
  return (
    <NavigationContainer>
      {/* Use a root Stack Navigator to switch between Auth and Main App */}
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // ---- User is Logged In ----
          // Conditionally render Web or Mobile navigation based on platform.
          Platform.OS === 'web' ? (
            <Stack.Screen
              name="WebNavigation" // Name for this screen in the stack
              component={WebNavigation} // The Web Tab Navigator component
            />
          ) : (
            <Stack.Screen
              name="MobileNavigation" // Name for this screen in the stack
              component={MobileNavigation} // The Mobile Tab Navigator component
            />
          )
        ) : (
          // ---- User is Not Logged In ----
          // Show the Login/Register screen.
          <Stack.Screen
            name="LoginRegister"
            component={LoginRegisterScreen}
            // Optionally show header for the login screen
            // options={{ headerShown: true, title: 'Login / Register' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, // Take up full screen
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    backgroundColor: '#f5f5f5', // Optional background color
  },
});


/**
 * Default export: Wraps the main App component with the UserProvider.
 * This ensures that the entire application has access to the UserContext.
 */
export default () => (
  <UserProvider>
    <App />
  </UserProvider>
);