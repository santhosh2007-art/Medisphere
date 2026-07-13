import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Activity, LogOut, ToggleLeft, ToggleRight, Database, Server } from 'lucide-react';

export const Navbar = () => {
  const { user, logout, sandboxMode, toggleSandbox } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.brandContainer}>
        <div style={styles.logoContainer}>
          <Activity size={24} color="#0d9488" style={styles.pulseLogo} />
        </div>
        <span style={styles.brandName}>MediSphere</span>
        <span style={styles.brandSubtitle}>Patient 360</span>
      </div>

      <div style={styles.rightSection}>
        {/* User Card */}
        {user && (
          <div style={styles.userCard}>
            <div style={styles.avatar}>
              {user.name ? user.name[0].toUpperCase() : 'D'}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.userName}>{user.name || user.username}</span>
              <span style={styles.userRole}>
                {user.roles?.includes('PROVIDER') ? 'Clinician' : user.roles?.includes('PATIENT') ? 'Patient' : 'Staff'}
              </span>
            </div>
            <button onClick={logout} style={styles.logoutBtn} title="Sign Out">
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 32px',
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(13, 148, 136, 0.1)',
    border: '1px solid rgba(13, 148, 136, 0.2)',
    padding: '8px',
    borderRadius: '10px',
  },
  pulseLogo: {
    animation: 'pulse 1.8s infinite ease-in-out',
  },
  brandName: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  brandSubtitle: {
    fontSize: '0.8rem',
    fontWeight: '600',
    background: 'rgba(13, 148, 136, 0.15)',
    color: '#0d9488',
    padding: '3px 8px',
    borderRadius: '4px',
    marginLeft: '6px',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  sandboxWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 12px',
    borderRadius: '8px',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid',
    transition: 'all 0.3s ease',
  },
  sandboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: 0,
    outline: 'none',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '6px 14px',
    borderRadius: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#0d9488',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#fff',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#94a3b8',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    marginLeft: '6px',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s',
    outline: 'none',
  }
};
