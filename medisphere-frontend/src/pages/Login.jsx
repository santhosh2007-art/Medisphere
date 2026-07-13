import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, User, Key, Users, AlertTriangle, UserPlus, CheckCircle } from 'lucide-react';
import { api } from '../services/api';

export const Login = () => {
  const { login, loading, error: authError } = useAuth();
  const [role, setRole] = useState('PROVIDER'); // 'PROVIDER' or 'PATIENT'
  const [patientTab, setPatientTab] = useState('SIGNIN'); // 'SIGNIN' or 'SIGNUP'
  
  // Clinician credentials
  const [username, setUsername] = useState('doctor');
  const [password, setPassword] = useState('doctor');
  
  // Patient Sign In credentials
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  
  // Patient Sign Up fields
  const [signUpData, setSignUpData] = useState({
    firstname: '',
    lastname: '',
    gender: 'Male',
    dob: '',
    email: '',
    phoneno: '',
    address: ''
  });

  // UI status
  const [localError, setLocalError] = useState('');
  const [localSuccess, setLocalSuccess] = useState('');
  const [signUpSaving, setSignUpSaving] = useState(false);

  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    setSignUpData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleClinicianSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');
    await login(username, password, 'PROVIDER');
  };

  const handlePatientSignIn = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');
    
    if (!patientEmail || !patientPhone) {
      setLocalError('Please fill in both Email and Phone Number.');
      return;
    }

    try {
      // Fetch all patients from backend
      const res = await api.getPatients();
      const patientList = res.data || [];
      
      // Find patient matching email and phone number
      const foundPatient = patientList.find(p => 
        p.email && p.email.trim().toLowerCase() === patientEmail.trim().toLowerCase() &&
        String(p.phoneno).trim() === patientPhone.trim()
      );

      if (foundPatient) {
        const patientName = `${foundPatient.firstname} ${foundPatient.lastname}`;
        const success = await login(foundPatient.email, String(foundPatient.phoneno), 'PATIENT', foundPatient.patientId, patientName);
        if (success) {
          setLocalSuccess(`Welcome back, ${patientName}!`);
        }
      } else {
        setLocalError('No matching patient profile found. Please verify your Email and Phone Number, or Sign Up.');
      }
    } catch (err) {
      console.error('Error fetching patients for sign in:', err);
      setLocalError('Failed to fetch patient data from database. Verify services are running.');
    }
  };

  const handlePatientSignUp = async (e) => {
    e.preventDefault();
    setLocalError('');
    setLocalSuccess('');
    setSignUpSaving(true);

    const { firstname, lastname, gender, dob, email, phoneno, address } = signUpData;
    if (!firstname || !lastname || !gender || !dob || !email || !phoneno || !address) {
      setLocalError('Please fill in all fields to register.');
      setSignUpSaving(false);
      return;
    }

    const phoneStr = String(phoneno).trim();
    if (!/^\d{10}$/.test(phoneStr)) {
      setLocalError('Phone number must be exactly 10 digits.');
      setSignUpSaving(false);
      return;
    }

    const phoneNum = Number(phoneStr);

    try {
      const payload = {
        firstname,
        lastname,
        gender,
        dob,
        email,
        phoneno: phoneNum,
        address
      };

      // 1. Save patient details to database
      const saveRes = await api.savePatient(payload);
      const newPatient = saveRes.data;

      if (!newPatient || !newPatient.patientId) {
        throw new Error('Failed to obtain registered patient ID.');
      }

      // 2. Automatically save default GRANTED HIPAA Consent record
      const consentPayload = {
        patientId: newPatient.patientId,
        consenttype: 'FULL_ACCESS',
        status: 'GRANTED',
        granteddate: new Date().toISOString().split('T')[0],
        expirydate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      await api.saveConsent(consentPayload);

      // 3. Automatically save default Health Twin record
      const twinPayload = {
        patientId: newPatient.patientId,
        bloodgroup: 'O+',
        height: 170,
        weight: 65,
        temperature: 98.6,
        disease: 'None'
      };
      await api.saveHealthTwin(twinPayload);

      setLocalSuccess('Registration successful! Logging you in...');
      
      // 4. Log in immediately
      const patientName = `${newPatient.firstname} ${newPatient.lastname}`;
      await login(newPatient.email, String(newPatient.phoneno), 'PATIENT', newPatient.patientId, patientName);
    } catch (err) {
      console.error('Registration failed:', err);
      const errMsg = err.response?.data?.message || err.response?.data || 'Error registering new patient in the database. Ensure services are online.';
      setLocalError(errMsg);
    } finally {
      setSignUpSaving(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard} className="glass-card">
        {/* Brand Header */}
        <div style={styles.header}>
          <div style={styles.logoContainer}>
            <Activity size={32} color="#0d9488" />
          </div>
          <h1 style={styles.title}>MediSphere</h1>
          <p style={styles.subtitle}>EHR Patient Digital Twin Intelligence</p>
        </div>

        {/* Info Badge */}
        <div style={styles.infoBadge}>
          <Shield size={16} color="#0d9488" />
          <span style={styles.infoText}>Direct MongoDB EHR Connection</span>
        </div>

        {/* Role Switcher */}
        <div style={styles.roleSwitcher}>
          <button
            type="button"
            style={{ ...styles.roleTab, ...(role === 'PROVIDER' ? styles.activeRoleTab : {}) }}
            onClick={() => { setRole('PROVIDER'); setLocalError(''); setLocalSuccess(''); }}
            disabled={loading || signUpSaving}
          >
            <User size={16} /> Clinician / Doctor
          </button>
          <button
            type="button"
            style={{ ...styles.roleTab, ...(role === 'PATIENT' ? styles.activeRoleTab : {}) }}
            onClick={() => { setRole('PATIENT'); setLocalError(''); setLocalSuccess(''); }}
            disabled={loading || signUpSaving}
          >
            <Users size={16} /> Patient
          </button>
        </div>

        {/* Local Error Alert / Success Alert */}
        {(localError || authError) && (
          <div style={styles.errorAlert}>
            <AlertTriangle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
            <span>{localError || authError}</span>
          </div>
        )}

        {localSuccess && (
          <div style={styles.successAlert}>
            <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0 }} />
            <span>{localSuccess}</span>
          </div>
        )}

        {/* Clinician Form */}
        {role === 'PROVIDER' && (
          <form onSubmit={handleClinicianSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                <span style={styles.labelSpan}><User size={16} /> Username</span>
              </label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="password">
                <span style={styles.labelSpan}><Key size={16} /> Password</span>
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : 'Sign In as Clinician'}
            </button>
          </form>
        )}

        {/* Patient Forms */}
        {role === 'PATIENT' && (
          <div style={styles.patientSubContainer}>
            {/* Patient Sub Tabs */}
            <div style={styles.subTabBar}>
              <button
                type="button"
                style={{ ...styles.subTabButton, ...(patientTab === 'SIGNIN' ? styles.activeSubTabButton : {}) }}
                onClick={() => { setPatientTab('SIGNIN'); setLocalError(''); setLocalSuccess(''); }}
                disabled={signUpSaving}
              >
                <User size={14} /> Sign In
              </button>
              <button
                type="button"
                style={{ ...styles.subTabButton, ...(patientTab === 'SIGNUP' ? styles.activeSubTabButton : {}) }}
                onClick={() => { setPatientTab('SIGNUP'); setLocalError(''); setLocalSuccess(''); }}
                disabled={signUpSaving}
              >
                <UserPlus size={14} /> Sign Up (Register)
              </button>
            </div>

            {/* Patient Sign In Form */}
            {patientTab === 'SIGNIN' && (
              <form onSubmit={handlePatientSignIn} style={styles.form}>
                <div className="form-group">
                  <label className="form-label" htmlFor="patientEmail">
                    <span style={styles.labelSpan}><User size={16} /> Email Address</span>
                  </label>
                  <input
                    id="patientEmail"
                    type="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label className="form-label" htmlFor="patientPhone">
                    <span style={styles.labelSpan}><Key size={16} /> Phone Number</span>
                  </label>
                  <input
                    id="patientPhone"
                    type="text"
                    className="form-input"
                    placeholder="Enter phone number"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={styles.submitBtn}
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Sign In as Patient'}
                </button>
              </form>
            )}

            {/* Patient Sign Up Form */}
            {patientTab === 'SIGNUP' && (
              <form onSubmit={handlePatientSignUp} style={styles.signUpFormScroll}>
                <div style={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-input"
                      name="firstname"
                      value={signUpData.firstname}
                      onChange={handleSignUpChange}
                      disabled={signUpSaving}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-input"
                      name="lastname"
                      value={signUpData.lastname}
                      onChange={handleSignUpChange}
                      disabled={signUpSaving}
                      required
                    />
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="form-select"
                      name="gender"
                      value={signUpData.gender}
                      onChange={handleSignUpChange}
                      disabled={signUpSaving}
                      style={styles.selectInput}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="form-input"
                      name="dob"
                      value={signUpData.dob}
                      onChange={handleSignUpChange}
                      disabled={signUpSaving}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-input"
                    name="email"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    disabled={signUpSaving}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number (used for login)</label>
                  <input
                    type="text"
                    className="form-input"
                    name="phoneno"
                    placeholder="e.g. 9894477190"
                    value={signUpData.phoneno}
                    onChange={handleSignUpChange}
                    disabled={signUpSaving}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Residential Address</label>
                  <input
                    type="text"
                    className="form-input"
                    name="address"
                    value={signUpData.address}
                    onChange={handleSignUpChange}
                    disabled={signUpSaving}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-success"
                  style={styles.submitBtn}
                  disabled={signUpSaving}
                >
                  {signUpSaving ? 'Registering...' : 'Register & Log In'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  loginCard: {
    width: '100%',
    maxWidth: '480px',
    padding: '36px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(13, 148, 136, 0.1)',
    border: '1px solid rgba(13, 148, 136, 0.2)',
    padding: '12px',
    borderRadius: '14px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.03em',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: '#94a3b8',
  },
  infoBadge: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    background: 'rgba(13, 148, 136, 0.08)',
    border: '1px solid rgba(13, 148, 136, 0.15)',
    padding: '6px 12px',
    borderRadius: '8px',
  },
  infoText: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#0d9488',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  roleSwitcher: {
    display: 'flex',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '6px',
    gap: '6px',
  },
  roleTab: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '0.9rem',
    fontWeight: '600',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.25s',
    outline: 'none',
  },
  activeRoleTab: {
    background: 'rgba(13, 148, 136, 0.1)',
    color: '#0d9488',
    border: '1px solid rgba(13, 148, 136, 0.2)',
  },
  patientSubContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  subTabBar: {
    display: 'flex',
    background: 'rgba(15, 23, 42, 0.2)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '2px',
    gap: '12px',
  },
  subTabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    outline: 'none',
  },
  activeSubTabButton: {
    color: '#0d9488',
    borderBottom: '2px solid #0d9488',
  },
  errorAlert: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    borderRadius: '8px',
    color: '#f43f5e',
    fontSize: '0.88rem',
    alignItems: 'center',
  },
  successAlert: {
    display: 'flex',
    gap: '10px',
    padding: '12px 16px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '0.88rem',
    alignItems: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  signUpFormScroll: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '360px',
    overflowY: 'auto',
    paddingRight: '8px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  labelSpan: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
  },
  selectInput: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '8px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#fff',
    outline: 'none',
    fontSize: '0.95rem',
    cursor: 'pointer',
  }
};
