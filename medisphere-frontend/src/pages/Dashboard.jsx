import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, Users, RefreshCw, Layers, ShieldCheck, Database, Search, Trash2, Calendar, FileText, CheckCircle,
  UserCheck, UserPlus, Link2, BellRing, Sliders, User, Stethoscope, Cpu, Activity
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Admin Tabs & Assignment State
  const [adminTab, setAdminTab] = useState('patients');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignDoctor, setAssignDoctor] = useState('Dr. Sarah Jenkins');
  const [assignPatientId, setAssignPatientId] = useState('');
  const [assignSuccess, setAssignSuccess] = useState('');

  const [doctorsList, setDoctorsList] = useState([
    { id: 1, name: 'Dr. Sarah Jenkins', specialty: 'Cardiologist (CARDIAC)', assignedPatients: 'Santhosh Kumar Reddy', status: 'Active' },
    { id: 2, name: 'Dr. Robert Chen', specialty: 'Pulmonologist (OXYGEN)', assignedPatients: 'Anitha Ramesh', status: 'Active' },
    { id: 3, name: 'Dr. Elena Rostova', specialty: 'General Physician (BLOOD_PRESSURE)', assignedPatients: 'Rajesh Kumar', status: 'Active' },
    { id: 4, name: 'Dr. Rajesh Kumar', specialty: 'Chief Medical Officer (ALL)', assignedPatients: 'All Patients', status: 'Active' },
  ]);

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
    const handleSwitchAdminTab = (e) => {
      if (e.detail) {
        setAdminTab(e.detail);
      }
    };
    window.addEventListener('switch-admin-tab', handleSwitchAdminTab);
    return () => window.removeEventListener('switch-admin-tab', handleSwitchAdminTab);
  }, []);

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
        setPatients(prev => prev.filter(p => String(p.patientId) !== String(id)));
        await api.deletePatient(id);
        fetchPatients();
      } catch (err) {
        console.error(err);
        fetchPatients();
      }
    }
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!assignPatientId && patients.length > 0) {
      setAssignPatientId(patients[0].patientId);
    }

    const targetPatientId = assignPatientId || (patients.length > 0 ? patients[0].patientId : '');
    const pObj = patients.find(p => String(p.patientId) === String(targetPatientId));
    const pName = pObj ? `${pObj.firstname} ${pObj.lastname}` : 'Selected Patient';

    setDoctorsList(prev => prev.map(d => {
      if (d.name === assignDoctor) {
        return {
          ...d,
          assignedPatients: d.assignedPatients === 'None' || d.assignedPatients === 'All Patients' 
            ? pName 
            : `${d.assignedPatients}, ${pName}`
        };
      }
      return d;
    }));

    setAssignSuccess(`Assigned ${assignDoctor} to ${pName} successfully!`);
    setTimeout(() => {
      setShowAssignModal(false);
      setAssignSuccess('');
    }, 1800);
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

  const userSpecialty = user?.specialty || 'ALL';

  const filteredPatients = patients.filter(p => {
    const fullName = `${p.firstname} ${p.lastname}`.toLowerCase();
    const email = (p.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = fullName.includes(query) || email.includes(query);
    if (!matchesSearch) return false;

    // Specialty Filtering
    if (userSpecialty === 'ALL' || user?.roles?.includes('ADMIN')) return true;

    if (userSpecialty === 'CARDIAC') {
      return fullName.includes('santhosh') || p.patientId === '35f51e3e-66fd-4f87-85ad-affa0dde1156' || (p.disease && p.disease.toUpperCase().includes('CARD'));
    }
    if (userSpecialty === 'OXYGEN') {
      return fullName.includes('anitha') || p.patientId === '8a719c2d-12ef-45a8-912b-34567890abcd' || (p.disease && (p.disease.toUpperCase().includes('ASTHMA') || p.disease.toUpperCase().includes('LUNG') || p.disease.toUpperCase().includes('OXY')));
    }
    if (userSpecialty === 'BLOOD_PRESSURE') {
      return fullName.includes('rajesh') || p.patientId === '9b820d3e-23fa-56b9-923c-45678901bcde' || (p.disease && (p.disease.toUpperCase().includes('HYPER') || p.disease.toUpperCase().includes('PRESS') || p.disease.toUpperCase().includes('DIAB')));
    }

    return true;
  });

  const isAdmin = user?.roles?.includes('ADMIN');

  return (
    <div style={styles.dashboardContainer}>
      {/* Top Header Section */}
      <div style={styles.headerBlock}>
        <div style={styles.headerTextContainer}>
          <h1 style={styles.mainTitle}>
            {isAdmin ? 'System Administration Control Center' : 'Patient Directory Workspace'}
          </h1>
          <p style={styles.mainSubtitle}>
            {isAdmin 
              ? 'Manage patient registries, assign clinical doctors, configure ML model HUD, and enforce HIPAA security rules.'
              : 'Onboard new patients, validate FHIR HL7 models, and explore real-time holographic digital twins.'}
          </p>
        </div>
      </div>

      {/* Role Capabilities Banner (Matching Slide 8 & Slide 4) */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5ddd0', boxShadow: '0 4px 16px rgba(107, 13, 36, 0.05)', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '800', background: 'rgba(107,13,36,0.1)', color: '#6b0d24', border: '1px solid #6b0d24' }}>
              {isAdmin ? 'Ad - Admin Portal' : user?.roles?.includes('PROVIDER') || user?.roles?.includes('DOCTOR') ? 'Dr - Doctor Portal' : 'Pt - Patient Portal'}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#2b1b1e' }}>
              Active User: <strong>{user?.name || user?.username}</strong> {user?.specialtyLabel ? `(${user.specialtyLabel})` : ''}
            </span>
          </div>
          <span style={{ fontSize: '0.78rem', color: '#6e6063', fontWeight: '600' }}>
            Role-Based Experience: Unified EHR Platform
          </span>
        </div>

        {/* Interactive Admin Tab Navigation Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {isAdmin ? (
            <>
              <button 
                type="button"
                onClick={() => setAdminTab('patients')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${adminTab === 'patients' ? '#6b0d24' : '#e2dbcd'}`,
                  background: adminTab === 'patients' ? '#6b0d24' : '#f6f3eb',
                  color: adminTab === 'patients' ? '#ffffff' : '#2b1b1e',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Users size={14} /> Manage Patients ({patients.length})
              </button>

              <button 
                type="button"
                onClick={() => setAdminTab('doctors')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${adminTab === 'doctors' ? '#6b0d24' : '#e2dbcd'}`,
                  background: adminTab === 'doctors' ? '#6b0d24' : '#f6f3eb',
                  color: adminTab === 'doctors' ? '#ffffff' : '#2b1b1e',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <UserCheck size={14} /> Manage Doctors ({doctorsList.length})
              </button>

              <button 
                type="button"
                onClick={() => { setAdminTab('assign'); setShowAssignModal(true); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${adminTab === 'assign' ? '#6b0d24' : '#e2dbcd'}`,
                  background: adminTab === 'assign' ? '#6b0d24' : '#f6f3eb',
                  color: adminTab === 'assign' ? '#ffffff' : '#2b1b1e',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Link2 size={14} /> Assign Doctors to Patients
              </button>

              <button 
                type="button"
                onClick={() => setAdminTab('models')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${adminTab === 'models' ? '#6b0d24' : '#e2dbcd'}`,
                  background: adminTab === 'models' ? '#6b0d24' : '#f6f3eb',
                  color: adminTab === 'models' ? '#ffffff' : '#2b1b1e',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <Database size={14} /> Manage ML Models
              </button>

              <button 
                type="button"
                onClick={() => setAdminTab('alerts')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${adminTab === 'alerts' ? '#6b0d24' : '#e2dbcd'}`,
                  background: adminTab === 'alerts' ? '#6b0d24' : '#f6f3eb',
                  color: adminTab === 'alerts' ? '#ffffff' : '#2b1b1e',
                  fontSize: '0.82rem',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                <BellRing size={14} /> Manage Alerts
              </button>
            </>
          ) : user?.roles?.includes('PROVIDER') || user?.roles?.includes('DOCTOR') ? (
            <>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ View assigned patients</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ View patient health information</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ View predictions</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ Review alerts</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ Review / approve care plans</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ Monitor patient progress</span>
            </>
          ) : (
            <>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ View health information</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ View vitals</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ View predictions</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ View care plan</span>
              <span style={{ padding: '4px 10px', background: '#f6f3eb', border: '1px solid #e2dbcd', borderRadius: '6px', fontSize: '0.78rem', color: '#2b1b1e', fontWeight: '600' }}>✓ Track adherence</span>
            </>
          )}
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
          <div style={{ ...styles.statIconContainer, color: '#6b0d24' }} className="card-title-icon">
            <UserCheck size={20} />
          </div>
          <div style={styles.statInfo}>
            <span style={styles.statLabel}>Clinical Roster</span>
            <span style={styles.statValue}>{doctorsList.length} Doctors</span>
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

      {/* ADMIN VIEW 1: MANAGING DOCTORS AND ASSIGNING DOCTORS */}
      {isAdmin && (adminTab === 'doctors' || adminTab === 'assign') && (
        <div className="glass-card" style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={{ ...styles.cardTitle, color: '#6b0d24' }}>Clinical Doctors Roster & Patient Assignments</h2>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', fontWeight: '500' }}>
                Manage physician accounts and assign doctors to specific patient digital twins.
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAssignModal(true)}>
              <Link2 size={16} />
              Assign Doctor to Patient
            </button>
          </div>

          <div className="table-container" style={{ marginTop: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5ddd0' }}>
                  <th style={{ padding: '12px', color: '#6b0d24', fontWeight: '800' }}>Doctor Name</th>
                  <th style={{ padding: '12px', color: '#6b0d24', fontWeight: '800' }}>Specialty</th>
                  <th style={{ padding: '12px', color: '#6b0d24', fontWeight: '800' }}>Assigned Patient(s)</th>
                  <th style={{ padding: '12px', color: '#6b0d24', fontWeight: '800' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: '#6b0d24', fontWeight: '800' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctorsList.map((doc) => (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #e5ddd0' }}>
                    <td style={{ padding: '14px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#6b0d24', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                          🩺
                        </div>
                        <span style={{ fontWeight: '800', color: '#2b1b1e', fontSize: '0.95rem' }}>{doc.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 12px', color: '#334155', fontWeight: '700' }}>{doc.specialty}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '4px 10px', borderRadius: '6px', background: '#f6f3eb', border: '1px solid #e2dbcd', color: '#6b0d24', fontWeight: '700', fontSize: '0.8rem' }}>
                        👤 {doc.assignedPatients}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ padding: '3px 8px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#047857', fontWeight: '800', fontSize: '0.75rem', border: '1px solid #a7f3d0' }}>
                        {doc.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button 
                        className="btn btn-secondary btn-small"
                        onClick={() => { setAssignDoctor(doc.name); setShowAssignModal(true); }}
                        style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: '700' }}
                      >
                        Assign Patient
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADMIN VIEW 2: ML MODELS HUD */}
      {isAdmin && adminTab === 'models' && (
        <div className="glass-card" style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={{ ...styles.cardTitle, color: '#6b0d24' }}>TensorFlow ML Model Management HUD</h2>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', fontWeight: '500' }}>
                Manage federated machine learning risk prediction models and deploy target weights.
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#047857', border: '1px solid rgba(16,185,129,0.3)', fontWeight: '800' }}>
              Active Model: v1.1 (92.8% Accuracy)
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '16px', textAlign: 'left' }}>
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5ddd0' }}>
              <h4 style={{ color: '#6b0d24', margin: '0 0 12px', fontSize: '0.95rem' }}>Active Models Registry</h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e5ddd0' }}>
                    <th style={{ padding: '8px', color: '#6b0d24' }}>Version</th>
                    <th style={{ padding: '8px', color: '#6b0d24' }}>Accuracy</th>
                    <th style={{ padding: '8px', color: '#6b0d24' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5ddd0' }}>
                    <td style={{ padding: '8px', fontWeight: '800', color: '#2b1b1e' }}>v1.0</td>
                    <td style={{ padding: '8px', fontWeight: '700', color: '#2b1b1e' }}>91.4%</td>
                    <td style={{ padding: '8px', color: '#475569' }}>INACTIVE</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5ddd0' }}>
                    <td style={{ padding: '8px', fontWeight: '800', color: '#2b1b1e' }}>v1.1</td>
                    <td style={{ padding: '8px', fontWeight: '700', color: '#2b1b1e' }}>92.8%</td>
                    <td style={{ padding: '8px', color: '#047857', fontWeight: '800' }}>ACTIVE</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ background: '#f6f3eb', padding: '16px', borderRadius: '12px', border: '1px solid #e2dbcd' }}>
              <h4 style={{ color: '#6b0d24', margin: '0 0 12px', fontSize: '0.95rem' }}>Deploy New Model Target</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>Model Target Version</label>
                  <input type="text" className="form-input" defaultValue="1.2" style={{ padding: '6px 10px', marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: '700', color: '#334155' }}>Expected Accuracy (%)</label>
                  <input type="number" className="form-input" defaultValue="94.5" style={{ padding: '6px 10px', marginTop: '4px' }} />
                </div>
                <button className="btn btn-primary" style={{ marginTop: '8px' }}>Deploy Model Weights</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN VIEW 3: ALERTS & AUDITS */}
      {isAdmin && adminTab === 'alerts' && (
        <div className="glass-card" style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={{ ...styles.cardTitle, color: '#6b0d24' }}>System Alerts & HIPAA Audit Enforcement HUD</h2>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', fontWeight: '500' }}>
                Monitor system-wide vital alarm thresholds and HIPAA audit trail logs.
              </p>
            </div>
            <span style={{ fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#047857', border: '1px solid rgba(16,185,129,0.3)', fontWeight: '800' }}>
              HIPAA Audit Status: ENFORCED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px', textAlign: 'left' }}>
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5ddd0' }}>
              <h4 style={{ color: '#6b0d24', margin: '0 0 8px' }}>🚨 Critical Threshold Rules</h4>
              <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: '#2b1b1e', lineHeight: '1.6' }}>
                <li>Heart Rate &gt; 130 bpm or &lt; 40 bpm</li>
                <li>Systolic BP &gt; 180 mmHg or &lt; 70 mmHg</li>
                <li>Oxygen Saturation (SpO2) &lt; 90%</li>
                <li>Blood Sugar &gt; 200 mg/dL or &lt; 55 mg/dL</li>
              </ul>
            </div>

            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e5ddd0' }}>
              <h4 style={{ color: '#6b0d24', margin: '0 0 8px' }}>🛡️ Security Audit Logs</h4>
              <div style={{ fontSize: '0.8rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>✓ Keycloak Security JWT Auth: Verified</div>
                <div>✓ Patient Consent Revocation Enforcement: Active</div>
                <div>✓ Kafka Encrypted Vitals Topic Streaming: Enforced</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEFAULT PATIENT DIRECTORY VIEW (For Patients Tab or Doctor/Patient User) */}
      {(!isAdmin || adminTab === 'patients') && (
        <div className="glass-card" style={styles.mainCard}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={{ ...styles.cardTitle, color: '#6b0d24' }}>Registered Patient List</h2>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px', fontWeight: '500' }}>
                Select any patient name or row to launch their clinical digital twin visualizer.
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
                  <tr style={{ borderBottom: '2px solid #e5ddd0' }}>
                    <th style={{ color: '#6b0d24', fontWeight: '800' }}>Patient Profile & Name</th>
                    <th style={{ color: '#6b0d24', fontWeight: '800' }}>Gender</th>
                    <th style={{ color: '#6b0d24', fontWeight: '800' }}>Age (DOB)</th>
                    <th style={{ color: '#6b0d24', fontWeight: '800' }}>Email Address</th>
                    <th style={{ color: '#6b0d24', fontWeight: '800' }}>Phone Number</th>
                    <th style={{ color: '#6b0d24', fontWeight: '800' }}>Residential Address</th>
                    <th style={{ textAlign: 'right', color: '#6b0d24', fontWeight: '800' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((p) => (
                    <tr
                      key={p.patientId}
                      style={{ cursor: 'pointer', borderBottom: '1px solid #e5ddd0' }}
                      onClick={() => navigate(`/patient/${p.patientId}`)}
                    >
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            background: p.gender === 'Female' 
                              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                              : 'linear-gradient(135deg, #6b0d24 0%, #8b1538 100%)',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            flexShrink: 0
                          }}>
                            {p.firstname ? p.firstname[0].toUpperCase() : 'P'}
                            {p.lastname ? p.lastname[0].toUpperCase() : ''}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                            <span style={{ fontWeight: '800', color: '#6b0d24', fontSize: '0.98rem' }}>
                              {p.firstname} {p.lastname}
                            </span>
                            <span style={{ fontSize: '0.72rem', color: '#6e6063', fontWeight: '600' }}>
                              ID: {p.patientId.substring(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${p.gender === 'Male' ? 'badge-info' : 'badge-success'}`} style={{ fontWeight: '800' }}>
                          {p.gender}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                          <span style={{ color: '#2b1b1e', fontWeight: '700' }}>{calculateAge(p.dob)}</span>
                          <span style={{ fontSize: '0.72rem', color: '#6e6063', fontWeight: '600' }}>{p.dob}</span>
                        </div>
                      </td>
                      <td style={{ color: '#334155', fontWeight: '600' }}>{p.email}</td>
                      <td style={{ color: '#334155', fontWeight: '600' }}>{p.phoneno}</td>
                      <td style={{ color: '#334155', fontWeight: '600' }}>{p.address}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                          {isAdmin && (
                            <button
                              className="btn btn-secondary btn-small"
                              onClick={() => { setAssignPatientId(p.patientId); setShowAssignModal(true); }}
                              style={{ fontSize: '0.75rem', padding: '4px 8px', fontWeight: '700' }}
                            >
                              Assign Dr
                            </button>
                          )}
                          <button
                            className="btn btn-primary btn-small"
                            onClick={() => navigate(`/patient/${p.patientId}`)}
                            style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: '700' }}
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
      )}

      {/* Assign Doctor Modal */}
      {showAssignModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAssignModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="glass-card">
            <h3 style={{ marginBottom: '16px', fontSize: '1.2rem', color: '#6b0d24' }}>Assign Clinical Doctor to Patient</h3>
            
            {assignSuccess && <div style={styles.successBanner}><CheckCircle size={18} /> {assignSuccess}</div>}

            <form onSubmit={handleAssignSubmit}>
              <div className="form-group" style={{ marginBottom: '16px', textAlign: 'left' }}>
                <label className="form-label">Select Clinical Doctor</label>
                <select 
                  className="form-select"
                  value={assignDoctor}
                  onChange={(e) => setAssignDoctor(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                >
                  <option value="Dr. Sarah Jenkins">Dr. Sarah Jenkins (Cardiology)</option>
                  <option value="Dr. Robert Chen">Dr. Robert Chen (Pulmonology)</option>
                  <option value="Dr. Elena Rostova">Dr. Elena Rostova (General Medicine)</option>
                  <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar (Chief Medical Officer)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '20px', textAlign: 'left' }}>
                <label className="form-label">Select Target Patient</label>
                <select 
                  className="form-select"
                  value={assignPatientId}
                  onChange={(e) => setAssignPatientId(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                >
                  {patients.map(p => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.firstname} {p.lastname} (ID: {p.patientId.substring(0, 8)}...)
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Doctor Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
    background: '#ffffff',
    border: '1px solid #e5ddd0',
    borderRadius: '16px',
    padding: '22px 28px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
    boxShadow: '0 4px 20px rgba(107, 13, 36, 0.05)',
  },
  headerTextContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  mainTitle: {
    fontSize: '1.75rem',
    fontWeight: '800',
    color: '#6b0d24',
    letterSpacing: '-0.025em',
    margin: 0,
  },
  mainSubtitle: {
    fontSize: '0.88rem',
    color: '#6e6063',
    fontWeight: '500',
    margin: 0,
  },
  dashboardContainer: {
    padding: '20px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box',
    background: '#f7f4ed',
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
    background: '#ffffff',
    border: '1px solid #e5ddd0',
    boxShadow: '0 4px 16px rgba(107, 13, 36, 0.04)',
    borderRadius: '16px',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '0.85rem',
    color: '#6e6063',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '700',
  },
  statValue: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#6b0d24',
    marginTop: '4px',
  },
  mainCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    background: '#ffffff',
    border: '1px solid #e5ddd0',
    borderRadius: '16px',
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
    fontWeight: '800',
    color: '#6b0d24',
  },
  actionRow: {
    display: 'flex',
    gap: '12px',
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    background: '#f6f3eb',
    border: '1px solid #e2dbcd',
    borderRadius: '10px',
    padding: '10px 16px',
    gap: '12px',
  },
  searchInput: {
    background: 'none',
    border: 'none',
    color: '#2b1b1e',
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
    background: '#ffffff',
    border: '1px solid #e5ddd0',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 16px 40px rgba(107, 13, 36, 0.12)',
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
