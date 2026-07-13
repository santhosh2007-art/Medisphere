import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, User, Key, Users, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

export const Login = () => {
  const { login, loading, error } = useAuth();
  const [role, setRole] = useState('PROVIDER'); // 'PROVIDER' or 'PATIENT'
  const [username, setUsername] = useState('doctor');
  const [password, setPassword] = useState('password123');
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientsLoading, setPatientsLoading] = useState(false);

  useEffect(() => {
    const fetchAllPatients = async () => {
      setPatientsLoading(true);
      try {
        const res = await api.getPatients();
        const patientList = res.data || [];
        setPatients(patientList);
        if (patientList.length > 0) {
          setSelectedPatientId(patientList[0].patientId);
        }
      } catch (err) {
        console.error('Error fetching patients for login:', err);
      } finally {
        setPatientsLoading(false);
      }
    };
    fetchAllPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role === 'PATIENT') {
      const selectedPatient = patients.find(p => p.patientId === selectedPatientId);
      const patientName = selectedPatient ? `${selectedPatient.firstname} ${selectedPatient.lastname}` : 'Patient User';
      await login('', '', 'PATIENT', selectedPatientId, patientName);
    } else {
      await login(username, password, 'PROVIDER');
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
            onClick={() => setRole('PROVIDER')}
            disabled={loading}
          >
            <User size={16} /> Clinician / Doctor
          </button>
          <button
            type="button"
            style={{ ...styles.roleTab, ...(role === 'PATIENT' ? styles.activeRoleTab : {}) }}
            onClick={() => setRole('PATIENT')}
            disabled={loading}
          >
            <Users size={16} /> Patient
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert}>
            <AlertTriangle size={18} color="#f43f5e" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {role === 'PROVIDER' ? (
            <>
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
            </>
          ) : (
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label className="form-label" htmlFor="patientSelect">
                <span style={styles.labelSpan}><Users size={16} /> Select Patient Profile</span>
              </label>
              {patientsLoading ? (
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '10px 0', textAlign: 'center' }}>
                  Loading patient list...
                </div>
              ) : patients.length === 0 ? (
                <div style={{ color: '#f43f5e', fontSize: '0.85rem', padding: '10px 0', textAlign: 'left', lineHeight: '1.4' }}>
                  No patients found in MongoDB database. Please sign in as a Clinician first to register a patient record.
                </div>
              ) : (
                <select
                  id="patientSelect"
                  className="form-select"
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  disabled={loading}
                  style={styles.selectInput}
                  required
                >
                  {patients.map(p => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.firstname} {p.lastname} ({p.email})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading || (role === 'PATIENT' && patients.length === 0)}
          >
            {loading ? 'Authenticating...' : role === 'PROVIDER' ? 'Sign In as Clinician' : 'Sign In as Patient'}
          </button>
        </form>
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
    maxWidth: '460px',
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
  form: {
    display: 'flex',
    flexDirection: 'column',
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
