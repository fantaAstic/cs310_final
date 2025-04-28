/**
 * @fileoverview Main application file setting up navigation and authentication flow.
 * Uses React Navigation for handling different navigation patterns (Stack, Bottom Tabs)
 * and React Context API (`UserContext`) for managing global user authentication state.
 * It provides platform-specific navigation layouts for Web and Mobile.
 */

import React, { useState, useEffect, createContext } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DashboardScreen from './Screens/DashboardScreen';
import SearchScreen from './Screens/SearchScreen';
import PersonalScreen from './Screens/PersonalScreen';
import SettingsScreen from './Screens/SettingsScreen';
import RecommendationsScreen from './Screens/RecommendationsScreen';
import ModuleCategoryScreen from './Screens/ModuleCategoryScreen';
import ModulePageScreen from './Screens/ModulePageScreen';
import LoginRegisterScreen from './Screens/LoginRegisterScreen'; 
import { UserProvider, useUser } from './UserContext'; // Import the context
import Icon from 'react-native-vector-icons/FontAwesome';

// Create navigation objects
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Context for Auth
export const AuthContext = createContext();

/**
 * Stack Navigator for the Dashboard tab flow.
 * Allows navigating from Dashboard -> ModulePage -> ModuleCategory.
 */
// Stack navigation for dashboard to module page -> to module category
const DashboardToModule = () => (
  <Stack.Navigator initialRouteName="DashboardMain">
    <Stack.Screen name="DashboardMain" component={DashboardScreen} options={{ title: 'Dashboard' }} />
    <Stack.Screen name="ModulePage" component={ModulePageScreen} options={{ title: 'Module Page' }} />
    <Stack.Screen name="ModuleCategory" component={ModuleCategoryScreen} options={{ title: 'Module Categories' }} />
  </Stack.Navigator>
);

/**
 * Stack Navigator for the Search tab flow.
 * Allows navigating from Search -> ModulePage -> ModuleCategory.
 */
const SearchToModule = () => (
  <Stack.Navigator initialRouteName= "SearchMain">
    <Stack.Screen 
      name= "SearchMain" 
      component={SearchScreen}
      options={{ title: 'Search' }} 
    /> 
    <Stack.Screen name="ModulePage" component={ModulePageScreen} options={{ title: 'Module Page' }}/>
    <Stack.Screen name="ModuleCategory" component={ModuleCategoryScreen} options={{ title: 'Module Categories' }}/>
  </Stack.Navigator>
);

/**
 * Stack Navigator for the Recommendations tab flow.
 * Allows navigating from Recommendations -> Personal.
 */
const RecommendationsToPersonal = () => (
  <Stack.Navigator initialRouteName= "RecommendationsMain">
    <Stack.Screen 
    name= "RecommendationsMain" 
    component={RecommendationsScreen} 
    options={{ title: 'Recommendations' }} 
    />
    <Stack.Screen name="Personal" component={PersonalScreen} options={{ title: 'Personal' }}/>
  </Stack.Navigator>
);

/**
 * Stack Navigator for the Personal tab flow.
 * Currently only contains the main Personal screen. Could be expanded.
 */
const PersonalToTeacher = () => (
  <Stack.Navigator initialRouteName= "PersonalMain">
    <Stack.Screen 
    name= "PersonalMain" 
    component={PersonalScreen}
    options={{ title: 'Personal' }}  
    />
  </Stack.Navigator>
);

/**
 * Stack Navigator for the Settings tab flow.
 * Currently only contains the main Settings screen.
 */
const StudentToTeacherSettings = () => (
  <Stack.Navigator initialRouteName= "SettingsMain">
    <Stack.Screen 
    name= "SettingsMain" 
    component={SettingsScreen} 
    options={{ title: 'Settings' }} 
    />
  </Stack.Navigator>
);

/**
 * Stack Navigator for the initial Login/Register flow.
 * Leads from Login/Register screen to the main Dashboard upon successful authentication.
 */
// Main navigation stack
const LoginToDashboard = () => (
    <Stack.Navigator initialRouteName="LoginRegister">
      <Stack.Screen
        name="LoginRegister"
        component={LoginRegisterScreen}
        options={{ title: 'Login/Register' }}
      />
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
);

/**
 * Main navigation structure for Web platforms.
 * Uses a simple Bottom Tab Navigator without icons (standard for web).
 * Each tab renders one of the pre-defined Stack Navigators.
 */
// Drawer navigation for web
const WebNavigation = () => (
  <Tab.Navigator 
    screenOptions={{ headerShown: false }}  
    initialRouteName="Dashboard"
  >
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
// Bottom Tab navigation for mobile
const MobileNavigation = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

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

        return <Icon name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#007bff',
      tabBarInactiveTintColor: 'gray',
    })}
    initialRouteName="Dashboard"
  >
    <Tab.Screen name="Dashboard" component={DashboardToModule} />
    <Tab.Screen name="Search" component={SearchToModule} />
    <Tab.Screen name="Personal" component={PersonalToTeacher} />
    <Tab.Screen name="Recommendations" component={RecommendationsToPersonal} />
    <Tab.Screen name="Settings" component={StudentToTeacherSettings} />
  </Tab.Navigator>
);

/**
 * The main App component.
 * Handles initial loading state and checks for persisted user sessions using AsyncStorage.
 * Conditionally renders either the Login/Register screen or the main application navigation
 * based on the user's authentication state (managed by UserContext) and the current platform.
 */
const App = () => {
  const { user, setUser } = useUser(); // Access user from context
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Clear any past users
        await AsyncStorage.removeItem('user'); // to avoid errornous login
  
        // Then check if there's a current user
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to load user from AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };
  
    checkUser();
  }, [setUser]);
  

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // If the user is logged in, navigate to either Web or Mobile Navigation
          Platform.OS === 'web' ? (
            <Stack.Screen 
              name="WebNavigation" 
              component={WebNavigation} // Pass the component directly
              options={{ headerShown: false }} // Optionally hide the header
            />
          ) : (
            <Stack.Screen 
              name="MobileNavigation" 
              component={MobileNavigation} // Pass the component directly
              options={{ headerShown: false }} // Optionally hide the header
            />
          )
        ) : (
          // If user is null (not logged in), show the login/register screen
          <Stack.Screen 
            name="LoginRegister" 
            component={LoginRegisterScreen} // Pass the component directly
            options={{ title: 'Login/Register' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

/**
 * Default export: Wraps the main App component with the UserProvider.
 * This ensures that the entire application has access to the UserContext.
 */
export default () => (
  <UserProvider>
    <App />
  </UserProvider>
);