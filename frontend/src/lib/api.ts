/**
 * VCAAS API Service
 * Handles all communication with the backend API
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Add request interceptor for logging and auth
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (authToken) {
      config.headers['Authorization'] = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    console.warn('API Request Warning:', error?.message || error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Log as warning rather than console.error to avoid Turbopack dev error popups
    console.warn('API Connection Warning:', error?.message || 'Network unreachable');
    return Promise.reject(error);
  }
);

export interface Voice {
  id: string;
  name: string;
  owner: string;
  status: string;
  quality: string;
  can_use: boolean;
  category: 'owned' | 'licensed' | 'public';
  tags: string[];
  avatar: string;
}

export interface TTSRequest {
  text: string;
  voice_id: string;
  language?: string;
  emotions?: string[];
  speed?: number;
  pitch?: number;
  volume?: number;
  add_watermark?: boolean;
}

export interface TTSJob {
  id: string;
  text: string;
  voice_name: string;
  status: 'generating' | 'completed' | 'failed';
  audio_url?: string;
  duration?: number;
  created_at: string;
  completed_at?: string;
  emotions: string[];
}

export interface TrainingJob {
  id: string;
  voice_name: string;
  status: string;
  progress: number;
  created_at: string;
  completed_at?: string;
  sample_count: number;
  error?: string;
}

export interface VoiceModel {
  id: string;
  name: string;
  status: string;
  quality_score: number;
  sample_count: number;
  created_at: string;
  tags: string[];
}

// Health check
export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

// Authentication
export const getCurrentUser = async () => {
  const response = await api.get('/api/v1/auth/profile');
  return response.data;
};

// Email OTP
export const requestEmailOtp = async (email: string): Promise<{ ok: boolean }> => {
  const res = await api.post('/api/v1/auth/otp/request', { email })
  return res.data
}

export const verifyEmailOtp = async (email: string, code: string): Promise<{ ok: boolean; customToken?: string }> => {
  const res = await api.post('/api/v1/auth/otp/verify', { email, code })
  return res.data
}

// Voice Management
export const getVoiceSamples = async () => {
  const response = await api.get('/api/v1/voices/');
  return response.data;
};

export const getAvailableVoices = async () => {
  const response = await api.get('/api/v1/tts/models/available');
  return response.data;
};

export const getTrainedVoices = async (userId = 'default') => {
  try {
    const response = await api.get('/api/v1/voices/', { params: { user_id: userId } });
    return response.data;
  } catch (err: any) {
    console.warn('Backend offline or voices unavailable, returning empty list:', err?.message || err);
    return [];
  }
};

export const deleteVoiceSample = async (voiceId: string) => {
  const response = await api.delete(`/api/v1/voices/${voiceId}`);
  return response.data;
};

export const deleteTrainedVoice = async (voiceId: string, userId = 'default') => {
  const response = await api.delete(`/api/v1/voices/${voiceId}`, { params: { user_id: userId } });
  return response.data;
};

// Text-to-Speech
export const generateSpeech = async (request: TTSRequest): Promise<{ id: string; status: string; message: string; estimated_completion: string }> => {
  const response = await api.post('/api/v1/tts/generate', request);
  return response.data;
};

export const getTTSJobs = async (): Promise<TTSJob[]> => {
  try {
    const response = await api.get('/api/v1/tts/jobs');
    return response.data;
  } catch (err: any) {
    console.warn('Backend offline or jobs unavailable, returning empty list:', err?.message || err);
    return [];
  }
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/api/v1/auth/login', {
    email: email,
    password: password
  });
  return response.data;
};

export const getTTSJob = async (jobId: string): Promise<TTSJob> => {
  const response = await api.get(`/api/v1/tts/job/${jobId}`);
  return response.data;
};

export const downloadAudio = async (jobId: string): Promise<Blob> => {
  const response = await api.get(`/api/v1/tts/job/${jobId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

// Zero-shot cloning (XTTS v2)
export const cloneZeroShot = async (
  text: string,
  language: string,
  referenceFile: File,
  addWatermark: boolean = false
): Promise<Blob> => {
  const formData = new FormData();
  formData.append('text', text);
  formData.append('language', language);
  formData.append('reference', referenceFile);
  if (addWatermark) {
    formData.append('watermark', 'true');
  }

  try {
    const response = await api.post('/api/v1/tts/clone', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      responseType: 'blob',
      timeout: 120000, // allow longer timeout for first model load
    });
    return response.data;
  } catch (err: any) {
    // Map common errors to clearer messages
    if (err?.code === 'ECONNABORTED') {
      throw new Error('The cloning request timed out. The first request may download the model and can take a few minutes. Please try again shortly or use the warmup endpoint.');
    }
    const status = err?.response?.status
    if (status === 413) {
      throw new Error('The reference audio is too large. Please keep it under 20 MB and try again.')
    }
    if (status === 415) {
      throw new Error('Unsupported file type. Please upload a WAV or MP3 audio file.')
    }
    const detail = err?.response?.data?.detail
    if (typeof detail === 'string') {
      throw new Error(detail)
    }
    throw err
  }
};

// Voice Training
export const uploadVoiceSample = async (file: File, userId = 'default') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);

  const response = await api.post('/api/v1/voices/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const startTraining = async (voiceName: string, audioSamples: string[], userId = 'default') => {
  const response = await api.post('/api/v1/training/start', {
    voice_name: voiceName,
    audio_samples: audioSamples,
    user_id: userId,
  });
  return response.data;
};

export const getTrainingJobs = async (userId = 'default'): Promise<{ jobs: TrainingJob[] }> => {
  const response = await api.get('/api/v1/training/jobs', { params: { user_id: userId } });
  return response.data;
};

export const getTrainingJobStatus = async (trainingId: string): Promise<TrainingJob> => {
  const response = await api.get(`/api/v1/training/job/${trainingId}`);
  return response.data;
};

// Dashboard
export const getDashboardStats = async () => {
  try {
    const response = await api.get('/api/v1/tts/stats');
    return response.data;
  } catch (err: any) {
    console.warn('Backend offline or stats unavailable, using defaults:', err?.message || err);
    return {
      total_voices: 0,
      total_generations: 0,
      api_calls: 0,
      storage_used_mb: 0,
    };
  }
};

// Security Reports
export interface SecurityReportData {
  type: 'security' | 'fraud' | 'unauthorized' | 'data' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  email?: string;
  anonymous: boolean;
}

export interface SecurityReportResponse {
  id: string;
  message: string;
  status: string;
  created_at: string;
}

export const submitSecurityReport = async (reportData: SecurityReportData): Promise<SecurityReportResponse> => {
  const response = await api.post('/api/security/report', reportData);
  return response.data;
};

// Deepfake / Defense Verification
export interface VerificationResult {
  overall_authenticity: number;
  final_decision: 'authentic' | 'synthetic' | 'watermarked';
  flags: string[];
  watermark_detected: boolean;
  layers: {
    layer_1_antispoof: any;
    layer_3_prosody: any;
    layer_4_paralinguistic: any;
    layer_5_semantic: any;
  };
}

export const verifyAudio = async (file: File): Promise<VerificationResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/v1/verify/full-analysis', formData, {
    timeout: 120000, // Models take time for first inference
    headers: { 'Content-Type': undefined }
  });
  return response.data;
};

export interface WatermarkVerificationResponse {
  watermark_found: boolean;
  watermark_id?: string;
  confidence?: number;
  payload?: any;
}

export const verifyWatermark = async (file: File): Promise<WatermarkVerificationResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/v1/verify/watermark', formData, {
    timeout: 30000,
    headers: { 'Content-Type': undefined }
  });
  return response.data;
};

// Utility functions
export const pollJobStatus = async (
  jobId: string,
  maxAttempts = 30,
  interval = 2000
): Promise<TTSJob> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const job = await getTTSJob(jobId);

    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error('Job polling timeout');
};

export const pollTrainingStatus = async (
  trainingId: string,
  maxAttempts = 300, // 10 minutes with 2s intervals
  interval = 2000
): Promise<TrainingJob> => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const job = await getTrainingJobStatus(trainingId);

    if (job.status === 'completed' || job.status === 'failed') {
      return job;
    }

    if (attempt < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  throw new Error('Training polling timeout');
};

// Create audio URL from blob
export const createAudioUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

// Cleanup audio URL
export const revokeAudioUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

// Sync user profile to backend DB (requires Firebase ID token in Authorization header)
export const syncUserProfile = async (user: { uid?: string | null; email?: string | null; displayName?: string | null; photoURL?: string | null; phoneNumber?: string | null; providerId?: string | null }, idToken?: string) => {
  const headers: any = {}
  if (idToken) headers['Authorization'] = `Bearer ${idToken}`
  const res = await api.post('/api/v1/users/sync', {
    uid: user.uid ?? undefined,
    email: user.email ?? undefined,
    name: user.displayName ?? undefined,
    photo_url: user.photoURL ?? undefined,
    phone: user.phoneNumber ?? undefined,
    provider_id: user.providerId ?? undefined,
  }, { headers })
  return res.data
}

export default api;

export const updateProfile = async (profileData: any) => {
  const response = await api.put('/api/v1/auth/profile', profileData);
  return response.data;
};

// --- Licensing API ---

export interface LicenseCreate {
  voice_id: string;
  name: string;
  description?: string;
  license_type: 'personal' | 'commercial' | 'enterprise' | 'educational' | 'non_profit' | 'custom';
  price?: number;
  currency?: string;
  duration_days?: number;
  usage_limit?: number;
  territory?: string[];
  allowed_use_cases?: string[];
  restrictions?: Record<string, any>;
}

export interface LicenseResponse {
  id: string;
  voice_id: string;
  name: string;
  description?: string;
  license_type: string;
  price?: number;
  currency: string;
  duration_days?: number;
  usage_limit?: number;
  territory?: string[];
  allowed_use_cases?: string[];
  restrictions?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LicenseTokenRequest {
  purchaser_email: string;
  purchaser_name?: string;
  purchase_amount?: number;
  custom_terms?: Record<string, any>;
}

export interface LicenseTokenResponse {
  token: string;
  token_id: string;
  license_id: string;
  purchaser_email: string;
  expires_at?: string;
  usage_remaining?: number;
  terms_url?: string;
}

export interface LicenseUsageResponse {
  id: string;
  license_id: string;
  token_id?: string;
  user_id: string;
  voice_id: string;
  text_length: number;
  audio_duration?: number;
  watermark_id?: string;
  used_at: string;
  metadata?: Record<string, any>;
}

export interface LicenseStats {
  license_id: string;
  license_name: string;
  total_uses: number;
  usage_limit?: number;
  usage_remaining?: number;
  unique_users: number;
  total_text_length: number;
  total_audio_duration: number;
  total_revenue: number;
  currency: string;
  last_used?: string;
  created_at: string;
}

export const createLicense = async (data: LicenseCreate): Promise<LicenseResponse> => {
  const response = await api.post('/api/v1/licenses/', data);
  return response.data;
};

export const getLicenses = async (filters?: { voice_id?: string; license_type?: string; is_active?: boolean }): Promise<LicenseResponse[]> => {
  const response = await api.get('/api/v1/licenses/', { params: filters });
  return response.data;
};

export const getLicense = async (id: string): Promise<LicenseResponse> => {
  const response = await api.get(`/api/v1/licenses/${id}`);
  return response.data;
};

export const updateLicense = async (id: string, data: Partial<LicenseCreate>): Promise<LicenseResponse> => {
  const response = await api.put(`/api/v1/licenses/${id}`, data);
  return response.data;
};

export const deleteLicense = async (id: string): Promise<{ message: string }> => {
  const response = await api.delete(`/api/v1/licenses/${id}`);
  return response.data;
};

export const generateLicenseToken = async (id: string, data: LicenseTokenRequest): Promise<LicenseTokenResponse> => {
  const response = await api.post(`/api/v1/licenses/${id}/tokens`, data);
  return response.data;
};

export const getLicenseUsage = async (id: string, limit: number = 50): Promise<LicenseUsageResponse[]> => {
  const response = await api.get(`/api/v1/licenses/${id}/usage`, { params: { limit } });
  return response.data;
};

export const getLicenseStats = async (id: string): Promise<LicenseStats> => {
  const response = await api.get(`/api/v1/licenses/${id}/stats`);
  return response.data;
};
