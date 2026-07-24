import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Users, RefreshCw, Layers, ShieldCheck, Database, Search, Trash2, Calendar, FileText, CheckCircle } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFhirModal, setShowFhirModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    gender: 'Male',
    dob: '',
    email: '',
    phoneno: '',
    address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // FHIR Sync Panel state
  const [fhirLogs, setFhirLogs] = useState([]);
  const [fhirLoading, setFhirLoading] = useState(false);

  useEffect(() => {
    if (user && user.roles?.includes('PATIENT')) {
      navigate(`/patient/${user.patientId}`);
    } else {
      fetchPatients();
    }
  }, [user, navigate]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.getPatients();
      setPatients(response.data);
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
    setErrorMsg('');
    setSuccessMsg('');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.firstname.trim()) errors.firstname = 'First name is required';
    if (!formData.lastname.trim()) errors.lastname = 'Last name is required';
    if (!formData.dob) errors.dob = 'Date of birth is required';
    if (!formData.address.trim()) errors.address = 'Address is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    const phoneStr = String(formData.phoneno).trim();
    if (!formData.phoneno) {
      errors.phoneno = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneStr)) {
      errors.phoneno = 'Phone number must be exactly 10 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        ...formData,
        phoneno: Number(formData.phoneno)
      };
      await api.savePatient(payload);
      setSuccessMsg('Patient registered successfully!');
      setFormData({
        firstname: '',
        lastname: '',
        gender: 'Male',
        dob: '',
        email: '',
        phoneno: '',
        address: ''
      });
      fetchPatients();
      setTimeout(() => {
        setShowAddModal(false);
        setSuccessMsg('');
      }, 1500);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || err.response?.data || 'Failed to register patient.';
      setErrorMsg(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid navigating to details page
    if (window.confirm('Are you sure you want to delete this patient record?')) {
      try {
        await api.deletePatient(id);
        fetchPatients();
      } catch (err) {
        console.error(err);
        alert('Failed to delete patient.');
      }
    }
  };

  // FHIR Actions
  const runFhirConnect = async () => {
    setFhirLoading(true);
    try {
      const res = await api.connectFhir();
      setFhirLogs(prev => [...prev, `[EHR CONNECT]: ${res.data.response}`]);
    } catch (err) {
      setFhirLogs(prev => [...prev, `[ERROR]: Connection failed.`]);
    } finally {
      setFhirLoading(false);
    }
  };

  const runFhirSync = async () => {
    if (patients.length === 0) {
      setFhirLogs(prev => [...prev, `[WARN]: Register at least 1 patient to sync resources.`]);
      return;
    }
    setFhirLoading(true);
    try {
      // Sync for the first patient
      const testPatientId = patients[0].patientId;
      const res = await api.syncFhir(testPatientId);
      setFhirLogs(prev => [...prev, `[FHIR SYNC]: ${res.data.response}`]);
    } catch (err) {
      setFhirLogs(prev => [...prev, `[ERROR]: Synchronization failed.`]);
    } finally {
      setFhirLoading(false);
    }
  };

  const runFhirValidate = async () => {
    setFhirLoading(true);
    try {
      const res = await api.validateFhir();
      setFhirLogs(prev => [...prev, `[FHIR SCHEMA VALIDATION]: ${res.data.response}`]);
    } catch (err) {
      setFhirLogs(prev => [...prev, `[ERROR]: FHIR validation server unreachable.`]);
    } finally {
      setFhirLoading(false);
    }
  };

  const calculateAge = (dobString) => {
    if (!dobString) return '';
    try {
      const dob = new Date(dobString);
      const diffMs = Date.now() - dob.getTime();
      const ageDate = new Date(diffMs);
      return Math.abs(ageDate.getUTCFullYear() - 1970) + ' Yrs';
    } catch {
      return '';
    }
  };

  const filteredPatients = patients.filter(p => {
    const fullName = `${p.firstname} ${p.lastname}`.toLowerCase();
    const email = p.email.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || email.includes(query);
  });

  return (
    <div style={styles.dashboardContainer}>
      {/* Top Header Section */}
      <div style={styles.headerBlock}>
        <div style={styles.headerTextContainer}>
          <h1 style={styles.mainTitle}>Patient Directory Workspace</h1>
          <p style={styles.mainSubtitle}>
            Onboard new patients, validate FHIR HL7 models, and explore real-time holographic digital twins.
          </p>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div style={styles.statsRow}>
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.statIconContainer} className="card-title-icon">
            <Users size={20} />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Total Registrations</span>
            <span style={styles.statValue}>{loading ? '...' : patients.length}</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, color: '#3b82f6' }} className="card-title-icon">
            <Layers size={20} />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>FHIR Sync Status</span>
            <span style={styles.statValue}>ACTIVE</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIconContainer, color: '#10b981' }} className="card-title-icon">
            <ShieldCheck size={20} />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>HIPAA Auditing</span>
            <span style={styles.statValue}>ENFORCED</span>
          </div>
        </div>
      </div>

      {/* Main Directory Table Glass Card */}
      <div className="glass-card" style={styles.mainCard}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>Registered Patient List</h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
              Select any profile row to launch their clinical digital twin visualizer.
            </p>
          </div>
          <div style={styles.actionRow}>
            <button className="btn btn-secondary" onClick={() => { setFhirLogs([]); setShowFhirModal(true); }}>
              <RefreshCw size={16} />
              FHIR Hub
            </button>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              Onboard Patient
            </button>
          </div>
        </div>

        {/* Search Input Bar */}
        <div style={styles.searchBar}>
          <Search size={18} color="#64748b" />
          <input
            type="text"
            placeholder="Search patients by name, email, or credentials..."
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Patient Table */}
        {loading ? (
          <div style={styles.loadingContainer}>
            <div className="pulse-indicator" style={{ width: '20px', height: '20px' }}></div>
            <span style={{ marginLeft: '12px', color: '#94a3b8' }}>Loading patient records...</span>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div style={styles.emptyContainer}>
            <Users size={48} color="#64748b" />
            <span style={{ color: '#94a3b8', marginTop: '12px' }}>No patients found. Onboard one to get started!</span>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Patient Profile</th>
                  <th>Gender</th>
                  <th>Age (DOB)</th>
                  <th>Email Address</th>
                  <th>Phone Number</th>
                  <th>Residential Address</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((p) => (
                  <tr
                    key={p.patientId}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/patient/${p.patientId}`)}
                  >
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          background: p.gender === 'Female' 
                            ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.2))' 
                            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.2))',
                          border: p.gender === 'Female' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(59, 130, 246, 0.2)',
                          color: p.gender === 'Female' ? '#10b981' : '#3b82f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '800',
                          fontSize: '0.85rem'
                        }}>
                          {p.firstname ? p.firstname[0].toUpperCase() : 'P'}
                          {p.lastname ? p.lastname[0].toUpperCase() : ''}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.9rem' }}>{p.firstname} {p.lastname}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748b' }}>ID: {p.patientId.substring(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.gender === 'Male' ? 'badge-info' : 'badge-success'}`}>
                        {p.gender}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                        <span style={{ color: '#fff', fontWeight: '600' }}>{calculateAge(p.dob)}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{p.dob}</span>
                      </div>
                    </td>
                    <td>{p.email}</td>
                    <td>{p.phoneno}</td>
                    <td>{p.address}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => navigate(`/patient/${p.patientId}`)}
                          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                        >
                          View Twin
                        </button>
                        <button
                          className="btn btn-danger btn-small"
                          onClick={(e) => handleDelete(p.patientId, e)}
                          title="Delete Patient"
                          style={{ padding: '6px' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard Patient Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Onboard New Patient</h3>
            
            {successMsg && <div style={styles.successBanner}><CheckCircle size={18} /> {successMsg}</div>}
            {errorMsg && <div style={styles.errorBanner}>{errorMsg}</div>}

            <form onSubmit={handleAddPatient}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    name="firstname"
                    className="form-input"
                    value={formData.firstname}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.firstname && <span style={styles.fieldError}>{formErrors.firstname}</span>}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    name="lastname"
                    className="form-input"
                    value={formData.lastname}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.lastname && <span style={styles.fieldError}>{formErrors.lastname}</span>}
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    className="form-select"
                    value={formData.gender}
                    onChange={handleInputChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    className="form-input"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.dob && <span style={styles.fieldError}>{formErrors.dob}</span>}
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-input"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.email && <span style={styles.fieldError}>{formErrors.email}</span>}
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneno"
                    className="form-input"
                    value={formData.phoneno}
                    onChange={handleInputChange}
                    required
                  />
                  {formErrors.phoneno && <span style={styles.fieldError}>{formErrors.phoneno}</span>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-input"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.address && <span style={styles.fieldError}>{formErrors.address}</span>}
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Registering...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FHIR Integration Modal */}
      {showFhirModal && (
        <div style={styles.modalOverlay} onClick={() => setShowFhirModal(false)}>
          <div style={{ ...styles.modalContent, maxWidth: '600px' }} onClick={(e) => e.stopPropagation()} className="glass-card">
            <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>FHIR Interoperability Center</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '20px' }}>
              Connect with healthcare sandboxes (Epic, Cerner, HAPI) to synchronize resources in standard HL7 FHIR formats.
            </p>

            <div style={styles.fhirBtnRow}>
              <button className="btn btn-secondary btn-small" onClick={runFhirConnect} disabled={fhirLoading}>
                1. Test HAPI Connection
              </button>
              <button className="btn btn-secondary btn-small" onClick={runFhirSync} disabled={fhirLoading}>
                2. Run Patient Sync
              </button>
              <button className="btn btn-secondary btn-small" onClick={runFhirValidate} disabled={fhirLoading}>
                3. Schema Validate
              </button>
            </div>

            {/* Console Log Panel */}
            <div style={styles.consoleLog}>
              <div style={styles.consoleHeader}>
                <Database size={14} />
                <span>FHIR Sync Operations Log</span>
              </div>
              <div style={styles.consoleBody}>
                {fhirLogs.length === 0 ? (
                  <span style={{ color: '#64748b', fontStyle: 'italic' }}>Terminal idle. Click one of the operations above to trigger actions.</span>
                ) : (
                  fhirLogs.map((log, i) => (
                    <div key={i} style={styles.logLine}>{log}</div>
                  ))
                )}
              </div>
            </div>

            <div style={styles.modalActions}>
              <button type="button" className="btn btn-primary" onClick={() => setShowFhirModal(false)}>
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  headerBlock: {
    background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.1) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(59, 130, 246, 0.06) 100%)',
    border: '1px solid rgba(13, 148, 136, 0.15)',
    borderRadius: '16px',
    padding: '22px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
    boxShadow: '0 4px 24px -4px rgba(13, 148, 136, 0.08)',
  },
  headerTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  mainTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.025em',
    margin: 0,
  },
  mainSubtitle: {
    fontSize: '0.88rem',
    color: '#64748b',
    margin: 0,
  },
  dashboardContainer: {
    padding: '20px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '24px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '24px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#fff',
    marginTop: '4px',
  },
  mainCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    textAlign: 'left',
  },
  cardTitle: {
    fontSize: '1.5rem',
    color: '#fff',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '10px 16px',
    gap: '12px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#fff',
    outline: 'none',
    fontSize: '0.95rem',
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '64px 0',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(5, 8, 16, 0.75)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '560px',
    background: '#0f172a',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '32px',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '24px',
  },
  fieldError: {
    fontSize: '0.78rem',
    color: '#f43f5e',
    marginTop: '4px',
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  errorBanner: {
    padding: '10px 14px',
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    borderRadius: '8px',
    color: '#f43f5e',
    fontSize: '0.9rem',
    marginBottom: '20px',
  },
  fhirBtnRow: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
    marginBottom: '20px',
  },
  consoleLog: {
    background: '#070a13',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  consoleHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    background: 'rgba(255, 255, 255, 0.02)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    color: '#94a3b8',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  consoleBody: {
    padding: '14px',
    fontFamily: 'monospace',
    fontSize: '0.82rem',
    maxHeight: '200px',
    overflowY: 'auto',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  logLine: {
    color: '#34d399',
    wordBreak: 'break-all',
  }
};
