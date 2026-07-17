import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Patient360 } from './pages/Patient360';

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
    background: '#0a0e1a',
  },
  appWrapper: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: '100vh',
    background: '#0a0e1a',
  },
  mainContent: {
    flex: 1,
    height: '100vh',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    background: '#0a0e1a',
  }
};

export default App;
