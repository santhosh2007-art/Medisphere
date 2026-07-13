import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, User, Key, KeyRound, AlertTriangle, Cpu } from 'lucide-react';

export const Login = () => {
  const { login, loading, error, sandboxMode, toggleSandbox } = useAuth();
  const [username, setUsername] = useState('testuser');
  const [password, setPassword] = useState('password123');
  const [localSandbox, setLocalSandbox] = useState(sandboxMode);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(username, password, localSandbox);
  };

  const handleSandboxChange = (e) => {
    const checked = e.target.checked;
    setLocalSandbox(checked);
    toggleSandbox(checked);
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

        {/* OAuth / SMART Info Badge */}
        <div style={styles.infoBadge}>
          <Shield size={16} color="#0d9488" />
          <span style={styles.infoText}>SMART on FHIR OAuth2 Authentication</span>
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

          <div className="form-group" style={{ marginBottom: '14px' }}>
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

          {/* Sandbox Toggle Option */}
          <div style={styles.sandboxCheckboxContainer}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={localSandbox}
                onChange={handleSandboxChange}
                style={styles.checkbox}
              />
              <div style={styles.checkboxText}>
                <span style={styles.checkboxTitle}>Enable Client-Side Sandbox</span>
                <span style={styles.checkboxDesc}>Bypasses Keycloak & Docker Gateway (uses localStorage)</span>
              </div>
            </label>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In with SMART on FHIR'}
          </button>
        </form>

        {/* Educational Student Guide Panel */}
        <div style={styles.guidePanel}>
          <div style={styles.guideTitle}>
            <Cpu size={14} color="#0d9488" />
            <span>Student Guide: OAuth2 Login Flow</span>
          </div>
          <ol style={styles.guideList}>
            <li>The frontend sends the credentials to the Keycloak Server (Authorization Server).</li>
            <li>Keycloak verifies credentials and returns a secure JWT access token.</li>
            <li>The frontend saves this token and appends it to all subsequent API Gateway calls.</li>
            <li>The API Gateway acts as a Resource Server to validate access before routing.</li>
          </ol>
        </div>
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
  sandboxCheckboxContainer: {
    background: 'rgba(251, 191, 36, 0.04)',
    border: '1px solid rgba(251, 191, 36, 0.1)',
    borderRadius: '8px',
    padding: '12px 14px',
    marginBottom: '20px',
  },
  checkboxLabel: {
    display: 'flex',
    gap: '12px',
    cursor: 'pointer',
    alignItems: 'flex-start',
  },
  checkbox: {
    marginTop: '4px',
    accentColor: '#fbbf24',
  },
  checkboxText: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  checkboxTitle: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fbbf24',
  },
  checkboxDesc: {
    fontSize: '0.75rem',
    color: '#94a3b8',
    marginTop: '2px',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    fontWeight: '600',
  },
  guidePanel: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    borderRadius: '10px',
    padding: '16px',
    fontSize: '0.8rem',
    textAlign: 'left',
  },
  guideTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  guideList: {
    paddingLeft: '16px',
    color: '#94a3b8',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  }
};
