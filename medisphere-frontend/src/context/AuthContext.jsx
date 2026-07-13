import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check localStorage on mount
    const savedToken = localStorage.getItem('medisphere_token');
    const savedUser = localStorage.getItem('medisphere_user');

    setSandboxMode(false);

    if (savedToken && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password, role = 'PROVIDER', patientId = null, patientName = '') => {
    setLoading(true);
    setError(null);
    try {
      let loggedInUser;
      if (role === 'PATIENT') {
        loggedInUser = {
          username: username || 'patient_user',
          roles: ['PATIENT'],
          name: patientName || 'Patient User',
          patientId: patientId
        };
      } else {
        if (username !== 'doctor' || password !== 'doctor') {
          throw new Error('Invalid clinician credentials. Use username "doctor" and password "doctor".');
        }
        loggedInUser = {
          username: username,
          roles: ['PROVIDER', 'CLINICIAN'],
          name: 'Dr. Specialist'
        };
      }

      localStorage.setItem('medisphere_sandbox', 'false');
      localStorage.setItem('medisphere_token', 'mock-authenticated-token');
      localStorage.setItem('medisphere_user', JSON.stringify(loggedInUser));
      localStorage.setItem('medisphere_username', loggedInUser.username);

      setSandboxMode(false);
      setToken('mock-authenticated-token');
      setUser(loggedInUser);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('medisphere_token');
    localStorage.removeItem('medisphere_user');
    localStorage.removeItem('medisphere_username');
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  const toggleSandbox = (enabled) => {
    localStorage.setItem('medisphere_sandbox', 'false');
    setSandboxMode(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, sandboxMode, loading, error, login, logout, toggleSandbox }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
