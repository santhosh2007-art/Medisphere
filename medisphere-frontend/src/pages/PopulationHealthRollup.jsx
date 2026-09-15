import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Activity, Users, ShieldAlert, FileText, Heart, TrendingDown, CheckCircle,
  AlertCircle, RefreshCw, Cpu, Layers, Award, Sparkles
} from 'lucide-react';

export const PopulationHealthRollup = () => {
  const [rollupData, setRollupData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRollup();
  }, []);

  const fetchRollup = async () => {
    setLoading(true);
    try {
      const res = await api.getPopulationRollup();
      setRollupData(res.data);
    } catch (err) {
      console.error('Error fetching population rollup:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading Master Population Health Rollup...</div>;
  }

  const { asOf, serviceStatuses, digitalTwins, riskPrediction, monitoring, careplans } = rollupData || {};

  return (
    <div className="dashboard-container" style={{ padding: '24px', color: '#2b1b1e' }}>
      
      {/* 1. MASTER HEADER & TIMESTAMP */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#6b0d24', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="#6b0d24" size={32} />
            <span>Population Health Master Application Screen</span>
          </h1>
          <p style={{ color: '#6e6063', fontSize: '0.9rem', marginTop: '4px', fontWeight: '500' }}>
            Cross-Milestone Synthesis Layer: Digital Twins • Risk Predictions • Monitoring Telemetry • Precision Careplans
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px 16px', background: 'rgba(107, 13, 36, 0.08)', border: '1px solid rgba(107, 13, 36, 0.18)', borderRadius: '8px', fontSize: '0.85rem', color: '#6b0d24', fontWeight: '700' }}>
            🕒 As of: <strong>{new Date(asOf).toLocaleString()}</strong>
          </div>
          <button
            onClick={fetchRollup}
            style={{ padding: '8px 14px', background: '#6b0d24', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* 2. FOUR-MILESTONE CARD GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* MILESTONE 1: DIGITAL TWINS */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e5ddd0', boxShadow: '0 6px 20px rgba(107,13,36,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6b0d24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users color="#6b0d24" size={20} />
              <span>1. Digital Twins Service</span>
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(25,115,62,0.1)', color: '#19733e', border: '1px solid #19733e', fontWeight: '700' }}>
              {serviceStatuses?.digitalTwinService || 'ONLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Total Monitored Cohort:</span>
              <strong style={{ color: '#2b1b1e' }}>{digitalTwins?.totalCohortSize} Patients</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Twin Coverage:</span>
              <strong style={{ color: '#19733e' }}>{digitalTwins?.coveragePercentage}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Freshness Status:</span>
              <strong style={{ color: '#6b0d24', fontSize: '0.85rem' }}>{digitalTwins?.twinFreshness}</strong>
            </div>
          </div>
        </div>

        {/* MILESTONE 2: RISK PREDICTION */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e5ddd0', boxShadow: '0 6px 20px rgba(107,13,36,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6b0d24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu color="#9e5d00" size={20} />
              <span>2. RiskPrediction Service</span>
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(25,115,62,0.1)', color: '#19733e', border: '1px solid #19733e', fontWeight: '700' }}>
              {serviceStatuses?.riskPredictionService || 'ONLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>High Risk Count:</span>
              <strong style={{ color: '#6b0d24' }}>{riskPrediction?.highRiskCount} Patients</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Avg CVD Risk Score:</span>
              <strong style={{ color: '#9e5d00' }}>{riskPrediction?.averageCvdRiskPct}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Avg Diabetes Risk Score:</span>
              <strong style={{ color: '#6b0d24' }}>{riskPrediction?.averageDiabetesRiskPct}%</strong>
            </div>
          </div>
        </div>

        {/* MILESTONE 3: MONITORING TELEMETRY */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e5ddd0', boxShadow: '0 6px 20px rgba(107,13,36,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6b0d24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert color="#6b0d24" size={20} />
              <span>3. Monitoring Service</span>
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(25,115,62,0.1)', color: '#19733e', border: '1px solid #19733e', fontWeight: '700' }}>
              {serviceStatuses?.monitoringService || 'ONLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Reading Compliance:</span>
              <strong style={{ color: '#19733e' }}>{monitoring?.readingCompliancePct}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Active Out-of-Range Alerts:</span>
              <strong style={{ color: '#6b0d24' }}>{monitoring?.activeOutofRangeAlertsCount} Active</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Kafka Stream Status:</span>
              <strong style={{ color: '#6b0d24', fontSize: '0.85rem' }}>{monitoring?.telemetryStreamStatus}</strong>
            </div>
          </div>
        </div>

        {/* MILESTONE 4: CAREPLANS & OUTCOMES */}
        <div className="glass-card" style={{ padding: '20px', background: '#ffffff', borderRadius: '14px', border: '1px solid #e5ddd0', boxShadow: '0 6px 20px rgba(107,13,36,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#6b0d24', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText color="#19733e" size={20} />
              <span>4. Careplans & Interventions</span>
            </h3>
            <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(25,115,62,0.1)', color: '#19733e', border: '1px solid #19733e', fontWeight: '700' }}>
              {serviceStatuses?.careplanService || 'ONLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Active Careplans Count:</span>
              <strong style={{ color: '#2b1b1e' }}>{careplans?.activeCareplansCount} Active</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Population Adherence:</span>
              <strong style={{ color: '#19733e' }}>{careplans?.populationAdherenceRatePct}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#6e6063', fontSize: '0.85rem', fontWeight: '600' }}>Hospitalizations Prevented:</span>
              <strong style={{ color: '#9e5d00' }}>{careplans?.estimatedHospitalizationsPrevented}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
