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
    const savedSandbox = localStorage.getItem('medisphere_sandbox') === 'true';

    setSandboxMode(savedSandbox);

    if (savedSandbox) {
      setIsAuthenticated(true);
      setUser(savedUser ? JSON.parse(savedUser) : { username: 'sandbox_doctor', roles: ['PROVIDER'] });
      setToken('mock-sandbox-token');
    } else if (savedToken && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password, useSandbox = false) => {
    setLoading(true);
    setError(null);
    try {
      if (useSandbox) {
        // Sandbox Mock Mode
        const mockUser = {
          username: username || 'sandbox_doctor',
          roles: ['PROVIDER', 'CLINICIAN'],
          name: 'Dr. Sandbox Expert'
        };
        localStorage.setItem('medisphere_sandbox', 'true');
        localStorage.setItem('medisphere_user', JSON.stringify(mockUser));
        localStorage.setItem('medisphere_token', 'mock-sandbox-token');
        localStorage.setItem('medisphere_username', mockUser.username);
        
        setSandboxMode(true);
        setToken('mock-sandbox-token');
        setUser(mockUser);
        setIsAuthenticated(true);
        setLoading(false);
        return true;
      }

      // SMART on FHIR OAuth2 Password Grant Flow against Keycloak (port 9090)
      const params = new URLSearchParams();
      params.append('client_id', 'medisphere-client');
      params.append('grant_type', 'password');
      params.append('username', username);
      params.append('password', password);

      const response = await axios.post(
        'http://localhost:9090/realms/medisphere/protocol/openid-connect/token',
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const accessToken = response.data.access_token;
      
      // Basic Decode JWT payload to get roles and user details
      const payloadBase64 = accessToken.split('.')[1];
      const payloadDecoded = JSON.parse(atob(payloadBase64));
      
      const roles = payloadDecoded.realm_access?.roles || [];
      const userProfile = {
        username: payloadDecoded.preferred_username || username,
        name: payloadDecoded.name || username,
        roles: roles,
        email: payloadDecoded.email
      };

      localStorage.setItem('medisphere_sandbox', 'false');
      localStorage.setItem('medisphere_token', accessToken);
      localStorage.setItem('medisphere_user', JSON.stringify(userProfile));
      localStorage.setItem('medisphere_username', userProfile.username);

      setSandboxMode(false);
      setToken(accessToken);
      setUser(userProfile);
      setIsAuthenticated(true);
      setLoading(false);
      return true;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.error_description || 'Invalid credentials or authentication service offline.');
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('medisphere_token');
    localStorage.removeItem('medisphere_user');
    localStorage.removeItem('medisphere_username');
    // Keep the sandbox toggle preference in localStorage so the user doesn't lose it
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
  };

  const toggleSandbox = (enabled) => {
    localStorage.setItem('medisphere_sandbox', enabled ? 'true' : 'false');
    setSandboxMode(enabled);
    logout();
    window.location.reload();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, sandboxMode, loading, error, login, logout, toggleSandbox }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
