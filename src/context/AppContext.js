import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state
const initialState = {
  user: null,
  settings: {
    theme: 'light',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 30000 // 30 seconds
  },
  environment: null,
  loading: false,
  error: null
};

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_SETTINGS: 'SET_SETTINGS',
  SET_ENVIRONMENT: 'SET_ENVIRONMENT',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    
    case ActionTypes.SET_SETTINGS:
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    
    case ActionTypes.SET_ENVIRONMENT:
      return { ...state, environment: action.payload };
    
    case ActionTypes.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({ 
          type: ActionTypes.SET_SETTINGS, 
          payload: parsedSettings 
        });
      } catch (error) {
        console.warn('Failed to load saved settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(state.settings));
  }, [state.settings]);

  // Actions
  const setUser = (user) => {
    dispatch({ type: ActionTypes.SET_USER, payload: user });
  };

  const updateSettings = (settings) => {
    dispatch({ type: ActionTypes.SET_SETTINGS, payload: settings });
  };

  const setEnvironment = (environment) => {
    dispatch({ type: ActionTypes.SET_ENVIRONMENT, payload: environment });
  };

  const setLoading = (loading) => {
    dispatch({ type: ActionTypes.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  };

  const value = {
    ...state,
    actions: {
      setUser,
      updateSettings,
      setEnvironment,
      setLoading,
      setError,
      clearError
    }
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { ActionTypes };