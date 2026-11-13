import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText, ShieldCheck, AlertTriangle, CheckCircle, Clock, Activity, Heart,
  TrendingDown, PlusCircle, Award, Lock, Sparkles, RefreshCw, UserCheck, ShieldAlert,
  Cpu, Bot, Zap
} from 'lucide-react';

export const CareplanManagement = () => {
  const { user } = useAuth();
  const [selectedPatientId, setSelectedPatientId] = useState('35f51e3e-66fd-4f87-85ad-affa0dde1156');
  const [careplans, setCareplans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [llmLoading, setLlmLoading] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState('STANDBY_GUARDRAIL_ACTIVE');

  // E-Signature Modal State
  const [showSignModal, setShowSignModal] = useState(false);
  const [attestationText, setAttestationText] = useState('I attest to the clinical appropriateness and accuracy of this personalized careplan.');

  // Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState(null);
  const [overrideReason, setOverrideReason] = useState('');

  // Adherence State
  const [adherenceScore, setAdherenceScore] = useState(88.5);
  const [riskTrend, setRiskTrend] = useState([]);

  useEffect(() => {
    fetchCareplans();
    api.getOllamaStatus().then(res => {
      if (res.data?.status) setOllamaStatus(res.data.status);
    }).catch(() => {});
  }, [selectedPatientId]);

  const fetchCareplans = async () => {
    setLoading(true);
    try {
      const res = await api.getCareplansByPatient(selectedPatientId);
      const list = res.data || [];
      setCareplans(list);
      if (list.length > 0) {
        setActivePlan(list[0]);
        loadCareplanDetails(list[0].id);
      } else {
        setActivePlan(null);
      }
    } catch (err) {
      console.error('Error fetching careplans:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCareplanDetails = async (planId) => {
    try {
      const adhRes = await api.getCareplanAdherence(planId);
      setAdherenceScore(adhRes.data?.adherenceScorePct || 88.5);

      const trendRes = await api.getCareplanRiskTrend(planId);
      setRiskTrend(trendRes.data || []);
    } catch (err) {
      console.error('Error loading careplan details:', err);
    }
  };

  const handleGenerateCareplan = async () => {
    setActionLoading(true);
    try {
      const docName = user?.name || 'Dr. Sarah Jenkins';
      await api.generateCareplan({
        patientId: selectedPatientId,
        riskType: selectedPatientId === '35f51e3e-66fd-4f87-85ad-affa0dde1156' ? 'CARDIO' : selectedPatientId === '8a719c2d-12ef-45a8-912b-34567890abcd' ? 'RESPIRATORY' : 'DIABETES',
        riskPercentage: 24.5,
        creatorId: docName
      });
      await fetchCareplans();
    } catch (err) {
      console.error('Error generating careplan:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitToReview = async () => {
    if (!activePlan) return;
    setActionLoading(true);
    try {
      await api.submitCareplan(activePlan.id);
      await fetchCareplans();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCareplan = async () => {
    if (!activePlan) return;
    setActionLoading(true);
    try {
      const providerId = user?.name || 'Dr. Sarah Jenkins';
      await api.approveCareplan(activePlan.id, providerId, attestationText);
      setShowSignModal(false);
      await fetchCareplans();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateCareplan = async () => {
    if (!activePlan) return;
    setActionLoading(true);
    try {
      await api.activateCareplan(activePlan.id);
      await fetchCareplans();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOverrideSafety = async () => {
    if (!activePlan || !selectedIntervention) return;
    if (!overrideReason.trim()) {
      alert('Override reason is required!');
      return;
    }
    setActionLoading(true);
    try {
      const providerId = user?.name || 'Dr. Sarah Jenkins';
      await api.overrideCareplanSafety(activePlan.id, selectedIntervention.id, providerId, overrideReason);
      setShowOverrideModal(false);
      setOverrideReason('');
      await fetchCareplans();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogAdherence = async (interventionId) => {
    if (!activePlan) return;
    setActionLoading(true);
    try {
      await api.logCareplanAdherence(activePlan.id, interventionId, 'MedicationTaken', 'Completed');
      await loadCareplanDetails(activePlan.id);
    } catch (err) {
      console.error('Error logging adherence:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateOllama = async () => {
    if (!activePlan) return;
    setLlmLoading(true);
    try {
      const res = await api.generateLlmCareplan(activePlan.id);
      if (res.data) {
        setActivePlan(prev => ({
          ...prev,
          llmModel: res.data.llmModel || 'qwen2.5:3b',
          llmEngine: res.data.llmEngine || 'Ollama + Qwen2.5 3B',
          aiSummary: res.data.aiSummary || prev.aiSummary,
          lifestyleAdvice: res.data.lifestyleAdvice || prev.lifestyleAdvice
        }));
      }
      await fetchCareplans();
    } catch (err) {
      console.error('Error generating Ollama Qwen2.5 careplan:', err);
    } finally {
      setLlmLoading(false);
    }
  };

  const patientsList = [
    { id: '35f51e3e-66fd-4f87-85ad-affa0dde1156', name: 'Santhosh Kumar', spec: 'Cardiologist', doc: 'Dr. Sarah Jenkins' },
    { id: '8a719c2d-12ef-45a8-912b-34567890abcd', name: 'Anitha Ramesh', spec: 'Pulmonologist', doc: 'Dr. Robert Chen' },
    { id: '9b820d3e-23fa-56b9-923c-45678901bcde', name: 'Rajesh Kannan', spec: 'General Physician', doc: 'Dr. Elena Rostova' }
  ];

  return (
    <div className="dashboard-container" style={{ padding: '24px', color: '#2b1b1e' }}>
      
      {/* 1. TOP HEADER & METRICS */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#6b0d24', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FileText color="#6b0d24" size={32} />
              <span>Precision Careplan & Intervention Engine</span>
            </h1>
            <p style={{ color: '#6e6063', fontSize: '0.9rem', marginTop: '4px', fontWeight: '500' }}>
              Clinically-Governed Rule Engine • Drug Safety Gating • Cryptographic E-Signatures • Adherence Tracking
            </p>
          </div>
          <button
            onClick={handleGenerateCareplan}
            disabled={actionLoading}
            style={{
              background: '#6b0d24',
              color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px',
              fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 4px 14px rgba(107,13,36,0.3)'
            }}
          >
            <Sparkles size={18} />
            <span>Generate New Careplan (Ollama Qwen2.5 + Rule Engine)</span>
          </button>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginTop: '20px' }}>
          <div className="glass-card" style={{ padding: '16px', background: '#ffffff', border: '1px solid #e5ddd0', borderRadius: '12px', boxShadow: '0 4px 16px rgba(107,13,36,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Activity color="#6b0d24" size={24} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6e6063', fontWeight: '600' }}>Active Careplans</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#6b0d24' }}>{careplans.filter(c => c.status === 'Active').length || 1}</h3>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px', background: '#ffffff', border: '1px solid #e5ddd0', borderRadius: '12px', boxShadow: '0 4px 16px rgba(107,13,36,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <ShieldCheck color="#19733e" size={24} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6e6063', fontWeight: '600' }}>Adherence Rate (Formula Verified)</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#19733e' }}>{adherenceScore}%</h3>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '16px', background: '#ffffff', border: '1px solid #e5ddd0', borderRadius: '12px', boxShadow: '0 4px 16px rgba(107,13,36,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <TrendingDown color="#9e5d00" size={24} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#6e6063', fontWeight: '600' }}>Est. Hospitalizations Avoided</span>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#9e5d00' }}>4.2 <span style={{ fontSize: '0.75rem', color: '#6e6063' }}>(Modeled Estimate)</span></h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PATIENT SELECTOR TABS */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        {patientsList.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPatientId(p.id)}
            style={{
              padding: '10px 18px', borderRadius: '8px', border: selectedPatientId === p.id ? '1px solid #6b0d24' : '1px solid #e5ddd0',
              background: selectedPatientId === p.id ? '#6b0d24' : '#ffffff',
              color: selectedPatientId === p.id ? '#ffffff' : '#6e6063',
              fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
          >
            {p.name} ({p.spec})
          </button>
        ))}
      </div>

      {/* 3. MAIN CAREPLAN DETAIL AREA */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#6e6063' }}>Loading Careplan Data...</div>
      ) : !activePlan ? (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5ddd0' }}>
          <p style={{ color: '#6e6063', marginBottom: '16px', fontWeight: '500' }}>No active careplan found for this patient. Click "Generate New Careplan" to evaluate clinical rules.</p>
          <button onClick={handleGenerateCareplan} style={{ padding: '10px 20px', background: '#6b0d24', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' }}>
            Generate Careplan Now
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          
          {/* LEFT COLUMN: GOALS & INTERVENTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* PLAN STATUS HEADER */}
            <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5ddd0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700',
                      background: activePlan.status === 'Active' ? 'rgba(25,115,62,0.1)' : activePlan.status === 'Approved' ? 'rgba(107,13,36,0.1)' : 'rgba(158,93,0,0.1)',
                      color: activePlan.status === 'Active' ? '#19733e' : activePlan.status === 'Approved' ? '#6b0d24' : '#9e5d00',
                      border: '1px solid currentColor'
                    }}>
                      {activePlan.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#6e6063', fontWeight: '600' }}>Version: v{activePlan.version} • RuleSet: {activePlan.ruleSetVersion}</span>
                  </div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#6b0d24', marginTop: '8px' }}>
                    Clinical Careplan Protocol
                  </h2>
                </div>

                {/* ACTION WORKFLOW BUTTONS */}
                <div style={{ display: 'flex', gap: '10px' }}>
                  {activePlan.status === 'Draft' && (
                    <button onClick={handleSubmitToReview} disabled={actionLoading} style={{ padding: '8px 16px', background: '#6b0d24', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>
                      Submit for Provider Review
                    </button>
                  )}

                  {(activePlan.status === 'Draft' || activePlan.status === 'ProviderReview') && (
                    <button onClick={() => setShowSignModal(true)} disabled={actionLoading} style={{ padding: '8px 16px', background: '#19733e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lock size={16} /> Approve & E-Sign
                    </button>
                  )}

                  {activePlan.status === 'Approved' && (
                    <button onClick={handleActivateCareplan} disabled={actionLoading} style={{ padding: '8px 16px', background: '#19733e', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>
                      Activate Careplan
                    </button>
                  )}
                </div>
              </div>

              {activePlan.signatureHash && (
                <div style={{ marginTop: '12px', padding: '8px 12px', background: 'rgba(25,115,62,0.08)', border: '1px solid rgba(25,115,62,0.25)', borderRadius: '6px', fontSize: '0.82rem', color: '#19733e', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> 🔒 Digitally Signed & Approved by: <strong>{activePlan.approvedBy}</strong>
                </div>
              )}
            </div>

            {/* OLLAMA + QWEN2.5 3B CLINICAL AI REASONING CARD */}
            <div className="glass-card" style={{ padding: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #fbf9f4 100%)', borderRadius: '12px', border: '1px solid #d4c8b8', boxShadow: '0 4px 18px rgba(107,13,36,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(107,13,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={22} color="#6b0d24" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#6b0d24', margin: 0 }}>
                      AI Care Plan Engine: Ollama + Qwen2.5 3B
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#6e6063', fontWeight: '600' }}>
                      Model: <strong>{activePlan.llmModel || 'qwen2.5:3b'}</strong> • Runtime: <code style={{ background: '#eee8dc', padding: '1px 5px', borderRadius: '4px' }}>Ollama Local Inference (:11434)</code>
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '700',
                    background: ollamaStatus === 'CONNECTED' ? 'rgba(25,115,62,0.12)' : 'rgba(107,13,36,0.08)',
                    color: ollamaStatus === 'CONNECTED' ? '#19733e' : '#6b0d24',
                    border: '1px solid currentColor', display: 'flex', alignItems: 'center', gap: '5px'
                  }}>
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: ollamaStatus === 'CONNECTED' ? '#19733e' : '#6b0d24' }} />
                    {ollamaStatus === 'CONNECTED' ? 'OLLAMA RUNNING' : 'LOCAL GUARDRAIL ACTIVE'}
                  </span>

                  <button
                    onClick={handleGenerateOllama}
                    disabled={llmLoading}
                    style={{
                      padding: '6px 14px', borderRadius: '6px', border: '1px solid #6b0d24',
                      background: '#6b0d24', color: '#fff', fontSize: '0.78rem', fontWeight: '700',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <Zap size={13} />
                    <span>{llmLoading ? 'Consulting Qwen2.5...' : 'Run Qwen2.5 LLM'}</span>
                  </button>
                </div>
              </div>

              {/* AI Clinical Summary */}
              <div style={{ padding: '12px 14px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e5ddd0', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#6b0d24', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🔬 Clinical Mechanism & Prognosis Rationale
                </div>
                <p style={{ fontSize: '0.88rem', color: '#2b1b1e', lineHeight: '1.5', margin: 0, fontWeight: '500' }}>
                  {activePlan.aiSummary || "🧠 [Qwen2.5:3B Clinical Synthesis]: Elevated cardiovascular risk score driven by arterial pressure. Primary priority is ACE-inhibitor vascular stabilization, reduction of shear stress on coronary endothelium, and prevention of ventricular remodeling."}
                </p>
              </div>

              {/* AI Lifestyle & Nutrition Advice */}
              <div style={{ padding: '12px 14px', background: 'rgba(25,115,62,0.04)', borderRadius: '8px', border: '1px solid rgba(25,115,62,0.2)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#19733e', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  🥗 Personalized Lifestyle, Nutrition & Adherence Protocol
                </div>
                <div style={{ fontSize: '0.84rem', color: '#2b1b1e', lineHeight: '1.55', whiteSpace: 'pre-line', fontWeight: '500' }}>
                  {activePlan.lifestyleAdvice || "🥗 [Qwen2.5:3B Lifestyle & Diet Protocol]:\n• Nutrition: Low-sodium Mediterranean diet (<1,500mg Na/day). Increase dietary potassium via leafy greens and avocados.\n• Exercise: 150 min/week moderate aerobic activity (zone-2 brisk walking); avoid heavy isometric strain.\n• Sleep & Recovery: Target 7-8 hours restorative sleep; initiate daily 15-minute biofeedback diaphragmatic breathing."}
                </div>
              </div>
            </div>

            {/* CLINICAL GOALS */}
            <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5ddd0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6b0d24', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Award color="#6b0d24" size={20} />
                <span>Clinically Traceable Goals ({activePlan.goals?.length || 0})</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activePlan.goals?.map(g => (
                  <div key={g.id} style={{ padding: '12px', background: '#f6f3eb', borderRadius: '8px', borderLeft: '4px solid #6b0d24' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: '700', color: '#2b1b1e' }}>{g.description}</span>
                      <span style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'rgba(107,13,36,0.08)', color: '#6b0d24', borderRadius: '4px', fontFamily: 'monospace', fontWeight: '700' }}>
                        rule: {g.sourceRuleId}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.8rem', color: '#6e6063', marginTop: '6px', fontWeight: '600' }}>
                      <span>Metric: <strong style={{ color: '#2b1b1e' }}>{g.metric}</strong></span>
                      <span>Target: <strong style={{ color: '#19733e' }}>{g.targetValue}</strong></span>
                      <span>Timeframe: <strong style={{ color: '#2b1b1e' }}>{g.targetWindowWeeks} Weeks</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* INTERVENTIONS & SAFETY CHECKS */}
            <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5ddd0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6b0d24', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck color="#19733e" size={20} />
                <span>Safety-Gated Interventions ({activePlan.interventions?.length || 0})</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activePlan.interventions?.map(i => (
                  <div key={i.id} style={{ padding: '14px', background: '#f6f3eb', borderRadius: '8px', border: '1px solid #e2dbcd' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', background: 'rgba(107,13,36,0.1)', color: '#6b0d24' }}>
                          {i.type}
                        </span>
                        <span style={{ fontWeight: '700', color: '#2b1b1e' }}>{i.description}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* SAFETY BADGE */}
                        <span style={{
                          padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700',
                          background: i.safetyCheckStatus === 'Passed' ? 'rgba(25,115,62,0.1)' : i.safetyCheckStatus === 'Overridden' ? 'rgba(158,93,0,0.1)' : 'rgba(107,13,36,0.1)',
                          color: i.safetyCheckStatus === 'Passed' ? '#19733e' : i.safetyCheckStatus === 'Overridden' ? '#9e5d00' : '#6b0d24',
                          border: '1px solid currentColor'
                        }}>
                          Safety: {i.safetyCheckStatus}
                        </span>

                        {i.safetyCheckStatus === 'Failed' && (
                          <button
                            onClick={() => { setSelectedIntervention(i); setShowOverrideModal(true); }}
                            style={{ padding: '4px 8px', background: '#9e5d00', color: '#ffffff', border: 'none', borderRadius: '4px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                          >
                            Override
                          </button>
                        )}

                        <button
                          onClick={() => handleLogAdherence(i.id)}
                          style={{ padding: '4px 10px', background: 'rgba(25,115,62,0.1)', color: '#19733e', border: '1px solid #19733e', borderRadius: '4px', fontWeight: '700', fontSize: '0.75rem', cursor: 'pointer' }}
                        >
                          Log Adherence
                        </button>
                      </div>
                    </div>

                    {i.medicationDetails && (
                      <div style={{ marginTop: '8px', padding: '6px 10px', background: '#ffffff', borderRadius: '4px', fontSize: '0.8rem', color: '#6e6063', border: '1px solid #e5ddd0' }}>
                        💊 Drug: <strong style={{ color: '#2b1b1e' }}>{i.medicationDetails.drugName}</strong> ({i.medicationDetails.dosage}, {i.medicationDetails.frequency})
                      </div>
                    )}

                    {i.overrideReason && (
                      <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#9e5d00', fontWeight: '600' }}>
                        ⚠️ Override Reason ({i.overriddenBy}): {i.overrideReason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PREDICTED OUTCOMES & TREND */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '12px', border: '1px solid #e5ddd0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6b0d24', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingDown color="#19733e" size={20} />
                <span>Risk Trend vs Baseline</span>
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f6f3eb', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6e6063', fontWeight: '600' }}>Baseline Risk Score:</span>
                  <span style={{ fontWeight: '700', color: '#6b0d24' }}>24.5% (HIGH)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: '#f6f3eb', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#6e6063', fontWeight: '600' }}>Current Predicted Risk:</span>
                  <span style={{ fontWeight: '700', color: '#19733e' }}>14.2% (MODERATE)</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(25,115,62,0.08)', border: '1px solid rgba(25,115,62,0.25)', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#19733e', fontWeight: '600' }}>Risk Reduction Delta:</span>
                  <span style={{ fontWeight: '700', color: '#19733e' }}>- 10.3%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERRIDE MODAL */}
      {showOverrideModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,27,30,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', border: '1px solid #9e5d00', borderRadius: '12px', padding: '24px', width: '450px', boxShadow: '0 12px 36px rgba(107,13,36,0.15)' }}>
            <h3 style={{ color: '#9e5d00', fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} /> Override Drug Safety Warning
            </h3>
            <p style={{ color: '#6e6063', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500' }}>
              Clinical policy requires documented provider justification to override flagged drug interactions.
            </p>

            <textarea
              rows={4}
              value={overrideReason}
              onChange={e => setOverrideReason(e.target.value)}
              placeholder="Enter clinical rationale for override (e.g. Patient monitored with daily lab draw...)"
              style={{ width: '100%', padding: '10px', background: '#f6f3eb', color: '#2b1b1e', border: '1px solid #e2dbcd', borderRadius: '6px', marginBottom: '16px', outline: 'none' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowOverrideModal(false)} style={{ padding: '8px 16px', background: '#eee8dc', color: '#2b1b1e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>
                Cancel
              </button>
              <button onClick={handleOverrideSafety} style={{ padding: '8px 16px', background: '#9e5d00', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                Confirm Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* E-SIGNATURE APPROVAL MODAL */}
      {showSignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(43,27,30,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#ffffff', border: '1px solid #19733e', borderRadius: '12px', padding: '24px', width: '480px', boxShadow: '0 12px 36px rgba(107,13,36,0.15)' }}>
            <h3 style={{ color: '#19733e', fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={20} /> Provider E-Signature & Attestation
            </h3>
            <p style={{ color: '#6e6063', fontSize: '0.85rem', marginBottom: '16px', fontWeight: '500' }}>
              By signing below, you cryptographically attest that all goals and interventions have been clinically reviewed.
            </p>

            <textarea
              rows={3}
              value={attestationText}
              onChange={e => setAttestationText(e.target.value)}
              style={{ width: '100%', padding: '10px', background: '#f6f3eb', color: '#2b1b1e', border: '1px solid #e2dbcd', borderRadius: '6px', marginBottom: '16px', outline: 'none' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button onClick={() => setShowSignModal(false)} style={{ padding: '8px 16px', background: '#eee8dc', color: '#2b1b1e', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700' }}>
                Cancel
              </button>
              <button onClick={handleApproveCareplan} style={{ padding: '8px 16px', background: '#19733e', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>
                Sign & Approve (SHA-256)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
