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

  const login = async (usernameInput, password, role = 'PROVIDER', patientId = null, patientName = '') => {
    setLoading(true);
    setError(null);
    try {
      let loggedInUser;

      if (role === 'ADMIN') {
        const cleanUser = (usernameInput || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        if (cleanUser !== 'admin' || cleanPass !== 'admin') {
          throw new Error('Invalid Admin credentials. Admin ID is "admin" and Password is "admin".');
        }

        loggedInUser = {
          username: 'admin',
          name: 'System Administrator',
          roles: ['ADMIN'],
          specialty: 'ALL',
          specialtyLabel: 'System Administrator'
        };
      } else if (role === 'PATIENT') {
        loggedInUser = {
          username: usernameInput || 'patient_user',
          roles: ['PATIENT'],
          name: patientName || 'Patient User',
          patientId: patientId,
          specialty: 'ALL'
        };
      } else {
        // DOCTOR / PROVIDER LOGIN
        const cleanUser = (usernameInput || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        if (cleanPass !== 'doctor') {
          throw new Error('Invalid password for Doctor login. Password must be "doctor".');
        }

        if (!cleanUser) {
          throw new Error('Please enter a valid Doctor Name or ID.');
        }

        const DOCTOR_MAP = {
          sarahjenkins: {
            username: 'sarahjenkins',
            name: 'Dr. Sarah Jenkins',
            specialty: 'CARDIAC',
            specialtyLabel: 'Cardiologist',
            roles: ['PROVIDER', 'DOCTOR']
          },
          sarah: {
            username: 'sarahjenkins',
            name: 'Dr. Sarah Jenkins',
            specialty: 'CARDIAC',
            specialtyLabel: 'Cardiologist',
            roles: ['PROVIDER', 'DOCTOR']
          },
          robertchen: {
            username: 'robertchen',
            name: 'Dr. Robert Chen',
            specialty: 'OXYGEN',
            specialtyLabel: 'Pulmonologist',
            roles: ['PROVIDER', 'DOCTOR']
          },
          robert: {
            username: 'robertchen',
            name: 'Dr. Robert Chen',
            specialty: 'OXYGEN',
            specialtyLabel: 'Pulmonologist',
            roles: ['PROVIDER', 'DOCTOR']
          },
          elenarostova: {
            username: 'elenarostova',
            name: 'Dr. Elena Rostova',
            specialty: 'BLOOD_PRESSURE',
            specialtyLabel: 'General Physician',
            roles: ['PROVIDER', 'DOCTOR']
          },
          elena: {
            username: 'elenarostova',
            name: 'Dr. Elena Rostova',
            specialty: 'BLOOD_PRESSURE',
            specialtyLabel: 'General Physician',
            roles: ['PROVIDER', 'DOCTOR']
          },
          doctor: {
            username: 'doctor',
            name: 'Dr. Rajesh Kumar',
            specialty: 'ALL',
            specialtyLabel: 'General Practice (Chief Medical Officer)',
            roles: ['PROVIDER', 'DOCTOR']
          }
        };

        let docConfig = DOCTOR_MAP[cleanUser];
        // If doctor name is entered dynamically (e.g. dr_smith or any name):
        if (!docConfig && cleanUser) {
          const formattedName = cleanUser.startsWith('dr.') || cleanUser.startsWith('dr_') 
            ? cleanUser.toUpperCase() 
            : `Dr. ${cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1)}`;
          docConfig = {
            username: cleanUser,
            name: formattedName,
            specialty: 'ALL',
            specialtyLabel: 'Specialist Clinician',
            roles: ['PROVIDER', 'DOCTOR']
          };
        }

        loggedInUser = docConfig;
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
