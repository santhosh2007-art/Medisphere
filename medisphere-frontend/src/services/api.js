import axios from 'axios';

// Base URL for Gateway API
const API_BASE_URL = 'http://localhost:8080';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Keycloak JWT Token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medisphere_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Toggle Sandbox Mode (Local Client-Side Storage vs Gateway Microservices)
const isSandboxMode = () => {
  return false;
};

// Initialize Mock Sandbox Data if not present
const initSandboxData = () => {
  if (!localStorage.getItem('sandbox_patients')) {
    const p1Id = '4a8a649d-649d-478d-9c4c-283cfb1b1111';
    const p2Id = '5a8a649d-649d-478d-9c4c-283cfb1b2222';
    
    const mockPatients = [
      { patientId: p1Id, firstname: 'John', lastname: 'Doe', gender: 'Male', dob: '1985-05-15', email: 'john.doe@example.com', phoneno: 9876543210, address: 'New York, USA' },
      { patientId: p2Id, firstname: 'Sarah', lastname: 'Connor', gender: 'Female', dob: '1990-11-22', email: 'sarah.c@example.com', phoneno: 9123456780, address: 'Los Angeles, USA' }
    ];

    const mockConsents = [
      { id: 'c1-id', patientId: p1Id, consenttype: 'FULL_ACCESS', status: 'GRANTED', granteddate: '2026-01-01', expirydate: '2027-01-01' },
      { id: 'c2-id', patientId: p2Id, consenttype: 'WEARABLE_DATA', status: 'REVOKED', granteddate: '2026-02-15', expirydate: '2027-02-15' }
    ];

    const mockTwins = [
      { id: 't1-id', patientId: p1Id, bloodgroup: 'O+', height: 180, weight: 75, temperature: 98.6, disease: 'Diabetes Type 2, Hypertension' },
      { id: 't2-id', patientId: p2Id, bloodgroup: 'A-', height: 165, weight: 60, temperature: 97.9, disease: 'Dust Allergy' }
    ];

    const mockVitalsList = [
      { id: 'v1-id', patientId: p1Id, heartbeat: 72, bloodpressure: '120/80', oxygenlevel: 98, bloodsuger: 110, pulserate: 72, timestamp: new Date().toISOString() },
      { id: 'v2-id', patientId: p2Id, heartbeat: 80, bloodpressure: '118/75', oxygenlevel: 99, bloodsuger: 95, pulserate: 80, timestamp: new Date().toISOString() }
    ];

    const mockAudits = [
      { id: 'a1', patientId: p1Id, action: 'PATIENT_CREATION', user: 'admin', timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 'a2', patientId: p1Id, action: 'CONSENT_GRANTED', user: 'admin', timestamp: new Date(Date.now() - 3600000 * 20).toISOString() },
      { id: 'a3', patientId: p2Id, action: 'PATIENT_CREATION', user: 'admin', timestamp: new Date(Date.now() - 3600000 * 18).toISOString() },
      { id: 'a4', patientId: p2Id, action: 'CONSENT_REVOKED', user: 'admin', timestamp: new Date(Date.now() - 3600000 * 12).toISOString() }
    ];

    localStorage.setItem('sandbox_patients', JSON.stringify(mockPatients));
    localStorage.setItem('sandbox_consents', JSON.stringify(mockConsents));
    localStorage.setItem('sandbox_twins', JSON.stringify(mockTwins));
    localStorage.setItem('sandbox_vitals', JSON.stringify(mockVitalsList));
    localStorage.setItem('sandbox_audits', JSON.stringify(mockAudits));
  }
};

// initSandboxData();

// Helper functions for sandbox DB access
const getSandboxPatients = () => JSON.parse(localStorage.getItem('sandbox_patients') || '[]');
const saveSandboxPatients = (data) => localStorage.setItem('sandbox_patients', JSON.stringify(data));
const getSandboxConsents = () => JSON.parse(localStorage.getItem('sandbox_consents') || '[]');
const saveSandboxConsents = (data) => localStorage.setItem('sandbox_consents', JSON.stringify(data));
const getSandboxTwins = () => JSON.parse(localStorage.getItem('sandbox_twins') || '[]');
const saveSandboxTwins = (data) => localStorage.setItem('sandbox_twins', JSON.stringify(data));
const getSandboxVitals = () => JSON.parse(localStorage.getItem('sandbox_vitals') || '[]');
const saveSandboxVitals = (data) => localStorage.setItem('sandbox_vitals', JSON.stringify(data));
const getSandboxAudits = () => JSON.parse(localStorage.getItem('sandbox_audits') || '[]');
const saveSandboxAudits = (data) => localStorage.setItem('sandbox_audits', JSON.stringify(data));

const getSandboxPredictions = () => JSON.parse(localStorage.getItem('sandbox_predictions') || '[]');
const saveSandboxPredictions = (data) => localStorage.setItem('sandbox_predictions', JSON.stringify(data));
const getSandboxExplanations = () => JSON.parse(localStorage.getItem('sandbox_explanations') || '[]');
const saveSandboxExplanations = (data) => localStorage.setItem('sandbox_explanations', JSON.stringify(data));
const getSandboxModels = () => {
  const data = localStorage.getItem('sandbox_models');
  if (!data) {
    const defaultModels = [
      { version: '1.0', accuracy: 91.4, createdDate: '2026-07-12', status: 'ACTIVE' }
    ];
    localStorage.setItem('sandbox_models', JSON.stringify(defaultModels));
    return defaultModels;
  }
  return JSON.parse(data);
};
const saveSandboxModels = (data) => localStorage.setItem('sandbox_models', JSON.stringify(data));


const addAuditLog = (patientId, action) => {
  const audits = getSandboxAudits();
  audits.unshift({
    id: `audit-${Math.random().toString(36).substr(2, 9)}`,
    patientId,
    action,
    user: localStorage.getItem('medisphere_username') || 'testuser',
    timestamp: new Date().toISOString()
  });
  saveSandboxAudits(audits);
};

export const api = {
  // PATIENTS
  getPatients: async () => {
    if (isSandboxMode()) {
      return { data: getSandboxPatients() };
    }
    return client.get('/patient/all');
  },

  getPatientById: async (id) => {
    if (isSandboxMode()) {
      const p = getSandboxPatients().find(x => x.patientId === id);
      addAuditLog(id, 'VIEW_PATIENT_DEMOGRAPHICS');
      return p ? { data: p } : Promise.reject({ response: { status: 404 } });
    }
    return client.get(`/patient/${id}`);
  },

  savePatient: async (patientData) => {
    if (isSandboxMode()) {
      const patients = getSandboxPatients();
      const newPatient = {
        ...patientData,
        patientId: crypto.randomUUID()
      };
      patients.push(newPatient);
      saveSandboxPatients(patients);
      addAuditLog(newPatient.patientId, 'CREATE_PATIENT');
      
      // Default blank consent
      const consents = getSandboxConsents();
      consents.push({
        id: crypto.randomUUID(),
        patientId: newPatient.patientId,
        consenttype: 'FULL_ACCESS',
        status: 'GRANTED',
        granteddate: new Date().toISOString().split('T')[0],
        expirydate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
      saveSandboxConsents(consents);

      // Default twin
      const twins = getSandboxTwins();
      twins.push({
        id: crypto.randomUUID(),
        patientId: newPatient.patientId,
        bloodgroup: 'O+',
        height: 175,
        weight: 70,
        temperature: 98.6,
        disease: 'None'
      });
      saveSandboxTwins(twins);

      return { data: newPatient };
    }
    return client.post('/patient/save', patientData);
  },

  updatePatient: async (id, patientData) => {
    if (isSandboxMode()) {
      const patients = getSandboxPatients();
      const idx = patients.findIndex(x => x.patientId === id);
      if (idx !== -1) {
        patients[idx] = { ...patients[idx], ...patientData };
        saveSandboxPatients(patients);
        addAuditLog(id, 'UPDATE_PATIENT');
        return { data: patients[idx] };
      }
      return Promise.reject({ response: { status: 404 } });
    }
    return client.put(`/patient/${id}`, patientData);
  },

  deletePatient: async (id) => {
    if (isSandboxMode()) {
      const patients = getSandboxPatients().filter(x => x.patientId !== id);
      saveSandboxPatients(patients);
      return { data: 'Patient Deleted Successfully' };
    }
    return client.delete(`/patient/${id}`);
  },

  // HEALTH TWIN
  getHealthTwin: async (patientId) => {
    if (isSandboxMode()) {
      const twins = getSandboxTwins();
      const twin = twins.find(x => x.patientId === patientId);
      return { data: twin || null };
    }
    return client.get(`/healthtwin/patient/${patientId}`);
  },

  saveHealthTwin: async (twinData) => {
    if (isSandboxMode()) {
      const twins = getSandboxTwins();
      const idx = twins.findIndex(x => x.patientId === twinData.patientId);
      const newTwin = {
        id: twins[idx]?.id || crypto.randomUUID(),
        ...twinData
      };
      if (idx !== -1) {
        twins[idx] = newTwin;
      } else {
        twins.push(newTwin);
      }
      saveSandboxTwins(twins);
      addAuditLog(twinData.patientId, 'UPDATE_HEALTH_TWIN');
      return { data: newTwin };
    }
    return client.post('/healthtwin/save', twinData);
  },

  // CONSENT MANAGEMENT
  getConsent: async (patientId) => {
    if (isSandboxMode()) {
      const consents = getSandboxConsents();
      const consent = consents.find(x => x.patientId === patientId);
      return { data: consent || null };
    }
    return client.get(`/consent/patient/${patientId}`);
  },

  saveConsent: async (consentData) => {
    if (isSandboxMode()) {
      const consents = getSandboxConsents();
      const idx = consents.findIndex(x => x.patientId === consentData.patientId);
      const newConsent = {
        id: consents[idx]?.id || crypto.randomUUID(),
        ...consentData
      };
      if (idx !== -1) {
        consents[idx] = newConsent;
      } else {
        consents.push(newConsent);
      }
      saveSandboxConsents(consents);
      addAuditLog(consentData.patientId, consentData.status === 'GRANTED' ? 'GRANT_CONSENT' : 'REVOKE_CONSENT');
      return { data: newConsent };
    }
    return client.post('/consent/save', consentData);
  },

  revokeConsent: async (id) => {
    if (isSandboxMode()) {
      const consents = getSandboxConsents();
      const idx = consents.findIndex(x => x.id === id);
      if (idx !== -1) {
        consents[idx].status = 'REVOKED';
        saveSandboxConsents(consents);
        addAuditLog(consents[idx].patientId, 'REVOKE_CONSENT');
        return { data: consents[idx] };
      }
      return Promise.reject({ response: { status: 404 } });
    }
    return client.patch(`/consent/${id}/revoke`);
  },

  // VITALS & KAFKA
  getLatestVitals: async (patientId) => {
    if (isSandboxMode()) {
      const vitals = getSandboxVitals();
      const v = vitals.filter(x => x.patientId === patientId);
      return { data: v[v.length - 1] || null };
    }
    return client.get(`/vitals/latest/${patientId}`);
  },

  publishVitals: async (vitalsData) => {
    if (isSandboxMode()) {
      const vitals = getSandboxVitals();
      const newReading = {
        id: crypto.randomUUID(),
        ...vitalsData,
        timestamp: new Date().toISOString()
      };
      vitals.push(newReading);
      saveSandboxVitals(vitals);
      addAuditLog(vitalsData.patientId, 'INGEST_REALTIME_VITALS_KAFKA');
      return { data: newReading };
    }
    return client.post('/vitals/wearable/publish', vitalsData);
  },

  // PATIENT 360 DASHBOARD
  getPatient360: async (patientId) => {
    if (isSandboxMode()) {
      const patient = getSandboxPatients().find(x => x.patientId === patientId);
      if (!patient) return Promise.reject({ response: { status: 404 } });

      const consent = getSandboxConsents().find(x => x.patientId === patientId) || null;
      const twin = getSandboxTwins().find(x => x.patientId === patientId) || null;
      const vitalsList = getSandboxVitals().filter(x => x.patientId === patientId);
      const latestVitals = vitalsList[vitalsList.length - 1] || null;

      addAuditLog(patientId, 'VIEW_PATIENT_360');

      // If consent is revoked, hide healthTwin and vitals
      const isGranted = consent && consent.status.toUpperCase() === 'GRANTED';

      return {
        data: {
          patient,
          consent,
          healthTwin: isGranted ? twin : { message: 'Access denied: Consent revoked.' },
          vitals: isGranted ? latestVitals : { message: 'Access denied: Consent revoked.' }
        }
      };
    }
    return client.get(`/patient360/${patientId}`);
  },

  // AUDIT LOGS
  getAudits: async (patientId) => {
    if (isSandboxMode()) {
      const audits = getSandboxAudits().filter(x => x.patientId === patientId);
      return { data: audits };
    }
    return client.get(`/audit/${patientId}`);
  },

  // FHIR EHR SYSTEM SYNCHRONIZATION
  connectFhir: async () => {
    if (isSandboxMode()) {
      return { data: { status: 'SUCCESS', response: 'Connected to public HAPI FHIR EHR Sandbox successfully.' } };
    }
    return client.post('/fhir/connect');
  },

  syncFhir: async (patientId) => {
    if (isSandboxMode()) {
      addAuditLog(patientId, 'SYNC_FHIR_EHR_RESOURCES');
      return { data: { status: 'SUCCESS', response: `Synced 12 FHIR Observation, 3 MedicationRequest, and 4 Condition resources for patient ${patientId}.` } };
    }
    return client.post('/fhir/sync', { patientId });
  },

  validateFhir: async () => {
    if (isSandboxMode()) {
      return { data: { status: 'SUCCESS', response: 'FHIR R4 schema validation passed: 0 warnings, 0 errors.' } };
    }
    return client.post('/fhir/validate');
  },

  getPatientFhirResource: async (patientId) => {
    if (isSandboxMode()) {
      const p = getSandboxPatients().find(x => x.patientId === patientId);
      if (!p) return Promise.reject({ response: { status: 404 } });
      return {
        data: {
          resourceType: 'Patient',
          id: p.patientId,
          active: true,
          name: [{ use: 'official', family: p.lastname, given: [p.firstname] }],
          gender: p.gender.toLowerCase(),
          birthDate: p.dob,
          telecom: [{ system: 'phone', value: String(p.phoneno), use: 'home' }, { system: 'email', value: p.email }],
          address: [{ line: [p.address], use: 'home' }]
        }
      };
    }
    return client.get(`/fhir/patient/${patientId}`);
  },

  // AI PREDICTION
  predictCvd: async (patientId) => {
    if (isSandboxMode()) {
      const preds = getSandboxPredictions();
      const newPred = {
        id: crypto.randomUUID(),
        patientId,
        riskType: 'CARDIO',
        riskPercentage: 27.4,
        riskLevel: 'HIGH',
        confidence: 94,
        predictionDate: new Date().toISOString().split('T')[0],
        modelVersion: '1.0'
      };
      preds.push(newPred);
      saveSandboxPredictions(preds);
      addAuditLog(patientId, 'RUN_AI_CVD_PREDICTION');
      return { data: newPred };
    }
    return client.post('/api/prediction/cvd', { patientId });
  },

  predictDiabetes: async (patientId) => {
    if (isSandboxMode()) {
      const preds = getSandboxPredictions();
      const newPred = {
        id: crypto.randomUUID(),
        patientId,
        riskType: 'DIABETES',
        riskPercentage: 18.6,
        riskLevel: 'MEDIUM',
        confidence: 91,
        predictionDate: new Date().toISOString().split('T')[0],
        modelVersion: '1.0'
      };
      preds.push(newPred);
      saveSandboxPredictions(preds);
      addAuditLog(patientId, 'RUN_AI_DIABETES_PREDICTION');
      return { data: newPred };
    }
    return client.post('/api/prediction/diabetes', { patientId });
  },

  getPredictionHistory: async (patientId) => {
    if (isSandboxMode()) {
      const preds = getSandboxPredictions().filter(x => x.patientId === patientId);
      return { data: preds };
    }
    return client.get(`/api/prediction/history/${patientId}`);
  },

  getLatestPrediction: async (patientId) => {
    if (isSandboxMode()) {
      const preds = getSandboxPredictions().filter(x => x.patientId === patientId);
      return { data: preds[preds.length - 1] || null };
    }
    return client.get(`/api/prediction/latest/${patientId}`);
  },

  getExplanation: async (patientId) => {
    if (isSandboxMode()) {
      const exps = getSandboxExplanations().filter(x => x.patientId === patientId);
      if (exps.length === 0) {
        return {
          data: {
            patientId,
            risk: 'HIGH',
            factors: [
              'Blood Pressure: +20%',
              'HbA1c: +18%',
              'BMI: +12%',
              'Heart Rate: +5%'
            ]
          }
        };
      }
      return { data: exps[exps.length - 1] };
    }
    return client.get(`/api/explanation/${patientId}`);
  },

  generateExplanation: async (patientId) => {
    if (isSandboxMode()) {
      const exps = getSandboxExplanations();
      const newExp = {
        id: crypto.randomUUID(),
        patientId,
        risk: 'HIGH',
        factors: [
          'Blood Pressure: +20%',
          'HbA1c: +18%',
          'BMI: +12%',
          'Heart Rate: +5%'
        ]
      };
      exps.push(newExp);
      saveSandboxExplanations(exps);
      addAuditLog(patientId, 'GENERATE_AI_EXPLANATION');
      return { data: newExp };
    }
    return client.post(`/api/explanation/${patientId}`);
  },

  getAllModels: async () => {
    if (isSandboxMode()) {
      return { data: getSandboxModels() };
    }
    return client.get('/api/model');
  },

  getLatestModel: async () => {
    if (isSandboxMode()) {
      const active = getSandboxModels().find(m => m.status === 'ACTIVE');
      return { data: active || getSandboxModels()[0] };
    }
    return client.get('/api/model/latest');
  },

  addModel: async (modelData) => {
    if (isSandboxMode()) {
      const models = getSandboxModels();
      const newM = {
        ...modelData,
        createdDate: new Date().toISOString().split('T')[0]
      };
      models.push(newM);
      saveSandboxModels(models);
      return { data: newM };
    }
    return client.post('/api/model', modelData);
  },

  activateModel: async (version) => {
    if (isSandboxMode()) {
      const models = getSandboxModels();
      const updated = models.map(m => {
        if (m.version === version) {
          m.status = 'ACTIVE';
        } else {
          m.status = 'INACTIVE';
        }
        return m;
      });
      saveSandboxModels(updated);
      return { data: updated.find(m => m.version === version) };
    }
    return client.put(`/api/model/${version}`);
  },

  deleteModel: async (version) => {
    if (isSandboxMode()) {
      const models = getSandboxModels().filter(m => m.version !== version);
      saveSandboxModels(models);
      return { data: 'Model deleted' };
    }
    return client.delete(`/api/model/${version}`);
  },

  getPredictionAccuracy: async () => {
    if (isSandboxMode()) {
      return { data: { accuracy: 92.5, validationSetSize: 1500, precision: 91.2, recall: 93.8 } };
    }
    return client.get('/api/prediction/accuracy');
  },

  getPredictionCalibration: async () => {
    if (isSandboxMode()) {
      return { data: { brierScore: 0.084, calibrated: true } };
    }
    return client.get('/api/prediction/calibration');
  },

  getPredictionBiasAudit: async () => {
    if (isSandboxMode()) {
      return { data: { disparateImpactRatio: 0.98, status: 'COMPLIANT' } };
    }
    return client.get('/api/prediction/bias-audit');
  },

  validateExplanationApi: async () => {
    if (isSandboxMode()) {
      return { data: { shapValuesConvergence: 98.4, faithfulnessMetric: 0.94 } };
    }
    return client.get('/api/explanation/validate');
  },

  getModelStatus: async () => {
    if (isSandboxMode()) {
      return { data: { federatedRound: 14, convergenceStatus: 'STABLE' } };
    }
    return client.get('/api/model/status');
  }
};
