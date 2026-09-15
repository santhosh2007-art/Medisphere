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
    background: '#ffffff',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid #e2dad0',
    boxShadow: '0 2px 10px rgba(107, 13, 36, 0.04)',
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
    background: 'rgba(107, 13, 36, 0.08)',
    border: '1px solid rgba(107, 13, 36, 0.18)',
    padding: '8px',
    borderRadius: '10px',
    color: '#6b0d24',
  },
  pulseLogo: {
    animation: 'pulse 1.8s infinite ease-in-out',
  },
  brandName: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#6b0d24',
    letterSpacing: '-0.02em',
  },
  brandSubtitle: {
    fontSize: '0.8rem',
    fontWeight: '700',
    background: 'rgba(107, 13, 36, 0.08)',
    color: '#6b0d24',
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
    background: '#f6f3eb',
    border: '1px solid #e2dad0',
    padding: '6px 14px',
    borderRadius: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#6b0d24',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.9rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#2b1b1e',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#6e6063',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    color: '#6e6063',
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
