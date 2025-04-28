/**
 * @fileoverview Defines the User Context and Provider for managing user state globally in the React application.
 * This allows components to access and update the currently logged-in user's information
 * without prop drilling.
 */

import React, { createContext, useState, useContext } from 'react';

/**
 * Creates a React Context object for user data.
 * This context will hold the user state and the function to update it.
 * Components will consume this context to access user information.
 * @type {React.Context<null|object>} // Type hint for the context value
 */
const UserContext = createContext(null); // Initialize with null, indicating no user initially

/**
 * UserProvider Component.
 * Wraps parts of the application that need access to the user context.
 * It manages the user state (`user`) and provides the `user` state and
 * the `setUser` function down to consuming components via the UserContext.Provider.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components that will have access to the context.
 * @returns {JSX.Element} The UserContext.Provider wrapping the children.
 */
export const UserProvider = ({ children }) => {
  /**
   * State hook for managing the user object.
   * `user`: Stores the current user data (object) or null if logged out.
   * `setUser`: Function to update the user state.
   */
  const [user, setUser] = useState(null); // Initial state is null (no user logged in)

  // The value prop of the Provider holds the data and functions to be shared.
  // Any component consuming UserContext will receive this object.
  const contextValue = { user, setUser };

  return (
    // Provide the user state and setUser function to child components.
    <UserContext.Provider value={contextValue}>
      {children} {/* Render the child components wrapped by the provider */}
    </UserContext.Provider>
  );
};

/**
 * Custom Hook: useUser.
 * Provides a convenient way for components to access the UserContext value (`user` state and `setUser` function).
 * It simplifies the process of consuming the context by abstracting `useContext(UserContext)`.
 * Throws an error if used outside of a UserProvider to ensure proper usage.
 *
 * @returns {object} The user context value containing `{ user, setUser }`.
 * @throws {Error} If the hook is used outside a UserProvider wrapper.
 */
export const useUser = () => {
  // Get the current context value.
  const context = useContext(UserContext);

  // Check if the hook is used within a UserProvider.
  if (context === undefined) {
    // Provide a helpful error message if the context is not found.
    throw new Error('useUser must be used within a UserProvider');
  }

  // Return the context value ({ user, setUser }).
  return context;
};
