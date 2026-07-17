import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, LogOut, Home, Users, Cpu, BarChart2, ShieldCheck, Database, LayoutGrid 
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPatientPage = location.pathname.startsWith('/patient/');
  
  const handleNavClick = (target, tab = null) => {
    if (target === 'home') {
      navigate('/');
    } else if (tab) {
      if (isPatientPage) {
        window.dispatchEvent(new CustomEvent('switch-patient-tab', { detail: tab }));
      } else {
        // If not on patient page, alert user to choose patient
        alert("Please select a patient from the directory first to view " + tab.toUpperCase() + " insights.");
      }
    }
  };

  return (
    <aside style={styles.sidebar}>
      {/* Top Brand Logo */}
      <div style={styles.brandContainer} onClick={() => navigate('/')}>
        <div style={styles.logoContainer}>
          <Activity size={24} color="#0d9488" className="pulse-logo" />
        </div>
        <div style={styles.brandText}>
          <span style={styles.brandName}>MediSphere</span>
          <span style={styles.brandTag}>360 CLINICAL HUD</span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav style={styles.navMenu}>
        <div style={styles.menuGroupTitle}>Main Workspace</div>
        
        <button 
          onClick={() => handleNavClick('home')} 
          style={{ 
            ...styles.navLink, 
            ...(location.pathname === '/' ? styles.navLinkActive : {}) 
          }}
        >
          <LayoutGrid size={18} />
          <span>Dashboard</span>
        </button>

        <button 
          onClick={() => handleNavClick('home')} 
          style={{ 
            ...styles.navLink, 
            ...(location.pathname === '/' ? styles.navLinkActive : {}) 
          }}
        >
          <Users size={18} />
          <span>Patients</span>
        </button>

        <div style={styles.menuGroupTitle}>AI & Analytics</div>

        <button 
          onClick={() => handleNavClick('ai', 'ai')} 
          style={styles.navLink}
        >
          <Cpu size={18} />
          <span>AI Predictions</span>
        </button>

        <button 
          onClick={() => handleNavClick('vitals', 'vitals')} 
          style={styles.navLink}
        >
          <Activity size={18} />
          <span>Monitoring</span>
        </button>

        <button 
          onClick={() => handleNavClick('ai', 'ai')} 
          style={styles.navLink}
        >
          <Database size={18} />
          <span>Model Management</span>
        </button>
      </nav>

      {/* Bottom User Card & Logout */}
      {user && (
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            {user.name ? user.name[0].toUpperCase() : 'D'}
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user.name || user.username}</span>
            <span style={styles.userRole}>
              {user.roles?.includes('PROVIDER') ? 'Dr. Specialist' : user.roles?.includes('PATIENT') ? 'Patient' : 'Clinician'}
            </span>
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      )}
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '260px',
    height: '100vh',
    position: 'sticky',
    top: 0,
    background: '#090d16',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
    marginBottom: '36px',
    padding: '0 8px',
  },
  logoContainer: {
    background: 'rgba(13, 148, 136, 0.1)',
    border: '1px solid rgba(13, 148, 136, 0.2)',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.025em',
  },
  brandTag: {
    fontSize: '0.62rem',
    fontWeight: '700',
    color: '#0d9488',
    letterSpacing: '0.1em',
    marginTop: '2px',
  },
  navMenu: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  menuGroupTitle: {
    fontSize: '0.68rem',
    fontWeight: '800',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    padding: '16px 8px 8px',
    textAlign: 'left',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'transparent',
    border: 'none',
    color: '#94a3b8',
    padding: '12px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
  },
  navLinkActive: {
    background: 'rgba(13, 148, 136, 0.1)',
    color: '#0d9488',
    borderLeft: '2px solid #0d9488',
    borderRadius: '0 10px 10px 0',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(15, 23, 42, 0.5)',
    border: '1px solid rgba(255, 255, 255, 0.03)',
    padding: '12px',
    borderRadius: '12px',
    marginTop: 'auto',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #0d9488, #3b82f6)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    fontSize: '0.95rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    overflow: 'hidden',
    textAlign: 'left',
  },
  userName: {
    fontSize: '0.82rem',
    fontWeight: '700',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '0.68rem',
    color: '#64748b',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  }
};
