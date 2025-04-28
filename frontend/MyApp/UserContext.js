/**
 * @fileoverview Defines the User Context and Provider for managing user state globally in the React application.
 * This allows components to access and update the currently logged-in user's information
 * without prop drilling.
 */

import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  /**
   * State hook for managing the user object.
   * `user`: Stores the current user data (object) or null if logged out.
   * `setUser`: Function to update the user state.
   */
  const [user, setUser] = useState(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  /**
   * Custom Hook: useUser.
   * Provides a convenient way for components to access the UserContext value (`user` state and `setUser` function).
   * It simplifies the process of consuming the context by abstracting `useContext(UserContext)`.
   * Throws an error if used outside of a UserProvider to ensure proper usage.
   *
   * @returns {object} The user context value containing `{ user, setUser }`.
   * @throws {Error} If the hook is used outside a UserProvider wrapper.
   */
  return useContext(UserContext);
};
