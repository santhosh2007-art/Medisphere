import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patient360 } from './pages/Patient360';
import { RealtimeMonitoringDashboard } from './pages/RealtimeMonitoringDashboard';
import { CareplanManagement } from './pages/CareplanManagement';
import { PopulationHealthRollup } from './pages/PopulationHealthRollup';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="pulse-indicator"></div>
        <span style={{ marginLeft: '12px', color: '#94a3b8' }}>Loading secure environment...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <div style={styles.appWrapper}>
        <Sidebar />
        <main style={styles.mainContent}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/patient/:id" element={<Patient360 />} />
            <Route path="/monitoring" element={<RealtimeMonitoringDashboard />} />
            <Route path="/careplans" element={<CareplanManagement />} />
            <Route path="/population-rollup" element={<PopulationHealthRollup />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = {
  loadingContainer: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f7f4ed',
  },
  appWrapper: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    background: '#f7f4ed',
  },
  mainContent: {
    flex: 1,
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    background: '#f7f4ed',
  }
};

export default App;
