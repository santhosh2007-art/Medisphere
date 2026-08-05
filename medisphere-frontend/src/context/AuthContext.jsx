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
      if (role === 'PATIENT') {
        loggedInUser = {
          username: usernameInput || 'patient_user',
          roles: ['PATIENT'],
          name: patientName || 'Patient User',
          patientId: patientId,
          specialty: 'ALL'
        };
      } else {
        const cleanUser = (usernameInput || '').trim().toLowerCase();
        
        if (password !== 'doctor') {
          throw new Error('Invalid password. Password for all doctor accounts is "doctor".');
        }

        const DOCTOR_MAP = {
          sarahjenkins: {
            username: 'sarahjenkins',
            name: 'Dr. Sarah Jenkins',
            specialty: 'CARDIAC',
            specialtyLabel: 'Cardiologist',
            roles: ['PROVIDER', 'CLINICIAN']
          },
          sarah: {
            username: 'sarahjenkins',
            name: 'Dr. Sarah Jenkins',
            specialty: 'CARDIAC',
            specialtyLabel: 'Cardiologist',
            roles: ['PROVIDER', 'CLINICIAN']
          },
          robertchen: {
            username: 'robertchen',
            name: 'Dr. Robert Chen',
            specialty: 'OXYGEN',
            specialtyLabel: 'Pulmonologist',
            roles: ['PROVIDER', 'CLINICIAN']
          },
          robert: {
            username: 'robertchen',
            name: 'Dr. Robert Chen',
            specialty: 'OXYGEN',
            specialtyLabel: 'Pulmonologist',
            roles: ['PROVIDER', 'CLINICIAN']
          },
          elenarostova: {
            username: 'elenarostova',
            name: 'Dr. Elena Rostova',
            specialty: 'BLOOD_PRESSURE',
            specialtyLabel: 'General Physician',
            roles: ['PROVIDER', 'CLINICIAN']
          },
          elena: {
            username: 'elenarostova',
            name: 'Dr. Elena Rostova',
            specialty: 'BLOOD_PRESSURE',
            specialtyLabel: 'General Physician',
            roles: ['PROVIDER', 'CLINICIAN']
          },
          doctor: {
            username: 'doctor',
            name: 'Dr. Specialist (All Patients)',
            specialty: 'ALL',
            specialtyLabel: 'General Practice (All Patients)',
            roles: ['PROVIDER', 'CLINICIAN']
          }
        };

        const docConfig = DOCTOR_MAP[cleanUser];
        if (!docConfig) {
          throw new Error('Invalid clinician username. Valid accounts: sarahjenkins, robertchen, elenarostova, doctor (Password: doctor).');
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
