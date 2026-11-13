import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Activity, LogOut, Home, Users, Cpu, BarChart2, ShieldCheck, Database, LayoutGrid, UserCheck, UserPlus, Link2, Sliders, BellRing
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

  const [activeAdminTab, setActiveAdminTab] = React.useState('patients');
  const [activePatientTab, setActivePatientTab] = React.useState('twin');

  React.useEffect(() => {
    const handleSwitch = (e) => {
      if (e.detail) {
        setActiveAdminTab(e.detail);
      }
    };
    const handlePatientTab = (e) => {
      if (e.detail) {
        setActivePatientTab(e.detail);
      }
    };
    window.addEventListener('switch-admin-tab', handleSwitch);
    window.addEventListener('switch-patient-tab', handlePatientTab);
    window.addEventListener('patient-tab-changed', handlePatientTab);
    return () => {
      window.removeEventListener('switch-admin-tab', handleSwitch);
      window.removeEventListener('switch-patient-tab', handlePatientTab);
      window.removeEventListener('patient-tab-changed', handlePatientTab);
    };
  }, []);

  const handleAdminNavClick = (adminTab) => {
    setActiveAdminTab(adminTab);
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switch-admin-tab', { detail: adminTab }));
      }, 100);
    } else {
      window.dispatchEvent(new CustomEvent('switch-admin-tab', { detail: adminTab }));
    }
  };

  const isAdmin = user?.roles?.includes('ADMIN');

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
        {/* Dedicated Admin Control Panel Links for Admin User */}
        {isAdmin && (
          <>
            <div style={{ ...styles.menuGroupTitle, color: '#6b0d24', borderBottom: '1px solid #e5ddd0', paddingBottom: '4px', marginBottom: '8px' }}>
              🛡️ Admin Controls
            </div>

            <button 
              onClick={() => handleAdminNavClick('patients')} 
              style={{ 
                ...styles.navLink, 
                ...(location.pathname === '/' && activeAdminTab === 'patients' ? styles.navLinkActive : {}),
                color: '#6b0d24', 
                fontWeight: '800' 
              }}
            >
              <Users size={18} color="#6b0d24" />
              <span>Manage Patients</span>
            </button>

            <button 
              onClick={() => handleAdminNavClick('doctors')} 
              style={{ 
                ...styles.navLink, 
                ...(location.pathname === '/' && activeAdminTab === 'doctors' ? styles.navLinkActive : {}),
                color: '#6b0d24', 
                fontWeight: '800' 
              }}
            >
              <UserCheck size={18} color="#6b0d24" />
              <span>Manage Doctors</span>
            </button>

            <button 
              onClick={() => handleAdminNavClick('assign')} 
              style={{ 
                ...styles.navLink, 
                ...(location.pathname === '/' && activeAdminTab === 'assign' ? styles.navLinkActive : {}),
                color: '#6b0d24', 
                fontWeight: '800' 
              }}
            >
              <Link2 size={18} color="#6b0d24" />
              <span>Assign Doctors</span>
            </button>

            <button 
              onClick={() => handleAdminNavClick('models')} 
              style={{ 
                ...styles.navLink, 
                ...(location.pathname === '/' && activeAdminTab === 'models' ? styles.navLinkActive : {}),
                color: '#6b0d24', 
                fontWeight: '800' 
              }}
            >
              <Database size={18} color="#6b0d24" />
              <span>Model Management</span>
            </button>

            <button 
              onClick={() => handleAdminNavClick('alerts')} 
              style={{ 
                ...styles.navLink, 
                ...(location.pathname === '/' && activeAdminTab === 'alerts' ? styles.navLinkActive : {}),
                color: '#6b0d24', 
                fontWeight: '800' 
              }}
            >
              <BellRing size={18} color="#6b0d24" />
              <span>Manage Alerts</span>
            </button>

            <button 
              onClick={() => handleAdminNavClick('audits')} 
              style={{ 
                ...styles.navLink, 
                ...(location.pathname === '/' && activeAdminTab === 'audits' ? styles.navLinkActive : {}),
                color: '#6b0d24', 
                fontWeight: '800' 
              }}
            >
              <ShieldCheck size={18} color="#6b0d24" />
              <span>HIPAA Audit Trail</span>
            </button>
            <div style={{ margin: '12px 0 6px', borderTop: '1px solid #e5ddd0' }} />
          </>
        )}

        {/* Main Workspace links for Doctor and Patient roles */}
        {!isAdmin && (
          <>
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
          </>
        )}

        {/* AI & Analytics (Only visible when a patient has been clicked / selected) */}
        {isPatientPage && (
          <>
            <div style={styles.menuGroupTitle}>AI & Analytics</div>

            <button 
              onClick={() => handleNavClick('ai', 'ai')} 
              style={{
                ...styles.navLink,
                ...(activePatientTab === 'ai' ? styles.navLinkActive : {})
              }}
            >
              <Cpu size={18} />
              <span>AI Predictions</span>
            </button>

            <button 
              onClick={() => handleNavClick('vitals', 'vitals')} 
              style={{ 
                ...styles.navLink, 
                ...(activePatientTab === 'vitals' ? styles.navLinkActive : {}) 
              }}
            >
              <Activity size={18} />
              <span>Monitoring</span>
            </button>

            <button 
              onClick={() => navigate('/careplans')} 
              style={{ 
                ...styles.navLink, 
                ...(location.pathname === '/careplans' ? styles.navLinkActive : {}) 
              }}
            >
              <BarChart2 size={18} />
              <span>Careplans & Interventions</span>
            </button>

            <button 
              onClick={() => navigate('/population-rollup')} 
              style={{ 
                ...styles.navLink, 
                ...(location.pathname === '/population-rollup' ? styles.navLinkActive : {}) 
              }}
            >
              <ShieldCheck size={18} />
              <span>Population Rollup</span>
            </button>

            <button 
              onClick={() => handleNavClick('ai', 'ai')} 
              style={styles.navLink}
            >
              <Database size={18} />
              <span>Model Management</span>
            </button>
          </>
        )}
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
              {user.roles?.includes('ADMIN') ? '🛡️ Admin (Ad)' : user.roles?.includes('PROVIDER') || user.roles?.includes('DOCTOR') ? '🩺 Doctor (Dr)' : '👤 Patient (Pt)'}
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
    background: '#eee8dc',
    borderRight: '1px solid #e2dad0',
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
    background: 'rgba(107, 13, 36, 0.08)',
    border: '1px solid rgba(107, 13, 36, 0.18)',
    padding: '8px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b0d24',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  brandName: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#6b0d24',
    letterSpacing: '-0.025em',
  },
  brandTag: {
    fontSize: '0.62rem',
    fontWeight: '700',
    color: '#6b0d24',
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
    color: '#6b0d24',
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
    color: '#2b1b1e',
    padding: '12px 14px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '0.88rem',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    textAlign: 'left',
    width: '100%',
  },
  navLinkActive: {
    background: 'rgba(107, 13, 36, 0.12)',
    color: '#6b0d24',
    borderLeft: '3px solid #6b0d24',
    borderRadius: '0 10px 10px 0',
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#ffffff',
    border: '1px solid #e2dad0',
    padding: '12px',
    borderRadius: '12px',
    marginTop: 'auto',
  },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: '#6b0d24',
    color: '#ffffff',
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
    color: '#2b1b1e',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '0.68rem',
    color: '#6e6063',
    fontWeight: '600',
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#6e6063',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease',
  }
};
