import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ArrowLeft, User, Heart, Shield, FileClock, Activity, AlertCircle, CheckCircle, 
  XCircle, Thermometer, Droplet, UserCheck, ShieldAlert, Cpu, HeartPulse, Info, RefreshCw
} from 'lucide-react';

export const Patient360 = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [data360, setData360] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('twin');
  const [fhirResource, setFhirResource] = useState(null);
  const [fhirLoading, setFhirLoading] = useState(false);
  const [audits, setAudits] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  // Live Wearable Stream (Kafka) State
  const [isStreaming, setIsStreaming] = useState(false);
  const streamIntervalRef = useRef(null);

  // Consent editing states
  const [consentSaving, setConsentSaving] = useState(false);
  const [consentError, setConsentError] = useState('');
  const [consentSuccess, setConsentSuccess] = useState('');

  // Local/Temporary Consent Toggle
  const [localConsentStatus, setLocalConsentStatus] = useState('GRANTED');

  // Health Twin Edit states
  const [showTwinModal, setShowTwinModal] = useState(false);
  const [twinFormData, setTwinFormData] = useState({
    bloodgroup: 'O+',
    height: 175,
    weight: 70,
    temperature: 98.6,
    disease: 'None'
  });
  const [twinSaving, setTwinSaving] = useState(false);
  const [twinError, setTwinError] = useState('');
  const [twinSuccess, setTwinSuccess] = useState('');

  // Demographics Edit states
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [demoFormData, setDemoFormData] = useState({
    firstname: '',
    lastname: '',
    gender: 'Male',
    dob: '',
    email: '',
    phoneno: '',
    address: ''
  });
  const [demoSaving, setDemoSaving] = useState(false);
  const [demoError, setDemoError] = useState('');
  const [demoSuccess, setDemoSuccess] = useState('');

  useEffect(() => {
    if (user && user.roles?.includes('PATIENT') && user.patientId !== id) {
      navigate(`/patient/${user.patientId}`);
    } else {
      fetchData();
    }
    return () => stopVitalsStream(); // Cleanup streaming on unmount
  }, [id, user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.getPatient360(id);
      setData360(res.data);
      const initialStatus = res.data.consent?.status || 'REVOKED';
      setLocalConsentStatus(initialStatus.toUpperCase());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAudits = async () => {
    setAuditLoading(true);
    try {
      const res = await api.getAudits(id);
      setAudits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditLoading(false);
    }
  };

  const loadFhirJson = async () => {
    setFhirLoading(true);
    try {
      const res = await api.getPatientFhirResource(id);
      setFhirResource(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setFhirLoading(false);
    }
  };

  const handleConsentToggle = async (newStatus) => {
    if (!data360) return;
    setConsentSaving(true);
    setConsentError('');
    setConsentSuccess('');
    try {
      const currentConsent = data360.consent || {};
      const payload = {
        patientId: id,
        consenttype: currentConsent.consenttype || 'FULL_ACCESS',
        status: newStatus,
        granteddate: new Date().toISOString().split('T')[0],
        expirydate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      await api.saveConsent(payload);
      setLocalConsentStatus(newStatus);
      setConsentSuccess(`Consent updated to ${newStatus} successfully.`);
      
      // Refresh patient 360 data to reflect blockages immediately
      const refreshed = await api.getPatient360(id);
      setData360(refreshed.data);
      
      // Reload audits if the audits tab is open
      if (activeTab === 'audits') loadAudits();
    } catch (err) {
      console.error(err);
      setConsentError('Failed to update HIPAA consent record on backend.');
    } finally {
      setConsentSaving(false);
    }
  };

  const handleEditTwinClick = () => {
    const ht = data360?.healthTwin || {};
    setTwinFormData({
      bloodgroup: ht.bloodgroup || 'O+',
      height: ht.height || 175,
      weight: ht.weight || 70,
      temperature: ht.temperature || 98.6,
      disease: ht.disease || 'None'
    });
    setTwinError('');
    setTwinSuccess('');
    setShowTwinModal(true);
  };

  const handleSaveTwin = async (e) => {
    e.preventDefault();
    setTwinSaving(true);
    setTwinError('');
    setTwinSuccess('');
    try {
      const payload = {
        patientId: id,
        bloodgroup: twinFormData.bloodgroup,
        height: Number(twinFormData.height),
        weight: Number(twinFormData.weight),
        temperature: Number(twinFormData.temperature),
        disease: twinFormData.disease
      };
      
      await api.saveHealthTwin(payload);
      setTwinSuccess('Bio-metrics updated successfully!');
      
      // Refresh patient 360 data
      const refreshed = await api.getPatient360(id);
      setData360(refreshed.data);
      
      setTimeout(() => {
        setShowTwinModal(false);
        setTwinSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setTwinError('Failed to update bio-metrics. Check API connectivity.');
    } finally {
      setTwinSaving(false);
    }
  };

  const handleEditDemoClick = () => {
    setDemoFormData({
      firstname: patient?.firstname || '',
      lastname: patient?.lastname || '',
      gender: patient?.gender || 'Male',
      dob: patient?.dob || '',
      email: patient?.email || '',
      phoneno: patient?.phoneno || '',
      address: patient?.address || ''
    });
    setDemoError('');
    setDemoSuccess('');
    setShowDemoModal(true);
  };

  const handleSaveDemo = async (e) => {
    e.preventDefault();
    setDemoSaving(true);
    setDemoError('');
    setDemoSuccess('');
    try {
      const payload = {
        ...demoFormData,
        phoneno: Number(demoFormData.phoneno)
      };
      
      await api.updatePatient(id, payload);
      setDemoSuccess('Demographics updated successfully!');
      
      // Refresh patient 360 data
      const refreshed = await api.getPatient360(id);
      setData360(refreshed.data);
      
      setTimeout(() => {
        setShowDemoModal(false);
        setDemoSuccess('');
      }, 1500);
    } catch (err) {
      console.error(err);
      setDemoError('Failed to update demographics. Check API connectivity.');
    } finally {
      setDemoSaving(false);
    }
  };

  // Real-time Ingestion Stream simulation via Kafka endpoint
  const startVitalsStream = () => {
    if (isStreaming) return;
    setIsStreaming(true);
    
    streamIntervalRef.current = setInterval(async () => {
      // Simulate wearable sensor inputs
      const randomHR = Math.floor(65 + Math.random() * 40); // 65-105 bpm
      const bpSystolic = Math.floor(115 + Math.random() * 20); // 115-135
      const bpDiastolic = Math.floor(75 + Math.random() * 10); // 75-85
      const randomSpO2 = Math.floor(95 + Math.random() * 5); // 95-100%
      const randomSugar = Math.floor(85 + Math.random() * 40); // 85-125 mg/dL
      const randomTemp = (97.5 + Math.random() * 2).toFixed(1); // 97.5 - 99.5 F

      const vitalsPayload = {
        patientId: id,
        heartbeat: randomHR,
        bloodpressure: `${bpSystolic}/${bpDiastolic}`,
        oxygenlevel: randomSpO2,
        bloodsuger: randomSugar,
        pulserate: randomHR
      };

      try {
        // Publish to Kafka vitals stream endpoint
        await api.publishVitals(vitalsPayload);
        
        // Fetch updated latest vitals
        const latestRes = await api.getLatestVitals(id);
        
        setData360(prev => {
          if (!prev) return null;
          return {
            ...prev,
            vitals: latestRes.data
          };
        });
      } catch (err) {
        console.error('Error streaming vitals:', err);
      }
    }, 3000);
  };

  const stopVitalsStream = () => {
    if (streamIntervalRef.current) {
      clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
    setIsStreaming(false);
  };

  const toggleStreamingState = () => {
    if (isStreaming) {
      stopVitalsStream();
    } else {
      startVitalsStream();
    }
  };

  // Change tabs handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'audits') loadAudits();
    if (tab === 'fhir') loadFhirJson();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div className="pulse-indicator" style={{ width: '24px', height: '24px' }}></div>
        <span style={{ marginLeft: '12px', color: '#94a3b8' }}>Assembling Digital Twin...</span>
      </div>
    );
  }

  if (!data360) {
    return (
      <div style={styles.errorContainer}>
        <XCircle size={48} color="#f43f5e" />
        <span style={{ color: '#94a3b8', marginTop: '12px' }}>Could not load patient dashboard. Check backend connectivity.</span>
        {user && !user.roles?.includes('PATIENT') && (
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginTop: '16px' }}>
            Back to Directory
          </button>
        )}
      </div>
    );
  }

  const { patient, healthTwin, vitals, consent } = data360;

  const diseaseStr = (healthTwin?.disease || '').toLowerCase();
  const hasHeartRisk = diseaseStr.includes('heart') || diseaseStr.includes('hypertension') || diseaseStr.includes('bp') || diseaseStr.includes('blood pressure');
  const hasDiabetesRisk = diseaseStr.includes('diabetes') || diseaseStr.includes('sugar') || diseaseStr.includes('pancreas');
  const hasRespiratoryRisk = diseaseStr.includes('asthma') || diseaseStr.includes('allergy') || diseaseStr.includes('dust') || diseaseStr.includes('lung');
  const hasBrainRisk = diseaseStr.includes('brain') || diseaseStr.includes('migraine') || diseaseStr.includes('head') || diseaseStr.includes('neurological');
  const hasKidneyRisk = diseaseStr.includes('kidney') || diseaseStr.includes('renal') || diseaseStr.includes('urine');

  // Consent restriction check
  const hasConsent = localConsentStatus === 'GRANTED';

  return (
    <div style={styles.container}>
      {/* Header bar */}
      <div style={styles.header}>
        {user && !user.roles?.includes('PATIENT') && (
          <button onClick={() => navigate('/')} style={styles.backBtn} className="btn btn-secondary btn-small">
            <ArrowLeft size={16} />
            Directory
          </button>
        )}
        <div style={styles.titleInfo}>
          <h1 style={styles.patientName}>
            {patient.firstname} {patient.lastname}
          </h1>
          <span style={styles.patientIdBadge}>ID: {id}</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div style={styles.mainGrid}>
        
        {/* Left Column: Demographics & Consent Manager */}
        <div style={styles.leftCol}>
          
          {/* Demographic Card */}
          <div className="glass-card" style={styles.demoCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} color="#0d9488" />
                <h3 style={{ margin: 0 }}>Demographics</h3>
              </div>
              {user && !user.roles?.includes('PATIENT') && (
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={handleEditDemoClick}
                >
                  Edit
                </button>
              )}
            </div>
            <div style={styles.demoGrid}>
              <div style={styles.demoItem}>
                <span style={styles.demoLabel}>Gender</span>
                <span style={styles.demoValue}>{patient.gender}</span>
              </div>
              <div style={styles.demoItem}>
                <span style={styles.demoLabel}>Date of Birth</span>
                <span style={styles.demoValue}>{patient.dob}</span>
              </div>
              <div style={styles.demoItem}>
                <span style={styles.demoLabel}>Phone</span>
                <span style={styles.demoValue}>{patient.phoneno}</span>
              </div>
              <div style={styles.demoItem}>
                <span style={styles.demoLabel}>Email</span>
                <span style={styles.demoValue}>{patient.email}</span>
              </div>
              <div style={{ ...styles.demoItem, gridColumn: 'span 2' }}>
                <span style={styles.demoLabel}>Address</span>
                <span style={styles.demoValue}>{patient.address}</span>
              </div>
            </div>
          </div>

          {/* HIPAA Consent Manager Card */}
          <div className="glass-card" style={styles.consentCard}>
            <div style={styles.sectionTitle}>
              <Shield size={18} color="#f59e0b" />
              <h3>HIPAA Consent Manager</h3>
            </div>
            
            <div style={{ ...styles.consentStatusBox, background: hasConsent ? 'rgba(16, 185, 129, 0.06)' : 'rgba(244, 63, 94, 0.06)' }}>
              <div style={styles.consentIcon}>
                {hasConsent ? (
                  <UserCheck size={28} color="#10b981" />
                ) : (
                  <ShieldAlert size={28} color="#f43f5e" />
                )}
              </div>
              <div style={styles.consentText}>
                <span style={styles.consentStatusTitle}>
                  Consent: {hasConsent ? 'GRANTED' : 'REVOKED'}
                </span>
                <span style={styles.consentStatusDesc}>
                  {hasConsent 
                    ? 'Clinical digital twin construction and high-frequency wearable sensor sync are authorized.' 
                    : 'Personal Health Information (PHI) is protected. Wearable sync and twin compilation are blocked.'}
                </span>
              </div>
            </div>

            {consentError && <div style={styles.consentErrBanner}>{consentError}</div>}
            {consentSuccess && <div style={styles.consentSuccBanner}>{consentSuccess}</div>}

            <div style={styles.consentActions}>
              <button 
                className="btn btn-success btn-small"
                disabled={consentSaving || hasConsent}
                onClick={() => handleConsentToggle('GRANTED')}
              >
                Grant Consent
              </button>
              <button 
                className="btn btn-danger btn-small"
                disabled={consentSaving || !hasConsent}
                onClick={() => handleConsentToggle('REVOKED')}
              >
                Revoke Consent
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Twin & Real-time Kafka Updates */}
        <div style={styles.rightCol}>
          
          {/* Tab Navigation buttons */}
          <div style={styles.tabsHeader}>
            <button 
              style={{ ...styles.tabBtn, ...(activeTab === 'twin' ? styles.activeTabBtn : {}) }}
              onClick={() => handleTabChange('twin')}
            >
              Health Twin
            </button>
            <button 
              style={{ ...styles.tabBtn, ...(activeTab === 'vitals' ? styles.activeTabBtn : {}) }}
              onClick={() => handleTabChange('vitals')}
            >
              Live Wearable Stream
            </button>
            <button 
              style={{ ...styles.tabBtn, ...(activeTab === 'audits' ? styles.activeTabBtn : {}) }}
              onClick={() => handleTabChange('audits')}
            >
              HIPAA Audit Trail
            </button>
            <button 
              style={{ ...styles.tabBtn, ...(activeTab === 'fhir' ? styles.activeTabBtn : {}) }}
              onClick={() => handleTabChange('fhir')}
            >
              FHIR Resource
            </button>
          </div>

          {/* Tab Contents */}
          <div style={styles.tabContentContainer}>
            
            {/* 1. HEALTH TWIN TAB */}
            {activeTab === 'twin' && (
              <div style={styles.tabBody}>
                {!hasConsent ? (
                  <div style={styles.consentDeniedBanner}>
                    <ShieldAlert size={48} color="#f43f5e" />
                    <h4>Digital Twin Data Withheld</h4>
                    <p>You cannot inspect the patient digital twin because HIPAA consent has been revoked.</p>
                  </div>
                ) : (
                  <div style={styles.twinGrid}>
                    {/* Health twin stats */}
                    <div style={styles.twinStatsCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                        <h4 style={{ ...styles.twinCardTitle, margin: 0 }}>Health Twin Bio-Metrics</h4>
                        {user && !user.roles?.includes('PATIENT') && (
                          <button 
                            className="btn btn-secondary btn-small"
                            onClick={handleEditTwinClick}
                          >
                            Edit Bio-Metrics
                          </button>
                        )}
                      </div>
                      <div style={styles.bioMetricList}>
                        <div style={styles.bioMetricItem}>
                          <span style={styles.bioMetricLabel}>Blood Group</span>
                          <span style={styles.bioMetricVal}>{healthTwin?.bloodgroup || 'O+'}</span>
                        </div>
                        <div style={styles.bioMetricItem}>
                          <span style={styles.bioMetricLabel}>Height</span>
                          <span style={styles.bioMetricVal}>{healthTwin?.height || '175'} cm</span>
                        </div>
                        <div style={styles.bioMetricItem}>
                          <span style={styles.bioMetricLabel}>Weight</span>
                          <span style={styles.bioMetricVal}>{healthTwin?.weight || '70'} kg</span>
                        </div>
                        <div style={styles.bioMetricItem}>
                          <span style={styles.bioMetricLabel}>Body Temperature</span>
                          <span style={styles.bioMetricVal}>{healthTwin?.temperature || '98.6'} °F</span>
                        </div>
                        <div style={styles.bioMetricItem}>
                          <span style={styles.bioMetricLabel}>BMI</span>
                          <span style={styles.bioMetricVal}>
                            {healthTwin?.height && healthTwin?.weight 
                              ? (healthTwin.weight / Math.pow(healthTwin.height / 100, 2)).toFixed(1)
                              : '22.9'}
                          </span>
                        </div>
                      </div>

                      <div style={styles.diseaseList}>
                        <span style={styles.demoLabel}>Allergies / Chronic Conditions</span>
                        <div style={styles.diseaseTagsContainer}>
                          {healthTwin?.disease ? (
                            healthTwin.disease.split(',').map((d, i) => (
                              <span key={i} style={styles.diseaseTag}>{d.trim()}</span>
                            ))
                          ) : (
                            <span style={styles.noDiseaseText}>No chronic conditions logged.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* interactive mock 3D human frame */}
                    <div style={styles.twinVisualCard}>
                      <h4 style={styles.twinCardTitle}>3D Digital Twin Visualizer</h4>
                      <div style={styles.twinVisualContainer}>
                        <div style={styles.twinBodyFrame}>
                          {/* Volumetric Holographic 3D model */}
                          <svg viewBox="0 0 100 220" style={styles.humanSvg}>
                            <style>{`
                              @keyframes pulse-node-glow {
                                0% { r: 3px; opacity: 0.3; stroke-width: 1px; }
                                50% { r: 7px; opacity: 0.95; stroke-width: 2px; }
                                100% { r: 3px; opacity: 0.3; stroke-width: 1px; }
                              }
                              @keyframes scan-line-sweep {
                                0% { y1: 15; y2: 15; opacity: 0.2; }
                                50% { y1: 205; y2: 205; opacity: 0.9; }
                                100% { y1: 15; y2: 15; opacity: 0.2; }
                              }
                              .pulsing-node {
                                animation: pulse-node-glow 2s infinite ease-in-out;
                              }
                              .scanner-line {
                                animation: scan-line-sweep 4s infinite ease-in-out;
                              }
                            `}</style>
                            {/* Volumetric Human Body Silhouette Path */}
                            <path 
                              d="M 50,15 C 44,15 42,20 42,26 C 42,32 46,36 50,36 C 54,36 58,32 58,26 C 58,20 56,15 50,15 Z M 47,36 L 53,36 M 47,36 C 43,36 38,40 36,44 L 27,78 C 25,85 20,105 20,110 C 20,112 22,113 24,111 L 30,82 L 38,64 L 40,100 L 39,125 L 41,168 L 43,210 C 44,212 48,212 49,210 L 47,168 L 50,130 L 53,168 L 51,210 C 52,212 56,212 57,210 L 59,168 L 61,125 L 60,100 L 62,64 L 70,82 L 76,111 C 78,113 80,112 80,110 C 80,105 75,85 73,78 L 64,44 C 62,40 57,36 53,36" 
                              fill="rgba(34, 211, 238, 0.05)" 
                              stroke="rgba(34, 211, 238, 0.3)" 
                              strokeWidth="1.2" 
                            />

                            {/* Volumetric 3D Grid Lines */}
                            <line x1="10" y1="110" x2="90" y2="110" stroke="rgba(13, 148, 136, 0.15)" strokeWidth="0.5" strokeDasharray="2,2" />
                            <line x1="50" y1="10" x2="50" y2="210" stroke="rgba(13, 148, 136, 0.15)" strokeWidth="0.5" strokeDasharray="2,2" />

                            {/* Head interior volumetric rings */}
                            <ellipse cx="50" cy="22" rx="6" ry="2.5" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.6" />
                            <ellipse cx="50" cy="26" rx="7.5" ry="3" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.6" />
                            <ellipse cx="50" cy="30" rx="6.5" ry="2.5" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.6" />

                            {/* Torso/Chest internal 3D stack rings */}
                            <ellipse cx="50" cy="54" rx="13" ry="4" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.6" />
                            <ellipse cx="50" cy="66" rx="16" ry="5" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.6" />
                            <ellipse cx="50" cy="78" rx="18" ry="5.5" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.7" />
                            <ellipse cx="50" cy="90" rx="17" ry="5" fill="none" stroke="rgba(6, 182, 212, 0.3)" strokeWidth="0.6" />
                            <ellipse cx="50" cy="102" rx="15" ry="4.5" fill="none" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="0.6" />
                            <ellipse cx="50" cy="114" rx="14" ry="4.2" fill="none" stroke="rgba(6, 182, 212, 0.2)" strokeWidth="0.6" />
                            <ellipse cx="50" cy="126" rx="13" ry="4" fill="none" stroke="rgba(6, 182, 212, 0.15)" strokeWidth="0.6" />

                            {/* Spine Line */}
                            <line x1="50" y1="36" x2="50" y2="130" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" strokeDasharray="3,3" />

                            {/* Arm centerlines */}
                            <line x1="33" y1="50" x2="23" y2="94" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="0.8" strokeDasharray="2,2" />
                            <line x1="67" y1="50" x2="77" y2="94" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="0.8" strokeDasharray="2,2" />

                            {/* Leg centerlines */}
                            <line x1="42" y1="130" x2="45" y2="200" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="0.8" strokeDasharray="2,2" />
                            <line x1="58" y1="130" x2="55" y2="200" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="0.8" strokeDasharray="2,2" />

                            {/* Holographic scanner sweep */}
                            <line x1="5" y1="0" x2="95" y2="0" stroke="rgba(34, 211, 238, 0.6)" strokeWidth="1.5" className="scanner-line" style={{ filter: 'drop-shadow(0 0 4px #22d3ee)' }} />

                            {/* Dynamic indicator nodes with leader lines pointing to text inside SVG */}
                            {/* Cerebral Node */}
                            <g>
                              <circle 
                                cx="50" 
                                cy="26" 
                                r="4" 
                                fill={hasBrainRisk ? "rgba(236, 72, 153, 0.2)" : "rgba(16, 185, 129, 0.15)"} 
                                stroke={hasBrainRisk ? "#ec4899" : "#10b981"} 
                                className={hasBrainRisk ? "pulsing-node" : ""} 
                              />
                              <circle cx="50" cy="26" r="2" fill={hasBrainRisk ? "#ec4899" : "#10b981"} />
                              {hasBrainRisk && (
                                <>
                                  <line x1="50" y1="26" x2="80" y2="18" stroke="#ec4899" strokeWidth="0.8" strokeDasharray="2,2" />
                                  <text x="82" y="20" fill="#ec4899" fontSize="6.5" fontWeight="700" letterSpacing="0.05em">CEREBRAL</text>
                                </>
                              )}
                            </g>

                            {/* Pulmonary Node */}
                            <g>
                              <circle 
                                cx="50" 
                                cy="60" 
                                r="4" 
                                fill={hasRespiratoryRisk ? "rgba(59, 130, 246, 0.2)" : "rgba(16, 185, 129, 0.15)"} 
                                stroke={hasRespiratoryRisk ? "#3b82f6" : "#10b981"} 
                                className={hasRespiratoryRisk ? "pulsing-node" : ""} 
                              />
                              <circle cx="50" cy="60" r="2" fill={hasRespiratoryRisk ? "#3b82f6" : "#10b981"} />
                              {hasRespiratoryRisk && (
                                <>
                                  <line x1="50" y1="60" x2="82" y2="54" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="2,2" />
                                  <text x="84" y="56" fill="#3b82f6" fontSize="6.5" fontWeight="700" letterSpacing="0.05em">PULMONARY</text>
                                </>
                              )}
                            </g>

                            {/* Cardiac Node */}
                            <g>
                              <circle 
                                cx="45" 
                                cy="74" 
                                r="4" 
                                fill={hasHeartRisk ? "rgba(244, 63, 94, 0.2)" : "rgba(16, 185, 129, 0.15)"} 
                                stroke={hasHeartRisk ? "#f43f5e" : "#10b981"} 
                                className={hasHeartRisk ? "pulsing-node" : ""} 
                              />
                              <circle cx="45" cy="74" r="2" fill={hasHeartRisk ? "#f43f5e" : "#10b981"} />
                              {hasHeartRisk && (
                                <>
                                  <line x1="45" y1="74" x2="12" y2="82" stroke="#f43f5e" strokeWidth="0.8" strokeDasharray="2,2" />
                                  <text x="10" y="81" fill="#f43f5e" fontSize="6.5" fontWeight="700" letterSpacing="0.05em" textAnchor="end">CARDIAC</text>
                                </>
                              )}
                            </g>

                            {/* Pancreatic Node */}
                            <g>
                              <circle 
                                cx="50" 
                                cy="98" 
                                r="4" 
                                fill={hasDiabetesRisk ? "rgba(251, 191, 36, 0.2)" : "rgba(16, 185, 129, 0.15)"} 
                                stroke={hasDiabetesRisk ? "#fbbf24" : "#10b981"} 
                                className={hasDiabetesRisk ? "pulsing-node" : ""} 
                              />
                              <circle cx="50" cy="98" r="2" fill={hasDiabetesRisk ? "#fbbf24" : "#10b981"} />
                              {hasDiabetesRisk && (
                                <>
                                  <line x1="50" y1="98" x2="82" y2="98" stroke="#fbbf24" strokeWidth="0.8" strokeDasharray="2,2" />
                                  <text x="84" y="100" fill="#fbbf24" fontSize="6.5" fontWeight="700" letterSpacing="0.05em">PANCREATIC</text>
                                </>
                              )}
                            </g>

                            {/* Renal Node */}
                            <g>
                              <circle 
                                cx="50" 
                                cy="116" 
                                r="4" 
                                fill={hasKidneyRisk ? "rgba(168, 85, 247, 0.2)" : "rgba(16, 185, 129, 0.15)"} 
                                stroke={hasKidneyRisk ? "#a855f7" : "#10b981"} 
                                className={hasKidneyRisk ? "pulsing-node" : ""} 
                              />
                              <circle cx="50" cy="116" r="2" fill={hasKidneyRisk ? "#a855f7" : "#10b981"} />
                              {hasKidneyRisk && (
                                <>
                                  <line x1="50" y1="116" x2="12" y2="122" stroke="#a855f7" strokeWidth="0.8" strokeDasharray="2,2" />
                                  <text x="10" y="121" fill="#a855f7" fontSize="6.5" fontWeight="700" letterSpacing="0.05em" textAnchor="end">RENAL</text>
                                </>
                              )}
                            </g>
                          </svg>
                        </div>

                        {/* Diagnostics HUD Readings */}
                        <div style={styles.hudPanel}>
                          <div style={styles.hudHeader}>SYSTEM DIAGNOSTICS</div>
                          <div style={styles.hudRow}>
                            <span style={styles.hudSystem}>Nervous System</span>
                            <span style={hasBrainRisk ? styles.hudAlert : styles.hudNormal}>
                              {hasBrainRisk ? 'CRITICAL ALERT' : 'FUNCTIONAL'}
                            </span>
                          </div>
                          <div style={styles.hudRow}>
                            <span style={styles.hudSystem}>Cardiovascular</span>
                            <span style={hasHeartRisk ? styles.hudAlert : styles.hudNormal}>
                              {hasHeartRisk ? 'CRITICAL ALERT' : 'FUNCTIONAL'}
                            </span>
                          </div>
                          <div style={styles.hudRow}>
                            <span style={styles.hudSystem}>Respiratory</span>
                            <span style={hasRespiratoryRisk ? styles.hudAlert : styles.hudNormal}>
                              {hasRespiratoryRisk ? 'CRITICAL ALERT' : 'FUNCTIONAL'}
                            </span>
                          </div>
                          <div style={styles.hudRow}>
                            <span style={styles.hudSystem}>Endocrine System</span>
                            <span style={hasDiabetesRisk ? styles.hudAlert : styles.hudNormal}>
                              {hasDiabetesRisk ? 'CRITICAL ALERT' : 'FUNCTIONAL'}
                            </span>
                          </div>
                          <div style={styles.hudRow}>
                            <span style={styles.hudSystem}>Renal/Urinary</span>
                            <span style={hasKidneyRisk ? styles.hudAlert : styles.hudNormal}>
                              {hasKidneyRisk ? 'CRITICAL ALERT' : 'FUNCTIONAL'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. LIVE VITALS / KAFKA STREAM TAB */}
            {activeTab === 'vitals' && (
              <div style={styles.tabBody}>
                {!hasConsent ? (
                  <div style={styles.consentDeniedBanner}>
                    <ShieldAlert size={48} color="#f43f5e" />
                    <h4>Wearable Ingestion Data Blocked</h4>
                    <p>Real-time wearable vitals streaming is suspended due to revoked HIPAA consent.</p>
                  </div>
                ) : (
                  <div style={styles.vitalsTabBody}>
                    <div style={styles.vitalsActionsHeader}>
                      <div>
                        <h4 style={styles.twinCardTitle}>Real-time Wearable Sensor Feeds</h4>
                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                          Simulates wearable device streaming data continuously into Apache Kafka topics.
                        </p>
                      </div>
                      <button 
                        className={`btn ${isStreaming ? 'btn-danger' : 'btn-primary'} btn-small`}
                        onClick={toggleStreamingState}
                      >
                        {isStreaming ? (
                          <>
                            <HeartPulse size={16} />
                            Stop Stream
                          </>
                        ) : (
                          <>
                            <Activity size={16} />
                            Simulate Stream
                          </>
                        )}
                      </button>
                    </div>

                    {/* Vitals grids */}
                    <div style={styles.vitalsGrid}>
                      
                      {/* Heart rate card */}
                      <div style={styles.vitalsBox} className="glass-card">
                        <div style={styles.vitalsBoxTitleRow}>
                          <Heart size={20} color="#f43f5e" />
                          <span style={styles.vitalsBoxTitle}>Heart Rate</span>
                        </div>
                        <div style={styles.vitalsValueRow}>
                          <span style={styles.vitalsVal}>{vitals?.heartbeat || 72}</span>
                          <span style={styles.vitalsUnit}>BPM</span>
                          {isStreaming && <span className="pulse-indicator-danger" style={styles.streamDot}></span>}
                        </div>
                        <span style={styles.vitalsStatus}>Normal range (60-100)</span>
                      </div>

                      {/* Blood pressure */}
                      <div style={styles.vitalsBox} className="glass-card">
                        <div style={styles.vitalsBoxTitleRow}>
                          <Activity size={20} color="#3b82f6" />
                          <span style={styles.vitalsBoxTitle}>Blood Pressure</span>
                        </div>
                        <div style={styles.vitalsValueRow}>
                          <span style={styles.vitalsVal}>{vitals?.bloodpressure || '120/80'}</span>
                          <span style={styles.vitalsUnit}>mmHg</span>
                        </div>
                        <span style={styles.vitalsStatus}>Normal range (&lt;120/80)</span>
                      </div>

                      {/* SpO2 oxygen */}
                      <div style={styles.vitalsBox} className="glass-card">
                        <div style={styles.vitalsBoxTitleRow}>
                          <Droplet size={20} color="#10b981" />
                          <span style={styles.vitalsBoxTitle}>Oxygen Level (SpO2)</span>
                        </div>
                        <div style={styles.vitalsValueRow}>
                          <span style={styles.vitalsVal}>{vitals?.oxygenlevel || 98}%</span>
                          <span style={styles.vitalsUnit}>SpO2</span>
                        </div>
                        <span style={styles.vitalsStatus}>Optimal range (95-100)</span>
                      </div>

                      {/* Body temperature */}
                      <div style={styles.vitalsBox} className="glass-card">
                        <div style={styles.vitalsBoxTitleRow}>
                          <Thermometer size={20} color="#f59e0b" />
                          <span style={styles.vitalsBoxTitle}>Blood Sugar</span>
                        </div>
                        <div style={styles.vitalsValueRow}>
                          <span style={styles.vitalsVal}>{vitals?.bloodsuger || 95}</span>
                          <span style={styles.vitalsUnit}>mg/dL</span>
                        </div>
                        <span style={styles.vitalsStatus}>Fasting range (70-100)</span>
                      </div>

                    </div>

                    <div style={styles.educationalPanel}>
                      <Info size={16} color="#0d9488" style={{ flexShrink: 0 }} />
                      <p style={{ fontSize: '0.8rem', color: '#94a3b8', textAlign: 'left' }}>
                        <strong>Student Insight:</strong> When you click "Simulate Stream", the client invokes the 
                        <code> /vitals/wearable/publish</code> gateway endpoint which triggers a Spring Kafka Producer. 
                        A Spring Kafka Consumer catches the message from the topic and updates the MongoDB database, showing how Kafka decouples systems.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. HIPAA AUDIT TRAIL TAB */}
            {activeTab === 'audits' && (
              <div style={styles.tabBody}>
                {!hasConsent ? (
                  <div style={styles.consentDeniedBanner}>
                    <ShieldAlert size={48} color="#f43f5e" />
                    <h4>Audits Restricted</h4>
                    <p>Audit records are restricted when patient consent is not active.</p>
                  </div>
                ) : auditLoading ? (
                  <div style={styles.loadingContainer}>
                    <RefreshCw size={20} className="pulse-logo" />
                    <span style={{ marginLeft: '10px' }}>Fetching audit trails...</span>
                  </div>
                ) : audits.length === 0 ? (
                  <div style={styles.emptyContainer}>
                    <FileClock size={40} color="#64748b" />
                    <span style={{ color: '#94a3b8', marginTop: '10px' }}>No audit trails generated yet.</span>
                  </div>
                ) : (
                  <div style={styles.auditTimelineContainer}>
                    <h4 style={{ ...styles.twinCardTitle, marginBottom: '16px' }}>HIPAA Compliance Audit Trail</h4>
                    <div style={styles.timeline}>
                      {audits.map((a, idx) => (
                        <div key={a.id || idx} style={styles.timelineItem}>
                          <div style={styles.timelineDot}></div>
                          <div style={styles.timelineContent}>
                            <div style={styles.timelineHeader}>
                              <span style={styles.timelineAction}>{a.action}</span>
                              <span style={styles.timelineTime}>{new Date(a.timestamp).toLocaleString()}</span>
                            </div>
                            <span style={styles.timelineUser}>Accessed by User: <strong>{a.user}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. FHIR RESOURCE TAB */}
            {activeTab === 'fhir' && (
              <div style={styles.tabBody}>
                {fhirLoading ? (
                  <div style={styles.loadingContainer}>
                    <RefreshCw size={20} className="pulse-logo" />
                    <span style={{ marginLeft: '10px' }}>Requesting FHIR payload...</span>
                  </div>
                ) : (
                  <div style={styles.fhirTabBody}>
                    <h4 style={{ ...styles.twinCardTitle, marginBottom: '8px' }}>HL7 FHIR JSON Resource</h4>
                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', textAlign: 'left' }}>
                      Below is the standardized FHIR R4 Patient representation generated dynamically by the backend:
                    </p>
                    <div style={styles.codeBlock}>
                      <pre style={styles.preCode}>
                        {JSON.stringify(fhirResource, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
      
      {/* Edit Health Twin Modal */}
      {showTwinModal && (
        <div style={styles.modalOverlay} onClick={() => setShowTwinModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Edit Health Twin Bio-Metrics</h3>
            
            {twinSuccess && <div style={styles.successBanner}><CheckCircle size={18} /> {twinSuccess}</div>}
            {twinError && <div style={styles.errorBanner}>{twinError}</div>}

            <form onSubmit={handleSaveTwin}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Blood Group</label>
                  <input
                    type="text"
                    className="form-input"
                    value={twinFormData.bloodgroup}
                    onChange={(e) => setTwinFormData({ ...twinFormData, bloodgroup: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Temperature (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={twinFormData.temperature}
                    onChange={(e) => setTwinFormData({ ...twinFormData, temperature: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Height (cm)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={twinFormData.height}
                    onChange={(e) => setTwinFormData({ ...twinFormData, height: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Weight (kg)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={twinFormData.weight}
                    onChange={(e) => setTwinFormData({ ...twinFormData, weight: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Allergies / Chronic Conditions (comma separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={twinFormData.disease}
                  onChange={(e) => setTwinFormData({ ...twinFormData, disease: e.target.value })}
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowTwinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={twinSaving}>
                  {twinSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Demographics Modal */}
      {showDemoModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDemoModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="glass-card">
            <h3 style={{ marginBottom: '20px', fontSize: '1.25rem' }}>Edit Demographics</h3>
            
            {demoSuccess && <div style={styles.successBanner}><CheckCircle size={18} /> {demoSuccess}</div>}
            {demoError && <div style={styles.errorBanner}>{demoError}</div>}

            <form onSubmit={handleSaveDemo}>
              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={demoFormData.firstname}
                    onChange={(e) => setDemoFormData({ ...demoFormData, firstname: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={demoFormData.lastname}
                    onChange={(e) => setDemoFormData({ ...demoFormData, lastname: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Gender</label>
                  <select
                    className="form-select"
                    value={demoFormData.gender}
                    onChange={(e) => setDemoFormData({ ...demoFormData, gender: e.target.value })}
                    style={styles.selectInput}
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
                    className="form-input"
                    value={demoFormData.dob}
                    onChange={(e) => setDemoFormData({ ...demoFormData, dob: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={styles.formRow}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={demoFormData.email}
                    onChange={(e) => setDemoFormData({ ...demoFormData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={demoFormData.phoneno}
                    onChange={(e) => setDemoFormData({ ...demoFormData, phoneno: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  className="form-input"
                  value={demoFormData.address}
                  onChange={(e) => setDemoFormData({ ...demoFormData, address: e.target.value })}
                  required
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDemoModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={demoSaving}>
                  {demoSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '32px',
    maxWidth: '1280px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  titleInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  patientName: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  patientIdBadge: {
    fontSize: '0.8rem',
    color: '#64748b',
    marginTop: '2px',
    fontFamily: 'monospace',
  },
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '380px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
  },
  demoCard: {
    textAlign: 'left',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  demoItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  demoLabel: {
    fontSize: '0.8rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  demoValue: {
    fontSize: '0.95rem',
    color: '#f8fafc',
    fontWeight: '500',
    marginTop: '4px',
  },
  consentCard: {
    textAlign: 'left',
  },
  consentStatusBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.03)',
    marginBottom: '20px',
  },
  consentIcon: {
    flexShrink: 0,
    marginTop: '2px',
  },
  consentText: {
    display: 'flex',
    flexDirection: 'column',
  },
  consentStatusTitle: {
    fontSize: '0.9rem',
    fontWeight: '700',
  },
  consentStatusDesc: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    marginTop: '4px',
    lineHeight: '1.4',
  },
  consentActions: {
    display: 'flex',
    gap: '10px',
  },
  consentErrBanner: {
    padding: '8px 12px',
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    borderRadius: '6px',
    color: '#f43f5e',
    fontSize: '0.8rem',
    marginBottom: '14px',
  },
  consentSuccBanner: {
    padding: '8px 12px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    borderRadius: '6px',
    color: '#10b981',
    fontSize: '0.8rem',
    marginBottom: '14px',
  },
  tabsHeader: {
    display: 'flex',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '6px',
    gap: '6px',
  },
  tabBtn: {
    flex: 1,
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
  activeTabBtn: {
    background: 'rgba(13, 148, 136, 0.1)',
    color: '#0d9488',
    border: '1px solid rgba(13, 148, 136, 0.2)',
  },
  tabContentContainer: {
    minHeight: '400px',
  },
  tabBody: {
    padding: '0px',
  },
  consentDeniedBanner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    textAlign: 'center',
    background: 'rgba(30, 41, 59, 0.3)',
    borderRadius: '16px',
    border: '1px solid rgba(244, 63, 94, 0.1)',
    height: '400px',
  },
  twinGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  twinStatsCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'left',
  },
  twinCardTitle: {
    fontSize: '1.1rem',
    color: '#fff',
    marginBottom: '20px',
  },
  bioMetricList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  bioMetricItem: {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(15, 23, 42, 0.4)',
    border: '1px solid rgba(255,255,255,0.02)',
    padding: '12px',
    borderRadius: '8px',
  },
  bioMetricLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
  },
  bioMetricVal: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#fff',
    marginTop: '4px',
  },
  diseaseList: {
    display: 'flex',
    flexDirection: 'column',
  },
  diseaseTagsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '10px',
  },
  diseaseTag: {
    fontSize: '0.8rem',
    fontWeight: '600',
    padding: '4px 10px',
    background: 'rgba(244, 63, 94, 0.1)',
    color: '#f43f5e',
    border: '1px solid rgba(244, 63, 94, 0.15)',
    borderRadius: '4px',
  },
  noDiseaseText: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: '8px',
  },
  twinVisualCard: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
  },
  twinBodyFrame: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '280px',
  },
  humanSvg: {
    height: '100%',
    maxHeight: '260px',
  },
  vitalsTabBody: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  vitalsActionsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'left',
  },
  vitalsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  vitalsBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '20px',
    textAlign: 'left',
  },
  vitalsBoxTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  vitalsBoxTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#94a3b8',
  },
  vitalsValueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '6px',
    margin: '12px 0 6px',
    position: 'relative',
    width: '100%',
  },
  vitalsVal: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.02em',
  },
  vitalsUnit: {
    fontSize: '0.85rem',
    color: '#64748b',
    fontWeight: '500',
  },
  streamDot: {
    position: 'absolute',
    right: 0,
    top: '12px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
  vitalsStatus: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  educationalPanel: {
    display: 'flex',
    gap: '10px',
    background: 'rgba(13, 148, 136, 0.04)',
    border: '1px solid rgba(13, 148, 136, 0.1)',
    borderRadius: '10px',
    padding: '12px 16px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '300px',
  },
  auditTimelineContainer: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'left',
  },
  timeline: {
    position: 'relative',
    paddingLeft: '24px',
    borderLeft: '2px solid rgba(255,255,255,0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  timelineItem: {
    position: 'relative',
  },
  timelineDot: {
    position: 'absolute',
    left: '-29px',
    top: '4px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#0d9488',
    boxShadow: '0 0 0 3px rgba(13, 148, 136, 0.15)',
  },
  timelineContent: {
    display: 'flex',
    flexDirection: 'column',
    background: 'rgba(15, 23, 42, 0.3)',
    border: '1px solid rgba(255, 255, 255, 0.02)',
    padding: '12px 16px',
    borderRadius: '8px',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '8px',
  },
  timelineAction: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#0d9488',
  },
  timelineTime: {
    fontSize: '0.75rem',
    color: '#64748b',
  },
  timelineUser: {
    fontSize: '0.78rem',
    color: '#94a3b8',
    marginTop: '6px',
  },
  fhirTabBody: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'left',
  },
  codeBlock: {
    background: '#070a13',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '20px',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  preCode: {
    fontFamily: 'monospace',
    fontSize: '0.82rem',
    color: '#a7f3d0',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px',
  },
  twinVisualContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  hudPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    background: 'rgba(15, 23, 42, 0.6)',
    border: '1px solid rgba(13, 148, 136, 0.15)',
    borderRadius: '10px',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    width: '100%',
    textAlign: 'left',
  },
  hudHeader: {
    color: '#0d9488',
    fontWeight: 'bold',
    borderBottom: '1px solid rgba(13, 148, 136, 0.3)',
    paddingBottom: '6px',
    marginBottom: '4px',
    letterSpacing: '0.1em',
  },
  hudRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
  },
  hudSystem: {
    color: '#94a3b8',
  },
  hudNormal: {
    color: '#10b981',
    fontWeight: 'bold',
    background: 'rgba(16, 185, 129, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
  },
  hudAlert: {
    color: '#f43f5e',
    fontWeight: 'bold',
    background: 'rgba(244, 63, 94, 0.1)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10, 14, 26, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '500px',
    background: 'rgba(30, 41, 59, 0.85)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '28px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
    color: '#fff',
    maxHeight: '90vh',
    overflowY: 'auto',
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
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '10px 14px',
    borderRadius: '8px',
    color: '#10b981',
    fontSize: '0.88rem',
    marginBottom: '16px',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(244, 63, 94, 0.1)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    padding: '10px 14px',
    borderRadius: '8px',
    color: '#f43f5e',
    fontSize: '0.88rem',
    marginBottom: '16px',
  }
};
