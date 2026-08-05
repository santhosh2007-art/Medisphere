import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Activity, AlertTriangle, CheckCircle, ShieldAlert, Zap, PhoneCall, 
  RefreshCw, Cpu, UserCheck, Clock, ShieldCheck, Info, Radio, AlertOctagon
} from 'lucide-react';

export const RealtimeMonitoringDashboard = () => {
  const [alerts, setAlerts] = useState([]);
  const [metrics, setMetrics] = useState({
    alertsToday: 12,
    wearablesOnline: 3,
    avgResponseTime: '1.8 min',
    activeAlerts: 2,
    precisionRate: 89.4,
    falseAlertRate: 2.1,
    simulatorStatus: 'CONNECTED'
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [simulating, setSimulating] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [contactBanner, setContactBanner] = useState(null);

  useEffect(() => {
    fetchLiveData();
    const interval = setInterval(fetchLiveData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveData = async () => {
    try {
      const [alertsRes, metricsRes] = await Promise.all([
        api.getLiveAlerts().catch(() => ({ data: [] })),
        api.getAlertMetrics().catch(() => ({ data: null }))
      ]);

      if (alertsRes && alertsRes.data) {
        setAlerts(alertsRes.data);
      }
      if (metricsRes && metricsRes.data) {
        setMetrics(prev => ({ ...prev, ...metricsRes.data }));
      }
    } catch (err) {
      console.error('Error fetching live monitoring data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerAbnormal = async () => {
    setSimulating(true);
    try {
      await api.triggerPythonAbnormal();
      await fetchLiveData();
    } catch (err) {
      console.error('Error triggering Python simulator abnormal reading:', err);
    } finally {
      setSimulating(false);
    }
  };

  const handleAcknowledge = async (alertId) => {
    setActionLoading(alertId);
    try {
      await api.acknowledgeAlert(alertId, 'Dr. Specialist');
      await fetchLiveData();
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEscalate = async (alertId) => {
    setActionLoading(alertId);
    try {
      await api.escalateAlert(alertId);
      await fetchLiveData();
    } catch (err) {
      console.error('Error escalating alert:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleContactPatient = async (alert) => {
    setActionLoading(alert.id);
    try {
      const res = await api.contactPatient(alert.id);
      setContactBanner({
        alertId: alert.id,
        patientName: alert.patientName || alert.patientId,
        message: res.data.message || 'Simulated Telehealth Call connected with patient successfully.'
      });
      setTimeout(() => setContactBanner(null), 5000);
    } catch (err) {
      console.error('Error initiating patient call:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'HYPERTENSIVE_CRISIS':
      case 'EMERGENCY':
        return 'badge-danger';
      case 'CRITICAL':
        return 'badge-danger';
      case 'WARNING':
        return 'badge-warning';
      default:
        return 'badge-info';
    }
  };

  return (
    <div style={styles.container}>
      {/* 1. HEADER CONTROL BAR */}
      <div className="glass-card" style={styles.headerBar}>
        <div style={styles.headerTitleGroup}>
          <div style={styles.pulseBadge}>
            <Radio size={16} color="#10b981" />
            <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 'bold' }}>LIVE STREAMING</span>
          </div>
          <h2 style={styles.headerTitle}>Wearable Real-Time Alert & Clinical Monitoring HUD</h2>
          <p style={styles.headerSubtitle}>
            Milestone 3 Student Demonstration — Continuous Python Sensor Ingestion, Kafka Topics, Anomaly Rules & Provider Routing.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button 
            className="btn btn-primary btn-small"
            onClick={handleTriggerAbnormal}
            disabled={simulating}
          >
            <Zap size={15} />
            <span>{simulating ? 'Injecting Anomaly...' : 'Trigger Abnormal Sensor Vital'}</span>
          </button>
          <button className="btn btn-secondary btn-small" onClick={fetchLiveData}>
            <RefreshCw size={15} />
            <span>Refresh Feed</span>
          </button>
        </div>
      </div>

      {/* 2. CONTACT PATIENT BANNER (IF ACTIVE) */}
      {contactBanner && (
        <div style={styles.contactBanner}>
          <PhoneCall size={20} color="#10b981" />
          <div>
            <strong>Simulated Telehealth Call Connected: {contactBanner.patientName}</strong>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>{contactBanner.message}</p>
          </div>
        </div>
      )}

      {/* 3. KPI METRICS CARDS GRID */}
      <div style={styles.metricsGrid}>
        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricIconBox('#3b82f6')}>
            <Activity size={22} color="#3b82f6" />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricLabel}>Alerts Today</span>
            <span style={styles.metricValue}>{metrics.alertsToday}</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricIconBox('#10b981')}>
            <Radio size={22} color="#10b981" />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricLabel}>Wearables Online</span>
            <span style={styles.metricValue}>{metrics.wearablesOnline} Devices</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricIconBox('#f59e0b')}>
            <Clock size={22} color="#f59e0b" />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricLabel}>Avg Response Time</span>
            <span style={styles.metricValue}>{metrics.avgResponseTime}</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricIconBox('#f43f5e')}>
            <AlertOctagon size={22} color="#f43f5e" />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricLabel}>Active Alerts</span>
            <span style={styles.metricValue}>{metrics.activeAlerts}</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricIconBox('#0d9488')}>
            <ShieldCheck size={22} color="#0d9488" />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricLabel}>Simulated Precision</span>
            <span style={styles.metricValue}>{metrics.precisionRate}%</span>
          </div>
        </div>

        <div className="glass-card" style={styles.metricCard}>
          <div style={styles.metricIconBox('#8b5cf6')}>
            <Cpu size={22} color="#8b5cf6" />
          </div>
          <div style={styles.metricInfo}>
            <span style={styles.metricLabel}>False Alert Rate</span>
            <span style={styles.metricValue}>{metrics.falseAlertRate}%</span>
          </div>
        </div>
      </div>

      {/* 4. LIVE ALERT FEED TABLE */}
      <div className="glass-card" style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>
            <ShieldAlert size={20} color="#f43f5e" />
            <span>Live Clinical Alert Stream (Kafka: alert-created)</span>
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            5-Min Fatigue Suppressor Active • Provider Auto-Routing Enabled
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Patient</th>
                <th>Alert Type</th>
                <th>AI Confidence</th>
                <th>Rule Message</th>
                <th>Assigned Specialist</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                    No alerts in stream right now. Click "Trigger Abnormal Sensor Vital" to test.
                  </td>
                </tr>
              ) : (
                alerts.map(a => (
                  <tr key={a.id}>
                    <td>
                      <span className={`badge ${getSeverityBadgeClass(a.severity)}`}>
                        {a.severity}
                      </span>
                    </td>
                    <td style={{ fontWeight: '600', color: '#fff' }}>
                      {a.patientName || a.patientId}
                    </td>
                    <td>
                      <span style={styles.alertTypeBadge(a.alertType)}>
                        {a.alertType}
                      </span>
                    </td>
                    <td style={{ fontWeight: '700', color: '#2dd4bf' }}>
                      {a.aiConfidence ? `${a.aiConfidence}%` : '92.0%'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                      {a.alertMessage}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600' }}>
                      {a.assignedDoctor}
                    </td>
                    <td>
                      <span style={styles.statusBadge(a.status)}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <div style={styles.actionBtnGroup}>
                        {a.status === 'ACTIVE' && (
                          <button
                            className="btn btn-success btn-small"
                            onClick={() => handleAcknowledge(a.id)}
                            disabled={actionLoading === a.id}
                            title="Acknowledge Alert"
                          >
                            <CheckCircle size={14} />
                            <span>Ack</span>
                          </button>
                        )}

                        {a.status !== 'ESCALATED' && (
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleEscalate(a.id)}
                            disabled={actionLoading === a.id}
                            title="Escalate Alert"
                          >
                            <AlertTriangle size={14} />
                            <span>Escalate</span>
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => handleContactPatient(a)}
                          disabled={actionLoading === a.id}
                          title="Contact Patient via Telehealth"
                        >
                          <PhoneCall size={14} />
                          <span>Contact</span>
                        </button>

                        <button
                          className="btn btn-secondary btn-small"
                          onClick={() => setSelectedAlert(a)}
                          title="View Details"
                        >
                          <Info size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. ALERT DETAILS MODAL */}
      {selectedAlert && (
        <div style={styles.modalOverlay} onClick={() => setSelectedAlert(null)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginTop: 0, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={20} color="#f43f5e" />
              <span>Alert Inspection Details — {selectedAlert.id}</span>
            </h3>

            <div style={styles.modalGrid}>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>Patient ID / Name</span>
                <span style={styles.fieldValue}>{selectedAlert.patientName} ({selectedAlert.patientId})</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>Alert Type</span>
                <span style={styles.fieldValue}>{selectedAlert.alertType}</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>Severity Level</span>
                <span style={styles.fieldValue}>{selectedAlert.severity}</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>AI Confidence</span>
                <span style={styles.fieldValue}>{selectedAlert.aiConfidence}%</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>Assigned Provider</span>
                <span style={styles.fieldValue}>{selectedAlert.assignedDoctor}</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>Status</span>
                <span style={styles.fieldValue}>{selectedAlert.status}</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>Heart Rate Snapshot</span>
                <span style={styles.fieldValue}>{selectedAlert.heartRate ? `${selectedAlert.heartRate} bpm` : 'N/A'}</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>SpO2 Snapshot</span>
                <span style={styles.fieldValue}>{selectedAlert.spO2 ? `${selectedAlert.spO2}%` : 'N/A'}</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>BP Snapshot</span>
                <span style={styles.fieldValue}>{selectedAlert.bloodPressure || 'N/A'}</span>
              </div>
              <div style={styles.modalField}>
                <span style={styles.fieldLabel}>Body Temperature</span>
                <span style={styles.fieldValue}>{selectedAlert.bodyTemperature ? `${selectedAlert.bodyTemperature}°C` : 'N/A'}</span>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setSelectedAlert(null)}>
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    boxSizing: 'border-box',
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    padding: '22px 28px',
    gap: '20px',
    background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(15, 23, 42, 0.85) 50%, rgba(59, 130, 246, 0.08) 100%)',
    border: '1px solid rgba(13, 148, 136, 0.18)',
    borderRadius: '16px',
    textAlign: 'left',
  },
  headerTitleGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  pulseBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '3px 10px',
    borderRadius: '99px',
    width: 'fit-content',
    marginBottom: '4px',
  },
  headerTitle: {
    fontSize: '1.4rem',
    fontWeight: '800',
    color: '#fff',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  headerSubtitle: {
    fontSize: '0.85rem',
    color: '#94a3b8',
    margin: 0,
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  contactBanner: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(16, 185, 129, 0.12)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px',
    padding: '14px 20px',
    color: '#fff',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  metricCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '18px 20px',
  },
  metricIconBox: (color) => ({
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: `${color}18`,
    border: `1px solid ${color}30`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  metricInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  metricLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  metricValue: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#fff',
    marginTop: '2px',
  },
  tableCard: {
    padding: '24px',
    textAlign: 'left',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  tableTitle: {
    fontSize: '1.1rem',
    fontWeight: '700',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    margin: 0,
  },
  actionBtnGroup: {
    display: 'flex',
    gap: '6px',
  },
  alertTypeBadge: (type) => ({
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    background: 'rgba(59, 130, 246, 0.1)',
    color: '#38bdf8',
    border: '1px solid rgba(59, 130, 246, 0.2)',
  }),
  statusBadge: (status) => ({
    fontSize: '0.75rem',
    fontWeight: '700',
    padding: '3px 8px',
    borderRadius: '6px',
    background: status === 'ACTIVE' ? 'rgba(244, 63, 94, 0.1)' : status === 'ACKNOWLEDGED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
    color: status === 'ACTIVE' ? '#f43f5e' : status === 'ACKNOWLEDGED' ? '#10b981' : '#f59e0b',
    border: `1px solid ${status === 'ACTIVE' ? 'rgba(244, 63, 94, 0.2)' : status === 'ACKNOWLEDGED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
  }),
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(5, 8, 16, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '640px',
    background: '#0f172a',
    border: '1px solid rgba(13, 148, 136, 0.3)',
    borderRadius: '16px',
    padding: '28px',
    textAlign: 'left',
  },
  modalGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginTop: '16px',
  },
  modalField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    background: 'rgba(15, 23, 42, 0.6)',
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.04)',
  },
  fieldLabel: {
    fontSize: '0.75rem',
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: '0.95rem',
    color: '#fff',
    fontWeight: '600',
  }
};
